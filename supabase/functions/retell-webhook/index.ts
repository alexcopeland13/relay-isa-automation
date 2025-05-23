
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://qvarmbhdradfpkegtpgw.supabase.co';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseServiceKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const webhookData = await req.json();
    console.log("Received Retell webhook data:", webhookData);
    
    const { event, data } = webhookData;

    // Handle call_started event - lookup caller and provide context
    if (event === 'call_started') {
      const callerPhone = data.customer_number;
      
      if (callerPhone) {
        console.log(`Looking up caller: ${callerPhone}`);
        
        // Lookup caller in phone_lead_mapping
        const { data: phoneMapping, error: lookupError } = await supabase
          .from('phone_lead_mapping')
          .select(`
            *,
            leads:lead_id (
              id,
              first_name,
              last_name,
              email,
              status,
              cinc_lead_id,
              notes
            )
          `)
          .eq('phone_e164', callerPhone)
          .single();

        if (lookupError) {
          console.log(`No existing lead found for ${callerPhone}:`, lookupError);
        } else {
          console.log(`Found lead context for ${callerPhone}:`, phoneMapping);
          
          // Prepare lead context for Retell
          const leadContext = {
            lead_name: phoneMapping.lead_name,
            first_name: phoneMapping.leads?.first_name,
            last_name: phoneMapping.leads?.last_name,
            property_interests: phoneMapping.property_interests,
            cinc_lead_id: phoneMapping.leads?.cinc_lead_id,
            favorited_properties: phoneMapping.cinc_data?.favorited_properties || [],
            buyer_timeline: phoneMapping.cinc_data?.buyer_timeline,
            preferred_cities: phoneMapping.property_interests?.search_criteria?.preferred_cities || [],
            price_range: {
              min: phoneMapping.property_interests?.search_criteria?.min_price,
              max: phoneMapping.property_interests?.search_criteria?.max_price
            }
          };

          // Update the call with lead context (this would typically be sent to Retell's API)
          console.log("Lead context prepared for Retell:", leadContext);
          
          // Here you would typically make a call to Retell's API to update the call with context
          // For now, we'll just log it and store it in our conversation record
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Call started event processed",
          lead_context_found: !!phoneMapping
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Handle call_ended event - process conversation and extract callbacks
    if (event === 'call_ended') {
      const {
        conversation,
        caller,
        transcription,
        call_metadata,
        extracted_information
      } = webhookData;
      
      // Map Retell data to our lead structure
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
      
      // Extract qualification data if available
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

      // Parse transcript for callback requests
      const callbackInfo = extractCallbackFromTranscript(transcription);
      
      // Insert lead using existing insert-lead function
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

      // If callback was requested, schedule it
      if (callbackInfo && insertData?.leadId) {
        const { error: callbackError } = await supabase
          .from('scheduled_callbacks')
          .insert({
            lead_id: insertData.leadId,
            phone_number: leadInfo.phone,
            callback_datetime: callbackInfo.datetime,
            callback_reason: callbackInfo.reason,
            callback_type: callbackInfo.type,
            callback_notes: callbackInfo.notes,
            status: 'scheduled'
          });

        if (callbackError) {
          console.error("Error scheduling callback:", callbackError);
        } else {
          console.log("Callback scheduled successfully");
        }
      }
      
      console.log("Lead successfully created:", insertData);
      
      return new Response(
        JSON.stringify({
          success: true,
          message: "Lead successfully created from Retell conversation",
          leadId: insertData?.leadId || null,
          callbackScheduled: !!callbackInfo
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Default response for unhandled events
    return new Response(
      JSON.stringify({
        success: true,
        message: `Event ${event} received but not processed`
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error("Error processing Retell webhook:", error);
    
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

// Helper function to extract callback information from transcript
function extractCallbackFromTranscript(transcript: string): any {
  if (!transcript) return null;

  const lowerTranscript = transcript.toLowerCase();
  
  // Look for callback-related keywords
  const callbackPatterns = [
    'call me back',
    'callback',
    'call back',
    'schedule a call',
    'follow up',
    'contact me',
    'reach out'
  ];

  const hasCallbackRequest = callbackPatterns.some(pattern => 
    lowerTranscript.includes(pattern)
  );

  if (!hasCallbackRequest) return null;

  // Extract time preferences (simplified)
  let callbackType = 'general';
  if (lowerTranscript.includes('property') || lowerTranscript.includes('house') || lowerTranscript.includes('home')) {
    callbackType = 'property_info';
  } else if (lowerTranscript.includes('financing') || lowerTranscript.includes('loan') || lowerTranscript.includes('mortgage')) {
    callbackType = 'financing';
  } else if (lowerTranscript.includes('showing') || lowerTranscript.includes('tour') || lowerTranscript.includes('visit')) {
    callbackType = 'showing_request';
  }

  // Default to tomorrow at 10 AM for now (in production, use NLP to extract actual times)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  return {
    datetime: tomorrow.toISOString(),
    reason: 'Callback requested during inbound call',
    type: callbackType,
    notes: 'Extracted from conversation transcript'
  };
}
