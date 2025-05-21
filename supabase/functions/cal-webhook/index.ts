import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Database } from '../_shared/database.types.ts';

// Define Cal.com webhook payload structure based on user's new request
interface CalWebhookPayload {
  type: 'booking.created' | 'booking.rescheduled' | 'booking.canceled';
  payload: {
    booking?: CalBooking; // New structure where booking might be nested
    // Allow other properties if payload is booking itself
    id?: string;
    startTime?: string;
    endTime?: string;
    notes?: string;
    metadata?: {
      lead_id?: string;
    };
    [key: string]: any;
  };
}

interface CalBooking {
  id: string;          // This is the cal_booking_id
  startTime: string;   // ISO 8601 string
  endTime: string;     // ISO 8601 string
  notes?: string | null;
  metadata?: {
    lead_id?: string;
  };
  // other fields from Cal.com payload might exist
  [key: string]: any; 
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', 
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cal-secret',
};

// Helper function to validate UUID (can be kept if lead_id needs validation, though user snippet doesn't explicitly validate)
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

  // Verify secret header
  const calSecret = Deno.env.get("CAL_SECRET");
  if (!calSecret) {
    console.error('cal-webhook: CAL_SECRET is not configured in environment variables.');
    return new Response(JSON.stringify({ error: 'Server configuration error: Missing secret.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
  const providedSecret = req.headers.get("x-cal-secret");
  if (providedSecret !== calSecret) {
    console.warn('cal-webhook: Forbidden - Invalid X-Cal-Secret header.');
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 403,
    });
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
    // Use SUPABASE_SERVICE_ROLE_KEY as per user's new snippet
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'); 

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('cal-webhook: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
      return new Response(JSON.stringify({ error: 'Server configuration error.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }
    supabaseClient = createClient<Database>(supabaseUrl, supabaseServiceRoleKey);
    console.log('cal-webhook: Supabase client initialized with service role key.');
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
    
    // Supports both { payload: { booking: { ... } } } and { payload: { ... directly booking fields } }
    const booking: CalBooking | undefined = payload?.booking || payload;

    if (!booking || !booking.id || !booking.startTime || !booking.endTime) {
      console.warn('cal-webhook: Invalid booking data. Missing id, startTime, or endTime.', booking);
      return new Response(JSON.stringify({ error: 'Invalid booking data in payload.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Validate start and end times before calculation
    const startTimeMs = new Date(booking.startTime).getTime();
    const endTimeMs = new Date(booking.endTime).getTime();

    if (isNaN(startTimeMs) || isNaN(endTimeMs)) {
        console.warn('cal-webhook: Invalid startTime or endTime format.', booking);
        return new Response(JSON.stringify({ error: 'Invalid startTime or endTime format.' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
    
    const durationMinutes = (endTimeMs - startTimeMs) / 60000;
    if (durationMinutes <= 0 && type !== 'booking.canceled') { // Duration can be irrelevant for cancel
        console.warn('cal-webhook: Invalid duration (must be positive).', { startTime: booking.startTime, endTime: booking.endTime });
        return new Response(JSON.stringify({ error: 'Invalid duration: endTime must be after startTime.' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }

    const appointmentData: Partial<Database['public']['Tables']['appointments']['Insert']> = {
      cal_booking_id: booking.id,
      scheduled_at: new Date(booking.startTime).toISOString(),
      duration: durationMinutes,
      appointment_type: "phone_call",
      notes: booking.notes ?? null,
      lead_id: booking.metadata?.lead_id ?? null, // DB foreign key will validate lead_id if present
    };

    if (appointmentData.lead_id && !isValidUUID(appointmentData.lead_id)) {
        console.warn('cal-webhook: Invalid lead_id UUID format.', booking.metadata);
        // According to user snippet, lead_id is optional (?? null). If present, it should be valid.
        // If your DB has a FK constraint on lead_id, inserting an invalid non-null UUID will fail.
        // If it's null, it's fine. Let's proceed and let DB handle FK, or add specific error if required.
        // For now, just logging, as user's snippet doesn't block on this.
    }

    if (type === 'booking.created') {
      console.log(`cal-webhook: Handling booking.created for ${booking.id}`);
      const { error } = await supabaseClient
        .from('appointments')
        .insert({
          ...appointmentData,
          status: "scheduled",
        } as Database['public']['Tables']['appointments']['Insert']) // Cast to ensure all required fields if any
        .select() // Keep select to potentially check for errors, even if using onConflict.ignore
        .maybeSingle(); // Use maybeSingle with onConflict.ignore or handle potential null data

      if (error) {
        console.error('cal-webhook: Supabase error on insert (booking.created):', error);
         // If onConflict().ignore() is used, an error for duplicate key (23505) shouldn't occur for cal_booking_id.
         // However, other errors like invalid lead_id (23503) can still happen.
        if (error.code === '23503' && error.details?.includes('lead_id')) {
            return new Response(JSON.stringify({ error: `Invalid lead_id: ${appointmentData.lead_id} does not exist.` }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400, // Bad request due to invalid lead_id
            });
        }
        return new Response(JSON.stringify({ error: 'Failed to create appointment.', details: error.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }
      console.log('cal-webhook: Appointment creation processed for cal_booking_id:', booking.id);

    } else if (type === 'booking.rescheduled') {
      console.log(`cal-webhook: Handling booking.rescheduled for ${booking.id}`);
      const { data, error } = await supabaseClient
        .from('appointments')
        .update({ 
          scheduled_at: appointmentData.scheduled_at,
          duration: appointmentData.duration, // Also update duration on reschedule
          status: "rescheduled" // As per user's new spec
        })
        .eq('cal_booking_id', booking.id)
        .select()
        .single(); // Expect one row to be updated

      if (error) {
        console.error('cal-webhook: Supabase error on update (booking.rescheduled):', error);
         if (error.code === 'PGRST204') { // PostgREST code for no rows found
          return new Response(JSON.stringify({ error: `Appointment with cal_booking_id ${booking.id} not found to reschedule.` }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404,
          });
        }
        return new Response(JSON.stringify({ error: 'Failed to reschedule appointment.', details: error.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }
       if (!data) { 
         console.warn(`cal-webhook: No appointment found with cal_booking_id ${booking.id} to reschedule (should be caught by PGRST204).`);
         return new Response(JSON.stringify({ error: `Appointment with cal_booking_id ${booking.id} not found.` }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404,
         });
      }
      console.log('cal-webhook: Appointment rescheduled:', data);

    } else if (type === 'booking.canceled') {
      console.log(`cal-webhook: Handling booking.canceled for ${booking.id}`);
      const { data, error } = await supabaseClient
        .from('appointments')
        .update({ status: "canceled" })
        .eq('cal_booking_id', booking.id)
        .select()
        .single(); // Expect one row to be updated
      
      if (error) {
        console.error('cal-webhook: Supabase error on update (booking.canceled):', error);
        if (error.code === 'PGRST204') { 
          return new Response(JSON.stringify({ error: `Appointment with cal_booking_id ${booking.id} not found to cancel.` }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404,
          });
        }
        return new Response(JSON.stringify({ error: 'Failed to cancel appointment.', details: error.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }
       if (!data) { 
         console.warn(`cal-webhook: No appointment found with cal_booking_id ${booking.id} to cancel (should be caught by PGRST204).`);
         return new Response(JSON.stringify({ error: `Appointment with cal_booking_id ${booking.id} not found.` }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404,
         });
      }
      console.log('cal-webhook: Appointment canceled:', data);

    } else {
      console.warn('cal-webhook: Unknown event type received:', type);
      // This case should ideally not be reached if `type` is strictly one of the three.
      // However, as a safeguard:
      const knownTypes: string[] = ['booking.created', 'booking.rescheduled', 'booking.canceled'];
      if (!knownTypes.includes(type)) {
        return new Response(JSON.stringify({ error: `Unknown event type: ${type}` }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }
    }

    console.log('cal-webhook: Successfully processed event:', type, booking.id);
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (e) {
    console.error('cal-webhook: Error processing request:', e);
    if (e instanceof SyntaxError) { 
        console.warn('cal-webhook: Invalid JSON payload.');
        return new Response(JSON.stringify({ error: 'Invalid JSON payload.' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
    return new Response(JSON.stringify({ error: 'An unexpected error occurred.', details: e.message || String(e) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
