
// This edge function performs a comprehensive diagnosis of Supabase connectivity and data flow
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Collect diagnostics about Supabase environment
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://qvarmbhdradfpkegtpgw.supabase.co';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    // Create diagnostics result object
    const diagnosticResult = {
      environment: {
        supabaseUrl: Boolean(supabaseUrl),
        hasServiceKey: Boolean(supabaseServiceKey),
        timestamp: new Date().toISOString()
      },
      errors: {
        connection: null,
        tableInfo: null,
        leadsQuery: null,
        specificsQuery: null
      },
      leadsCount: 0,
      tableInfo: null,
      leadStatuses: [],
      recentLead: null,
      agentSources: {
        vapiCount: 0,
        retellCount: 0,
        otherCount: 0
      }
    };
    
    // Check for missing configuration
    if (!supabaseUrl || !supabaseServiceKey) {
      if (!supabaseUrl) diagnosticResult.errors.connection = "Missing SUPABASE_URL";
      if (!supabaseServiceKey) diagnosticResult.errors.connection = "Missing SUPABASE_SERVICE_ROLE_KEY";
      
      return new Response(
        JSON.stringify(diagnosticResult),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    try {
      // Try to get basic database information instead of using the get_table_info function
      // This avoids the dependency on a function that may not exist
      const { data: tablesData, error: tableError } = await supabase
        .from('leads')
        .select('count')
        .limit(1);
      
      if (tableError) {
        console.error("Error getting table info:", tableError);
        diagnosticResult.errors.tableInfo = tableError.message;
      } else {
        diagnosticResult.tableInfo = {
          exists: true,
          message: "Table 'leads' exists and is accessible"
        };
      }
    } catch (tableInfoErr) {
      console.error("Exception getting table info:", tableInfoErr);
      diagnosticResult.errors.tableInfo = tableInfoErr instanceof Error ? tableInfoErr.message : String(tableInfoErr);
    }

    try {
      // Get basic leads count
      const { data: leadsData, error: leadsError, count } = await supabase
        .from('leads')
        .select('*', { count: 'exact' });
      
      if (leadsError) {
        console.error("Error getting leads:", leadsError);
        diagnosticResult.errors.leadsQuery = leadsError.message;
      } else {
        diagnosticResult.leadsCount = count || 0;
        
        // Get specifically status values to check for case sensitivity issues
        const { data: statusesData, error: statusesError } = await supabase
          .from('leads')
          .select('id, status, source');
        
        if (statusesError) {
          console.error("Error getting lead statuses:", statusesError);
          diagnosticResult.errors.specificsQuery = statusesError.message;
        } else {
          diagnosticResult.leadStatuses = statusesData || [];
          
          // Count leads by agent source
          if (statusesData) {
            statusesData.forEach((lead) => {
              const source = (lead.source || '').toLowerCase();
              if (source.includes('vapi')) {
                diagnosticResult.agentSources.vapiCount++;
              } else if (source.includes('retell')) {
                diagnosticResult.agentSources.retellCount++;
              } else {
                diagnosticResult.agentSources.otherCount++;
              }
            });
          }
        }
        
        // Get most recent lead
        if (leadsData && leadsData.length > 0) {
          const { data: recentData, error: recentError } = await supabase
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
          
          if (!recentError && recentData) {
            diagnosticResult.recentLead = recentData;
          }
        }
      }
    } catch (leadsQueryErr) {
      console.error("Exception getting leads:", leadsQueryErr);
      diagnosticResult.errors.leadsQuery = leadsQueryErr instanceof Error ? leadsQueryErr.message : String(leadsQueryErr);
    }

    return new Response(
      JSON.stringify(diagnosticResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error("Unexpected error during diagnostics:", err);
    
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : String(err),
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
