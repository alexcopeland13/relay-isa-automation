
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { publishEvent, EventType, Event } from '@/lib/ai-integration/eventProcessor';

interface CallEventProcessorProps {
  conversationId: string;
  onCallStatusChange?: (status: string) => void;
  onTranscriptUpdate?: (transcript: string) => void;
}

export const CallEventProcessor = ({ 
  conversationId, 
  onCallStatusChange,
  onTranscriptUpdate 
}: CallEventProcessorProps) => {
  const { toast } = useToast();

  useEffect(() => {
    // Subscribe to conversation changes
    const conversationChannel = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations',
          filter: `id=eq.${conversationId}`
        },
        async (payload) => {
          const { new: newConversation, old: oldConversation } = payload;
          
          // Handle call status changes
          if (newConversation.call_status !== oldConversation?.call_status) {
            onCallStatusChange?.(newConversation.call_status);
            
            // Publish event to event processor
            const event: Event = {
              id: `call-status-${Date.now()}`,
              type: newConversation.call_status === 'completed' 
                ? 'conversation.ended' 
                : 'conversation.message.received',
              timestamp: new Date().toISOString(),
              conversationId,
              payload: {
                callStatus: newConversation.call_status,
                callSid: newConversation.call_sid
              },
              metadata: {
                source: 'webhook_processor'
              }
            };
            
            await publishEvent(event);
            
            if (newConversation.call_status === 'completed') {
              toast({
                title: "Call Ended",
                description: "The conversation has been completed and is ready for review.",
              });
            }
          }
          
          // Handle transcript updates
          if (newConversation.transcript !== oldConversation?.transcript && newConversation.transcript) {
            onTranscriptUpdate?.(newConversation.transcript);
            
            // Publish transcript update event
            const transcriptEvent: Event = {
              id: `transcript-${Date.now()}`,
              type: 'conversation.message.received',
              timestamp: new Date().toISOString(),
              conversationId,
              payload: {
                transcript: newConversation.transcript,
                transcriptLength: newConversation.transcript.length
              },
              metadata: {
                source: 'transcript_processor'
              }
            };
            
            await publishEvent(transcriptEvent);
          }
        }
      )
      .subscribe();

    // Subscribe to extraction updates
    const extractionChannel = supabase
      .channel(`extractions-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversation_extractions',
          filter: `conversation_id=eq.${conversationId}`
        },
        async (payload) => {
          // Publish entity extraction event
          const extractionEvent: Event = {
            id: `extraction-${Date.now()}`,
            type: 'entity.extracted',
            timestamp: new Date().toISOString(),
            conversationId,
            payload: {
              extractionData: payload.new,
              eventType: payload.eventType
            },
            metadata: {
              source: 'extraction_processor'
            }
          };
          
          await publishEvent(extractionEvent);
        }
      )
      .subscribe();

    return () => {
      conversationChannel.unsubscribe();
      extractionChannel.unsubscribe();
    };
  }, [conversationId, onCallStatusChange, onTranscriptUpdate, toast]);

  // This component doesn't render anything, it's just for processing events
  return null;
};
