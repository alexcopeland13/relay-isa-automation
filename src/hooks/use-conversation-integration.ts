
import { useState, useEffect } from 'react';
import { useConversationPipeline } from './use-conversation-pipeline';
import { useAIRecommendations } from './use-ai-recommendations';
import { useAILeadScoring } from './use-ai-lead-scoring';
import { useToast } from './use-toast';

export function useConversationIntegration(conversationId?: string) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  
  const { processConversation } = useConversationPipeline();
  const { generateRecommendations } = useAIRecommendations();
  const { generateLeadInsights } = useAILeadScoring();

  // Auto-process new conversations
  const handleNewConversation = async (conversation: any) => {
    if (!conversation.transcript || conversation.call_status !== 'completed') {
      return;
    }

    try {
      setIsProcessing(true);
      console.log('🔄 Auto-processing completed conversation:', conversation.id);

      // Step 1: Process conversation through AI pipeline
      const extractionData = await processConversation(conversation.id, conversation.transcript);
      
      // Step 2: Generate AI insights if we have lead info
      if (conversation.lead_id && conversation.leadInfo) {
        const leadInsights = await generateLeadInsights(conversation.leadInfo);

        // Step 3: Generate recommendations based on extraction data
        if (leadInsights && extractionData) {
          await generateRecommendations(conversation.leadInfo, { 
            transcript: conversation.transcript,
            extractionData: extractionData
          });
        }
      }

      toast({
        title: "Conversation Processed",
        description: "AI analysis complete with insights and recommendations generated.",
      });

    } catch (error) {
      console.error('Error in conversation auto-processing:', error);
      toast({
        title: "Processing Error",
        description: "Some AI features may not be available for this conversation.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Monitor for conversation updates
  useEffect(() => {
    // This would be triggered by real-time updates from the conversation system
    // For now, we'll set up the infrastructure for auto-processing
    console.log('🔧 Conversation integration initialized');
  }, []);

  return {
    isProcessing,
    handleNewConversation
  };
}
