
import { useState, useEffect } from 'react';
import { ConversationMessage } from '@/lib/ai-integration/apiGateway';
import { useToast } from '@/hooks/use-toast';
import { useEntityExtraction } from './conversation/use-entity-extraction';
import { useProfileUpdates } from './conversation/use-profile-updates';
import { ConversationData, EntityMap } from './conversation/types';

export { type ConversationData, type EntityMap } from './conversation/types';

export function useConversationData(conversationId?: string) {
  const [conversationData, setConversationData] = useState<ConversationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [extractedUpdates, setExtractedUpdates] = useState<EntityMap>({});
  const { toast } = useToast();
  
  // Use our extracted hooks
  const { processMessage, isProcessing } = useEntityExtraction();
  const { updateLeadProfile: updateProfile, isUpdating } = useProfileUpdates();

  useEffect(() => {
    if (!conversationId) return;

    const loadConversationData = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock data for demonstration
        const mockData: ConversationData = {
          conversationId,
          leadInfo: {
            name: 'Michael Brown',
            email: 'michael.brown@example.com',
            phone: '(555) 123-4567',
            source: 'Website Form',
            interests: ['Single-family homes', 'Investment properties'],
            budget: '$450,000 - $600,000',
            timeline: '3-6 months',
            locationPreferences: ['North Hills', 'Downtown']
          },
          extractedEntities: {
            'preferred_bedroom_count': {
              value: '3-4',
              confidence: 0.85,
              source: 'conversation',
              timestamp: new Date().toISOString()
            },
            'preferred_school_district': {
              value: 'Franklin County',
              confidence: 0.92,
              source: 'conversation',
              timestamp: new Date().toISOString()
            },
            'financing_type': {
              value: 'Conventional mortgage',
              confidence: 0.78,
              source: 'conversation',
              timestamp: new Date().toISOString()
            }
          },
          lastUpdate: new Date().toISOString()
        };
        
        setConversationData(mockData);
      } catch (error) {
        console.error('Error loading conversation data:', error);
        toast({
          title: 'Error loading conversation data',
          description: 'Could not load the conversation data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadConversationData();
  }, [conversationId, toast]);

  // Process a message and extract entities
  const handleProcessMessage = async (message: ConversationMessage) => {
    const newEntities = await processMessage(message);
    
    if (newEntities) {
      setExtractedUpdates(prev => ({...prev, ...newEntities}));
      
      // Update conversation data with new entities
      setConversationData(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          extractedEntities: {
            ...prev.extractedEntities,
            ...newEntities
          },
          lastUpdate: new Date().toISOString()
        };
      });
      
      return newEntities;
    }
    
    return null;
  };

  // Wrapper for profile updates
  const handleUpdateLeadProfile = async () => {
    if (!conversationData) return false;
    
    const success = await updateProfile(extractedUpdates);
    
    if (success) {
      // Clear pending updates
      setExtractedUpdates({});
    }
    
    return success;
  };

  return {
    conversationData,
    isLoading,
    isUpdating: isProcessing || isUpdating,
    extractedUpdates,
    processMessage: handleProcessMessage,
    updateLeadProfile: handleUpdateLeadProfile,
    hasPendingUpdates: Object.keys(extractedUpdates).length > 0
  };
}
