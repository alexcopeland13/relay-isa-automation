
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
    const { phoneNumber, message, leadId, actionId } = await req.json();
    
    console.log(`SMS request received for ${phoneNumber}`, { leadId, actionId });
    
    // Basic phone number validation
    if (!phoneNumber || typeof phoneNumber !== 'string') {
      throw new Error('Valid phone number is required');
    }
    
    if (!message || typeof message !== 'string') {
      throw new Error('Message content is required');
    }
    
    // Clean phone number (remove any non-digit characters except +)
    const cleanedPhone = phoneNumber.replace(/[^\d+]/g, '');
    if (cleanedPhone.length < 10) {
      throw new Error('Phone number must be at least 10 digits');
    }
    
    // Get Twilio credentials from environment
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const fromNumber = Deno.env.get('TWILIO_PHONE_NUMBER');
    
    if (!accountSid || !authToken || !fromNumber) {
      throw new Error('Twilio credentials not configured. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER');
    }
    
    console.log(`Sending SMS to ${cleanedPhone} from ${fromNumber}`);
    
    // Send SMS via Twilio
    const twilioResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: cleanedPhone,
          From: fromNumber,
          Body: message,
        }),
      }
    );
    
    const twilioData = await twilioResponse.json();
    
    if (!twilioResponse.ok) {
      console.error('Twilio API error:', twilioData);
      throw new Error(`Twilio error: ${twilioData.message || 'Failed to send SMS'}`);
    }
    
    console.log('SMS sent successfully:', twilioData.sid);
    
    // Update action status if actionId provided
    if (actionId) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      
      if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Supabase credentials not configured');
      } else {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        const { error: updateError } = await supabase
          .from('actions')
          .update({ 
            status: 'completed',
            completed_at: new Date().toISOString(),
            notes: `SMS sent successfully. Twilio SID: ${twilioData.sid}`
          })
          .eq('id', actionId);
        
        if (updateError) {
          console.error('Error updating action status:', updateError);
        } else {
          console.log(`Action ${actionId} marked as completed`);
        }
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'SMS sent successfully',
        twilioSid: twilioData.sid,
        to: cleanedPhone
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error('SMS sending error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
