
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (!openAIApiKey) {
    return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    const { action, data } = await req.json();

    switch (action) {
      case 'generate_response': {
        const { context, prompt } = data;
        
        const messages = [
          {
            role: 'system',
            content: `You are an AI assistant helping with real estate lead conversations. 
            Generate appropriate responses based on the conversation context. 
            Be professional, helpful, and focused on real estate needs.
            Context: ${JSON.stringify(context)}`
          },
          {
            role: 'user',
            content: prompt
          }
        ];

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: messages,
            temperature: 0.7,
            max_tokens: 2000,
          }),
        });

        const aiResponse = await response.json();
        
        if (!response.ok) {
          throw new Error(aiResponse.error?.message || 'OpenAI API error');
        }

        const messageContent = aiResponse.choices[0].message.content;

        return new Response(JSON.stringify({
          message: {
            id: `msg-${Date.now()}`,
            role: 'assistant',
            content: messageContent,
            timestamp: new Date().toISOString()
          },
          suggestedActions: await generateSuggestedActions(messageContent),
          sentiment: await analyzeSentiment(messageContent),
          confidenceScore: 0.9
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'extract_entities': {
        const { text } = data;
        
        const extractionPrompt = `Extract real estate-relevant entities from this conversation text. 
        Return a JSON object with extracted information like contact details, property preferences, 
        budget, timeline, location preferences, etc. Only extract information that is explicitly mentioned.
        
        Text: ${text}
        
        Return format:
        {
          "entities": {
            "name": {"value": "string", "confidence": 0.0-1.0},
            "phone": {"value": "string", "confidence": 0.0-1.0},
            "email": {"value": "string", "confidence": 0.0-1.0},
            "budget_range": {"value": "string", "confidence": 0.0-1.0},
            "property_type": {"value": "string", "confidence": 0.0-1.0},
            "location_preference": {"value": "string", "confidence": 0.0-1.0},
            "timeline": {"value": "string", "confidence": 0.0-1.0}
          }
        }`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'You are an expert at extracting structured data from conversations.' },
              { role: 'user', content: extractionPrompt }
            ],
            temperature: 0.1,
            max_tokens: 1500,
          }),
        });

        const aiResponse = await response.json();
        
        if (!response.ok) {
          throw new Error(aiResponse.error?.message || 'OpenAI API error');
        }

        try {
          const extractedData = JSON.parse(aiResponse.choices[0].message.content);
          return new Response(JSON.stringify(extractedData), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (parseError) {
          console.error('Failed to parse extraction result:', parseError);
          return new Response(JSON.stringify({ entities: {} }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      case 'analyze_conversation': {
        const { conversationHistory } = data;
        
        const analysisPrompt = `Analyze this real estate conversation and provide insights:
        
        Conversation: ${JSON.stringify(conversationHistory)}
        
        Provide analysis in this JSON format:
        {
          "summary": "Brief summary of the conversation",
          "qualificationScore": 0-100,
          "sentiment": "positive|neutral|negative",
          "nextSteps": ["step1", "step2"],
          "leadTemperature": "hot|warm|cool|cold",
          "concerns": ["concern1", "concern2"],
          "interests": ["interest1", "interest2"]
        }`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'You are an expert real estate conversation analyst.' },
              { role: 'user', content: analysisPrompt }
            ],
            temperature: 0.3,
            max_tokens: 1000,
          }),
        });

        const aiResponse = await response.json();
        
        if (!response.ok) {
          throw new Error(aiResponse.error?.message || 'OpenAI API error');
        }

        try {
          const analysis = JSON.parse(aiResponse.choices[0].message.content);
          return new Response(JSON.stringify(analysis), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (parseError) {
          console.error('Failed to parse analysis result:', parseError);
          return new Response(JSON.stringify({
            summary: 'Analysis unavailable',
            qualificationScore: 50,
            sentiment: 'neutral',
            nextSteps: ['Follow up with lead'],
            leadTemperature: 'warm',
            concerns: [],
            interests: []
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

  } catch (error) {
    console.error('AI processing error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateSuggestedActions(messageContent: string) {
  // Simple heuristic-based action suggestions
  const actions = [];
  
  if (messageContent.toLowerCase().includes('schedule') || messageContent.toLowerCase().includes('appointment')) {
    actions.push({
      type: 'follow_up',
      reason: 'Lead mentioned scheduling',
      priority: 'high',
      data: { suggestedChannel: 'calendar', suggestedTemplate: 'appointment_booking' }
    });
  }
  
  if (messageContent.toLowerCase().includes('budget') || messageContent.toLowerCase().includes('price')) {
    actions.push({
      type: 'collect_info',
      reason: 'Budget information discussed',
      priority: 'medium'
    });
  }
  
  return actions;
}

async function analyzeSentiment(text: string) {
  // Simple sentiment analysis based on keywords
  const positiveWords = ['great', 'excellent', 'perfect', 'wonderful', 'amazing', 'love', 'interested'];
  const negativeWords = ['terrible', 'awful', 'hate', 'disappointing', 'frustrated', 'angry'];
  
  const lowerText = text.toLowerCase();
  const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
  
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}
