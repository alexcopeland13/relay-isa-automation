
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://qvarmbhdradfpkegtpgw.supabase.co';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    // Validate service role key exists
    if (!supabaseServiceKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get request data
    const requestData = await req.json();
    const { 
      leadInfo, 
      qualificationData, 
      conversationData 
    } = requestData;
    
    console.log("Received lead data from VAPI:", { leadInfo });

    // Validate required fields
    if (!leadInfo || !leadInfo.firstName || !leadInfo.email) {
      throw new Error('Missing required lead information (firstName, email)');
    }

    // Insert lead
    const { data: leadData, error: leadError } = await supabase
      .from('leads')
      .insert({
        first_name: leadInfo.firstName,
        last_name: leadInfo.lastName || null,
        email: leadInfo.email,
        phone: leadInfo.phone || null,
        source: leadInfo.source || 'VAPI Voice Agent',
        status: 'new',
        next_follow_up: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Default follow-up 24h later
        notes: leadInfo.notes || null
      })
      .select()
      .single();

    if (leadError) {
      throw new Error(`Error inserting lead: ${leadError.message}`);
    }

    const leadId = leadData.id;

    // Optional: Insert qualification data if provided
    if (qualificationData) {
      const { error: qualificationError } = await supabase
        .from('qualification_data')
        .insert({
          lead_id: leadId,
          loan_type: qualificationData.loanType || null,
          property_type: qualificationData.propertyType || null,
          property_use: qualificationData.propertyUse || null,
          estimated_credit_score: qualificationData.creditScore || null,
          annual_income: qualificationData.annualIncome || null,
          is_self_employed: qualificationData.isSelfEmployed || null,
          has_co_borrower: qualificationData.hasCoBorrower || null,
          down_payment_percentage: qualificationData.downPaymentPercentage || null,
          loan_amount: qualificationData.loanAmount || null,
          debt_to_income_ratio: qualificationData.debtToIncomeRatio || null,
          time_frame: qualificationData.timeFrame || null,
          qualifying_notes: qualificationData.notes || null
        });

      if (qualificationError) {
        console.error("Error inserting qualification data:", qualificationError);
      }
    }

    // Optional: Insert conversation data if provided
    if (conversationData) {
      const { error: conversationError } = await supabase
        .from('conversations')
        .insert({
          lead_id: leadId,
          agent_id: conversationData.agentId || 'vapi-agent',
          call_sid: conversationData.callSid || null,
          direction: conversationData.direction || 'inbound',
          duration: conversationData.duration || null,
          recording_url: conversationData.recordingUrl || null,
          transcript: conversationData.transcript || null,
          sentiment_score: conversationData.sentimentScore || null
        });

      if (conversationError) {
        console.error("Error inserting conversation data:", conversationError);
      }
    }

    console.log("Successfully processed lead with ID:", leadId);

    return new Response(
      JSON.stringify({
        success: true,
        leadId: leadId,
        message: "Lead data successfully inserted"
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message
      }),
      { 
        status: 400, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    );
  }
});
