import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Database } from '../_shared/database.types.ts';

// Define Cal.com webhook payload structure
interface CalWebhookPayload {
  type: 'BOOKING_CREATED' | 'BOOKING_RESCHEDULED' | 'BOOKING_CANCELLED'; // Based on user's input: "type":"booking.created"|...
                                                                      // Cal.com usually uses "triggerEvent" for this. We will adapt to "type".
                                                                      // Also, Cal.com standard types are BOOKING_CREATED, BOOKING_RESCHEDULED, BOOKING_CANCELLED.
                                                                      // User specified booking.created. Assuming they meant the part after booking.*
                                                                      // Let's use user's specified "booking.created" type format.
  // Renaming to match user's request { "type":"booking.created"|... , "payload":{...}}.
  // type: 'booking.created' | 'booking.rescheduled' | 'booking.cancelled';
  payload: {
    startTime?: string; // ISO 8601 string
    endTime?: string;   // ISO 8601 string
    uid: string;       // This is the cal_booking_id
    metadata?: {
      lead_id?: string;
    };
    // other fields from Cal.com payload might exist
    [key: string]: any; // Allow other properties
  };
}


const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Adjust to Cal.com's IP or a more restrictive origin in production
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to validate UUID
function isValidUUID(uuid: string): boolean {
  if (!uuid) return false;
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  return uuidRegex.test(uuid);
}

