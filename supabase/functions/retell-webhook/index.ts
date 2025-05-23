
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

    // Enhanced call_started event - lookup caller and provide context
    if (event === 'call_started') {
      const callerPhone = data.customer_number;
      
      if (callerPhone) {
        console.log(`Looking up caller: ${callerPhone}`);
        
        // Enhanced lookup with qualification data
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
          
          // Get qualification data separately to avoid complex joins
          const { data: qualificationData } = await supabase
            .from('qualification_data')
            .select('*')
            .eq('lead_id', phoneMapping.leads?.id)
            .single();
          
          // Enhanced lead context for Retell
          const leadContext = {
            // Basic info
            lead_name: phoneMapping.lead_name,
            first_name: phoneMapping.leads?.first_name,
            last_name: phoneMapping.leads?.last_name,
            cinc_lead_id: phoneMapping.leads?.cinc_lead_id,
            
            // CINC property interests
            favorited_properties: phoneMapping.cinc_data?.favorited_properties || [],
            property_interests: phoneMapping.property_interests,
            preferred_cities: phoneMapping.property_interests?.search_criteria?.preferred_cities || [],
            price_range: {
              min: phoneMapping.property_interests?.search_criteria?.min_price,
              max: phoneMapping.property_interests?.search_criteria?.max_price
            },
            buyer_timeline: phoneMapping.cinc_data?.buyer_timeline,
            
            // Previous conversation context (if any)
            previous_status: qualificationData?.pre_approval_status,
            previous_concerns: qualificationData?.objection_details,
            is_return_caller: !!qualificationData?.pre_approval_status,
            knows_overlays: qualificationData?.knows_about_overlays,
            has_specific_property: qualificationData?.has_specific_property,
            property_address: qualificationData?.property_address,
            
            // Custom greeting suggestion based on context
            greeting_context: generateGreetingContext(phoneMapping, qualificationData)
          };

          console.log("Enhanced lead context prepared for Retell:", leadContext);
          
          // TODO: Send this context to Retell via their API when available
          // await updateRetellCallContext(data.call_id, leadContext);
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Call started event processed with enhanced context",
          lead_context_found: !!phoneMapping,
          is_return_caller: !!phoneMapping?.leads
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Enhanced call_ended event - process conversation and extract enhanced data
    if (event === 'call_ended') {
      const {
        call_id,
        duration,
        recording_url,
        transcript,
        from_number: callerPhone,
        custom_analysis_data,
        // Fallback to existing structure if custom_analysis_data not available
        conversation,
        caller,
        transcription,
        call_metadata,
        extracted_information
      } = data;
      
      console.log("Processing call_ended event for:", callerPhone);
      
      // Use custom_analysis_data if available, otherwise fall back to extracted_information
      const extractionData = custom_analysis_data || extracted_information || {};
      
      // Find existing lead or create new one
      let leadId = null;
      let conversationId = null;
      
      // Try to find existing lead first
      const { data: phoneMapping } = await supabase
        .from('phone_lead_mapping')
        .select('lead_id')
        .eq('phone_e164', callerPhone)
        .single();
      
      if (phoneMapping?.lead_id) {
        leadId = phoneMapping.lead_id;
        console.log("Found existing lead:", leadId);
      } else {
        // Create new lead if not found
        const leadInfo = {
          firstName: extractionData?.first_name || caller?.name?.split(' ')[0] || 'Unknown',
          lastName: extractionData?.last_name || (caller?.name?.split(' ').slice(1).join(' ') || 'User'),
          email: extractionData?.email || caller?.email || `retell_lead_${Date.now()}@example.com`,
          phone: callerPhone || '',
          source: 'Retell Voice Agent',
          notes: `Lead created via Retell conversation. Call ID: ${call_id || 'Unknown'}`,
          status: 'new'
        };
        
        console.log("Creating new lead:", leadInfo);
        
        // Use existing insert-lead function
        const { data: insertData, error: insertError } = await supabase.functions.invoke('insert-lead', {
          body: { leadInfo }
        });
        
        if (insertError) {
          throw new Error(`Error creating lead: ${insertError.message}`);
        }
        
        leadId = insertData?.leadId;
      }
      
      if (leadId) {
        // Create conversation record
        const { data: conversation, error: convError } = await supabase
          .from('conversations')
          .insert({
            lead_id: leadId,
            agent_id: 'retell-agent',
            call_sid: call_id || call_metadata?.call_id,
            direction: 'inbound',
            duration: duration || call_metadata?.duration,
            recording_url: recording_url || call_metadata?.recording_url,
            transcript: transcript || transcription
          })
          .select()
          .single();

        if (convError) {
          console.error("Error creating conversation:", convError);
        } else {
          conversationId = conversation.id;
          console.log("Created conversation:", conversationId);
        }

        // Store extraction data in conversation_extractions table
        if (conversationId && extractionData) {
          const { error: extractionError } = await supabase
            .from('conversation_extractions')
            .insert({
              conversation_id: conversationId,
              lead_id: leadId,
              lead_qualification_status: extractionData.lead_qualification_status,
              pre_approval_status: extractionData.pre_approval_status,
              current_lender: extractionData.current_lender,
              knows_overlays: extractionData.knows_overlays,
              buying_timeline: extractionData.buying_timeline,
              primary_concerns: extractionData.primary_concerns || [],
              interested_properties: extractionData.interested_properties || [],
              requested_actions: extractionData.requested_actions || [],
              conversation_summary: extractionData.conversation_summary,
              extraction_version: '2.0',
              raw_extraction_data: extractionData
            });

          if (extractionError) {
            console.error("Error creating conversation extraction:", extractionError);
          } else {
            console.log("Conversation extraction created successfully");
          }
        }

        // Create actions based on extraction
        await createActionsFromExtraction(leadId, conversationId, extractionData);

        // Handle specific requests
        await handleSpecificRequests(leadId, extractionData, callerPhone);
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          message: "Call ended event processed with enhanced extraction",
          leadId: leadId,
          conversationId: conversationId,
          extractionCreated: true
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

// Helper function to generate greeting context
function generateGreetingContext(phoneMapping: any, qualificationData?: any) {
  const firstName = phoneMapping.leads?.first_name || phoneMapping.lead_name?.split(' ')[0];
  const favoriteCount = phoneMapping.cinc_data?.favorited_properties?.length || 0;
  
  // Return caller with previous qualification
  if (qualificationData?.pre_approval_status) {
    return {
      type: 'return_caller',
      greeting: `Hi ${firstName}! Great to hear from you again. How can I help you continue your home buying journey?`
    };
  }
  
  // Property-specific greeting
  if (favoriteCount > 0) {
    const topProperty = phoneMapping.cinc_data.favorited_properties[0];
    return {
      type: 'property_specific',
      greeting: `Hi ${firstName}! I see you were interested in the property on ${topProperty.address}. How can I help you with that today?`
    };
  } 
  
  // General search greeting
  const city = phoneMapping.property_interests?.search_criteria?.preferred_cities?.[0];
  return {
    type: 'general_search',
    greeting: `Hi ${firstName}! I understand you're looking for homes${city ? ` in ${city}` : ' in the area'}. What can I help you with today?`
  };
}

// Helper function to create actions from extraction data
async function createActionsFromExtraction(leadId: string, conversationId: string | null, extractionData: any) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://qvarmbhdradfpkegtpgw.supabase.co';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const actions = [];
  const requestedActions = extractionData.requested_actions || [];
  
  if (requestedActions.includes('send_preapproval_link')) {
    actions.push({
      lead_id: leadId,
      conversation_id: conversationId,
      action_type: 'send_sms',
      description: 'Send EMM pre-approval link',
      status: 'pending',
      scheduled_for: new Date().toISOString()
    });
  }
  
  if (requestedActions.includes('schedule_showing')) {
    const propertyAddress = extractionData.interested_properties?.[0]?.address || 'property mentioned in call';
    actions.push({
      lead_id: leadId,
      conversation_id: conversationId,
      action_type: 'schedule_showing',
      description: `Schedule showing for ${propertyAddress}`,
      status: 'pending',
      scheduled_for: getNextBusinessDay()
    });
  }
  
  if (requestedActions.includes('credit_review')) {
    actions.push({
      lead_id: leadId,
      conversation_id: conversationId,
      action_type: 'credit_review_followup',
      description: 'Credit team to provide free review',
      status: 'pending',
      scheduled_for: getNextBusinessDay()
    });
  }
  
  if (requestedActions.includes('callback')) {
    actions.push({
      lead_id: leadId,
      conversation_id: conversationId,
      action_type: 'callback',
      description: 'Follow-up call requested',
      status: 'pending',
      scheduled_for: extractionData.callback_time || getNextBusinessDay()
    });
  }
  
  // High-priority follow-up for hot leads
  if (extractionData.buying_timeline === 'immediately' || extractionData.buying_timeline === '1-3_months') {
    actions.push({
      lead_id: leadId,
      conversation_id: conversationId,
      action_type: 'priority_followup',
      description: 'Hot lead - immediate follow-up required',
      status: 'pending',
      scheduled_for: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours from now
    });
  }
  
  if (actions.length > 0) {
    const { error } = await supabase.from('actions').insert(actions);
    if (error) {
      console.error("Error creating actions:", error);
    } else {
      console.log(`Created ${actions.length} actions for lead ${leadId}`);
    }
  }
}

// Helper function to handle specific requests
async function handleSpecificRequests(leadId: string, extractionData: any, phoneNumber: string) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://qvarmbhdradfpkegtpgw.supabase.co';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const requestedActions = extractionData.requested_actions || [];
  
  // Schedule callback if mentioned
  if (requestedActions.includes('callback')) {
    const { error: callbackError } = await supabase
      .from('scheduled_callbacks')
      .insert({
        lead_id: leadId,
        phone_number: phoneNumber,
        callback_datetime: extractionData.callback_time || getNextBusinessDay(),
        callback_reason: extractionData.callback_reason || 'Follow-up requested during conversation',
        callback_type: 'general',
        status: 'scheduled'
      });

    if (callbackError) {
      console.error("Error scheduling callback:", callbackError);
    } else {
      console.log("Callback scheduled successfully");
    }
  }
  
  // TODO: Implement SMS sending for pre-approval links
  if (requestedActions.includes('send_preapproval_link')) {
    console.log(`TODO: Send pre-approval link to ${phoneNumber}`);
    // await sendSMS(phoneNumber, `Hi! Here's your pre-approval link: ${EMM_PREAPPROVAL_URL}`);
  }
}

// Helper function to get next business day
function getNextBusinessDay(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // If tomorrow is Saturday (6) or Sunday (0), move to Monday
  if (tomorrow.getDay() === 6) {
    tomorrow.setDate(tomorrow.getDate() + 2);
  } else if (tomorrow.getDay() === 0) {
    tomorrow.setDate(tomorrow.getDate() + 1);
  }
  
  // Set to 10 AM
  tomorrow.setHours(10, 0, 0, 0);
  return tomorrow.toISOString();
}
