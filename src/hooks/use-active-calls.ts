
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ActiveCall {
  conversation_id: string;
  lead_id: string;
  call_status: string;
  started_at: string;
  call_sid: string;
  lead_name: string;
  lead_phone: string;
  duration_seconds?: number;
}

export function useActiveCalls() {
  const [activeCalls, setActiveCalls] = useState<ActiveCall[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchActiveCalls = async () => {
    try {
      console.log('📞 Fetching active calls...');
      
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          call_sid,
          call_status,
          started_at,
          lead_id,
          leads!inner(
            first_name,
            last_name,
            phone,
            phone_e164
          )
        `)
        .eq('call_status', 'active')
        .order('started_at', { ascending: false });

      if (error) throw error;

      const activeCallsData: ActiveCall[] = (data || []).map(call => ({
        conversation_id: call.id,
        lead_id: call.lead_id,
        call_status: call.call_status,
        started_at: call.started_at,
        call_sid: call.call_sid,
        lead_name: `${call.leads?.first_name || ''} ${call.leads?.last_name || ''}`.trim() || 'Unknown',
        lead_phone: call.leads?.phone_e164 || call.leads?.phone || 'Unknown',
        duration_seconds: call.started_at ? 
          Math.floor((new Date().getTime() - new Date(call.started_at).getTime()) / 1000) : 0
      }));

      setActiveCalls(activeCallsData);
      console.log('📊 Active calls loaded:', activeCallsData.length);

    } catch (error) {
      console.error('Error fetching active calls:', error);
      toast({
        title: "Error Loading Active Calls",
        description: "Could not load active call data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Set up real-time subscription for active calls
  useEffect(() => {
    fetchActiveCalls();

    const channel = supabase
      .channel('active-calls-monitor')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        (payload) => {
          console.log('📡 Real-time call update:', payload);
          
          // Refresh active calls when any conversation changes
          fetchActiveCalls();
          
          // Show notifications for call events
          if (payload.eventType === 'INSERT' && payload.new.call_status === 'active') {
            toast({
              title: "New Call Started",
              description: "An active conversation has begun.",
            });
          } else if (payload.eventType === 'UPDATE' && 
                     payload.old?.call_status === 'active' && 
                     payload.new.call_status === 'completed') {
            toast({
              title: "Call Completed",
              description: "An active conversation has ended.",
            });
          }
        }
      )
      .subscribe();

    // Refresh active calls every 30 seconds to update durations
    const refreshInterval = setInterval(fetchActiveCalls, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(refreshInterval);
    };
  }, [toast]);

  return {
    activeCalls,
    isLoading,
    fetchActiveCalls
  };
}
