
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Webhook, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { useWebhookEvents } from '@/hooks/use-webhook-events';
import { format } from 'date-fns';

interface WebhookEventsMonitorProps {
  provider?: string;
  className?: string;
}

export const WebhookEventsMonitor = ({ 
  provider = 'retell', 
  className 
}: WebhookEventsMonitorProps) => {
  const { events, isLoading, error } = useWebhookEvents(provider, 20);

  const getEventBadgeVariant = (eventType: string) => {
    switch (eventType) {
      case 'call_started':
        return 'default';
      case 'call_ended':
        return 'secondary';
      case 'call_analyzed':
        return 'outline';
      case 'transcript_update':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'call_started':
      case 'call_ended':
        return <CheckCircle className="h-3 w-3" />;
      case 'call_analyzed':
      case 'transcript_update':
        return <Clock className="h-3 w-3" />;
      default:
        return <AlertCircle className="h-3 w-3" />;
    }
  };

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Webhook Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500">
            <AlertCircle className="h-6 w-6 mx-auto mb-2" />
            <p>Error loading webhook events</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Webhook className="h-5 w-5" />
          Webhook Events
          {isLoading && (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          {events.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Webhook className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No webhook events yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <div 
                  key={event.id} 
                  className="flex items-start gap-3 p-3 border rounded-lg bg-card"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getEventIcon(event.payload?.event)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getEventBadgeVariant(event.payload?.event)}>
                        {event.payload?.event || 'unknown'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(event.received_at), 'HH:mm:ss')}
                      </span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground truncate">
                      Call ID: {event.payload?.data?.call_id || event.event_id}
                    </p>
                    
                    {event.payload?.data?.from_number && (
                      <p className="text-xs text-muted-foreground">
                        From: {event.payload.data.from_number}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
