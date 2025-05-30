
import { useState } from 'react';
import { ConversationMessage } from '@/lib/ai-integration/apiGateway';
import { extractEntities } from '@/lib/ai-integration/apiGateway';
import { EntityMap } from './types';
import { useToast } from '@/hooks/use-toast';

export function useEntityExtraction() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  
  const processMessage = async (message: ConversationMessage) => {
    setIsProcessing(true);
    
    try {
      console.log('Processing message for entity extraction:', message.content);
      
      // Use real AI to extract entities
      const extractionResult = await extractEntities(message.content);
      
      if (!extractionResult.entities || Object.keys(extractionResult.entities).length === 0) {
        console.log('No entities extracted from message');
        return null;
      }

      // Convert the AI response to our EntityMap format
      const newEntities: EntityMap = {};
      
      Object.entries(extractionResult.entities).forEach(([key, entityData]: [string, any]) => {
        if (entityData.value && entityData.confidence > 0.5) { // Only include confident extractions
          newEntities[key] = {
            value: entityData.value,
            confidence: entityData.confidence,
            source: 'conversation',
            timestamp: new Date().toISOString()
          };
        }
      });
      
      console.log('Extracted entities:', newEntities);
      
      // Only return entities if some were found with decent confidence
      if (Object.keys(newEntities).length > 0) {
        return newEntities;
      }
      
      return null;
    } catch (error) {
      console.error('Error processing message for entity extraction:', error);
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
