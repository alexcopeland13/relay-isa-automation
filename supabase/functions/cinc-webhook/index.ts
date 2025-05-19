import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { parsePhoneNumberWithError, PhoneNumber } from 'https://esm.sh/libphonenumber-js@1.12.8/max';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cinc-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const CINC_WEBHOOK_EVENT_TYPE_NEW_LEAD = 'NEW_LEAD_WEBHOOK';
const CINC_WEBHOOK_EVENT_TYPE_UPDATED_LEAD = 'LEAD_UPDATE_WEBHOOK';
const CINC_WEBHOOK_EVENT_TYPE_NOTE_ADDED = 'NOTE_ADDED_WEBHOOK'; // Example of another event type

async function verifySignature(request: Request, secret: string): Promise<boolean> {
  const signature = request.headers.get('x-cinc-signature');
  if (!signature) {
    console.warn('Signature missing');
    return false;
  }

  const body = await request.clone().text();
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );

  const data = encoder.encode(body);
  const verified = await crypto.subtle.verify('HMAC', key, hexToBytes(signature), data);
  return verified;
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

// Export normalizePhoneNumber for testing
export function normalizePhoneNumber(phone: string | undefined | null, country: string = 'US'): { phone_raw?: string, phone_e164?: string } {
  if (!phone) {
    return { phone_raw: undefined, phone_e164: undefined };
  }
  const phone_raw = phone;
  try {
    const phoneNumber: PhoneNumber | undefined = parsePhoneNumberWithError(phone, country as any);
    if (phoneNumber && phoneNumber.isValid()) {
      return { phone_raw, phone_e164: phoneNumber.format('E.164') };
    }
    console.warn(`Invalid phone number: ${phone}`);
    return { phone_raw, phone_e164: undefined };
  } catch (error) {
    console.warn(`Error parsing phone number ${phone}:`, error.message);
    return { phone_raw, phone_e164: undefined };
  }
}


serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}` } } }
  );

  const cincWebhookSecret = Deno.env.get('CINC_WEBHOOK_SECRET');
  if (!cincWebhookSecret) {
    console.error('CINC_WEBHOOK_SECRET is not set in environment variables.');
    return new Response(JSON.stringify({ error: 'Webhook secret not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const isVerified = await verifySignature(req.clone(), cincWebhookSecret);
  if (!isVerified) {
    console.warn('Invalid signature');
    return new Response(JSON.stringify({ error: 'Invalid signature' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const payload = await req.json();
    console.log('Received CINC webhook payload:', JSON.stringify(payload, null, 2));

    const eventId = payload.event_id || payload.data?.event_id || `${payload.event_type}-${Date.now()}`;

    const { error: eventError } = await supabaseClient
      .from('webhook_events')
      .insert({
        provider: 'CINC',
        event_id: eventId,
        payload: payload,
      });

    if (eventError) {
      console.error('Error storing webhook event:', eventError);
      // Potentially proceed if this is not critical, or return error
    }
    
    const eventType = payload.event_type;
    const leadData = payload.data?.buyer || payload.data;

    if (!leadData) {
        console.error('No lead data found in payload:', payload);
        return new Response(JSON.stringify({ error: 'No lead data in payload' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    const cincLeadId = String(leadData.lead_id || leadData.id);

    if (!cincLeadId) {
      console.error('CINC Lead ID missing from payload data:', leadData);
      return new Response(JSON.stringify({ error: 'CINC Lead ID missing' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (eventType === CINC_WEBHOOK_EVENT_TYPE_NEW_LEAD || eventType === CINC_WEBHOOK_EVENT_TYPE_UPDATED_LEAD) {
      const { phone_raw, phone_e164 } = normalizePhoneNumber(leadData.phone1 || leadData.phone);
      
      const leadRecord = {
        cinc_lead_id: cincLeadId,
        first_name: leadData.first_name,
        last_name: leadData.last_name,
        email: leadData.email,
        phone_raw: phone_raw,
        phone_e164: phone_e164,
        source: leadData.source_type || 'CINC',
        status: leadData.pipeline_status?.toLowerCase() || 'new',
        notes: leadData.note || leadData.remarks,
      };

      console.log('Attempting to upsert lead:', JSON.stringify(leadRecord, null, 2));

      const { data: upsertedLead, error: upsertError } = await supabaseClient
        .from('leads')
        .upsert(leadRecord, { onConflict: 'cinc_lead_id', ignoreDuplicates: false })
        .select()
        .single();

      if (upsertError) {
        console.error('Error upserting lead:', upsertError);
        return new Response(JSON.stringify({ error: 'Failed to process lead data', details: upsertError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      console.log('Lead upserted successfully:', upsertedLead);
      return new Response(JSON.stringify({ message: 'Lead processed successfully', lead: upsertedLead }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (eventType === CINC_WEBHOOK_EVENT_TYPE_NOTE_ADDED) {
      // Handle note added event if necessary
        const noteContent = leadData.note_text || leadData.note;
        if (cincLeadId && noteContent) {
            const { data: existingLead, error: fetchError } = await supabaseClient
                .from('leads')
                .select('notes')
                .eq('cinc_lead_id', cincLeadId)
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116: "Query returned 0 rows"
                console.error('Error fetching lead for note addition:', fetchError);
            } else if (existingLead) {
                const updatedNotes = `${existingLead.notes || ''}\n\n[CINC Note - ${new Date().toISOString()}]:\n${noteContent}`.trim();
                const { error: updateError } = await supabaseClient
                    .from('leads')
                    .update({ notes: updatedNotes, last_contacted: new Date().toISOString() })
                    .eq('cinc_lead_id', cincLeadId);
                
                if (updateError) {
                    console.error('Error updating lead with new note:', updateError);
                } else {
                    console.log(`Note added to lead ${cincLeadId}`);
                }
            } else {
                 console.warn(`Lead with cinc_lead_id ${cincLeadId} not found for note addition.`);
            }
        }
        return new Response(JSON.stringify({ message: 'Note event received' }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } else {
      console.log(`Received unhandled CINC event_type: ${eventType}`);
      return new Response(JSON.stringify({ message: 'Event type not handled', event_type: eventType }), {
        status: 200, // Or 400 if you want to signify it's an unhandled type client-side
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error processing CINC webhook:', error);
    return new Response(JSON.stringify({ error: 'Internal server error', details: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
