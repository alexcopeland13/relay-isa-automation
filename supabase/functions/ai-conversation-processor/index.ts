
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
        const { conversation_id, transcript } = data;
        
        const extractionPrompt = `Analyze this real estate conversation transcript and extract comprehensive information.
        
        Transcript: ${transcript}
        
        Return a JSON object with the following structure:
        {
          "identified_lead_id": "lead-uuid-if-identified",
          "sentiment_score": 0.0-1.0,
          "pre_approval_status": "not_started|in_progress|approved|denied",
          "current_lender": "lender name or null",
          "buying_timeline": "immediately|1-3_months|3-6_months|6+_months",
          "summary": "brief conversation summary",
          "concerns": ["concern1", "concern2"],
          "properties": ["property info"],
          "actions": ["requested action"],
          "extracted_entities": {
            "name": {"value": "string", "confidence": 0.0-1.0},
            "phone": {"value": "string", "confidence": 0.0-1.0},
            "email": {"value": "string", "confidence": 0.0-1.0},
            "budget_range": {"value": "string", "confidence": 0.0-1.0},
            "property_type": {"value": "string", "confidence": 0.0-1.0},
            "location_preference": {"value": "string", "confidence": 0.0-1.0}
          },
          "lead_temperature": "hot|warm|cool|cold",
          "qualification_score": 0-100,
          "next_best_actions": ["action1", "action2"],
          "conversion_probability": 0.0-1.0
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
              { role: 'system', content: 'You are an expert at extracting structured data from real estate conversations.' },
              { role: 'user', content: extractionPrompt }
            ],
            temperature: 0.1,
            max_tokens: 2000,
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
          return new Response(JSON.stringify({ 
            sentiment_score: 0.5,
            extracted_entities: {},
            summary: 'Extraction failed',
            qualification_score: 50
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      case 'analyze_lead': {
        const { lead_context, analysis_type } = data;
        
        const analysisPrompt = `Analyze this real estate lead comprehensively:
        
        Lead Context: ${JSON.stringify(lead_context)}
        
        Provide analysis in this JSON format:
        {
          "analysis": {
            "insights": ["insight1", "insight2"],
            "recommendations": ["recommendation1", "recommendation2"],
            "next_best_action": "specific action to take",
            "confidence": 0.0-1.0,
            "temperature_score": 0-100,
            "urgency_score": 0-100,
            "score_adjustments": {
              "conversation_quality": -10 to +10,
              "engagement_level": -10 to +10,
              "qualification_depth": -10 to +10
            },
            "conversion_indicators": ["indicator1", "indicator2"],
            "risk_factors": ["risk1", "risk2"],
            "follow_up_strategy": {
              "timing": "immediate|within_24h|within_week",
              "channel": "phone|email|text",
              "message_type": "qualification|nurture|appointment"
            }
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
              { role: 'system', content: 'You are an expert real estate lead analyst providing strategic insights.' },
              { role: 'user', content: analysisPrompt }
            ],
            temperature: 0.3,
            max_tokens: 1500,
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
            analysis: {
              insights: ['Analysis temporarily unavailable'],
              recommendations: ['Follow up with lead'],
              next_best_action: 'Schedule follow-up call',
              confidence: 0.5,
              temperature_score: 50,
              urgency_score: 50,
              score_adjustments: { conversation_quality: 0, engagement_level: 0, qualification_depth: 0 }
            }
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      case 'score_from_conversation': {
        const { lead_id, conversation } = data;
        
        const scoringPrompt = `Analyze this conversation and provide lead scoring updates:
        
        Conversation Data: ${JSON.stringify(conversation)}
        
        Return JSON:
        {
          "score_update": {
            "new_score": 0-100,
            "score_change": -50 to +50,
            "reasoning": "explanation of score change",
            "temperature": "hot|warm|cool|cold",
            "priority_level": "high|medium|low",
            "follow_up_urgency": "immediate|urgent|normal|low"
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
              { role: 'system', content: 'You are a lead scoring specialist.' },
              { role: 'user', content: scoringPrompt }
            ],
            temperature: 0.2,
            max_tokens: 500,
          }),
        });

        const aiResponse = await response.json();
        
        if (!response.ok) {
          throw new Error(aiResponse.error?.message || 'OpenAI API error');
        }

        try {
          const scoreData = JSON.parse(aiResponse.choices[0].message.content);
          return new Response(JSON.stringify(scoreData), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (parseError) {
          return new Response(JSON.stringify({
            score_update: {
              new_score: 50,
              score_change: 0,
              reasoning: 'Score analysis unavailable',
              temperature: 'warm',
              priority_level: 'medium',
              follow_up_urgency: 'normal'
            }
          }), {
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
          "interests": ["interest1", "interest2"],
          "conversion_probability": 0.0-1.0,
          "recommended_follow_up": {
            "timing": "immediate|within_24h|within_week",
            "method": "phone|email|text",
            "message": "suggested follow-up message"
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
            interests: [],
            conversion_probability: 0.5,
            recommended_follow_up: {
              timing: 'within_24h',
              method: 'phone',
              message: 'Follow up on our previous conversation'
            }
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
  // Enhanced action suggestions based on message content
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

  if (messageContent.toLowerCase().includes('pre-approval') || messageContent.toLowerCase().includes('mortgage')) {
    actions.push({
      type: 'qualify',
      reason: 'Financing needs identified',
      priority: 'high',
      data: { suggestedTemplate: 'mortgage_qualification' }
    });
  }
  
  return actions;
}

async function analyzeSentiment(text: string) {
  // Enhanced sentiment analysis
  const positiveWords = ['great', 'excellent', 'perfect', 'wonderful', 'amazing', 'love', 'interested', 'excited'];
  const negativeWords = ['terrible', 'awful', 'hate', 'disappointing', 'frustrated', 'angry', 'concerned', 'worried'];
  
  const lowerText = text.toLowerCase();
  const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
  
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}
