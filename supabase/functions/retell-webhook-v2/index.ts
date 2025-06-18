
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Import utilities
import { parsePhoneNumber } from 'https://esm.sh/libphonenumber-js@1.12.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function normalizePhone(phone: string): string {
  try {
    const parsed = parsePhoneNumber(phone, 'US');
    return parsed.number;
  } catch {
    return phone;
  }
}

// Enhanced function to fetch complete call data from Retell API
async function fetchCompleteCallData(callId: string) {
  try {
    console.log('🔍 Fetching complete call data from Retell API for:', callId);
    
    const retellApiKey = Deno.env.get('RETELL_API_KEY');
    if (!retellApiKey) {
      throw new Error('RETELL_API_KEY not found in environment');
    }
    
    const response = await fetch(`https://api.retellai.com/get-call/${callId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${retellApiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Retell API responded with status: ${response.status}`);
    }
    
    const callData = await response.json();
    console.log('✅ Complete call data fetched:', {
      call_id: callData.call_id,
      has_transcript_object: !!callData.transcript_object,
      has_call_analysis: !!callData.call_analysis,
      transcript_utterances: callData.transcript_object?.length || 0,
      call_analysis_keys: callData.call_analysis ? Object.keys(callData.call_analysis) : []
    });
    
    return callData;
  } catch (error) {
    console.error('❌ Error fetching complete call data:', error);
    throw error;
  }
}

// Helper to convert Retell transcript_object to our conversation messages format
function convertRetellTranscriptToMessages(transcriptObject: any[], conversationId: string) {
  if (!transcriptObject || !Array.isArray(transcriptObject)) {
    console.log('⚠️ No transcript_object available, skipping conversion');
    return [];
  }

  return transcriptObject.map((utterance, index) => ({
    conversation_id: conversationId,
    role: utterance.role === 'agent' ? 'agent' : 'lead',
    content: utterance.content || '',
    seq: index,
    ts: new Date(utterance.timestamp).toISOString()
  }));
}

function splitTranscriptToMessages(raw: string, conversationId: string) {
  if (!raw) return [];
  
  return raw.split('\n')
    .map((line, i) => {
      // More deterministic parsing - look for specific patterns
      const agentMatch = line.match(/^(Agent|AI Agent):\s?(.+)$/);
      const userMatch = line.match(/^(Lead|Customer|User):\s?(.+)$/);
      
      let role = 'lead'; // default
      let content = line.trim();
      
      if (agentMatch) {
        role = 'agent';
        content = agentMatch[2].trim();
      } else if (userMatch) {
        role = 'lead';
        content = userMatch[2].trim();
      } else if (line.trim()) {
        // If no pattern matches but there's content, try to infer from context
        content = line.trim();
      }
      
      return {
        conversation_id: conversationId,
        role,
        content,
        seq: i
      };
    })
    .filter(m => m.content.length > 0);
}

// Helper to insert or update a single message during live transcript streaming
async function insertLiveMessage(supabaseClient: any, conversationId: string, utterance: any, seq: number) {
  try {
    const role = utterance.speaker === 'agent' ? 'agent' : 'lead';
    const content = utterance.content || utterance.text || '';
    
    if (!content.trim()) return;

    const messageData = {
      conversation_id: conversationId,
      role,
      content: content.trim(),
      seq: seq
    };

    console.log('📝 Inserting live message:', messageData);

    // Use upsert with the new unique constraint
    const { error } = await supabaseClient
      .from('conversation_messages')
      .upsert(messageData, {
        onConflict: 'conversation_id,seq',
        ignoreDuplicates: false
      });

    if (error) {
      console.error('❌ Error upserting live message:', error);
      // Fallback to insert
      const { error: insertError } = await supabaseClient
        .from('conversation_messages')
        .insert(messageData);
      
      if (insertError) {
        console.error('❌ Error inserting live message fallback:', insertError);
      }
    } else {
      console.log('✅ Upserted live message for conversation:', conversationId);
    }

  } catch (error) {
    console.error('❌ Error processing live message:', error);
  }
}

