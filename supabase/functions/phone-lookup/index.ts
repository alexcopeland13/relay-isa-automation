
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
    
    const { phone_number } = await req.json();
    
    if (!phone_number) {
      throw new Error('phone_number is required');
    }

    console.log(`Looking up phone number: ${phone_number}`);
    
    // Lookup phone number in mapping table
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
          notes,
          source,
          created_at,
          last_contacted
        )
      `)
      .eq('phone_e164', phone_number)
      .single();

    if (lookupError) {
      console.log(`No lead found for ${phone_number}:`, lookupError);
      return new Response(
        JSON.stringify({
          success: false,
          message: 'No lead found for this phone number',
          phone_number
        }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Prepare comprehensive lead context
    const leadContext = {
      lead_id: phoneMapping.leads?.id,
      lead_name: phoneMapping.lead_name,
      first_name: phoneMapping.leads?.first_name,
      last_name: phoneMapping.leads?.last_name,
      email: phoneMapping.leads?.email,
      status: phoneMapping.leads?.status,
      source: phoneMapping.leads?.source,
      cinc_lead_id: phoneMapping.leads?.cinc_lead_id,
      property_interests: phoneMapping.property_interests || {},
      cinc_data: phoneMapping.cinc_data || {},
      last_updated: phoneMapping.last_updated,
      phone_raw: phoneMapping.phone_raw,
      phone_e164: phoneMapping.phone_e164,
      // Derived context for voice agent
      greeting_context: {
        has_favorited_properties: (phoneMapping.cinc_data?.favorited_properties || []).length > 0,
        buyer_timeline: phoneMapping.cinc_data?.buyer_timeline || 'not_specified',
        preferred_cities: phoneMapping.property_interests?.search_criteria?.preferred_cities || [],
        price_range: {
          min: phoneMapping.property_interests?.search_criteria?.min_price,
          max: phoneMapping.property_interests?.search_criteria?.max_price
        }
      }
    };

    console.log(`Found lead context for ${phone_number}:`, leadContext);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Lead context found',
        lead_context: leadContext
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error("Error in phone lookup:", error);
    
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
