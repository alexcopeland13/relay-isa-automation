
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

      // Update lead score based on conversation if lead identified
      if (data.identified_lead_id) {
        await updateLeadScoreFromConversation(data.identified_lead_id, data);
      }

      // Create or update extraction record with enhanced data
      await createOrUpdateExtractionRecord(conversationId, data);

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

  const createOrUpdateExtractionRecord = async (conversationId: string, extractionData: any) => {
    try {
      // Map AI extraction data to database schema
      const mappedData = {
        conversation_id: conversationId,
        lead_id: extractionData.identified_lead_id,
        extraction_timestamp: new Date().toISOString(),
        extraction_version: '2.0',
        
        // Core qualification data
        pre_approval_status: extractionData.pre_approval_status,
        current_lender: extractionData.current_lender,
        buying_timeline: extractionData.buying_timeline,
        lead_temperature: extractionData.lead_temperature,
        lead_score: extractionData.lead_score,
        call_outcome: extractionData.call_outcome,
        
        // Property information
        property_address: extractionData.property_address,
        property_mls_number: extractionData.property_mls_number,
        property_price: extractionData.property_price,
        property_type: extractionData.property_type,
        property_use: extractionData.property_use,
        multiple_properties_interested: extractionData.multiple_properties_interested,
        
        // Financial details
        annual_income: extractionData.annual_income,
        monthly_debt_payments: extractionData.monthly_debt_payments,
        credit_score_range: extractionData.credit_score_range,
        employment_status: extractionData.employment_status,
        employment_length: extractionData.employment_length,
        is_self_employed: extractionData.is_self_employed,
        
        // Loan information
        loan_amount: extractionData.loan_amount,
        loan_type: extractionData.loan_type,
        down_payment_amount: extractionData.down_payment_amount,
        down_payment_percentage: extractionData.down_payment_percentage,
        has_co_borrower: extractionData.has_co_borrower,
        
        // Buyer profile
        first_time_buyer: extractionData.first_time_buyer,
        va_eligible: extractionData.va_eligible,
        ready_to_buy_timeline: extractionData.ready_to_buy_timeline,
        
        // Current situation
        has_realtor: extractionData.has_realtor,
        realtor_name: extractionData.realtor_name,
        
        // Preferences and concerns
        preferred_contact_method: extractionData.preferred_contact_method,
        best_time_to_call: extractionData.best_time_to_call,
        wants_credit_review: extractionData.wants_credit_review,
        wants_down_payment_assistance: extractionData.wants_down_payment_assistance,
        credit_concerns: extractionData.credit_concerns,
        debt_concerns: extractionData.debt_concerns,
        down_payment_concerns: extractionData.down_payment_concerns,
        job_change_concerns: extractionData.job_change_concerns,
        interest_rate_concerns: extractionData.interest_rate_concerns,
        
        // Education and knowledge
        knows_overlays: extractionData.knows_overlays,
        overlay_education_completed: extractionData.overlay_education_completed,
        
        // Complex data
        objection_details: extractionData.objection_details,
        next_steps: extractionData.next_steps,
        primary_concerns: extractionData.concerns,
        interested_properties: extractionData.properties,
        requested_actions: extractionData.actions,
        
        // Summary
        conversation_summary: extractionData.summary,
        follow_up_date: extractionData.follow_up_date,
        
        // Raw data for debugging
        raw_extraction_data: extractionData
      };

      const { error } = await supabase
        .from('conversation_extractions')
        .upsert(mappedData, {
          onConflict: 'conversation_id',
          ignoreDuplicates: false
        });

      if (error) throw error;
      
      console.log('✅ Enhanced extraction record created/updated for conversation:', conversationId);
    } catch (error) {
      console.error('Error creating/updating extraction record:', error);
    }
  };

  // Auto-process new conversations with enhanced extraction
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
            
            console.log('🔄 Auto-processing completed conversation with enhanced extraction:', conversation.id);
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
