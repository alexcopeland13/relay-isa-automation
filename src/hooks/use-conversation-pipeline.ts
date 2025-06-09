
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAILeadScoring } from './use-ai-lead-scoring';

export function useConversationPipeline() {
  const [processingQueue, setProcessingQueue] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { updateLeadScoreFromConversation } = useAILeadScoring();

  // Process conversation through AI pipeline
  const processConversation = async (conversationId: string, transcript: string) => {
    try {
      setIsProcessing(true);
      setProcessingQueue(prev => [...prev, conversationId]);
      
      console.log('🔄 Processing conversation through AI pipeline:', conversationId);

      // Call AI conversation processor with retry wrapper
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

      // Update lead score based on conversation if lead identified
      if (data.lead_id) {
        await updateLeadScoreFromConversation(data.lead_id, data);
      }

      toast({
        title: "Conversation Processed",
        description: "AI has successfully analyzed the conversation and extracted comprehensive information.",
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

  // Auto-process pending conversations
  const processPendingConversations = async () => {
    try {
      const { data: pendingConversations, error } = await supabase
        .from('conversations')
        .select('id, transcript')
        .eq('extraction_status', 'pending')
        .not('transcript', 'is', null)
        .limit(10);

      if (error) {
        console.error('Error fetching pending conversations:', error);
        return;
      }

      for (const conversation of pendingConversations || []) {
        if (!processingQueue.includes(conversation.id) && conversation.transcript) {
          console.log('🔄 Auto-processing pending conversation:', conversation.id);
          await processConversation(conversation.id, conversation.transcript);
        }
      }
    } catch (error) {
      console.error('Error processing pending conversations:', error);
    }
  };

  // Monitor for conversations that need processing
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
          
          // Process when extraction_status becomes 'pending' and transcript exists
          if (conversation.extraction_status === 'pending' && 
              conversation.transcript && 
              !processingQueue.includes(conversation.id)) {
            
            console.log('🔄 Auto-processing conversation with pending status:', conversation.id);
            await processConversation(conversation.id, conversation.transcript);
          }
        }
      )
      .subscribe();

    // Also check for existing pending conversations on mount
    processPendingConversations();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [processingQueue]);

  return {
    processConversation,
    processingQueue,
    isProcessing,
    processPendingConversations
  };
}
