
import { useState, useEffect } from 'react';
import { ConversationMessage } from '@/lib/ai-integration/apiGateway';
import { useToast } from '@/hooks/use-toast';

interface EntityMap {
  [key: string]: {
    value: string;
    confidence: number;
    source: 'conversation' | 'user-input' | 'system';
    timestamp: string;
  };
}

export interface ConversationData {
  conversationId: string;
  leadInfo: {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
    source?: string;
    interests?: string[];
    budget?: string;
    timeline?: string;
    locationPreferences?: string[];
  };
  extractedEntities: EntityMap;
  lastUpdate: string;
}

export function useConversationData(conversationId?: string) {
  const [conversationData, setConversationData] = useState<ConversationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [extractedUpdates, setExtractedUpdates] = useState<EntityMap>({});
  const { toast } = useToast();

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

  // Simulated function to extract entities from a message
  const processMessage = async (message: ConversationMessage) => {
    setIsUpdating(true);
    
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Mock entity extraction based on message content
      const newEntities: EntityMap = {};
      
      // Simple keyword-based extraction for demonstration
      if (message.content.toLowerCase().includes('bedroom')) {
        newEntities['preferred_bedroom_count'] = {
          value: message.content.includes('4') ? '4' : '3',
          confidence: 0.89,
          source: 'conversation',
          timestamp: new Date().toISOString()
        };
      }
      
      if (message.content.toLowerCase().includes('school')) {
        newEntities['preferred_school_district'] = {
          value: 'Parkview District',
          confidence: 0.92,
          source: 'conversation',
          timestamp: new Date().toISOString()
        };
      }
      
      if (message.content.toLowerCase().includes('down payment') || message.content.toLowerCase().includes('mortgage')) {
        newEntities['down_payment_amount'] = {
          value: '$50,000',
          confidence: 0.85,
          source: 'conversation',
          timestamp: new Date().toISOString()
        };
      }
      
      // Only set updates if entities were found
      if (Object.keys(newEntities).length > 0) {
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
    } catch (error) {
      console.error('Error processing message:', error);
      toast({
        title: 'Error processing message',
        description: 'Could not process the message for entity extraction.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsUpdating(false);
    }
  };

  // Function to update lead profile with extracted data
  const updateLeadProfile = async (entities?: EntityMap) => {
    if (!conversationData) return false;
    
    const entitiesToUpdate = entities || extractedUpdates;
    if (Object.keys(entitiesToUpdate).length === 0) return false;
    
    setIsUpdating(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Clear pending updates
      setExtractedUpdates({});
      
      toast({
        title: 'Lead profile updated',
        description: 'New information extracted from conversation has been added to the lead profile.',
      });
      
      return true;
    } catch (error) {
      console.error('Error updating lead profile:', error);
      toast({
        title: 'Error updating lead profile',
        description: 'Could not update the lead profile with extracted information.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    conversationData,
    isLoading,
    isUpdating,
    extractedUpdates,
    processMessage,
    updateLeadProfile,
    hasPendingUpdates: Object.keys(extractedUpdates).length > 0
  };
}
