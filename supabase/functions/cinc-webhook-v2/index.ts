
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { parsePhoneNumber } from 'https://esm.sh/libphonenumber-js@1.12.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cinc-signature',
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
    console.log('=== CINC WEBHOOK V2 RECEIVED ===');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if v2 system is enabled
    const { data: config } = await supabaseClient
      .from('system_config')
      .select('enabled')
      .eq('feature', 'cinc_ingestion_v2')
      .single();

    if (!config?.enabled) {
      console.log('CINC ingestion v2 is disabled, skipping processing');
      return new Response(JSON.stringify({ 
        status: 'disabled',
        message: 'CINC ingestion v2 is currently disabled' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const payload = await req.json();
    console.log('CINC payload received:', JSON.stringify(payload, null, 2));

    // Extract lead data from CINC payload
    const leadData = payload.lead || payload;
    const phoneRaw = leadData.phone || leadData.mobile_phone || leadData.phone_number;
    const phoneE164 = phoneRaw ? normalizePhone(phoneRaw) : null;

    if (!phoneE164) {
      throw new Error('No valid phone number found in CINC payload');
    }

    // Store in CINC mapping table for Make.com processing
    const { data: mapping, error: mappingError } = await supabaseClient
      .from('cinc_lead_mapping')
      .insert({
        cinc_lead_id: leadData.id || leadData.lead_id,
        cinc_contact_id: leadData.contact_id,
        phone_e164: phoneE164,
        phone_raw: phoneRaw,
        cinc_payload: payload,
        processing_status: 'pending'
      })
      .select()
      .single();

    if (mappingError) {
      console.error('Error storing CINC mapping:', mappingError);
      throw mappingError;
    }

    console.log('✅ CINC lead mapping created:', mapping.id);

    // Trigger Make.com workflow if enabled
    const { data: makecomConfig } = await supabaseClient
      .from('system_config')
      .select('enabled')
      .eq('feature', 'use_makecom_processing')
      .single();

    if (makecomConfig?.enabled) {
      // Log workflow execution
      await supabaseClient
        .from('makecom_workflows')
        .insert({
          workflow_name: 'cinc_ingestion_v2',
          input_data: { cinc_mapping_id: mapping.id, payload },
          status: 'running'
        });

      console.log('✅ Make.com workflow triggered for CINC ingestion');
    }

    return new Response(JSON.stringify({ 
      success: true,
      mapping_id: mapping.id,
      phone_e164: phoneE164,
      makecom_enabled: makecomConfig?.enabled || false
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('=== CINC WEBHOOK V2 ERROR ===');
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
