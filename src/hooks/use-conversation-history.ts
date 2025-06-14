
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
      
      // First, let's check if we have any conversations at all
      const { data: allConversations, error: countError } = await supabase
        .from('conversations')
        .select('id, lead_id, call_status')
        .limit(10);
      
      console.log('📊 Total conversations in database:', allConversations?.length || 0, allConversations);
      
      if (countError) {
        console.error('❌ Error counting conversations:', countError);
      }

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

      if (error) {
        console.error('❌ Error in main query:', error);
        throw error;
      }

      console.log('📋 Raw conversation data from query:', data);

      const historyData: ConversationHistory[] = (data || []).map(conv => {
        console.log('🔍 Processing conversation:', conv.id, conv);
        
        return {
          id: conv.id,
          created_at: conv.created_at,
          call_sid: conv.call_sid || 'unknown',
          direction: conv.direction || 'inbound',
          duration: conv.duration || 0,
          call_status: conv.call_status || 'completed',
          transcript: conv.transcript || '',
          sentiment_score: conv.sentiment_score || 0,
          recording_url: conv.recording_url || '',
          lead_id: conv.lead_id || 'unknown',
          lead_name: conv.leads ? 
            `${conv.leads.first_name || ''} ${conv.leads.last_name || ''}`.trim() : 
            'Unknown Lead',
          extractions: conv.conversation_extractions || []
        };
      });

      console.log('✅ Processed conversation history:', historyData.length, historyData);
      setConversations(historyData);

    } catch (error) {
      console.error('❌ Error fetching conversation history:', error);
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
          console.log('📡 Real-time update detected, refetching conversation history');
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
