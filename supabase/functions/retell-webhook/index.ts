
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json();
    console.log('Retell webhook received:', JSON.stringify(body, null, 2));

    const { event, data } = body;

    // Log webhook event
    await supabaseClient
      .from('webhook_events')
      .insert({
        provider: 'retell',
        event_id: data.call_id,
        payload: body
      });

    if (event === 'call_started') {
      console.log('Processing call_started event');
      
      // Look up lead by phone number
      const { data: phoneMapping, error: lookupError } = await supabaseClient
        .from('phone_lead_mapping')
        .select('lead_id, lead_name')
        .eq('phone_e164', data.from_number || data.to_number)
        .single();

      if (lookupError) {
        console.log('No lead found for phone number:', data.from_number || data.to_number);
      }

      // Create conversation record with active status
      const { data: conversation, error: convError } = await supabaseClient
        .from('conversations')
        .insert({
          call_sid: data.call_id,
          lead_id: phoneMapping?.lead_id || null,
          direction: data.direction || 'inbound',
          call_status: 'active',
          started_at: new Date().toISOString(),
          agent_id: 'retell_ai'
        })
        .select()
        .single();

      if (convError) {
        console.error('Error creating conversation:', convError);
        throw convError;
      }

      console.log('Created active conversation:', conversation.id);

      // Create initial extraction record
      await supabaseClient
        .from('conversation_extractions')
        .insert({
          conversation_id: conversation.id,
          lead_id: phoneMapping?.lead_id || null,
          extraction_timestamp: new Date().toISOString(),
          extraction_version: '1.0'
        });

    } else if (event === 'call_ended') {
      console.log('Processing call_ended event');
      
      // Update conversation with end status
      const { data: conversation, error: updateError } = await supabaseClient
        .from('conversations')
        .update({
          call_status: 'completed',
          ended_at: new Date().toISOString(),
          duration: data.call_length_seconds || 0,
          recording_url: data.recording_url || null,
          transcript: data.transcript || null
        })
        .eq('call_sid', data.call_id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating conversation:', updateError);
        throw updateError;
      }

      console.log('Updated conversation to completed:', conversation.id);

      // Update lead's last contacted timestamp
      if (conversation.lead_id) {
        await supabaseClient
          .from('leads')
          .update({ last_contacted: new Date().toISOString() })
          .eq('id', conversation.lead_id);
      }

    } else if (event === 'call_analyzed') {
      console.log('Processing call_analyzed event');
      
      // Update conversation with analysis data
      const { error: analysisError } = await supabaseClient
        .from('conversations')
        .update({
          sentiment_score: data.sentiment_score || null,
          transcript: data.transcript || null
        })
        .eq('call_sid', data.call_id);

      if (analysisError) {
        console.error('Error updating conversation analysis:', analysisError);
        throw analysisError;
      }

      console.log('Updated conversation with analysis data');
      
    } else if (event === 'transcript_update') {
      console.log('Processing transcript_update event');
      
      // Update conversation with latest transcript
      const { error: transcriptError } = await supabaseClient
        .from('conversations')
        .update({
          transcript: data.transcript || null
        })
        .eq('call_sid', data.call_id);

      if (transcriptError) {
        console.error('Error updating transcript:', transcriptError);
        throw transcriptError;
      }

      console.log('Updated conversation transcript');
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
