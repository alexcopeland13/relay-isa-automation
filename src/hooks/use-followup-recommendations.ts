import { useState, useEffect } from 'react';
import { Lead } from '@/components/leads/LeadsList';
import { MessageTemplate } from '@/data/sampleFollowUpData';

export type FollowUpRecommendation = {
  id: string;
  leadId: string;
  suggestedTiming: {
    description: string;
    timeframe: string;
  };
  channel: 'email' | 'sms' | 'phone' | 'meeting';
  priority: 'high' | 'medium' | 'low';
  reason: string;
  recommendedTemplates: MessageTemplate[];
  context: {
    lastInteraction?: string;
    lastInteractionDate?: string;
    engagementScore?: number;
    stage?: string;
  };
};

export function useFollowUpRecommendations(leadId?: string) {
  const [recommendations, setRecommendations] = useState<FollowUpRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [leadData, setLeadData] = useState<Lead | null>(null);

  useEffect(() => {
    if (!leadId) return;

    const fetchRecommendations = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));

        // Mock data - in a real application, this would come from the backend
        const mockTemplates: MessageTemplate[] = [
          {
            id: 'template-1',
            title: 'Property Viewing Follow-up',
            description: 'Template to use after a property showing',
            content: 'Hi {{name}}, Thank you for viewing the property at {{address}} yesterday. I wanted to follow up to see if you had any questions or if you\'d like to schedule another viewing. Looking forward to hearing back from you!',
            category: 'follow-up',
            channel: 'email',
            tags: ['viewing', 'follow-up'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            author: 'System',
            usage: 28
          },
          {
            id: 'template-2',
            title: 'Mortgage Rate Update',
            description: 'Update clients on new mortgage rates',
            content: 'Hi {{name}}, I wanted to let you know that mortgage rates have recently dropped to {{rate}}%. This could be a great opportunity for your home purchase plans. Would you like to discuss how this impacts your buying power?',
            category: 'follow-up',
            channel: 'email',
            tags: ['mortgage', 'rates', 'financing'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            author: 'System',
            usage: 15
          }
        ];

        // Generate recommendations
        const mockRecommendations: FollowUpRecommendation[] = [
          {
            id: `rec-${Date.now()}-1`,
            leadId,
            suggestedTiming: {
              description: 'Tomorrow morning',
              timeframe: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString()
            },
            channel: 'email',
            priority: 'high',
            reason: 'Lead showed high interest during last conversation',
            recommendedTemplates: mockTemplates,
            context: {
              lastInteraction: 'Property viewing',
              lastInteractionDate: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
              engagementScore: 85,
              stage: 'Evaluation'
            }
          },
          {
            id: `rec-${Date.now()}-2`,
            leadId,
            suggestedTiming: {
              description: 'Next week',
              timeframe: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString()
            },
            channel: 'phone',
            priority: 'medium',
            reason: 'Lead requested more information about financing options',
            recommendedTemplates: [],
            context: {
              lastInteraction: 'Website interaction',
              lastInteractionDate: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
              engagementScore: 65,
              stage: 'Discovery'
            }
          }
        ];

        setRecommendations(mockRecommendations);

        // Mock lead data with all required properties
        const mockLead: Lead = {
          id: leadId,
          name: 'Michael Brown',
          email: 'michael.brown@example.com',
          phone: '(555) 123-4567',
          status: 'Qualified',
          source: 'Website Inquiry',
          createdAt: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(),
          lastContact: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
          notes: 'Interested in investment properties',
          assignedTo: 'Sarah Johnson',
          type: 'Mortgage',
          interestType: 'Investment Property',
          location: 'San Francisco, CA',
          score: 85
        };

        setLeadData(mockLead);
      } catch (error) {
        console.error('Error fetching follow-up recommendations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [leadId]);

  // Function to create a follow-up from a recommendation
  const createFollowUp = async (recommendation: FollowUpRecommendation, templateId?: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      // This would be where you'd create the actual follow-up in your system
      console.log('Creating follow-up from recommendation:', recommendation, 'with template:', templateId);

      return {
        success: true,
        message: 'Follow-up created successfully',
        followUpId: `followup-${Date.now()}`
      };
    } catch (error) {
      console.error('Error creating follow-up:', error);
      return {
        success: false,
        message: 'Failed to create follow-up',
        error
      };
    }
  };

  // Function to dismiss a recommendation
  const dismissRecommendation = async (recommendationId: string) => {
    try {
      // Remove the recommendation from the list
      setRecommendations(prevRecs => prevRecs.filter(rec => rec.id !== recommendationId));
      return true;
    } catch (error) {
      console.error('Error dismissing recommendation:', error);
      return false;
    }
  };

  return {
    recommendations,
    isLoading,
    leadData,
    createFollowUp,
    dismissRecommendation
  };
}
