
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Import zod for JSON validation
// @deno-types="https://deno.land/x/zod@v3.22.4/index.d.ts"
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

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

// Define the expected extraction schema
const ExtractionSchema = z.object({
  name: z.object({
    value: z.string(),
    confidence: z.number()
  }).optional(),
  phone: z.object({
    value: z.string(),
    confidence: z.number()
  }).optional(),
  email: z.object({
    value: z.string(),
    confidence: z.number()
  }).optional(),
  property_type: z.object({
    value: z.string(),
    confidence: z.number()
  }).optional(),
  price_range: z.object({
    min: z.number(),
    max: z.number(),
    confidence: z.number()
  }).optional(),
  timeline: z.object({
    value: z.string(),
    confidence: z.number()
  }).optional(),
  pre_approval_status: z.object({
    value: z.string(),
    confidence: z.number()
  }).optional(),
  lead_temperature: z.object({
    value: z.string(),
    confidence: z.number()
  }).optional(),
  primary_concerns: z.array(z.any()).optional(),
  interested_properties: z.array(z.any()).optional(),
  requested_actions: z.array(z.any()).optional()
});

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
      
      // Guard against empty transcript
      if (!transcript || transcript.trim() === '') {
        console.log('⚠️ Empty transcript, skipping extraction');
        await supabaseClient
          .from('conversations')
          .update({ extraction_status: 'skipped' })
          .eq('id', conversation_id);
        
        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Skipped extraction - empty transcript'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
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
        
        // Persist extraction data with improved error handling
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
        
        // Mark as failed
        await supabaseClient
          .from('conversations')
          .update({ extraction_status: 'failed' })
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

  // Chunk transcript if too long (rough estimate: 1 token ≈ 4 chars)
  const maxLength = 20000; // roughly 5k tokens
  let processedTransript = transcript;
  
  if (transcript.length > maxLength) {
    console.log('📏 Transcript too long, chunking...');
    // Take the first and last portions to get opening and closing
    const firstPart = transcript.substring(0, maxLength / 2);
    const lastPart = transcript.substring(transcript.length - maxLength / 2);
    processedTransript = `${firstPart}\n...[transcript truncated]...\n${lastPart}`;
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
          content: `Extract structured data from this real estate conversation transcript. Return ONLY valid JSON with these fields:
          {
            "name": {"value": "string", "confidence": 0.8},
            "phone": {"value": "string", "confidence": 0.8},
            "email": {"value": "string", "confidence": 0.8},
            "property_type": {"value": "string", "confidence": 0.8},
            "price_range": {"min": 400000, "max": 500000, "confidence": 0.8},
            "timeline": {"value": "string", "confidence": 0.8},
            "pre_approval_status": {"value": "string", "confidence": 0.8},
            "lead_temperature": {"value": "hot|warm|cool|cold", "confidence": 0.8},
            "primary_concerns": [],
            "interested_properties": [],
            "requested_actions": []
          }
          
          Return only the JSON object, no other text. If a field is not found, omit it entirely.`
        },
        {
          role: 'user',
          content: processedTransript
        }
      ],
      temperature: 0.1,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  const content = result.choices[0].message.content;
  
  console.log('🔍 Raw OpenAI response:', content);
  
  try {
    const parsed = JSON.parse(content);
    // Validate the parsed JSON against our schema
    const validated = ExtractionSchema.parse(parsed);
    return validated;
  } catch (parseError) {
    console.error('❌ JSON parsing failed:', parseError);
    console.error('❌ Raw content:', content);
    
    // Try to extract JSON from the content if it's wrapped in markdown or other text
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const extracted = JSON.parse(jsonMatch[0]);
        const validated = ExtractionSchema.parse(extracted);
        return validated;
      } catch (secondParseError) {
        console.error('❌ Second JSON parsing attempt failed:', secondParseError);
      }
    }
    
    // If all parsing fails, log and set extraction status to failed
    throw new Error('Failed to parse OpenAI response as valid JSON');
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

  try {
    const { error } = await supabaseClient
      .from('conversation_extractions')
      .upsert(extractionData, {
        onConflict: 'conversation_id',
        ignoreDuplicates: false
      });

    if (error) {
      console.error('❌ Error persisting extraction:', error);
      // Try insert instead if upsert fails
      const { error: insertError } = await supabaseClient
        .from('conversation_extractions')
        .insert(extractionData);
      
      if (insertError) {
        console.error('❌ Error inserting extraction:', insertError);
        throw insertError;
      }
    }

    console.log('✅ Persisted extraction data');
  } catch (error) {
    console.error('❌ Final error persisting extraction:', error);
    // Don't throw - let the conversation processing continue
  }
}
