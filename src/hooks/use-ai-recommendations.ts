
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AIRecommendation {
  id: string;
  type: 'follow_up' | 'qualification' | 'appointment' | 'nurture' | 'escalate';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  reasoning: string;
  suggestedAction: string;
  timing: 'immediate' | 'within_24h' | 'within_week' | 'next_month';
  channel: 'phone' | 'email' | 'text' | 'calendar';
  confidence: number;
  leadId: string;
  conversationId?: string;
  dueDate?: string;
  estimatedEffort: 'low' | 'medium' | 'high';
  expectedOutcome: string;
  createdAt: string;
}

export interface RecommendationFilters {
  priority?: 'high' | 'medium' | 'low';
  type?: string;
  timing?: string;
  leadId?: string;
}

export function useAIRecommendations(leadId?: string) {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateRecommendations = async (leadData: any, conversationData?: any) => {
    try {
      setIsGenerating(true);
      console.log('🧠 Generating AI recommendations for lead:', leadData.id);

      const { data, error } = await supabase.functions.invoke('ai-conversation-processor', {
        body: {
          action: 'analyze_lead',
          data: {
            lead_context: {
              lead_info: leadData,
              conversation_data: conversationData,
              timestamp: new Date().toISOString()
            },
            analysis_type: 'recommendations'
          }
        }
      });

      if (error) throw error;

      // Transform AI analysis into structured recommendations
      const aiRecommendations = transformAnalysisToRecommendations(data.analysis, leadData.id);
      
      // Store recommendations (in a real app, you'd save to database)
      setRecommendations(prev => {
        const filtered = prev.filter(rec => rec.leadId !== leadData.id);
        return [...filtered, ...aiRecommendations];
      });

      return aiRecommendations;

    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast({
        title: 'Recommendation Error',
        description: 'Could not generate AI recommendations.',
        variant: 'destructive',
      });
      return [];
    } finally {
      setIsGenerating(false);
    }
  };

  const getRecommendationsForLead = (leadId: string, filters?: RecommendationFilters) => {
    let filtered = recommendations.filter(rec => rec.leadId === leadId);

    if (filters?.priority) {
      filtered = filtered.filter(rec => rec.priority === filters.priority);
    }
    if (filters?.type) {
      filtered = filtered.filter(rec => rec.type === filters.type);
    }
    if (filters?.timing) {
      filtered = filtered.filter(rec => rec.timing === filters.timing);
    }

    return filtered.sort((a, b) => {
      // Sort by priority and confidence
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return b.confidence - a.confidence;
    });
  };

  const getHighPriorityRecommendations = () => {
    return recommendations
      .filter(rec => rec.priority === 'high')
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);
  };

  const getUpcomingActions = () => {
    const now = new Date();
    return recommendations
      .filter(rec => {
        if (!rec.dueDate) return false;
        const dueDate = new Date(rec.dueDate);
        const timeDiff = dueDate.getTime() - now.getTime();
        const daysDiff = timeDiff / (1000 * 3600 * 24);
        return daysDiff <= 7 && daysDiff >= 0;
      })
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
  };

  const markRecommendationCompleted = (recommendationId: string) => {
    setRecommendations(prev => 
      prev.filter(rec => rec.id !== recommendationId)
    );
    
    toast({
      title: 'Action Completed',
      description: 'Recommendation marked as completed.',
    });
  };

  const dismissRecommendation = (recommendationId: string, reason?: string) => {
    setRecommendations(prev => 
      prev.filter(rec => rec.id !== recommendationId)
    );
    
    console.log('📝 Recommendation dismissed:', { recommendationId, reason });
  };

  // Auto-fetch recommendations for specified lead
  useEffect(() => {
    if (leadId) {
      // In a real implementation, you'd fetch from database
      console.log('📊 Loading recommendations for lead:', leadId);
    }
  }, [leadId]);

  return {
    recommendations,
    isLoading,
    isGenerating,
    generateRecommendations,
    getRecommendationsForLead,
    getHighPriorityRecommendations,
    getUpcomingActions,
    markRecommendationCompleted,
    dismissRecommendation
  };
}

function transformAnalysisToRecommendations(analysis: any, leadId: string): AIRecommendation[] {
  const recommendations: AIRecommendation[] = [];
  const baseId = `rec-${Date.now()}`;

  // Transform insights into recommendations
  if (analysis.insights && analysis.insights.length > 0) {
    analysis.insights.forEach((insight: string, index: number) => {
      recommendations.push({
        id: `${baseId}-insight-${index}`,
        type: 'follow_up',
        priority: 'medium',
        title: 'Follow Up Based on Insight',
        description: insight,
        reasoning: 'AI identified this insight from conversation analysis',
        suggestedAction: analysis.next_best_action || 'Follow up with lead',
        timing: analysis.follow_up_strategy?.timing || 'within_24h',
        channel: analysis.follow_up_strategy?.channel || 'phone',
        confidence: analysis.confidence || 0.8,
        leadId,
        dueDate: calculateDueDate(analysis.follow_up_strategy?.timing || 'within_24h'),
        estimatedEffort: 'medium',
        expectedOutcome: 'Maintain engagement and gather more information',
        createdAt: new Date().toISOString()
      });
    });
  }

  // Transform specific recommendations
  if (analysis.recommendations && analysis.recommendations.length > 0) {
    analysis.recommendations.forEach((rec: string, index: number) => {
      recommendations.push({
        id: `${baseId}-rec-${index}`,
        type: determineRecommendationType(rec),
        priority: analysis.urgency_score > 75 ? 'high' : analysis.urgency_score > 50 ? 'medium' : 'low',
        title: rec.split('.')[0] || rec.substring(0, 50),
        description: rec,
        reasoning: 'AI-generated recommendation based on lead analysis',
        suggestedAction: rec,
        timing: analysis.follow_up_strategy?.timing || 'within_24h',
        channel: analysis.follow_up_strategy?.channel || 'phone',
        confidence: analysis.confidence || 0.8,
        leadId,
        dueDate: calculateDueDate(analysis.follow_up_strategy?.timing || 'within_24h'),
        estimatedEffort: 'medium',
        expectedOutcome: 'Move lead forward in pipeline',
        createdAt: new Date().toISOString()
      });
    });
  }

  return recommendations;
}

function determineRecommendationType(recommendation: string): 'follow_up' | 'qualification' | 'appointment' | 'nurture' | 'escalate' {
  const lower = recommendation.toLowerCase();
  
  if (lower.includes('qualify') || lower.includes('qualification')) return 'qualification';
  if (lower.includes('appointment') || lower.includes('meeting') || lower.includes('schedule')) return 'appointment';
  if (lower.includes('nurture') || lower.includes('education')) return 'nurture';
  if (lower.includes('escalate') || lower.includes('manager')) return 'escalate';
  
  return 'follow_up';
}

function calculateDueDate(timing: string): string {
  const now = new Date();
  
  switch (timing) {
    case 'immediate':
      return new Date(now.getTime() + 1000 * 60 * 30).toISOString(); // 30 minutes
    case 'within_24h':
      return new Date(now.getTime() + 1000 * 60 * 60 * 24).toISOString(); // 24 hours
    case 'within_week':
      return new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7).toISOString(); // 7 days
    case 'next_month':
      return new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30).toISOString(); // 30 days
    default:
      return new Date(now.getTime() + 1000 * 60 * 60 * 24).toISOString(); // Default 24 hours
  }
}
