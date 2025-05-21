
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Database } from '../_shared/database.types.ts'; // Assuming you'll place a shared types file

// Define the expected request body structure
interface ScheduleRequestBody {
  lead_id: string;
  scheduled_at: string; // ISO 8601 string
  appointment_type: 'phone_call' | 'in_person' | 'zoom';
  duration?: number;
  notes?: string;
}

// CORS Headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Adjust to your Retell/frontend domain in production
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to validate UUID
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  return uuidRegex.test(uuid);
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  let supabaseClient: SupabaseClient<Database>;
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY');
      return new Response(JSON.stringify({ error: 'Server configuration error.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
  } catch (e) {
    console.error('Failed to initialize Supabase client:', e);
    return new Response(JSON.stringify({ error: 'Failed to initialize Supabase client.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed. Please use POST.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405,
    });
  }

  try {
    const body: ScheduleRequestBody = await req.json();

    // Validate request body
    if (!body.lead_id || !isValidUUID(body.lead_id)) {
      return new Response(JSON.stringify({ error: 'Missing or invalid lead_id (must be a UUID).' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
    if (!body.scheduled_at || isNaN(new Date(body.scheduled_at).getTime())) {
      return new Response(JSON.stringify({ error: 'Missing or invalid scheduled_at (must be a valid ISO 8601 date string).' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
    if (!body.appointment_type || !['phone_call', 'in_person', 'zoom'].includes(body.appointment_type)) {
      return new Response(JSON.stringify({ error: "Invalid appointment_type. Must be 'phone_call', 'in_person', or 'zoom'." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
    if (body.duration !== undefined && (typeof body.duration !== 'number' || body.duration <= 0)) {
        return new Response(JSON.stringify({ error: 'Invalid duration. Must be a positive number.' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }


    const appointmentToInsert: Database['public']['Tables']['appointments']['Insert'] = {
      lead_id: body.lead_id,
      scheduled_at: new Date(body.scheduled_at).toISOString(),
      appointment_type: body.appointment_type,
      duration: body.duration, // Will use DB default if undefined
      notes: body.notes,
      // specialist_id will be null by default
      // status will use DB default 'scheduled'
    };

    const { data, error } = await supabaseClient
      .from('appointments')
      .insert(appointmentToInsert)
      .select()
      .single(); // Assuming we want the created record back

    if (error) {
      console.error('Supabase error:', error);
      // Check for specific errors, e.g., foreign key violation for lead_id
      if (error.code === '23503' && error.details?.includes('lead_id')) {
         return new Response(JSON.stringify({ error: `Invalid lead_id: ${body.lead_id} does not exist.` }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }
      return new Response(JSON.stringify({ error: 'Failed to create appointment.', details: error.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    console.log('Appointment created:', data);
    return new Response(JSON.stringify({ success: true, appointment: data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 201, // 201 Created
    });

  } catch (e) {
    console.error('Error processing request:', e);
    if (e instanceof SyntaxError) { // JSON parsing error
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
