
import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CallHeader } from './call/CallHeader';
import { CallControls } from './call/CallControls';
import { TranscriptTab } from './call/TranscriptTab';
import { HighlightsTab } from './call/HighlightsTab';
import { LeadInfoPanel } from './call/LeadInfoPanel';
import { MinimizedCallView } from './call/MinimizedCallView';
import { TranscriptUpdateIndicator } from './call/TranscriptUpdateIndicator';
import { CallEventProcessor } from './CallEventProcessor';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRealtimeConversations } from '@/hooks/use-realtime-conversations';
import { useRealtimeExtractions } from '@/hooks/use-realtime-extractions';

interface ActiveCallData {
  conversation_id: string;
  lead_id: string;
  call_status: string;
  started_at: string;
  call_sid: string;
  lead_name: string;
  lead_phone: string;
}

interface ActiveCallInterfaceProps {
  callData?: ActiveCallData;
  leadInfo: {
    name: string;
    email: string;
    phone: string;
    source: string;
    id?: string;
  };
  onClose: () => void;
}

export const ActiveCallInterface = ({ callData, leadInfo, onClose }: ActiveCallInterfaceProps) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [transcript, setTranscript] = useState<string>('');
  const [isCallActive, setIsCallActive] = useState(true);
  const [lastTranscriptUpdate, setLastTranscriptUpdate] = useState<string>();
  const { toast } = useToast();
  
  // Real-time hooks
  const { conversationUpdates } = useRealtimeConversations(
    callData?.conversation_id ? [callData.conversation_id] : []
  );
  const { extractionUpdates } = useRealtimeExtractions(
    callData?.conversation_id ? [callData.conversation_id] : []
  );
  
  // Get current conversation update
  const currentUpdate = callData?.conversation_id ? 
    conversationUpdates[callData.conversation_id] : null;
  
  // Calculate call duration from actual start time
  useEffect(() => {
    if (!callData?.started_at) return;
    
    const updateDuration = () => {
      const startTime = new Date(callData.started_at);
      const now = new Date();
      const durationInSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      setCallDuration(durationInSeconds);
    };
    
    updateDuration();
    const timer = setInterval(updateDuration, 1000);
    
    return () => clearInterval(timer);
  }, [callData?.started_at]);

  // Handle real-time conversation updates
  useEffect(() => {
    if (currentUpdate) {
      // Update transcript if changed
      if (currentUpdate.transcript && currentUpdate.transcript !== transcript) {
        setTranscript(currentUpdate.transcript);
        setLastTranscriptUpdate(new Date().toISOString());
      }
      
      // Update call status
      if (currentUpdate.call_status !== 'active') {
        setIsCallActive(false);
      }
    }
  }, [currentUpdate, transcript]);

  // Load initial conversation transcript from database
  useEffect(() => {
    const loadTranscript = async () => {
      if (!callData?.conversation_id) return;
      
      try {
        const { data, error } = await supabase
          .from('conversations')
          .select('transcript, call_status')
          .eq('id', callData.conversation_id)
          .single();
          
        if (error) {
          console.error('Error loading transcript:', error);
          return;
        }
        
        if (data?.transcript) {
          setTranscript(data.transcript);
        }
        
        if (data?.call_status !== 'active') {
          setIsCallActive(false);
        }
      } catch (error) {
        console.error('Error loading transcript:', error);
      }
    };
    
    loadTranscript();
  }, [callData?.conversation_id]);
  
  const handleCallStatusChange = (status: string) => {
    setIsCallActive(status === 'active');
  };
  
  const handleTranscriptUpdate = (newTranscript: string) => {
    setTranscript(newTranscript);
    setLastTranscriptUpdate(new Date().toISOString());
  };
  
  const handleEndCall = async () => {
    if (!callData?.conversation_id) {
      onClose();
      return;
    }
    
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ 
          call_status: 'completed',
          ended_at: new Date().toISOString()
        })
        .eq('id', callData.conversation_id);
        
      if (error) {
        console.error('Error ending call:', error);
        toast({
          title: "Error ending call",
          description: "Could not update call status. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Call ended",
        description: "The call has been successfully ended.",
      });
      
      onClose();
    } catch (error) {
      console.error('Error ending call:', error);
      toast({
        title: "Error ending call",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };
  
  if (isMinimized) {
    return (
      <MinimizedCallView
        leadInfo={{
          name: leadInfo.name,
          id: leadInfo.id || callData?.lead_id
        }}
        callDuration={callDuration}
        onMaximize={() => setIsMinimized(false)}
        onEndCall={handleEndCall}
      />
    );
  }
  
  const isTranscriptUpdating = Boolean(currentUpdate && 
    currentUpdate.transcript && 
    currentUpdate.transcript !== transcript
  );
  
  return (
    <>
      {/* Event processor for handling real-time events */}
      {callData?.conversation_id && (
        <CallEventProcessor
          conversationId={callData.conversation_id}
          onCallStatusChange={handleCallStatusChange}
          onTranscriptUpdate={handleTranscriptUpdate}
        />
      )}
      
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-background rounded-lg shadow-xl w-full max-w-4xl overflow-hidden">
          <CallHeader
            leadInfo={leadInfo}
            callDuration={callDuration}
            callSid={callData?.call_sid}
            isActive={isCallActive}
            onMinimize={() => setIsMinimized(true)}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 h-[500px]">
            <div className="md:col-span-2 border-r border-border">
              <Tabs defaultValue="transcript">
                <div className="border-b border-border">
                  <TabsList className="w-full justify-start h-12 px-4">
                    <TabsTrigger value="transcript" className="flex items-center gap-2">
                      Live Transcript
                      {isTranscriptUpdating && (
                        <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="highlights">
                      Key Highlights
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="transcript" className="mt-0 p-0 h-[448px]">
                  <div className="relative h-full">
                    <TranscriptTab transcript={transcript} />
                    <div className="absolute top-2 right-2">
                      <TranscriptUpdateIndicator 
                        isUpdating={isTranscriptUpdating}
                        lastUpdate={lastTranscriptUpdate}
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="highlights" className="mt-0 p-0 h-[448px]">
                  <HighlightsTab conversationId={callData?.conversation_id} />
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="border-t md:border-t-0 md:border-l border-border bg-muted/30">
              <LeadInfoPanel 
                leadInfo={leadInfo} 
                leadId={callData?.lead_id}
              />
            </div>
          </div>
          
          <CallControls
            isMuted={isMuted}
            isActive={isCallActive}
            onMuteToggle={() => setIsMuted(!isMuted)}
            onEndCall={handleEndCall}
          />
        </div>
      </div>
    </>
  );
};
