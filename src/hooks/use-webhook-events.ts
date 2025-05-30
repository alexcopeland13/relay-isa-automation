
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface WebhookEvent {
  id: string;
  received_at: string;
  payload: any;
  provider: string;
  event_id: string;
}

export function useWebhookEvents(provider?: string, limit: number = 50) {
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        let query = supabase
          .from('webhook_events')
          .select('*')
          .order('received_at', { ascending: false })
          .limit(limit);
        
        if (provider) {
          query = query.eq('provider', provider);
        }
        
        const { data, error: queryError } = await query;
        
        if (queryError) {
          throw queryError;
        }
        
        setEvents(data || []);
      } catch (error) {
        console.error('Error fetching webhook events:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();

    // Set up real-time subscription for new webhook events
    const subscription = supabase
      .channel('webhook-events-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'webhook_events',
          filter: provider ? `provider=eq.${provider}` : undefined
        },
        (payload) => {
          console.log('New webhook event received:', payload);
          setEvents(prev => [payload.new as WebhookEvent, ...prev.slice(0, limit - 1)]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [provider, limit]);

  return {
    events,
    isLoading,
    error,
    getEventsByType: (eventType: string) => 
      events.filter(event => event.payload?.event === eventType),
    getRecentEvents: (minutes: number) => {
      const cutoff = new Date(Date.now() - minutes * 60 * 1000);
      return events.filter(event => new Date(event.received_at) > cutoff);
    }
  };
}
