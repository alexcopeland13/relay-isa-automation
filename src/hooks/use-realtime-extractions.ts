
import { useState, useEffect, useRef } from 'react';
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
      .channel('extractions-realtime')
      .on('postgres_changes', {
        event: '*', // Listen for INSERT, UPDATE, and DELETE
        schema: 'public',
        table: 'conversation_extractions',
        filter: `conversation_id=in.(${conversationIds.join(',')})`
      }, (payload) => {
        const extraction = payload.new as ExtractionData;
        
        if (payload.eventType === 'INSERT') {
          setExtractionUpdates(prev => ({
            ...prev,
            [extraction.conversation_id]: extraction
          }));

          toast({
            title: "New Insights Available",
            description: "AI has extracted new information from the conversation.",
          });
        } else if (payload.eventType === 'UPDATE') {
          setExtractionUpdates(prev => ({
            ...prev,
            [extraction.conversation_id]: extraction
          }));

          toast({
            title: "Insights Updated",
            description: "AI analysis has been updated with new information.",
          });
        } else if (payload.eventType === 'DELETE') {
          setExtractionUpdates(prev => {
            const updated = { ...prev };
            delete updated[payload.old.conversation_id];
            return updated;
          });
        }
      });

    // Subscribe using v2 pattern (zero arguments)
    const subscribeToExtractions = async () => {
      try {
        await channelRef.current.subscribe();
        console.log('📡 Extractions subscription successful');
        setConnectionError(null);
      } catch (error) {
        console.error('📡 Extractions subscription error:', error);
        setConnectionError('Failed to connect to extraction updates');
      }
    };

    subscribeToExtractions();

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
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
    connectionError,
    getExtraction,
    getLatestExtractions
  };
}
