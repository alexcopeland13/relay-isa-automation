
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useConversationIntegration } from './use-conversation-integration';
import { useAILeadScoring } from './use-ai-lead-scoring';

export function useConversationPipeline() {
  const [processingQueue, setProcessingQueue] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { updateConversation, linkConversationToLead } = useConversationIntegration();
  const { updateLeadScoreFromConversation } = useAILeadScoring();

  // Process conversation through AI pipeline
  const processConversation = async (conversationId: string, transcript: string) => {
    try {
      setIsProcessing(true);
      setProcessingQueue(prev => [...prev, conversationId]);
      
      console.log('🔄 Processing conversation through AI pipeline:', conversationId);

      // Call AI conversation processor
      const { data, error } = await supabase.functions.invoke('ai-conversation-processor', {
        body: {
          action: 'extract_entities',
          data: {
            conversation_id: conversationId,
            transcript: transcript
          }
        }
      });

      if (error) {
        console.error('AI processing error:', error);
        throw new Error('Failed to process conversation with AI');
      }

      console.log('✅ AI processing complete:', data);

      // Update conversation with extracted data
      if (data.extracted_entities) {
        await updateConversation(conversationId, {
          sentiment_score: data.sentiment_score
        });
      }

      // Link to lead if identified
      if (data.identified_lead_id) {
        await linkConversationToLead(conversationId, data.identified_lead_id);
        
        // Update lead score based on conversation
        await updateLeadScoreFromConversation(data.identified_lead_id, data);
      }

      // Create extraction record
      await createExtractionRecord(conversationId, data);

      toast({
        title: "Conversation Processed",
        description: "AI has successfully analyzed the conversation and extracted key information.",
      });

      return data;

    } catch (error) {
      console.error('Error processing conversation:', error);
      toast({
        title: "Processing Error",
        description: "Failed to process conversation. Will retry automatically.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setProcessingQueue(prev => prev.filter(id => id !== conversationId));
      setIsProcessing(false);
    }
  };

  const createExtractionRecord = async (conversationId: string, extractionData: any) => {
    try {
      const { error } = await supabase
        .from('conversation_extractions')
        .insert({
          conversation_id: conversationId,
          lead_id: extractionData.identified_lead_id,
          pre_approval_status: extractionData.pre_approval_status,
          current_lender: extractionData.current_lender,
          buying_timeline: extractionData.buying_timeline,
          conversation_summary: extractionData.summary,
          primary_concerns: extractionData.concerns,
          interested_properties: extractionData.properties,
          requested_actions: extractionData.actions,
          extraction_timestamp: new Date().toISOString(),
          raw_extraction_data: extractionData
        });

      if (error) throw error;
      
      console.log('✅ Extraction record created for conversation:', conversationId);
    } catch (error) {
      console.error('Error creating extraction record:', error);
    }
  };

  // Auto-process new conversations
  useEffect(() => {
    const channel = supabase
      .channel('conversation-processor')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations'
        },
        async (payload) => {
          const conversation = payload.new;
          
          // Process when transcript is updated and conversation is completed
          if (conversation.transcript && 
              conversation.call_status === 'completed' && 
              !processingQueue.includes(conversation.id)) {
            
            console.log('🔄 Auto-processing completed conversation:', conversation.id);
            await processConversation(conversation.id, conversation.transcript);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [processingQueue]);

  return {
    processConversation,
    processingQueue,
    isProcessing
  };
}
