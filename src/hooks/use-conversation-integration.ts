
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ConversationData {
  id: string;
  lead_id: string | null;
  call_sid: string | null;
  direction: string | null;
  duration: number | null;
  transcript: string | null;
  sentiment_score: number | null;
  call_status: string;
  started_at: string | null;
  ended_at: string | null;
  agent_id: string | null;
  recording_url: string | null;
}

export function useConversationIntegration() {
  const [conversations, setConversations] = useState<ConversationData[]>([]);
  const [activeConversations, setActiveConversations] = useState<ConversationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const conversationData = data as ConversationData[];
      setConversations(conversationData);
      
      // Filter active conversations
      const active = conversationData.filter(conv => 
        conv.call_status === 'active' || conv.call_status === 'in-progress'
      );
      setActiveConversations(active);
      
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: 'Error Loading Conversations',
        description: 'Could not load conversation data.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createConversation = async (conversationData: Partial<ConversationData>) => {
    try {
      console.log('📞 Creating new conversation:', conversationData);
      
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          lead_id: conversationData.lead_id,
          call_sid: conversationData.call_sid,
          direction: conversationData.direction || 'inbound',
          call_status: conversationData.call_status || 'active',
          agent_id: conversationData.agent_id || 'retell_ai',
          started_at: conversationData.started_at || new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      await fetchConversations();
      return data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  };

  const updateConversation = async (conversationId: string, updates: Partial<ConversationData>) => {
    try {
      console.log('🔄 Updating conversation:', conversationId, updates);
      
      const { data, error } = await supabase
        .from('conversations')
        .update(updates)
        .eq('id', conversationId)
        .select()
        .single();

      if (error) throw error;

      await fetchConversations();
      return data;
    } catch (error) {
      console.error('Error updating conversation:', error);
      throw error;
    }
  };

  const linkConversationToLead = async (conversationId: string, leadId: string) => {
    try {
      await updateConversation(conversationId, { lead_id: leadId });
      
      // Also update the lead's last contacted timestamp
      await supabase
        .from('leads')
        .update({ last_contacted: new Date().toISOString() })
        .eq('id', leadId);

      toast({
        title: 'Conversation Linked',
        description: 'Conversation has been linked to lead successfully.',
      });
    } catch (error) {
      console.error('Error linking conversation to lead:', error);
      toast({
        title: 'Link Error',
        description: 'Failed to link conversation to lead.',
        variant: 'destructive',
      });
    }
  };

  const getConversationsByLead = (leadId: string) => {
    return conversations.filter(conv => conv.lead_id === leadId);
  };

  const getActiveCallsCount = () => {
    return activeConversations.length;
  };

  // Set up real-time subscription for conversations
  useEffect(() => {
    fetchConversations();

    const channel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        (payload) => {
          console.log('📡 Real-time conversation change:', payload);
          fetchConversations();
          
          // Show toast for new conversations
          if (payload.eventType === 'INSERT') {
            toast({
              title: 'New Call Started',
              description: 'A new conversation has begun.',
            });
          } else if (payload.eventType === 'UPDATE' && payload.new.call_status === 'completed') {
            toast({
              title: 'Call Completed',
              description: 'A conversation has ended.',
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  return {
    conversations,
    activeConversations,
    isLoading,
    createConversation,
    updateConversation,
    linkConversationToLead,
    getConversationsByLead,
    getActiveCallsCount,
    fetchConversations
  };
}
