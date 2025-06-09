
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

function splitTranscriptToMessages(raw: string) {
  if (!raw) return [];
  
  return raw.split('\n')
    .map((line, i) => {
      const isAgent = line.startsWith('Agent:') || line.startsWith('AI Agent:');
      const isLead = line.startsWith('Lead:') || line.startsWith('Customer:') || line.startsWith('User:');
      
      let role = 'lead'; // default
      let content = line.trim();
      
      if (isAgent) {
        role = 'agent';
        content = line.replace(/^(Agent|AI Agent):\s?/, '').trim();
      } else if (isLead) {
        role = 'lead';
        content = line.replace(/^(Lead|Customer|User):\s?/, '').trim();
      }
      
      return {
        role,
        content,
        seq: i
      };
    })
    .filter(m => m.content.length > 0);
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
      version: 'v2'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  }

  try {
    console.log('=== RETELL WEBHOOK V2 RECEIVED ===');
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
          version: 'v2'
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

    // Log webhook event for debugging - with v2 marker
    await supabaseClient
      .from('webhook_events')
      .insert({
        provider: 'retell-v2',
        event_id: body.call?.call_id || body.event || 'unknown',
        payload: body
      });

    console.log('✅ Webhook event logged to database with retell-v2 provider');

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
          agent_id: 'retell_ai_v2'
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
          extraction_version: '2.0'
        });

      console.log('✅ Created initial extraction record');

    } else if (eventType === 'call_ended') {
      console.log('🏁 Processing call_ended event');
      
      // Update conversation with end status
      const { data: conversation, error: updateError } = await supabaseClient
        .from('conversations')
        .update({
          call_status: 'completed',
          ended_at: new Date().toISOString(),
          duration: callData.duration_ms ? Math.round(callData.duration_ms / 1000) : 0,
          recording_url: callData.recording_url || null,
          transcript: callData.transcript || null,
          extraction_status: 'pending' // Set to pending for AI processing
        })
        .eq('call_sid', callData.call_id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Error updating conversation:', updateError);
        throw updateError;
      }

      console.log('✅ Updated conversation to completed:', conversation?.id);

      // Split transcript into messages
      if (callData.transcript && conversation) {
        const messages = splitTranscriptToMessages(callData.transcript);
        if (messages.length > 0) {
          const messageInserts = messages.map(m => ({
            conversation_id: conversation.id,
            role: m.role,
            content: m.content,
            seq: m.seq
          }));

          const { error: msgError } = await supabaseClient
            .from('conversation_messages')
            .insert(messageInserts);

          if (msgError) {
            console.error('❌ Error inserting conversation messages:', msgError);
          } else {
            console.log('✅ Inserted', messages.length, 'conversation messages');
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

      // Process post-call analysis data if available
      if (callData.post_call_analysis) {
        console.log('🤖 Processing post-call analysis data');
        await processPostCallAnalysis(supabaseClient, conversation.id, conversation.lead_id, callData.post_call_analysis);
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

      // Process post-call analysis if available
      if (callData.post_call_analysis) {
        const { data: conversation } = await supabaseClient
          .from('conversations')
          .select('id, lead_id')
          .eq('call_sid', callData.call_id)
          .single();
        
        if (conversation) {
          await processPostCallAnalysis(supabaseClient, conversation.id, conversation.lead_id, callData.post_call_analysis);
        }
      }
      
    } else if (eventType === 'transcript_update') {
      console.log('📝 Processing transcript_update event');
      
      // Update conversation with latest transcript
      const { error: transcriptError } = await supabaseClient
        .from('conversations')
        .update({
          transcript: callData.transcript || null
        })
        .eq('call_sid', callData.call_id);

      if (transcriptError) {
        console.error('❌ Error updating transcript:', transcriptError);
        throw transcriptError;
      }

      console.log('✅ Updated conversation transcript');
    } else {
      console.log('❓ Unknown event type received:', eventType);
    }

    console.log('=== WEBHOOK V2 PROCESSING COMPLETE ===');

    return new Response(JSON.stringify({ success: true, version: 'v2' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('=== WEBHOOK V2 ERROR ===');
    console.error('Error details:', error);
    console.error('Stack trace:', error.stack);
    return new Response(JSON.stringify({ error: error.message, version: 'v2' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

// Helper function to process post-call analysis data
async function processPostCallAnalysis(supabaseClient: any, conversationId: string, leadId: string | null, analysisData: any) {
  try {
    console.log('🤖 Processing post-call analysis for conversation:', conversationId);
    
    // Prepare extraction data with all new fields
    const extractionData = {
      conversation_id: conversationId,
      lead_id: leadId,
      extraction_timestamp: new Date().toISOString(),
      extraction_version: '2.0',
      
      // Lead qualification and scoring
      lead_temperature: analysisData.lead_temperature || null,
      lead_score: analysisData.lead_score ? parseInt(analysisData.lead_score) : null,
      lead_qualification_status: analysisData.lead_qualification_status || null,
      call_outcome: analysisData.call_outcome || null,
      
      // Property information
      property_address: analysisData.property_address || null,
      property_mls_number: analysisData.property_mls_number || null,
      property_price: analysisData.property_price ? parseInt(analysisData.property_price) : null,
      property_type: analysisData.property_type || null,
      property_use: analysisData.property_use || null,
      multiple_properties_interested: analysisData.multiple_properties_interested === 'true' || analysisData.multiple_properties_interested === true,
      
      // Contact preferences
      preferred_contact_method: analysisData.preferred_contact_method || null,
      best_time_to_call: analysisData.best_time_to_call || null,
      
      // Financial information
      credit_score_range: analysisData.credit_score_range || null,
      annual_income: analysisData.annual_income ? parseInt(analysisData.annual_income) : null,
      monthly_debt_payments: analysisData.monthly_debt_payments ? parseInt(analysisData.monthly_debt_payments) : null,
      employment_status: analysisData.employment_status || null,
      employment_length: analysisData.employment_length || null,
      is_self_employed: analysisData.is_self_employed === 'true' || analysisData.is_self_employed === true,
      
      // Loan details
      loan_amount: analysisData.loan_amount ? parseInt(analysisData.loan_amount) : null,
      loan_type: analysisData.loan_type || null,
      down_payment_amount: analysisData.down_payment_amount ? parseInt(analysisData.down_payment_amount) : null,
      down_payment_percentage: analysisData.down_payment_percentage ? parseInt(analysisData.down_payment_percentage) : null,
      has_co_borrower: analysisData.has_co_borrower === 'true' || analysisData.has_co_borrower === true,
      
      // Buyer profile
      first_time_buyer: analysisData.first_time_buyer === 'true' || analysisData.first_time_buyer === true,
      va_eligible: analysisData.va_eligible === 'true' || analysisData.va_eligible === true,
      ready_to_buy_timeline: analysisData.ready_to_buy_timeline || null,
      
      // Current situation
      pre_approval_status: analysisData.pre_approval_status || null,
      current_lender: analysisData.current_lender || null,
      has_realtor: analysisData.has_realtor === 'true' || analysisData.has_realtor === true,
      realtor_name: analysisData.realtor_name || null,
      
      // Preferences and concerns
      wants_credit_review: analysisData.wants_credit_review === 'true' || analysisData.wants_credit_review === true,
      wants_down_payment_assistance: analysisData.wants_down_payment_assistance === 'true' || analysisData.wants_down_payment_assistance === true,
      credit_concerns: analysisData.credit_concerns === 'true' || analysisData.credit_concerns === true,
      debt_concerns: analysisData.debt_concerns === 'true' || analysisData.debt_concerns === true,
      down_payment_concerns: analysisData.down_payment_concerns === 'true' || analysisData.down_payment_concerns === true,
      job_change_concerns: analysisData.job_change_concerns === 'true' || analysisData.job_change_concerns === true,
      interest_rate_concerns: analysisData.interest_rate_concerns === 'true' || analysisData.interest_rate_concerns === true,
      
      // Complex data as JSONB
      objection_details: analysisData.objection_details || null,
      next_steps: analysisData.next_steps || null,
      primary_concerns: analysisData.primary_concerns || null,
      interested_properties: analysisData.interested_properties || null,
      requested_actions: analysisData.requested_actions || null,
      
      // Timeline and follow-up
      buying_timeline: analysisData.buying_timeline || null,
      follow_up_date: analysisData.follow_up_date || null,
      overlay_education_completed: analysisData.overlay_education_completed === 'true' || analysisData.overlay_education_completed === true,
      knows_overlays: analysisData.knows_overlays === 'true' || analysisData.knows_overlays === true,
      
      // Summary and raw data
      conversation_summary: analysisData.conversation_summary || null,
      raw_extraction_data: analysisData
    };

    // Update existing extraction record or create new one
    const { error: extractionError } = await supabaseClient
      .from('conversation_extractions')
      .upsert(extractionData, {
        onConflict: 'conversation_id',
        ignoreDuplicates: false
      });

    if (extractionError) {
      console.error('❌ Error updating conversation extraction:', extractionError);
      throw extractionError;
    }

    console.log('✅ Successfully processed post-call analysis data');

    // Update qualification_data table if lead exists
    if (leadId && analysisData) {
      await updateQualificationData(supabaseClient, leadId, conversationId, analysisData);
    }

  } catch (error) {
    console.error('❌ Error processing post-call analysis:', error);
    throw error;
  }
}

// Helper function to update qualification_data table
async function updateQualificationData(supabaseClient: any, leadId: string, conversationId: string, analysisData: any) {
  try {
    const qualificationUpdate = {
      lead_id: leadId,
      conversation_id: conversationId,
      
      // Financial qualification
      annual_income: analysisData.annual_income ? parseInt(analysisData.annual_income) : null,
      loan_amount: analysisData.loan_amount ? parseInt(analysisData.loan_amount) : null,
      down_payment_percentage: analysisData.down_payment_percentage ? parseInt(analysisData.down_payment_percentage) : null,
      estimated_credit_score: analysisData.credit_score_range || null,
      
      // Employment details
      is_self_employed: analysisData.is_self_employed === 'true' || analysisData.is_self_employed === true,
      has_co_borrower: analysisData.has_co_borrower === 'true' || analysisData.has_co_borrower === true,
      
      // Property details
      property_type: analysisData.property_type || null,
      property_use: analysisData.property_use || null,
      property_price: analysisData.property_price ? parseInt(analysisData.property_price) : null,
      property_address: analysisData.property_address || null,
      property_mls_number: analysisData.property_mls_number || null,
      has_specific_property: analysisData.property_address ? true : false,
      multiple_properties_interested: analysisData.multiple_properties_interested === 'true' || analysisData.multiple_properties_interested === true,
      
      // Loan details
      loan_type: analysisData.loan_type || null,
      pre_approval_status: analysisData.pre_approval_status || null,
      current_lender: analysisData.current_lender || null,
      
      // Buyer profile
      first_time_buyer: analysisData.first_time_buyer === 'true' || analysisData.first_time_buyer === true,
      va_eligible: analysisData.va_eligible === 'true' || analysisData.va_eligible === true,
      
      // Timeline and preferences
      ready_to_buy_timeline: analysisData.ready_to_buy_timeline || null,
      lead_temperature: analysisData.lead_temperature || null,
      preferred_contact_method: analysisData.preferred_contact_method || null,
      best_time_to_call: analysisData.best_time_to_call || null,
      
      // Concerns and preferences
      wants_credit_review: analysisData.wants_credit_review === 'true' || analysisData.wants_credit_review === true,
      wants_down_payment_assistance: analysisData.wants_down_payment_assistance === 'true' || analysisData.wants_down_payment_assistance === true,
      credit_concerns: analysisData.credit_concerns === 'true' || analysisData.credit_concerns === true,
      debt_concerns: analysisData.debt_concerns === 'true' || analysisData.debt_concerns === true,
      down_payment_concerns: analysisData.down_payment_concerns === 'true' || analysisData.down_payment_concerns === true,
      job_change_concerns: analysisData.job_change_concerns === 'true' || analysisData.job_change_concerns === true,
      interest_rate_concerns: analysisData.interest_rate_concerns === 'true' || analysisData.interest_rate_concerns === true,
      
      // Education and knowledge
      knows_about_overlays: analysisData.knows_overlays === 'true' || analysisData.knows_overlays === true,
      overlay_education_completed: analysisData.overlay_education_completed === 'true' || analysisData.overlay_education_completed === true,
      
      // Complex data
      objection_details: analysisData.objection_details || null,
      qualifying_notes: analysisData.conversation_summary || null
    };

    // Upsert qualification data
    const { error: qualError } = await supabaseClient
      .from('qualification_data')
      .upsert(qualificationUpdate, {
        onConflict: 'lead_id,conversation_id',
        ignoreDuplicates: false
      });

    if (qualError) {
      console.error('❌ Error updating qualification data:', qualError);
    } else {
      console.log('✅ Successfully updated qualification data for lead:', leadId);
    }

  } catch (error) {
    console.error('❌ Error updating qualification data:', error);
  }
}
