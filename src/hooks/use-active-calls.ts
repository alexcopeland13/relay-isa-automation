
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useActiveCalls() {
  const [activeCallLeadIds, setActiveCallLeadIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial fetch of active calls
    const fetchActiveCalls = async () => {
      try {
        // Use type casting to bypass TypeScript checking for custom RPC functions
        const { data: activeCalls, error } = await (supabase as any)
          .rpc('get_active_calls');

        if (error) {
          console.error('Error fetching active calls:', error);
          setIsLoading(false);
          return;
        }

        const leadIds: string[] = [];
        if (activeCalls && Array.isArray(activeCalls)) {
          for (const call of activeCalls) {
            if (call.lead_id && typeof call.lead_id === 'string') {
              leadIds.push(call.lead_id);
            }
          }
        }
        setActiveCallLeadIds(leadIds);
      } catch (error) {
        console.error('Error fetching active calls:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActiveCalls();

    // Set up real-time subscription
    const subscription = supabase
      .channel('active-calls')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        (payload: any) => {
          console.log('Call status change:', payload);
          
          if (payload.eventType === 'INSERT' && payload.new?.call_status === 'active') {
            const leadId = payload.new.lead_id;
            if (leadId && typeof leadId === 'string') {
              setActiveCallLeadIds(prev => [...new Set([...prev, leadId])]);
            }
          } else if (payload.eventType === 'UPDATE') {
            const leadId = payload.new?.lead_id;
            if (leadId && typeof leadId === 'string') {
              if (payload.new.call_status === 'completed') {
                setActiveCallLeadIds(prev => prev.filter(id => id !== leadId));
              } else if (payload.new.call_status === 'active') {
                setActiveCallLeadIds(prev => [...new Set([...prev, leadId])]);
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    activeCallLeadIds,
    isLoading,
    isLeadOnCall: (leadId: string) => activeCallLeadIds.includes(leadId)
  };
}
