
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('=== RETELL WEBHOOK V3 RECEIVED ===');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if v2 system is enabled
    const { data: config } = await supabaseClient
      .from('system_config')
      .select('enabled')
      .eq('feature', 'retell_processing_v2')
      .single();

    if (!config?.enabled) {
      console.log('Retell processing v2 is disabled, skipping processing');
      return new Response(JSON.stringify({ 
        status: 'disabled',
        message: 'Retell processing v2 is currently disabled' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const body = await req.json();
    console.log('Retell webhook payload:', JSON.stringify(body, null, 2));

    // Handle different webhook formats
    let eventType, callData;
    if (body.event && body.call) {
      eventType = body.event;
      callData = body.call;
    } else {
      eventType = body.event_type || body.type || 'unknown';
      callData = body.data || body;
    }

    console.log('Processing event type:', eventType);

    if (eventType === 'call_ended') {
      const callId = callData.call_id;
      const phoneNumbers = [
        callData.from_number,
        callData.to_number,
        callData.caller_number,
        callData.phone_number
      ].filter(Boolean).map(normalizePhone);

      console.log('Looking up lead by phone numbers:', phoneNumbers);

      // Find matching lead in v2 system
      let leadId = null;
      for (const phone of phoneNumbers) {
        const { data: lead } = await supabaseClient
          .from('leads_v2')
          .select('id')
          .eq('phone_e164', phone)
          .single();
        
        if (lead) {
          leadId = lead.id;
          console.log('Found matching lead:', leadId);
          break;
        }
      }

      if (!leadId) {
        console.log('No matching lead found, creating new lead');
        const { data: newLead, error: leadError } = await supabaseClient
          .from('leads_v2')
          .insert({
            phone_e164: phoneNumbers[0],
            phone_raw: phoneNumbers[0],
            first_name: 'Unknown',
            last_name: 'Caller',
            source: 'retell_call',
            status: 'contacted'
          })
          .select()
          .single();

        if (leadError) {
          throw leadError;
        }
        leadId = newLead.id;
      }

      // Create conversation record
      const { data: conversation, error: convError } = await supabaseClient
        .from('conversations_v2')
        .insert({
          lead_id: leadId,
          retell_call_id: callId,
          retell_agent_id: callData.agent_id,
          direction: callData.direction || 'inbound',
          duration_seconds: callData.duration_ms ? Math.round(callData.duration_ms / 1000) : 0,
          transcript: callData.transcript,
          recording_url: callData.recording_url,
          started_at: callData.started_at || new Date().toISOString(),
          ended_at: callData.ended_at || new Date().toISOString()
        })
        .select()
        .single();

      if (convError) {
        throw convError;
      }

      console.log('✅ Created conversation v2:', conversation.id);

      // Trigger Make.com workflow for AI processing
      const { data: makecomConfig } = await supabaseClient
        .from('system_config')
        .select('enabled')
        .eq('feature', 'use_makecom_processing')
        .single();

      if (makecomConfig?.enabled) {
        await supabaseClient
          .from('makecom_workflows')
          .insert({
            workflow_name: 'retell_processing_v2',
            conversation_id: conversation.id,
            lead_id: leadId,
            input_data: { 
              conversation_id: conversation.id,
              transcript: callData.transcript,
              call_data: callData 
            },
            status: 'running'
          });

        console.log('✅ Make.com workflow triggered for Retell processing');
      }

      return new Response(JSON.stringify({ 
        success: true,
        conversation_id: conversation.id,
        lead_id: leadId,
        makecom_enabled: makecomConfig?.enabled || false
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // For other event types, just acknowledge
    return new Response(JSON.stringify({ 
      success: true,
      event_type: eventType,
      processed: false 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('=== RETELL WEBHOOK V3 ERROR ===');
    console.error('Error details:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
