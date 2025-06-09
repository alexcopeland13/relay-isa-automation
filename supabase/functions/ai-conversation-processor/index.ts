
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Import retry utility
interface RetryOptions {
  retries: number;
  backoff: number;
  maxBackoff?: number;
}

async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = { retries: 3, backoff: 2000, maxBackoff: 30000 }
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= options.retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === options.retries) {
        throw lastError;
      }
      
      const delay = Math.min(
        options.backoff * Math.pow(2, attempt),
        options.maxBackoff || 30000
      );
      
      console.log(`Retry attempt ${attempt + 1}/${options.retries + 1} failed, waiting ${delay}ms:`, error);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

function normalizePhone(phone: string): string {
  try {
    // Simple US phone normalization - more robust version would use libphonenumber
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) return `+1${cleaned}`;
    if (cleaned.length === 11 && cleaned.startsWith('1')) return `+${cleaned}`;
    return phone;
  } catch {
    return phone;
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, data } = await req.json();
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🤖 AI Conversation Processor called with action:', action);

    if (action === 'extract_entities') {
      const { conversation_id, transcript } = data;
      
      console.log('🔄 Processing conversation:', conversation_id);
      
      // Update status to processing
      await supabaseClient
        .from('conversations')
        .update({ extraction_status: 'processing' })
        .eq('id', conversation_id);

      try {
        // Extract entities using OpenAI with retry logic
        const entities = await retry(async () => {
          return await extractEntitiesFromTranscript(transcript);
        });

        console.log('✅ Entities extracted:', entities);

        // Upsert lead from entities
        const leadId = await upsertLeadFromEntities(entities, conversation_id, supabaseClient);
        
        // Persist extraction data
        await persistExtraction(conversation_id, leadId, entities, supabaseClient);
        
        // Mark as done
        await supabaseClient
          .from('conversations')
          .update({ extraction_status: 'done' })
          .eq('id', conversation_id);

        return new Response(JSON.stringify({ 
          success: true, 
          entities,
          lead_id: leadId
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      } catch (error) {
        console.error('❌ Error in entity extraction:', error);
        
        // Mark as pending for retry
        await supabaseClient
          .from('conversations')
          .update({ extraction_status: 'pending' })
          .eq('id', conversation_id);
          
        throw error;
      }
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });

  } catch (error) {
    console.error('❌ AI Processor error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

async function extractEntitiesFromTranscript(transcript: string) {
  const openAIKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIKey) {
    throw new Error('OpenAI API key not configured');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Extract structured data from this real estate conversation transcript. Return a JSON object with these fields:
          - name: {value: string, confidence: number} - Lead's full name
          - phone: {value: string, confidence: number} - Phone number in E.164 format
          - email: {value: string, confidence: number} - Email address
          - property_type: {value: string, confidence: number} - Type of property interested in
          - price_range: {min: number, max: number, confidence: number} - Price range
          - timeline: {value: string, confidence: number} - Buying timeline
          - pre_approval_status: {value: string, confidence: number} - Pre-approval status
          - lead_temperature: {value: string, confidence: number} - hot/warm/cool/cold
          - primary_concerns: array of concern objects
          - interested_properties: array of property objects
          - requested_actions: array of action objects`
        },
        {
          role: 'user',
          content: transcript
        }
      ],
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  const content = result.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch {
    throw new Error('Failed to parse OpenAI response as JSON');
  }
}

async function upsertLeadFromEntities(entities: any, conversationId: string, supabaseClient: any) {
  const phone = entities.phone?.value ? normalizePhone(entities.phone.value) : null;
  let leadId = null;

  // Look up existing lead by phone
  if (phone) {
    const { data: mapping } = await supabaseClient
      .from('phone_lead_mapping')
      .select('lead_id')
      .eq('phone_e164', phone)
      .single();

    if (mapping) {
      leadId = mapping.lead_id;
      console.log('✅ Found existing lead:', leadId);
    }
  }

  // Create new lead if not found
  if (!leadId) {
    const nameParts = entities.name?.value?.split(' ') || [];
    const firstName = nameParts[0] || 'Unknown';
    const lastName = nameParts.slice(1).join(' ') || 'Caller';

    const { data: newLead, error } = await supabaseClient
      .from('leads')
      .insert({
        first_name: firstName,
        last_name: lastName,
        phone_e164: phone,
        phone_raw: entities.phone?.value || null,
        email: entities.email?.value || null,
        source: 'Retell Voice Agent',
        status: 'new'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating lead:', error);
      throw error;
    }

    leadId = newLead.id;
    console.log('✅ Created new lead:', leadId);

    // Create phone mapping
    if (phone) {
      await supabaseClient.from('phone_lead_mapping').insert({
        phone_e164: phone,
        lead_id: leadId,
        lead_name: `${firstName} ${lastName}`
      });
      console.log('✅ Created phone mapping');
    }
  }

  // Link conversation to lead
  await supabaseClient
    .from('conversations')
    .update({ lead_id: leadId })
    .eq('id', conversationId);

  console.log('✅ Linked conversation to lead:', leadId);
  return leadId;
}

async function persistExtraction(conversationId: string, leadId: string, entities: any, supabaseClient: any) {
  const extractionData = {
    conversation_id: conversationId,
    lead_id: leadId,
    extraction_timestamp: new Date().toISOString(),
    extraction_version: '2.0',
    
    // Map extracted entities to database fields
    pre_approval_status: entities.pre_approval_status?.value || null,
    buying_timeline: entities.timeline?.value || null,
    lead_temperature: entities.lead_temperature?.value || null,
    property_type: entities.property_type?.value || null,
    
    // Complex data as JSONB
    primary_concerns: entities.primary_concerns || null,
    interested_properties: entities.interested_properties || null,
    requested_actions: entities.requested_actions || null,
    
    // Price range
    property_price: entities.price_range?.max || null,
    
    // Raw extraction data for debugging
    raw_extraction_data: entities
  };

  const { error } = await supabaseClient
    .from('conversation_extractions')
    .upsert(extractionData, {
      onConflict: 'conversation_id',
      ignoreDuplicates: false
    });

  if (error) {
    console.error('❌ Error persisting extraction:', error);
    throw error;
  }

  console.log('✅ Persisted extraction data');
}
