
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RealtimeConversationData {
  id: string;
  transcript: string;
  call_status: string;
  sentiment_score?: number;
  ended_at?: string;
}

export function useRealtimeConversations(conversationIds: string[]) {
  const [conversationUpdates, setConversationUpdates] = useState<Record<string, RealtimeConversationData>>({});
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const { toast } = useToast();
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (conversationIds.length === 0) return;

    // Clean up existing channel
    if (channelRef.current) {
      channelRef.current.unsubscribe();
    }

    // Create new channel with dynamic filter
    channelRef.current = supabase
      .channel('conversations-realtime')
      .on('postgres_changes', {
        event: '*', // Listen for INSERT, UPDATE, and DELETE
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
              description: "The active call has been completed.",
            });
          }
        } else if (payload.eventType === 'DELETE') {
          setConversationUpdates(prev => {
            const updated = { ...prev };
            delete updated[payload.old.id];
            return updated;
          });
        }
      })
      .on('error', (error) => {
        console.error('📡 Conversations channel error:', error);
        setConnectionError('Failed to connect to conversation updates');
        toast({
          title: "Connection Error",
          description: "Lost connection to conversation updates.",
          variant: "destructive",
        });
      })
      .subscribe();

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, [conversationIds, toast]);

  return {
    conversationUpdates,
    connectionError,
    getConversationUpdate: (id: string) => conversationUpdates[id]
  };
}
