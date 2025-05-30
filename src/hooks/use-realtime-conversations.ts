
import { useState, useEffect } from 'react';
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
  const { toast } = useToast();

  useEffect(() => {
    if (conversationIds.length === 0) return;

    const channel = supabase
      .channel('conversations-realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations',
          filter: `id=in.(${conversationIds.join(',')})`
        },
        (payload) => {
          const updatedConversation = payload.new as RealtimeConversationData;
          
          setConversationUpdates(prev => ({
            ...prev,
            [updatedConversation.id]: updatedConversation
          }));

          // Show toast for call status changes
          if (updatedConversation.call_status === 'completed') {
            toast({
              title: "Call Ended",
              description: "The active call has been completed.",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationIds, toast]);

  return {
    conversationUpdates,
    getConversationUpdate: (id: string) => conversationUpdates[id]
  };
}
