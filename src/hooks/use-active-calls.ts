
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
    // Initial fetch of active calls using direct query
    const fetchActiveCalls = async () => {
      try {
        // Use a more flexible query approach to handle potential schema differences
        const { data: activeCallsData, error } = await supabase
          .from('conversations')
          .select('*')
          .not('call_status', 'is', null)
          .eq('call_status', 'active')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching active calls:', error);
          // If call_status column doesn't exist yet, fall back to empty array
          setActiveCalls([]);
          setIsLoading(false);
          return;
        }

        // Get lead data separately to avoid join issues
        const leadIds = activeCallsData?.map(call => call.lead_id).filter(Boolean) || [];
        
        let leadsData: any[] = [];
        if (leadIds.length > 0) {
          const { data: leads } = await supabase
            .from('leads')
            .select('id, first_name, last_name, phone_e164, phone, phone_raw')
            .in('id', leadIds);
          leadsData = leads || [];
        }

        // Transform the data to match our ActiveCall interface
        const transformedCalls: ActiveCall[] = (activeCallsData || []).map(call => {
          const leadData = leadsData.find(lead => lead.id === call.lead_id);
          
          return {
            conversation_id: call.id,
            lead_id: call.lead_id || '',
            call_status: call.call_status || 'active',
            started_at: call.started_at || call.created_at || new Date().toISOString(),
            call_sid: call.call_sid || '',
            lead_name: leadData ? `${leadData.first_name || ''} ${leadData.last_name || ''}`.trim() : 'Unknown',
            lead_phone: leadData ? (leadData.phone_e164 || leadData.phone || leadData.phone_raw || '') : ''
          };
        });

        console.log('Active calls fetched:', transformedCalls);
        setActiveCalls(transformedCalls);
      } catch (error) {
        console.error('Error fetching active calls:', error);
        setActiveCalls([]);
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
            console.log('New active call detected, refreshing data');
            await fetchActiveCalls();
          } else if (payload.eventType === 'UPDATE') {
            const { new: newConversation, old: oldConversation } = payload;
            
            if (newConversation.call_status === 'active' && oldConversation?.call_status !== 'active') {
              // Call became active - fetch updated data
              console.log('Call became active, refreshing data');
              await fetchActiveCalls();
            } else if (newConversation.call_status !== 'active' && oldConversation?.call_status === 'active') {
              // Call ended - remove from active calls
              console.log('Call ended, removing from active calls');
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