serve(async (req: Request) => {
  console.log(`cal-webhook: Received ${req.method} request`);

  if (req.method === 'OPTIONS') {
    console.log('cal-webhook: Handling OPTIONS request');
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    console.warn('cal-webhook: Method not allowed:', req.method);
    return new Response(JSON.stringify({ error: 'Method not allowed. Please use POST.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405,
    });
  }

  let supabaseClient: SupabaseClient<Database>;
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY'); // Service role key for sensitive operations if needed

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('cal-webhook: Missing SUPABASE_URL or SUPABASE_ANON_KEY');
      return new Response(JSON.stringify({ error: 'Server configuration error.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }
    // Use anon key for webhooks unless specific elevated privileges are required for writes,
    // in which case service_role key should be used CAREFULLY.
    // For now, anon key is fine as RLS is not being changed for this.
    supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
    console.log('cal-webhook: Supabase client initialized.');
  } catch (e) {
    console.error('cal-webhook: Failed to initialize Supabase client:', e);
    return new Response(JSON.stringify({ error: 'Failed to initialize Supabase client.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }

  try {
    const body: CalWebhookPayload = await req.json();
    console.log('cal-webhook: Request body parsed:', body);

    const { type, payload } = body;

    if (!type || !payload) {
      console.warn('cal-webhook: Invalid payload structure. Missing type or payload.', body);
      return new Response(JSON.stringify({ error: 'Invalid payload structure. Missing type or payload.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
    
    if (!payload.uid) {
        console.warn('cal-webhook: Missing cal_booking_id (payload.uid).', payload);
        return new Response(JSON.stringify({ error: 'Missing cal_booking_id (payload.uid).' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }

    const calBookingId = payload.uid;

    if (type === 'BOOKING_CREATED') {
      console.log(`cal-webhook: Handling BOOKING_CREATED for ${calBookingId}`);
      if (!payload.metadata?.lead_id || !isValidUUID(payload.metadata.lead_id)) {
        console.warn('cal-webhook: Missing or invalid lead_id for BOOKING_CREATED.', payload.metadata);
        return new Response(JSON.stringify({ error: 'Missing or invalid lead_id (must be a UUID).' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }
      if (!payload.startTime || isNaN(new Date(payload.startTime).getTime())) {
        console.warn('cal-webhook: Missing or invalid startTime for BOOKING_CREATED.', payload);
        return new Response(JSON.stringify({ error: 'Missing or invalid startTime.' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }
      if (!payload.endTime || isNaN(new Date(payload.endTime).getTime())) {
        console.warn('cal-webhook: Missing or invalid endTime for BOOKING_CREATED.', payload);
        return new Response(JSON.stringify({ error: 'Missing or invalid endTime.' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }

      const leadId = payload.metadata.lead_id;
      const scheduledAt = new Date(payload.startTime).toISOString();
      const endTime = new Date(payload.endTime).toISOString();
      const durationMinutes = (new Date(endTime).getTime() - new Date(scheduledAt).getTime()) / (1000 * 60);

      if (durationMinutes <= 0) {
        console.warn('cal-webhook: Invalid duration (must be positive) for BOOKING_CREATED.', { scheduledAt, endTime });
        return new Response(JSON.stringify({ error: 'Invalid duration: endTime must be after startTime.' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
      }

      const appointmentToInsert: Database['public']['Tables']['appointments']['Insert'] = {
        lead_id: leadId,
        scheduled_at: scheduledAt,
        duration: durationMinutes,
        appointment_type: 'phone_call', // As per requirement
        status: 'scheduled',           // As per requirement
        cal_booking_id: calBookingId,
        notes: `Booked via Cal.com. Title: ${payload.title || 'N/A'}` // Optional: add title as note
      };

      console.log('cal-webhook: Inserting appointment:', appointmentToInsert);
      const { data, error } = await supabaseClient
        .from('appointments')
        .insert(appointmentToInsert)
        .select()
        .single();

      if (error) {
        console.error('cal-webhook: Supabase error on insert:', error);
        if (error.code === '23505' && error.message.includes('appointments_cal_booking_id_key')) {
            return new Response(JSON.stringify({ error: `Booking with cal_booking_id ${calBookingId} already exists.` }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 409, // Conflict
            });
        }
        if (error.code === '23503' && error.details?.includes('lead_id')) {
            return new Response(JSON.stringify({ error: `Invalid lead_id: ${leadId} does not exist.` }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            });
        }
        return new Response(JSON.stringify({ error: 'Failed to create appointment.', details: error.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }
      console.log('cal-webhook: Appointment created:', data);

    } else if (type === 'BOOKING_RESCHEDULED') {
      console.log(`cal-webhook: Handling BOOKING_RESCHEDULED for ${calBookingId}`);
      if (!payload.startTime || isNaN(new Date(payload.startTime).getTime())) {
         console.warn('cal-webhook: Missing or invalid startTime for BOOKING_RESCHEDULED.', payload);
        return new Response(JSON.stringify({ error: 'Missing or invalid new startTime.' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }
       if (!payload.endTime || isNaN(new Date(payload.endTime).getTime())) {
        console.warn('cal-webhook: Missing or invalid endTime for BOOKING_RESCHEDULED.', payload);
        return new Response(JSON.stringify({ error: 'Missing or invalid new endTime.' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }

      const newScheduledAt = new Date(payload.startTime).toISOString();
      const newEndTime = new Date(payload.endTime).toISOString();
      const newDurationMinutes = (new Date(newEndTime).getTime() - new Date(newScheduledAt).getTime()) / (1000 * 60);

      if (newDurationMinutes <= 0) {
        console.warn('cal-webhook: Invalid duration for BOOKING_RESCHEDULED.', { newScheduledAt, newEndTime });
        return new Response(JSON.stringify({ error: 'Invalid duration: new endTime must be after new startTime.' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
      }

      const appointmentToUpdate: Database['public']['Tables']['appointments']['Update'] = {
        scheduled_at: newScheduledAt,
        duration: newDurationMinutes,
        status: 'scheduled', // Ensure status is reset to scheduled on reschedule
      };

      console.log('cal-webhook: Updating appointment:', calBookingId, appointmentToUpdate);
      const { data, error } = await supabaseClient
        .from('appointments')
        .update(appointmentToUpdate)
        .eq('cal_booking_id', calBookingId)
        .select()
        .single();

      if (error) {
        console.error('cal-webhook: Supabase error on update (reschedule):', error);
         if (error.code === 'PGRST204') { // PostgREST code for no rows found
          return new Response(JSON.stringify({ error: `Appointment with cal_booking_id ${calBookingId} not found.` }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404,
          });
        }
        return new Response(JSON.stringify({ error: 'Failed to reschedule appointment.', details: error.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }
      if (!data) { // Should be caught by PGRST204, but as a safeguard
         console.warn(`cal-webhook: No appointment found with cal_booking_id ${calBookingId} to reschedule.`);
         return new Response(JSON.stringify({ error: `Appointment with cal_booking_id ${calBookingId} not found.` }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404,
         });
      }
      console.log('cal-webhook: Appointment rescheduled:', data);

    } else if (type === 'BOOKING_CANCELLED') {
      console.log(`cal-webhook: Handling BOOKING_CANCELLED for ${calBookingId}`);
      const appointmentToUpdate: Database['public']['Tables']['appointments']['Update'] = {
        status: 'canceled',
      };

      console.log('cal-webhook: Updating appointment (cancel):', calBookingId, appointmentToUpdate);
      const { data, error } = await supabaseClient
        .from('appointments')
        .update(appointmentToUpdate)
        .eq('cal_booking_id', calBookingId)
        .select()
        .single();
      
      if (error) {
        console.error('cal-webhook: Supabase error on update (cancel):', error);
        if (error.code === 'PGRST204') { // PostgREST code for no rows found
          return new Response(JSON.stringify({ error: `Appointment with cal_booking_id ${calBookingId} not found.` }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404,
          });
        }
        return new Response(JSON.stringify({ error: 'Failed to cancel appointment.', details: error.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }
       if (!data) { // Should be caught by PGRST204, but as a safeguard
         console.warn(`cal-webhook: No appointment found with cal_booking_id ${calBookingId} to cancel.`);
         return new Response(JSON.stringify({ error: `Appointment with cal_booking_id ${calBookingId} not found.` }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404,
         });
      }
      console.log('cal-webhook: Appointment canceled:', data);

    } else {
      console.warn('cal-webhook: Unknown event type received:', type);
      return new Response(JSON.stringify({ error: `Unknown event type: ${type}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    console.log('cal-webhook: Successfully processed event:', type, calBookingId);
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (e) {
    console.error('cal-webhook: Error processing request:', e);
    if (e instanceof SyntaxError) { // JSON parsing error
        console.warn('cal-webhook: Invalid JSON payload.');
        return new Response(JSON.stringify({ error: 'Invalid JSON payload.' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
    return new Response(JSON.stringify({ error: 'An unexpected error occurred.', details: e.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
