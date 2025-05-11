
// Retell webhook integration for Relay CRM
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * This function handles webhook requests from Retell and processes conversation data
 * to create leads in the Supabase database. It follows a similar pattern to the
 * existing VAPI integration but is adapted for Retell's data structure.
 */
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with admin privileges
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://qvarmbhdradfpkegtpgw.supabase.co';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    // Validate service role key exists
    if (!supabaseServiceKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parse webhook data from Retell
    const webhookData = await req.json();
    console.log("Received Retell webhook data:", webhookData);
    
    // Extract conversation data based on Retell's webhook structure
    // Note: This structure will need to be adjusted based on the actual Retell webhook payload
    const {
      conversation,
      caller,
      transcription,
      call_metadata,
      extracted_information
    } = webhookData;
    
    // Map Retell data to our lead structure
    // This is based on assumptions about Retell's data structure and may need adjustment
    const leadInfo = {
      firstName: extracted_information?.first_name || caller?.name?.split(' ')[0] || 'Unknown',
      lastName: extracted_information?.last_name || (caller?.name?.split(' ').slice(1).join(' ') || 'User'),
      email: extracted_information?.email || caller?.email || `retell_lead_${Date.now()}@example.com`,
      phone: extracted_information?.phone || caller?.phone || '',
      source: 'Retell Voice Agent',
      notes: `Lead created via Retell conversation. Call ID: ${call_metadata?.call_id || 'Unknown'}`,
      status: 'new'
    };
    
    console.log("Mapped lead information:", leadInfo);
    
    // Optional: Extract qualification data if available
    const qualificationData = extracted_information?.qualification_data ? {
      loanType: extracted_information.qualification_data.loan_type,
      propertyType: extracted_information.qualification_data.property_type,
      propertyUse: extracted_information.qualification_data.property_use,
      creditScore: extracted_information.qualification_data.estimated_credit_score,
      annualIncome: extracted_information.qualification_data.annual_income,
      isSelfEmployed: extracted_information.qualification_data.is_self_employed,
      hasCoBorrower: extracted_information.qualification_data.has_co_borrower,
      downPaymentPercentage: extracted_information.qualification_data.down_payment_percentage,
      loanAmount: extracted_information.qualification_data.loan_amount,
      debtToIncomeRatio: extracted_information.qualification_data.debt_to_income_ratio,
      timeFrame: extracted_information.qualification_data.time_frame,
      notes: extracted_information.qualification_data.notes
    } : null;
    
    // Create conversation data structure
    const conversationData = transcription ? {
      agentId: 'retell-agent',
      callSid: call_metadata?.call_id || '',
      direction: 'inbound',
      duration: call_metadata?.duration || null,
      recordingUrl: call_metadata?.recording_url || null,
      transcript: transcription,
      sentimentScore: extracted_information?.sentiment_score || null
    } : null;
    
    // Insert lead using existing insert-lead function to maintain consistency
    const { data: insertData, error: insertError } = await supabase.functions.invoke('insert-lead', {
      body: {
        leadInfo,
        qualificationData,
        conversationData
      }
    });
    
    if (insertError) {
      throw new Error(`Error inserting lead: ${insertError.message}`);
    }
    
    console.log("Lead successfully created:", insertData);
    
    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Lead successfully created from Retell conversation",
        leadId: insertData?.leadId || null
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error("Error processing Retell webhook:", error);
    
    // Return error response
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
