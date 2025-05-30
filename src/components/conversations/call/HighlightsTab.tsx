
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface HighlightsTabProps {
  conversationId?: string;
}

interface ConversationExtraction {
  lead_qualification_status?: string;
  pre_approval_status?: string;
  buying_timeline?: string;
  primary_concerns?: any;
  interested_properties?: any;
  conversation_summary?: string;
}

export const HighlightsTab = ({ conversationId }: HighlightsTabProps) => {
  const [extractions, setExtractions] = useState<ConversationExtraction | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadExtractions = async () => {
      if (!conversationId) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('conversation_extractions')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) {
          console.error('Error loading extractions:', error);
        } else if (data && data.length > 0) {
          setExtractions(data[0]);
        }
      } catch (error) {
        console.error('Error loading extractions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadExtractions();

    // Set up real-time subscription for extraction updates
    const subscription = supabase
      .channel(`extractions-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversation_extractions',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          if (payload.new) {
            setExtractions(payload.new as ConversationExtraction);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [conversationId]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!extractions) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <AlertCircle className="h-8 w-8 mx-auto mb-2" />
          <p>No highlights available yet</p>
          <p className="text-xs mt-1">Key insights will appear as the conversation progresses</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'qualified':
      case 'highly qualified':
        return 'bg-green-500';
      case 'needs more information':
        return 'bg-yellow-500';
      case 'not qualified':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {/* Lead Qualification Status */}
        {extractions.lead_qualification_status && (
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4" />
                <span className="font-medium text-sm">Qualification Status</span>
              </div>
              <Badge className={getStatusColor(extractions.lead_qualification_status)}>
                {extractions.lead_qualification_status}
              </Badge>
            </CardContent>
          </Card>
        )}

        {/* Pre-approval Status */}
        {extractions.pre_approval_status && (
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium text-sm">Pre-approval</span>
              </div>
              <p className="text-sm">{extractions.pre_approval_status}</p>
            </CardContent>
          </Card>
        )}

        {/* Buying Timeline */}
        {extractions.buying_timeline && (
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4" />
                <span className="font-medium text-sm">Timeline</span>
              </div>
              <p className="text-sm">{extractions.buying_timeline}</p>
            </CardContent>
          </Card>
        )}

        {/* Primary Concerns */}
        {extractions.primary_concerns && (
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium text-sm">Primary Concerns</span>
              </div>
              <div className="space-y-1">
                {Array.isArray(extractions.primary_concerns) ? (
                  extractions.primary_concerns.map((concern: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {concern}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm">{JSON.stringify(extractions.primary_concerns)}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Conversation Summary */}
        {extractions.conversation_summary && (
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-sm">Summary</span>
              </div>
              <p className="text-sm leading-relaxed">{extractions.conversation_summary}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
};
