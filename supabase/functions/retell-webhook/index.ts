
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAKECOM_WEBHOOK_URL = 'https://hook.us1.make.com/your-scenario-1-webhook-url'; // Replace with your actual URL

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Handle GET requests for testing
  if (req.method === 'GET') {
    return new Response(JSON.stringify({ 
      status: 'Simplified Retell webhook endpoint is active',
      timestamp: new Date().toISOString(),
      method: 'GET'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  }

  try {
    console.log('=== SIMPLIFIED RETELL WEBHOOK RECEIVED ===');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Clean up stuck conversations (run cleanup first)
    await cleanupStuckConversations(supabaseClient);

    // Parse request body
    let body;
    try {
      const text = await req.text();
      
      if (!text || text.trim() === '') {
        return new Response(JSON.stringify({ 
          status: 'success', 
          message: 'Empty body received, likely a health check' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }
      
      body = JSON.parse(text);
      console.log('Parsed webhook body:', JSON.stringify(body, null, 2));
    } catch (parseError) {
      console.error('Failed to parse JSON body:', parseError);
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Log webhook event for debugging
    await supabaseClient
      .from('webhook_events')
      .insert({
        provider: 'retell',
        event_id: body.call?.call_id || body.event || 'unknown',
        payload: body
      });

    // Parse event type and call data
    let eventType, callData;
    if (body.event && body.call) {
      eventType = body.event;
      callData = body.call;
    } else if (body.event_type) {
      eventType = body.event_type;
      callData = body.data || body;
    } else {
      eventType = body.type || 'unknown';
      callData = body;
    }

    console.log('Processing event:', eventType);

    if (eventType === 'call_started') {
      await handleCallStarted(supabaseClient, callData);
    } else if (eventType === 'call_ended') {
      await handleCallEnded(supabaseClient, callData);
    } else if (eventType === 'transcript_update') {
      await handleTranscriptUpdate(supabaseClient, callData);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('=== WEBHOOK ERROR ===', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

// Clean up stuck conversations
async function cleanupStuckConversations(supabaseClient: any) {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
  
  await supabaseClient
    .from('conversations')
    .update({ 
      call_status: 'completed',
      extraction_status: 'stuck_cleaned' 
    })
    .eq('call_status', 'active')
    .lt('created_at', thirtyMinutesAgo);
}

// Handle call started event
async function handleCallStarted(supabaseClient: any, callData: any) {
  console.log('Processing call_started event');
  
  // Look up lead by phone number
  const phoneNumbers = [
    callData.from_number,
    callData.to_number,
    callData.caller_number,
    callData.phone_number
  ].filter(Boolean);

  let phoneMapping = null;
  for (const phone of phoneNumbers) {
    const { data, error } = await supabaseClient
      .from('phone_lead_mapping')
      .select('lead_id, lead_name')
      .eq('phone_e164', phone)
      .single();
    
    if (!error && data) {
      phoneMapping = data;
      break;
    }
  }

  // Create conversation record
  const { data: conversation, error: convError } = await supabaseClient
    .from('conversations')
    .insert({
      call_sid: callData.call_id,
      lead_id: phoneMapping?.lead_id || null,
      direction: callData.direction || 'inbound',
      call_status: 'active',
      extraction_status: 'active_call',
      started_at: new Date().toISOString(),
      agent_id: 'retell_ai'
    })
    .select()
    .single();

  if (convError) throw convError;
  console.log('✅ Created active conversation:', conversation.id);
}

// Handle call ended event
async function handleCallEnded(supabaseClient: any, callData: any) {
  console.log('Processing call_ended event');
  
  // Update conversation with completion data
  const { data: conversation, error: updateError } = await supabaseClient
    .from('conversations')
    .update({
      call_status: 'completed',
      extraction_status: 'pending_ai_processing',
      ended_at: new Date().toISOString(),
      duration: callData.duration_ms ? Math.round(callData.duration_ms / 1000) : 0,
      recording_url: callData.recording_url || null,
      transcript: callData.transcript || null
    })
    .eq('call_sid', callData.call_id)
    .select()
    .single();

  if (updateError) throw updateError;
  console.log('✅ Updated conversation to completed:', conversation?.id);

  // Update lead's last contacted timestamp
  if (conversation?.lead_id) {
    await supabaseClient
      .from('leads')
      .update({ last_contacted: new Date().toISOString() })
      .eq('id', conversation.lead_id);
  }

  // Trigger Make.com Scenario 1 with clean payload
  const makecomPayload = {
    event_type: 'call_completed',
    conversation_id: conversation.id,
    call_id: callData.call_id,
    lead_id: conversation.lead_id,
    phone_number: callData.from_number || callData.caller_number,
    duration_seconds: conversation.duration,
    transcript: callData.transcript,
    recording_url: callData.recording_url,
    post_call_analysis: callData.post_call_analysis || null,
    timestamp: new Date().toISOString()
  };

  await triggerMakecomScenario1(supabaseClient, makecomPayload, conversation.id);
}

// Handle transcript updates
async function handleTranscriptUpdate(supabaseClient: any, callData: any) {
  console.log('Processing transcript_update event');
  
  // Update conversation transcript
  await supabaseClient
    .from('conversations')
    .update({ transcript: callData.transcript || null })
    .eq('call_sid', callData.call_id);

  // Store individual messages for real-time frontend updates
  if (callData.transcript_delta) {
    await supabaseClient
      .from('conversation_messages')
      .insert({
        conversation_id: callData.call_id, // Using call_id as conversation lookup
        role: callData.transcript_delta.role || 'user',
        content: callData.transcript_delta.content || '',
        seq: callData.transcript_delta.sequence || 0,
        ts: new Date().toISOString()
      });
  }

  console.log('✅ Updated conversation transcript');
}

// Trigger Make.com Scenario 1 with retry logic
async function triggerMakecomScenario1(supabaseClient: any, conversationData: any, conversationId: string, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Triggering Make.com Scenario 1 (attempt ${i + 1})`);
      
      const response = await fetch(MAKECOM_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(conversationData)
      });
      
      if (response.ok) {
        console.log('✅ Make.com scenario triggered successfully');
        return;
      } else {
        console.error(`❌ Make.com trigger failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ Attempt ${i + 1} failed:`, error);
      if (i < retries - 1) {
        await new Promise(r => setTimeout(r, 1000 * (i + 1))); // Exponential backoff
      }
    }
  }
  
  // If all retries fail, update status so UI doesn't hang
  console.error('❌ All Make.com trigger attempts failed');
  await supabaseClient
    .from('conversations')
    .update({ extraction_status: 'makecom_trigger_failed' })
    .eq('id', conversationId);
}