// Helper to trigger AI processing
async function triggerAIProcessing(supabaseClient: any, conversationId: string, transcript: string) {
  try {
    console.log('🤖 Triggering AI processor for conversation:', conversationId);
    
    // Skip if transcript is empty
    if (!transcript || transcript.trim() === '') {
      console.log('⚠️ Skipping AI processing - empty transcript');
      await supabaseClient
        .from('conversations')
        .update({ extraction_status: 'skipped' })
        .eq('id', conversationId);
      return;
    }
    
    // Set status to processing immediately
    await supabaseClient
      .from('conversations')
      .update({ extraction_status: 'processing' })
      .eq('id', conversationId);
    
    // Call the AI conversation processor
    const { data, error } = await supabaseClient.functions.invoke('ai-conversation-processor', {
      body: {
        action: 'extract_entities',
        data: {
          conversation_id: conversationId,
          transcript: transcript
        }
      }
    });

    if (error) {
      console.error('❌ AI processor error:', error);
      // Set status to failed and log error
      await supabaseClient
        .from('conversations')
        .update({ extraction_status: 'failed' })
        .eq('id', conversationId);
      throw error;
    }

    console.log('✅ AI processor completed successfully:', data);
    
    // Status will be set to 'done' by the AI processor itself
    return data;

  } catch (error) {
    console.error('❌ Error triggering AI processing:', error);
    // Ensure status is set to failed
    await supabaseClient
      .from('conversations')
      .update({ extraction_status: 'failed' })
      .eq('id', conversationId);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Handle GET requests for testing
  if (req.method === 'GET') {
    return new Response(JSON.stringify({ 
      status: 'Retell webhook v2 endpoint is active',
      timestamp: new Date().toISOString(),
      method: 'GET',
      version: 'v2-enhanced'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  }

  try {
    console.log('=== RETELL WEBHOOK V2 ENHANCED RECEIVED ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Headers:', Object.fromEntries(req.headers.entries()));

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let body;
    try {
      const text = await req.text();
      console.log('Raw request body:', text);
      
      if (!text || text.trim() === '') {
        console.log('Empty request body received');
        return new Response(JSON.stringify({ 
          status: 'success', 
          message: 'Empty body received, likely a health check',
          version: 'v2-enhanced'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }
      
      body = JSON.parse(text);
      console.log('=== WEBHOOK PAYLOAD START ===');
      console.log(JSON.stringify(body, null, 2));
      console.log('=== WEBHOOK PAYLOAD END ===');
    } catch (parseError) {
      console.error('Failed to parse JSON body:', parseError);
      return new Response(JSON.stringify({ error: 'Invalid JSON', details: parseError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Log webhook event for debugging - with v2-enhanced marker
    await supabaseClient
      .from('webhook_events')
      .insert({
        provider: 'retell-v2-enhanced',
        event_id: body.call?.call_id || body.event || 'unknown',
        payload: body
      });

    console.log('✅ Webhook event logged to database with retell-v2-enhanced provider');

    // Handle different webhook formats with enhanced logging
    let eventType, callData;
    
    if (body.event && body.call) {
      // New format: { event: "call_started", call: {...} }
      eventType = body.event;
      callData = body.call;
      console.log('✅ New webhook format detected:', eventType);
    } else if (body.event_type) {
      // Alternative format
      eventType = body.event_type;
      callData = body.data || body;
      console.log('✅ Alternative webhook format detected:', eventType);
    } else {
      // Legacy or unknown format
      eventType = body.type || 'unknown';
      callData = body;
      console.log('⚠️ Legacy/unknown webhook format detected:', eventType);
    }

    console.log('🔄 Processing event type:', eventType);
    console.log('📞 Call data:', JSON.stringify(callData, null, 2));

    if (eventType === 'call_started') {
      console.log('🚀 Processing call_started event');
      
      // Look up lead by phone number - try multiple phone fields and normalize them
      const phoneNumbers = [
        callData.from_number,
        callData.to_number,
        callData.caller_number,
        callData.phone_number
      ].filter(Boolean).map(normalizePhone);

      console.log('🔍 Looking up lead by normalized phone numbers:', phoneNumbers);

      let phoneMapping = null;
      for (const phone of phoneNumbers) {
        const { data, error } = await supabaseClient
          .from('phone_lead_mapping')
          .select('lead_id, lead_name')
          .eq('phone_e164', phone)
          .single();
        
        if (!error && data) {
          phoneMapping = data;
          console.log('✅ Found lead mapping for phone:', phone, 'Lead:', data);
          break;
        } else {
          console.log('❌ No mapping found for phone:', phone);
        }
      }

      // Create lead if no mapping found
      if (!phoneMapping) {
        console.log('⚠️ No lead found for phone numbers:', phoneNumbers);
        console.log('🔄 Creating new lead for unknown caller');
        
        const { data: newLead, error: leadError } = await supabaseClient
          .from('leads')
          .insert({
            first_name: 'Unknown',
            last_name: 'Caller',
            phone_raw: phoneNumbers[0],
            phone_e164: phoneNumbers[0],
            source: 'Retell Voice Agent',
            status: 'new'
          })
          .select()
          .single();

        if (leadError) {
          console.error('❌ Error creating new lead:', leadError);
        } else {
          console.log('✅ Created new lead:', newLead);
          
          // Create phone mapping for the new lead
          await supabaseClient.from('phone_lead_mapping').insert({
            phone_e164: phoneNumbers[0],
            lead_id: newLead.id,
            lead_name: `${newLead.first_name} ${newLead.last_name}`
          });

          phoneMapping = { lead_id: newLead.id, lead_name: `${newLead.first_name} ${newLead.last_name}` };
          console.log('✅ Created phone mapping for new lead');
        }
      }

      // Create conversation record with pending extraction status
      const { data: conversation, error: convError } = await supabaseClient
        .from('conversations')
        .insert({
          call_sid: callData.call_id,
          lead_id: phoneMapping?.lead_id || null,
          direction: callData.direction || 'inbound',
          call_status: 'active',
          extraction_status: 'pending',
          started_at: new Date().toISOString(),
          agent_id: 'retell_ai_v2_enhanced'
        })
        .select()
        .single();

      if (convError) {
        console.error('❌ Error creating conversation:', convError);
        throw convError;
      }

      console.log('✅ Created active conversation:', conversation.id);

      // Create initial extraction record
      await supabaseClient
        .from('conversation_extractions')
        .insert({
          conversation_id: conversation.id,
          lead_id: phoneMapping?.lead_id || null,
          extraction_timestamp: new Date().toISOString(),
          extraction_version: '2.0-enhanced'
        });

      console.log('✅ Created initial extraction record');

    } else if (eventType === 'transcript_update') {
      console.log('📝 Processing transcript_update event (LIVE STREAMING)');
      
      // Find the conversation by call_id
      const { data: conversation, error: findError } = await supabaseClient
        .from('conversations')
        .select('id')
        .eq('call_sid', callData.call_id || callData.call?.call_id)
        .single();

      if (findError || !conversation) {
        console.error('❌ Could not find conversation for transcript_update:', findError);
        return new Response(JSON.stringify({ error: 'Conversation not found' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        });
      }

      // Handle live transcript streaming - insert individual utterances
      if (callData.utterances && Array.isArray(callData.utterances)) {
        console.log('📝 Processing', callData.utterances.length, 'live utterances');
        
        for (let i = 0; i < callData.utterances.length; i++) {
          const utterance = callData.utterances[i];
          await insertLiveMessage(supabaseClient, conversation.id, utterance, i);
        }
      } else if (callData.transcript) {
        // Fallback: update conversation transcript if no structured utterances
        console.log('📝 Updating conversation transcript (fallback)');
        await supabaseClient
          .from('conversations')
          .update({ transcript: callData.transcript })
          .eq('call_sid', callData.call_id || callData.call?.call_id);
      }

      console.log('✅ Processed transcript_update for conversation:', conversation.id);

    } else if (eventType === 'call_ended') {
      console.log('🏁 Processing call_ended event - ENHANCED WITH COMPLETE CALL DATA FETCH');
      
      // **ENHANCED: Fetch complete call data from Retell API**
      let completeCallData;
      try {
        completeCallData = await fetchCompleteCallData(callData.call_id);
        console.log('✅ Enhanced call data fetched successfully');
      } catch (error) {
        console.error('❌ Failed to fetch complete call data, using webhook data:', error);
        completeCallData = callData;
      }
      
      // Update conversation with enhanced data
      const conversationUpdate: any = {
        call_status: 'completed',
        ended_at: new Date().toISOString(),
        duration: completeCallData.duration_ms ? Math.round(completeCallData.duration_ms / 1000) : 0,
        recording_url: completeCallData.recording_url || null,
        transcript: completeCallData.transcript || null,
        extraction_status: 'pending',
        // Store complete Retell data as JSONB
        retell_call_data: completeCallData
      };

      // Add call analysis if available
      if (completeCallData.call_analysis) {
        conversationUpdate.retell_call_analysis = completeCallData.call_analysis;
        console.log('📊 Retell call analysis available:', Object.keys(completeCallData.call_analysis));
      }

      const { data: conversation, error: updateError } = await supabaseClient
        .from('conversations')
        .update(conversationUpdate)
        .eq('call_sid', callData.call_id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Error updating conversation:', updateError);
        throw updateError;
      }

      console.log('✅ Updated conversation with enhanced data:', conversation?.id);

      // **ENHANCED: Use transcript_object if available for structured messages**
      if (completeCallData.transcript_object && Array.isArray(completeCallData.transcript_object)) {
        console.log(`📝 Using Retell's structured transcript_object with ${completeCallData.transcript_object.length} utterances`);
        
        const structuredMessages = convertRetellTranscriptToMessages(completeCallData.transcript_object, conversation.id);
        
        if (structuredMessages.length > 0) {
          const { error: msgError } = await supabaseClient
            .from('conversation_messages')
            .upsert(structuredMessages, { 
              onConflict: 'conversation_id,seq',
              ignoreDuplicates: false
            });

          if (msgError) {
            console.error('❌ Error upserting structured conversation messages:', msgError);
          } else {
            console.log('✅ Upserted', structuredMessages.length, 'structured conversation messages');
          }
        }
      } else if (completeCallData.transcript && conversation) {
        // Fallback to parsing text transcript
        console.log('📝 Falling back to parsing text transcript');
        const messages = splitTranscriptToMessages(completeCallData.transcript, conversation.id);
        if (messages.length > 0) {
          console.log(`📝 Parsed ${messages.length} messages for ${conversation.id}`);
          
          const { error: msgError } = await supabaseClient
            .from('conversation_messages')
            .upsert(messages, { 
              onConflict: 'conversation_id,seq',
              ignoreDuplicates: false
            });

          if (msgError) {
            console.error('❌ Error upserting final conversation messages:', msgError);
          } else {
            console.log('✅ Upserted', messages.length, 'final conversation messages');
          }
        }
      }

      // Update lead's last contacted timestamp
      if (conversation?.lead_id) {
        await supabaseClient
          .from('leads')
          .update({ last_contacted: new Date().toISOString() })
          .eq('id', conversation.lead_id);
        console.log('✅ Updated lead last_contacted timestamp');
      }

      // **ENHANCED: Use available analysis data before triggering AI processing**
      console.log('🤖 Starting enhanced AI processing for completed conversation');
      try {
        await triggerAIProcessing(supabaseClient, conversation.id, completeCallData.transcript || '');
        console.log('✅ AI processing triggered successfully');
      } catch (aiError) {
        console.error('❌ AI processing failed:', aiError);
        // Don't fail the webhook - just log the error
      }

    } else if (eventType === 'call_analyzed') {
      console.log('📊 Processing call_analyzed event');
      
      // Update conversation with analysis data
      const { error: analysisError } = await supabaseClient
        .from('conversations')
        .update({
          sentiment_score: callData.sentiment_score || null,
          transcript: callData.transcript || null
        })
        .eq('call_sid', callData.call_id);

      if (analysisError) {
        console.error('❌ Error updating conversation analysis:', analysisError);
        throw analysisError;
      }

      console.log('✅ Updated conversation with analysis data');
      
    } else {
      console.log('❓ Unknown event type received:', eventType);
    }

    console.log('=== WEBHOOK V2 ENHANCED PROCESSING COMPLETE ===');

    return new Response(JSON.stringify({ success: true, version: 'v2-enhanced' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('=== WEBHOOK V2 ENHANCED ERROR ===');
    console.error('Error details:', error);
    console.error('Stack trace:', error.stack);
    return new Response(JSON.stringify({ error: error.message, version: 'v2-enhanced' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
