
import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CallHeader } from './call/CallHeader';
import { CallControls } from './call/CallControls';
import { TranscriptTab } from './call/TranscriptTab';
import { HighlightsTab } from './call/HighlightsTab';
import { LeadInfoPanel } from './call/LeadInfoPanel';
import { MinimizedCallView } from './call/MinimizedCallView';

interface ActiveCallInterfaceProps {
  leadInfo: {
    name: string;
    email: string;
    phone: string;
    source: string;
  };
  onClose: () => void;
}

export const ActiveCallInterface = ({ leadInfo, onClose }: ActiveCallInterfaceProps) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  
  // Call timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  if (isMinimized) {
    return (
      <MinimizedCallView
        leadInfo={leadInfo}
        callDuration={callDuration}
        onMaximize={() => setIsMinimized(false)}
        onEndCall={onClose}
      />
    );
  }
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-4xl overflow-hidden">
        <CallHeader
          leadInfo={leadInfo}
          callDuration={callDuration}
          onMinimize={() => setIsMinimized(true)}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 h-[500px]">
          <div className="md:col-span-2 border-r border-border">
            <Tabs defaultValue="transcript">
              <div className="border-b border-border">
                <TabsList className="w-full justify-start h-12 px-4">
                  <TabsTrigger value="transcript">
                    Live Transcript
                  </TabsTrigger>
                  <TabsTrigger value="highlights">
                    Key Highlights
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="transcript" className="mt-0 p-0 h-[448px]">
                <TranscriptTab />
              </TabsContent>
              
              <TabsContent value="highlights" className="mt-0 p-0 h-[448px]">
                <HighlightsTab />
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="border-t md:border-t-0 md:border-l border-border bg-muted/30">
            <LeadInfoPanel leadInfo={leadInfo} />
          </div>
        </div>
        
        <CallControls
          isMuted={isMuted}
          onMuteToggle={() => setIsMuted(!isMuted)}
          onEndCall={onClose}
        />
      </div>
    </div>
  );
};
