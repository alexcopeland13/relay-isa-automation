
import { useState } from 'react';
import { ConversationMessage } from '@/lib/ai-integration/apiGateway';
import { EntityMap } from './types';
import { useToast } from '@/hooks/use-toast';

export function useEntityExtraction() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  
  // Simulated function to extract entities from a message
  const processMessage = async (message: ConversationMessage) => {
    setIsProcessing(true);
    
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
      
      // Only return entities if some were found
      if (Object.keys(newEntities).length > 0) {
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
      setIsProcessing(false);
    }
  };

  return {
    processMessage,
    isProcessing
  };
}
