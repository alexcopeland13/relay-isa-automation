
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ActiveCall {
  conversation_id: string;
  lead_id: string;
  call_status: string;
  started_at: string;
  call_sid: string;
  lead_name: string;
  lead_phone: string;
}

export function useActiveCalls() {
  const [activeCalls, setActiveCalls] = useState<ActiveCall[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial fetch of active calls using the new RPC function
    const fetchActiveCalls = async () => {
      try {
        const { data: activeCallsData, error } = await supabase
          .rpc('get_active_calls');

        if (error) {
          console.error('Error fetching active calls:', error);
          setIsLoading(false);
          return;
        }

        setActiveCalls(activeCallsData || []);
      } catch (error) {
        console.error('Error fetching active calls:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActiveCalls();

    // Set up real-time subscription for conversation changes
    const subscription = supabase
      .channel('active-calls-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        async (payload: any) => {
          console.log('Real-time conversation change:', payload);
          
          if (payload.eventType === 'INSERT' && payload.new?.call_status === 'active') {
            // New active call started - fetch updated data
            await fetchActiveCalls();
          } else if (payload.eventType === 'UPDATE') {
            const { new: newConversation, old: oldConversation } = payload;
            
            if (newConversation.call_status === 'active' && oldConversation.call_status !== 'active') {
              // Call became active - fetch updated data
              await fetchActiveCalls();
            } else if (newConversation.call_status !== 'active' && oldConversation.call_status === 'active') {
              // Call ended - remove from active calls
              setActiveCalls(prev => 
                prev.filter(call => call.conversation_id !== newConversation.id)
              );
            }
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to active calls real-time updates');
        }
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('Active calls subscription error:', status, err);
        }
      });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    activeCalls,
    activeCallLeadIds: activeCalls.map(call => call.lead_id),
    isLoading,
    isLeadOnCall: (leadId: string) => activeCalls.some(call => call.lead_id === leadId),
    getActiveCallForLead: (leadId: string) => activeCalls.find(call => call.lead_id === leadId)
  };
}
