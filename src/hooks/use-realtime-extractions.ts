
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ExtractionData {
  id: string;
  conversation_id: string;
  lead_id: string;
  extraction_timestamp: string;
  pre_approval_status?: string;
  current_lender?: string;
  buying_timeline?: string;
  conversation_summary?: string;
  primary_concerns?: any;
  interested_properties?: any;
  requested_actions?: any;
}

export function useRealtimeExtractions(conversationIds: string[]) {
  const [extractionUpdates, setExtractionUpdates] = useState<Record<string, ExtractionData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
          const extraction = payload.new as ExtractionData;
          
          setExtractionUpdates(prev => ({
            ...prev,
            [extraction.conversation_id]: extraction
          }));

          // Show toast for new extractions
          if (payload.eventType === 'INSERT') {
            toast({
              title: "New Insights Available",
              description: "AI has extracted new information from the conversation.",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationIds, toast]);

  const getExtraction = (conversationId: string) => {
    return extractionUpdates[conversationId];
  };

  const getLatestExtractions = () => {
    return Object.values(extractionUpdates);
  };

  return {
    extractionUpdates,
    isLoading,
    getExtraction,
    getLatestExtractions
  };
}
