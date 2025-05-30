
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RealtimeExtractionData {
  id: string;
  conversation_id: string;
  lead_qualification_status?: string;
  pre_approval_status?: string;
  buying_timeline?: string;
  conversation_summary?: string;
  primary_concerns?: any;
  interested_properties?: any;
  created_at: string;
}

export function useRealtimeExtractions(conversationIds: string[]) {
  const [extractionUpdates, setExtractionUpdates] = useState<Record<string, RealtimeExtractionData>>({});

  useEffect(() => {
    if (conversationIds.length === 0) return;

    const channel = supabase
      .channel('extractions-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversation_extractions',
          filter: `conversation_id=in.(${conversationIds.join(',')})`
        },
        (payload) => {
          if (payload.new) {
            const extraction = payload.new as RealtimeExtractionData;
            setExtractionUpdates(prev => ({
              ...prev,
              [extraction.conversation_id]: extraction
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationIds]);

  return {
    extractionUpdates,
    getExtractionForConversation: (conversationId: string) => extractionUpdates[conversationId]
  };
}
