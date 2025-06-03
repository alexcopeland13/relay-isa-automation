
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, Clock, User, PhoneOff } from 'lucide-react';
import { retellAPI } from '@/lib/retell-api';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface RetellCallHistoryProps {
  leadId?: string;
  agentId?: string;
}

export function RetellCallHistory({ leadId, agentId }: RetellCallHistoryProps) {
  const [calls, setCalls] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadCallHistory();
  }, [leadId, agentId]);

  const loadCallHistory = async () => {
    try {
      setIsLoading(true);
      
      const params = {
        filter_criteria: {
          ...(agentId && { agent_id: agentId }),
          // Filter by metadata if leadId is provided
        },
        limit: 50
      };

      const response = await retellAPI.listCalls(params);
      setCalls(response.calls || []);
      
    } catch (error) {
      console.error('❌ Failed to load call history:', error);
      toast({
        title: "Failed to Load Calls",
        description: "Could not retrieve call history from Retell.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing':
        return 'bg-green-100 text-green-800';
      case 'ended':
        return 'bg-gray-100 text-gray-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const formatDuration = (startTimestamp?: number, endTimestamp?: number) => {
    if (!startTimestamp || !endTimestamp) return 'N/A';
    const duration = Math.floor((endTimestamp - startTimestamp) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}m ${seconds}s`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Retell Call History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading call history...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Retell Call History
          <Button variant="outline" size="sm" onClick={loadCallHistory}>
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {calls.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No calls found
          </div>
        ) : (
          <div className="space-y-3">
            {calls.map((call) => (
              <div key={call.call_id} className="border rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(call.call_status)}>
                      {call.call_status}
                    </Badge>
                    <span className="text-sm font-medium">
                      {call.direction === 'outbound' ? 'Outbound' : 'Inbound'}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {call.start_timestamp && format(new Date(call.start_timestamp * 1000), 'MMM d, yyyy HH:mm')}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{call.to_number || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatDuration(call.start_timestamp, call.end_timestamp)}</span>
                  </div>
                </div>

                {call.call_analysis?.call_summary && (
                  <div className="mt-2 p-2 bg-muted rounded text-xs">
                    <strong>Summary:</strong> {call.call_analysis.call_summary}
                  </div>
                )}

                <div className="mt-2 text-xs text-muted-foreground">
                  Call ID: {call.call_id}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
