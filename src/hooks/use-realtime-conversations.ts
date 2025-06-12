
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ConversationMessage } from '@/types/conversation';

interface RealtimeConversationData {
  id: string;
  transcript: string;
  call_status: string;
  extraction_status: string;
  sentiment_score?: number;
  ended_at?: string;
}

export function useRealtimeConversations(conversationIds: string[]) {
  const [conversationUpdates, setConversationUpdates] = useState<Record<string, RealtimeConversationData>>({});
  const [conversationMessages, setConversationMessages] = useState<Record<string, ConversationMessage[]>>({});
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const { toast } = useToast();
  const channelRef = useRef<any>(null);
  const messagesChannelRef = useRef<any>(null);

  useEffect(() => {
    if (conversationIds.length === 0) return;

    // Clean up existing channels
    if (channelRef.current) {
      channelRef.current.unsubscribe();
    }
    if (messagesChannelRef.current) {
      messagesChannelRef.current.unsubscribe();
    }

    // Subscribe to conversation changes
    channelRef.current = supabase
      .channel('conversations-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `id=in.(${conversationIds.join(',')})`
      }, (payload) => {
        const conversation = payload.new as RealtimeConversationData;
        
        if (payload.eventType === 'INSERT') {
          setConversationUpdates(prev => ({
            ...prev,
            [conversation.id]: conversation
          }));

          toast({
            title: "New Conversation Started",
            description: "A new conversation has been initiated.",
          });
        } else if (payload.eventType === 'UPDATE') {
          setConversationUpdates(prev => ({
            ...prev,
            [conversation.id]: conversation
          }));

          // Show toast for call status changes
          if (conversation.call_status === 'completed') {
            toast({
              title: "Call Ended",
              description: "The conversation has been completed and is ready for review.",
            });
          }
          
          // Show toast for extraction completion
          if (conversation.extraction_status === 'done') {
            toast({
              title: "Analysis Complete",
              description: "AI has finished analyzing the conversation.",
            });
          }
        } else if (payload.eventType === 'DELETE') {
          setConversationUpdates(prev => {
            const updated = { ...prev };
            delete updated[payload.old.id];
            return updated;
          });
        }
      });

    // Subscribe to conversation messages
    messagesChannelRef.current = supabase
      .channel('conversation-messages-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversation_messages',
        filter: `conversation_id=in.(${conversationIds.join(',')})`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const message = payload.new as ConversationMessage;
          setConversationMessages(prev => ({
            ...prev,
            [message.conversation_id]: [
              ...(prev[message.conversation_id] || []),
              message
            ].sort((a, b) => a.seq - b.seq)
          }));
        }
      });

    // Subscribe using v2 pattern
    const subscribeToConversations = async () => {
      try {
        await channelRef.current.subscribe();
        await messagesChannelRef.current.subscribe();
        console.log('📡 Conversations subscription successful');
        setConnectionError(null);
      } catch (error) {
        console.error('📡 Conversations subscription error:', error);
        setConnectionError('Failed to connect to conversation updates');
      }
    };

    subscribeToConversations();

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
      if (messagesChannelRef.current) {
        messagesChannelRef.current.unsubscribe();
      }
    };
  }, [conversationIds, toast]);

  return {
    conversationUpdates,
    conversationMessages,
    connectionError,
    getConversationUpdate: (id: string) => conversationUpdates[id],
    getConversationMessages: (id: string) => conversationMessages[id] || []
  };
}
