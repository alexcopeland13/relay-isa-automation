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
    console.log('=== MAKE.COM CALLBACK RECEIVED ===');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const payload = await req.json();
    console.log('Make.com callback payload:', JSON.stringify(payload, null, 2));

    const { workflow, executionId, data } = payload;

    // Handle retell processing v2 workflow
    if (workflow === 'retell_processing_v2' && data) {
      console.log('Processing retell v2 workflow');
      
      const { leadData, conversationData, aiProfile, metadata } = data;
      
      if (!leadData?.phone) {
        throw new Error('Phone number is required for retell processing');
      }

      // Normalize phone number
      const phoneE164 = normalizePhone(leadData.phone);
      console.log('Normalized phone:', phoneE164);

      // Step 1: Find or create lead
      let leadId;
      const { data: existingLead } = await supabaseClient
        .from('leads_v2')
        .select('id')
        .eq('phone_e164', phoneE164)
        .single();

      if (existingLead) {
        // Update existing lead
        leadId = existingLead.id;
        await supabaseClient
          .from('leads_v2')
          .update({
            first_name: leadData.firstName || undefined,
            last_name: leadData.lastName || undefined,
            full_name: leadData.firstName && leadData.lastName 
              ? `${leadData.firstName} ${leadData.lastName}` 
              : undefined,
            email: leadData.email || undefined,
            lead_score: leadData.leadScore || undefined,
            lead_temperature: leadData.leadTemperature || undefined,
            qualification_status: leadData.qualificationStatus || undefined,
            last_contacted_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', leadId);

        console.log('✅ Updated existing lead:', leadId);
      } else {
        // Create new lead
        const { data: newLead, error: leadError } = await supabaseClient
          .from('leads_v2')
          .insert({
            phone_e164: phoneE164,
            phone_raw: leadData.phone,
            first_name: leadData.firstName || 'Unknown',
            last_name: leadData.lastName || 'Caller',
            full_name: leadData.firstName && leadData.lastName 
              ? `${leadData.firstName} ${leadData.lastName}` 
              : 'Unknown Caller',
            email: leadData.email,
            lead_score: leadData.leadScore || 0,
            lead_temperature: leadData.leadTemperature || 'cold',
            qualification_status: leadData.qualificationStatus || 'unqualified',
            status: 'contacted',
            source: 'retell_call',
            last_contacted_at: new Date().toISOString()
          })
          .select()
          .single();

        if (leadError) throw leadError;
        leadId = newLead.id;
        console.log('✅ Created new lead:', leadId);
      }

      // Step 2: Create conversation record
      let conversationId;
      if (conversationData?.retellCallId) {
        const { data: conversation, error: convError } = await supabaseClient
          .from('conversations_v2')
          .insert({
            lead_id: leadId,
            retell_call_id: conversationData.retellCallId,
            duration_seconds: conversationData.duration || 0,
            transcript: conversationData.transcript,
            ai_summary: conversationData.summary,
            sentiment_score: conversationData.sentiment === 'positive' ? 0.8 : 
                           conversationData.sentiment === 'negative' ? 0.2 : 0.5,
            call_quality_score: metadata?.extractionConfidence ? 
              Math.round(metadata.extractionConfidence / 10) : 5,
            started_at: new Date().toISOString(),
            ended_at: new Date().toISOString()
          })
          .select()
          .single();

        if (convError) throw convError;
        conversationId = conversation.id;
        console.log('✅ Created conversation v2:', conversationId);
      }

      // Step 3: Create/update AI profile
      if (aiProfile && Object.keys(aiProfile).length > 0) {
        const profileData = {
          lead_id: leadId,
          conversation_id: conversationId,
          annual_income: aiProfile.annualIncome,
          credit_score_range: aiProfile.creditScoreRange,
          employment_status: aiProfile.employmentStatus,
          property_type: aiProfile.propertyType,
          price_range_min: aiProfile.priceRangeMin,
          price_range_max: aiProfile.priceRangeMax,
          preferred_locations: aiProfile.preferredLocations,
          loan_type: aiProfile.loanType,
          pre_approval_status: aiProfile.preApprovalStatus,
          buying_timeline: aiProfile.buyingTimeline,
          motivation_factors: aiProfile.motivationFactors,
          concerns: aiProfile.concerns,
          profile_completeness_score: metadata?.dataCompleteness || 0,
          data_confidence_score: metadata?.extractionConfidence || 0,
          extraction_version: '2.0',
          processed_by: 'makecom'
        };

        const { error: profileError } = await supabaseClient
          .from('ai_profiles')
          .upsert(profileData, {
            onConflict: 'lead_id,conversation_id'
          });

        if (profileError) {
          console.error('Error upserting AI profile:', profileError);
        } else {
          console.log('✅ Upserted AI profile for lead:', leadId);
        }
      }

      // Step 4: Update workflow status
      await supabaseClient
        .from('makecom_workflows')
        .update({
          status: 'success',
          completed_at: new Date().toISOString(),
          output_data: {
            lead_id: leadId,
            conversation_id: conversationId,
            phone_e164: phoneE164,
            processing_summary: {
              lead_action: existingLead ? 'updated' : 'created',
              conversation_created: !!conversationId,
              ai_profile_processed: !!(aiProfile && Object.keys(aiProfile).length > 0)
            }
          }
        })
        .eq('execution_id', executionId);

      console.log('✅ Retell processing v2 workflow completed successfully');

      return new Response(JSON.stringify({ 
        success: true,
        workflow: 'retell_processing_v2',
        lead_id: leadId,
        conversation_id: conversationId,
        phone_e164: phoneE164
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Keep existing workflow handlers for backward compatibility
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
