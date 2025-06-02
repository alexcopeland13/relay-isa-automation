
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ConversationHistory {
  id: string;
  created_at: string;
  call_sid: string;
  direction: string;
  duration: number;
  call_status: string;
  transcript: string;
  sentiment_score: number;
  recording_url: string;
  lead_id: string;
  lead_name: string;
  extractions: any[];
}

export function useConversationHistory(leadId?: string) {
  const [conversations, setConversations] = useState<ConversationHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchConversationHistory = async () => {
    try {
      console.log('📞 Fetching conversation history for lead:', leadId);
      
      let query = supabase
        .from('conversations')
        .select(`
          id,
          created_at,
          call_sid,
          direction,
          duration,
          call_status,
          transcript,
          sentiment_score,
          recording_url,
          lead_id,
          leads(first_name, last_name),
          conversation_extractions(*)
        `)
        .order('created_at', { ascending: false });

      if (leadId) {
        query = query.eq('lead_id', leadId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const historyData: ConversationHistory[] = (data || []).map(conv => ({
        id: conv.id,
        created_at: conv.created_at,
        call_sid: conv.call_sid,
        direction: conv.direction || 'inbound',
        duration: conv.duration || 0,
        call_status: conv.call_status,
        transcript: conv.transcript || '',
        sentiment_score: conv.sentiment_score || 0,
        recording_url: conv.recording_url || '',
        lead_id: conv.lead_id,
        lead_name: conv.leads ? 
          `${conv.leads.first_name || ''} ${conv.leads.last_name || ''}`.trim() : 
          'Unknown',
        extractions: conv.conversation_extractions || []
      }));

      setConversations(historyData);
      console.log('📊 Conversation history loaded:', historyData.length);

    } catch (error) {
      console.error('Error fetching conversation history:', error);
      toast({
        title: "Error Loading History",
        description: "Could not load conversation history.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConversationHistory();

    // Set up real-time subscription
    const channel = supabase
      .channel('conversation-history')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        () => {
          fetchConversationHistory();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [leadId]);

  return {
    conversations,
    isLoading,
    fetchConversationHistory
  };
}
