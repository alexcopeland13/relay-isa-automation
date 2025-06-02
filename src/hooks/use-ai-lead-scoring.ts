
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/types/lead';
import { useToast } from '@/hooks/use-toast';

export interface AILeadInsight {
  leadId: string;
  score: number;
  temperature: 'hot' | 'warm' | 'cool' | 'cold';
  insights: string[];
  recommendations: string[];
  priority: 'high' | 'medium' | 'low';
  nextBestAction: string;
  confidence: number;
}

export function useAILeadScoring() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [insights, setInsights] = useState<Record<string, AILeadInsight>>({});
  const { toast } = useToast();

  const generateLeadInsights = async (lead: Lead, conversations?: any[]): Promise<AILeadInsight> => {
    setIsProcessing(true);
    
    try {
      console.log('🤖 Generating AI insights for lead:', lead.id);
      
      // Prepare context for AI analysis
      const leadContext = {
        lead_info: {
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          status: lead.status,
          source: lead.source,
          created_at: lead.createdAt,
          last_contact: lead.lastContact,
          current_score: lead.score,
          notes: lead.notes
        },
        qualification_data: lead.qualification_data,
        conversations: conversations || [],
        conversation_count: conversations?.length || 0
      };

      const { data, error } = await supabase.functions.invoke('ai-conversation-processor', {
        body: {
          action: 'analyze_lead',
          data: {
            lead_context: leadContext,
            analysis_type: 'comprehensive_scoring'
          }
        }
      });

      if (error) {
        console.error('AI analysis error:', error);
        throw new Error('Failed to generate AI insights');
      }

      const aiInsight: AILeadInsight = {
        leadId: lead.id,
        score: calculateEnhancedScore(lead, data.analysis),
        temperature: determineTemperature(data.analysis),
        insights: data.analysis.insights || [],
        recommendations: data.analysis.recommendations || [],
        priority: determinePriority(data.analysis),
        nextBestAction: data.analysis.next_best_action || 'Follow up via phone call',
        confidence: data.analysis.confidence || 0.8
      };

      setInsights(prev => ({
        ...prev,
        [lead.id]: aiInsight
      }));

      return aiInsight;
      
    } catch (error) {
      console.error('Error generating lead insights:', error);
      
      // Fallback to rule-based scoring
      const fallbackInsight = generateFallbackInsights(lead);
      setInsights(prev => ({
        ...prev,
        [lead.id]: fallbackInsight
      }));
      
      return fallbackInsight;
    } finally {
      setIsProcessing(false);
    }
  };

  const updateLeadScoreFromConversation = async (leadId: string, conversationData: any) => {
    try {
      console.log('📊 Updating lead score from conversation:', leadId);
      
      const { data, error } = await supabase.functions.invoke('ai-conversation-processor', {
        body: {
          action: 'score_from_conversation',
          data: {
            lead_id: leadId,
            conversation: conversationData
          }
        }
      });

      if (error) throw error;

      // Update the lead score in database
      await supabase
        .from('leads')
        .update({ 
          // Assuming we add a computed_score column later
          last_contacted: new Date().toISOString()
        })
        .eq('id', leadId);

      return data.score_update;
      
    } catch (error) {
      console.error('Error updating lead score:', error);
      toast({
        title: 'Scoring Error',
        description: 'Could not update lead score from conversation.',
        variant: 'destructive',
      });
    }
  };

  const batchAnalyzeLeads = async (leads: Lead[]) => {
    try {
      setIsProcessing(true);
      console.log('🔄 Batch analyzing leads:', leads.length);
      
      const analysisPromises = leads.map(lead => 
        generateLeadInsights(lead).catch(err => {
          console.error(`Failed to analyze lead ${lead.id}:`, err);
          return generateFallbackInsights(lead);
        })
      );

      const results = await Promise.all(analysisPromises);
      
      toast({
        title: 'Analysis Complete',
        description: `Generated insights for ${results.length} leads.`,
      });
      
      return results;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    insights,
    isProcessing,
    generateLeadInsights,
    updateLeadScoreFromConversation,
    batchAnalyzeLeads
  };
}

// Helper functions
function calculateEnhancedScore(lead: Lead, aiAnalysis: any): number {
  let score = lead.score;
  
  // Apply AI adjustments
  if (aiAnalysis.score_adjustments) {
    score += aiAnalysis.score_adjustments.conversation_quality || 0;
    score += aiAnalysis.score_adjustments.engagement_level || 0;
    score += aiAnalysis.score_adjustments.qualification_depth || 0;
  }
  
  return Math.max(0, Math.min(100, Math.round(score)));
}

function determineTemperature(analysis: any): 'hot' | 'warm' | 'cool' | 'cold' {
  const score = analysis.temperature_score || 50;
  
  if (score >= 80) return 'hot';
  if (score >= 60) return 'warm';
  if (score >= 40) return 'cool';
  return 'cold';
}

function determinePriority(analysis: any): 'high' | 'medium' | 'low' {
  const urgency = analysis.urgency_score || 50;
  
  if (urgency >= 75) return 'high';
  if (urgency >= 50) return 'medium';
  return 'low';
}

function generateFallbackInsights(lead: Lead): AILeadInsight {
  return {
    leadId: lead.id,
    score: lead.score,
    temperature: lead.score >= 80 ? 'hot' : lead.score >= 60 ? 'warm' : 'cool',
    insights: [
      `Lead status: ${lead.status}`,
      `Source: ${lead.source}`,
      `Contact method: ${lead.phone ? 'Phone available' : 'Email only'}`
    ],
    recommendations: [
      'Follow up within 24 hours',
      'Verify contact information',
      'Schedule qualification call'
    ],
    priority: lead.score >= 75 ? 'high' : 'medium',
    nextBestAction: 'Schedule follow-up call',
    confidence: 0.6
  };
}
