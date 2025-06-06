
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Brain, Clock } from 'lucide-react';

interface ConversationExtractionsProps {
  conversationId: string;
}

export const ConversationExtractions = ({ conversationId }: ConversationExtractionsProps) => {
  const [latestExtraction, setLatestExtraction] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!conversationId) {
      setIsLoading(false);
      setLatestExtraction(null);
      return;
    }

    const fetchInitialExtraction = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const { data, error: fetchError } = await supabase
          .from('conversation_extractions')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (fetchError) {
          throw fetchError;
        }

        setLatestExtraction(data);
      } catch (err) {
        console.error('Error fetching conversation extractions:', err);
        setError(err instanceof Error ? err.message : 'Unknown error fetching extractions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialExtraction();

    // Real-time subscription for extraction updates
    const channel = supabase
      .channel(`conversation-extraction-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversation_extractions',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload: any) => {
          console.log('Real-time extraction update:', payload);
          
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const newRecord = payload.new;
            if (newRecord.conversation_id === conversationId) {
              setLatestExtraction(currentLatest => {
                if (!currentLatest || new Date(newRecord.created_at) >= new Date(currentLatest.created_at)) {
                  return newRecord;
                }
                return currentLatest;
              });
            }
          } else if (payload.eventType === 'DELETE') {
            if (latestExtraction && payload.old && payload.old.id === latestExtraction.id) {
              fetchInitialExtraction();
            }
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to extraction updates for ${conversationId}`);
        }
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error(`Subscription error for ${conversationId}:`, status, err);
          setError(`Real-time connection issue: ${status}`);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading conversation analysis...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500">Error loading conversation analysis: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!latestExtraction) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No AI analysis available for this conversation.</p>
        </CardContent>
      </Card>
    );
  }

  const getQualificationBadge = (status?: string) => {
    const colors = {
      'Highly Qualified': 'bg-green-500 text-white',
      'Qualified': 'bg-blue-500 text-white',
      'Needs More Information': 'bg-yellow-500 text-black',
      'Not Qualified': 'bg-red-500 text-white'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500 text-white';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Conversation Analysis
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          {new Date(latestExtraction.created_at).toLocaleString()}
          <Badge variant="outline">v{latestExtraction.extraction_version}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Lead Qualification Status */}
        {latestExtraction.lead_qualification_status && (
          <div>
            <h4 className="font-medium mb-2">Qualification Status</h4>
            <Badge className={getQualificationBadge(latestExtraction.lead_qualification_status)}>
              {latestExtraction.lead_qualification_status}
            </Badge>
          </div>
        )}

        {/* Conversation Summary */}
        {latestExtraction.conversation_summary && (
          <div>
            <h4 className="font-medium mb-2">Summary</h4>
            <p className="text-sm text-muted-foreground p-3 bg-muted rounded-md">
              {latestExtraction.conversation_summary}
            </p>
          </div>
        )}

        {/* Primary Concerns */}
        {latestExtraction.primary_concerns && Array.isArray(latestExtraction.primary_concerns) && latestExtraction.primary_concerns.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Primary Concerns</h4>
            <div className="flex flex-wrap gap-2">
              {latestExtraction.primary_concerns.map((concern: string, index: number) => (
                <Badge key={index} variant="destructive">{concern}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Interested Properties */}
        {latestExtraction.interested_properties && Array.isArray(latestExtraction.interested_properties) && latestExtraction.interested_properties.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Properties of Interest</h4>
            <div className="space-y-2">
              {latestExtraction.interested_properties.map((property: any, index: number) => (
                <div key={index} className="p-3 bg-muted rounded-md">
                  {typeof property === 'string' ? (
                    <p className="text-sm">{property}</p>
                  ) : (
                    <div className="space-y-1">
                      {property.address && <p className="text-sm font-medium">{property.address}</p>}
                      {property.price && <p className="text-sm text-muted-foreground">${property.price.toLocaleString()}</p>}
                      {property.mls && <p className="text-sm text-muted-foreground">MLS: {property.mls}</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Requested Actions */}
        {latestExtraction.requested_actions && Array.isArray(latestExtraction.requested_actions) && latestExtraction.requested_actions.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Requested Actions</h4>
            <div className="space-y-2">
              {latestExtraction.requested_actions.map((action: any, index: number) => (
                <div key={index} className="p-3 bg-blue-50 rounded-md border-l-4 border-blue-500">
                  {typeof action === 'string' ? (
                    <p className="text-sm">{action}</p>
                  ) : (
                    <div>
                      <p className="text-sm font-medium">{action.type || 'Action'}</p>
                      {action.description && <p className="text-sm text-muted-foreground">{action.description}</p>}
                      {action.priority && <Badge variant="outline" className="mt-1">{action.priority}</Badge>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          {latestExtraction.pre_approval_status && (
            <div>
              <span className="font-medium">Pre-Approval:</span>
              <p className="text-muted-foreground">{latestExtraction.pre_approval_status.replace('_', ' ')}</p>
            </div>
          )}
          {latestExtraction.buying_timeline && (
            <div>
              <span className="font-medium">Timeline:</span>
              <p className="text-muted-foreground">{latestExtraction.buying_timeline.replace('_', '-')}</p>
            </div>
          )}
          {latestExtraction.current_lender && (
            <div>
              <span className="font-medium">Current Lender:</span>
              <p className="text-muted-foreground">{latestExtraction.current_lender}</p>
            </div>
          )}
          {latestExtraction.knows_overlays !== null && (
            <div>
              <span className="font-medium">Knows Overlays:</span>
              <p className="text-muted-foreground">{latestExtraction.knows_overlays ? 'Yes' : 'No'}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
