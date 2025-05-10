
// This edge function creates a SQL function to get table information
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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // SQL to create the function that gets table information
    const sql = `
      CREATE OR REPLACE FUNCTION public.create_get_table_info_function()
      RETURNS boolean
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        -- Create the function if it doesn't exist
        CREATE OR REPLACE FUNCTION public.get_table_info(table_name text)
        RETURNS jsonb
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $func$
        DECLARE
          result jsonb;
        BEGIN
          SELECT 
            jsonb_agg(
              jsonb_build_object(
                'column_name', column_name,
                'data_type', data_type,
                'is_nullable', is_nullable,
                'column_default', column_default
              )
            ) INTO result
          FROM 
            information_schema.columns
          WHERE 
            table_schema = 'public' AND table_name = $1;
          
          RETURN result;
        END;
        $func$;

        RETURN TRUE;
      END;
      $$;
    `;

    const { error } = await supabase.rpc('exec_sql', { sql })

    if (error) {
      // If the exec_sql function doesn't exist, create it first
      if (error.message.includes('function exec_sql() does not exist')) {
        const createExecSql = `
          CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
          RETURNS boolean
          LANGUAGE plpgsql
          SECURITY DEFINER
          AS $$
          BEGIN
            EXECUTE sql;
            RETURN TRUE;
          END;
          $$;
        `;
        
        const { error: execSqlError } = await supabase.rpc('exec_sql', { sql: createExecSql })
        
        if (execSqlError) {
          // If we still can't create it, try direct SQL execution as a fallback
          await supabase.sql(createExecSql)
          await supabase.sql(sql)
        } else {
          await supabase.rpc('exec_sql', { sql })
        }
      } else {
        // Try direct SQL execution as a fallback
        await supabase.sql(sql)
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Table info function created' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
