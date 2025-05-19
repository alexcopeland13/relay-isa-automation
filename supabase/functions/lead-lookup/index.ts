
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { parsePhoneNumberWithError, PhoneNumber } from 'https://esm.sh/libphonenumber-js@1.12.8/max';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

function normalizePhoneNumberE164(phone: string | undefined | null, country: string = 'US'): string | undefined {
  if (!phone) {
    return undefined;
  }
  try {
    const phoneNumber: PhoneNumber | undefined = parsePhoneNumberWithError(phone, country as any);
    if (phoneNumber && phoneNumber.isValid()) {
      return phoneNumber.format('E.164');
    }
    return undefined; // Not a valid number or couldn't parse
  } catch (error) {
    console.warn(`Error parsing phone number ${phone} for E.164:`, error.message);
    return undefined;
  }
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // Use service role for querying leads
    { global: { headers: { Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}` } } }
  );

  const url = new URL(req.url);
  const phoneQuery = url.searchParams.get('phone');

  if (!phoneQuery) {
    return new Response(JSON.stringify({ error: 'Phone query parameter is required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const phone_e164 = normalizePhoneNumberE164(phoneQuery);

  if (!phone_e164) {
    return new Response(JSON.stringify({ error: 'Invalid phone number format' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { data: lead, error } = await supabaseClient
      .from('leads')
      .select('id, first_name, last_name, email, phone_raw, phone_e164, status, source, created_at, last_contacted, assigned_to, notes, cinc_lead_id') // Adjust fields as needed
      .eq('phone_e164', phone_e164)
      .maybeSingle(); // Use maybeSingle to handle cases where no lead is found

    if (error) {
      console.error('Error looking up lead:', error);
      return new Response(JSON.stringify({ error: 'Failed to lookup lead', details: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!lead) {
      return new Response(JSON.stringify({ message: 'Lead not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(lead), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Unexpected error in lead-lookup:', error);
    return new Response(JSON.stringify({ error: 'Internal server error', details: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
