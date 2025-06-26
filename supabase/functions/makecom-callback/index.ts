
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
    console.log('=== MAKE.COM CALLBACK RECEIVED ===');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const payload = await req.json();
    console.log('Make.com callback payload:', JSON.stringify(payload, null, 2));

    const { 
      workflow_name, 
      execution_id, 
      status, 
      error_message,
      execution_time_ms,
      lead_data,
      conversation_data,
      ai_profile_data 
    } = payload;

    // Update workflow status
    if (execution_id) {
      await supabaseClient
        .from('makecom_workflows')
        .update({
          status,
          error_message,
          execution_time_ms,
          completed_at: new Date().toISOString(),
          output_data: payload
        })
        .eq('execution_id', execution_id);
    }

    // Process lead data if provided
    if (lead_data && lead_data.id) {
      await supabaseClient
        .from('leads_v2')
        .update({
          first_name: lead_data.first_name,
          last_name: lead_data.last_name,
          full_name: lead_data.full_name,
          email: lead_data.email,
          profile_data: lead_data.profile_data,
          lead_score: lead_data.lead_score,
          lead_temperature: lead_data.lead_temperature,
          qualification_status: lead_data.qualification_status,
          last_contacted_at: lead_data.last_contacted_at,
          next_follow_up_at: lead_data.next_follow_up_at
        })
        .eq('id', lead_data.id);

      console.log('✅ Updated lead v2:', lead_data.id);
    }

    // Process conversation data if provided
    if (conversation_data && conversation_data.id) {
      await supabaseClient
        .from('conversations_v2')
        .update({
          ai_summary: conversation_data.ai_summary,
          ai_insights: conversation_data.ai_insights,
          sentiment_score: conversation_data.sentiment_score,
          call_quality_score: conversation_data.call_quality_score
        })
        .eq('id', conversation_data.id);

      console.log('✅ Updated conversation v2:', conversation_data.id);
    }

    // Process AI profile data if provided
    if (ai_profile_data) {
      const { error: profileError } = await supabaseClient
        .from('ai_profiles')
        .upsert(ai_profile_data, {
          onConflict: 'lead_id,conversation_id'
        });

      if (profileError) {
        console.error('Error upserting AI profile:', profileError);
      } else {
        console.log('✅ Upserted AI profile for lead:', ai_profile_data.lead_id);
      }
    }

    // Update CINC mapping status if this was a CINC workflow
    if (workflow_name === 'cinc_ingestion_v2' && payload.cinc_mapping_id) {
      await supabaseClient
        .from('cinc_lead_mapping')
        .update({
          processing_status: status === 'success' ? 'processed' : 'error',
          error_message: error_message,
          processed_at: new Date().toISOString()
        })
        .eq('id', payload.cinc_mapping_id);
    }

    return new Response(JSON.stringify({ 
      success: true,
      processed_workflow: workflow_name,
      status: status
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('=== MAKE.COM CALLBACK ERROR ===');
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
