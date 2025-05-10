
// This edge function helps diagnose connection issues between Supabase and the frontend
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the Supabase URL and service role key from environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get a count of all leads
    const { data: leadsCount, error: countError } = await supabase
      .from('leads')
      .select('*', { count: 'exact' });

    if (countError) {
      throw new Error(`Error counting leads: ${countError.message}`);
    }

    // Get the most recent lead
    const { data: recentLead, error: recentError } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (recentError && recentError.code !== 'PGRST116') { // PGRST116 is "no rows returned" which is ok
      console.error('Error fetching most recent lead:', recentError);
    }

    // Get the statuses of all leads to check for case sensitivity issues
    const { data: statuses, error: statusesError } = await supabase
      .from('leads')
      .select('id, status')
      .order('created_at', { ascending: false });

    if (statusesError) {
      console.error('Error fetching statuses:', statusesError);
    }

    // Get table info to verify structure
    const { data: tableInfo, error: tableInfoError } = await supabase
      .rpc('get_table_info', { table_name: 'leads' });

    if (tableInfoError) {
      console.error('Error fetching table info:', tableInfoError);
    }

    // Send back all diagnostic information
    const diagnosticData = {
      timestamp: new Date().toISOString(),
      environment: {
        supabaseUrl: supabaseUrl,
        hasServiceKey: !!supabaseKey,
      },
      leadsCount: leadsCount?.length || 0,
      recentLead: recentLead || null,
      leadStatuses: statuses || [],
      tableInfo: tableInfo || null,
      errors: {
        countError: countError?.message || null,
        recentError: recentError?.code === 'PGRST116' ? 'No leads found' : recentError?.message || null,
        statusesError: statusesError?.message || null,
        tableInfoError: tableInfoError?.message || null,
      }
    };

    return new Response(
      JSON.stringify(diagnosticData),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Diagnostic error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
