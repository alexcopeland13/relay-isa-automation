
import { useState, useEffect } from 'react';
import { 
  MicOff, 
  Mic, 
  PhoneOff, 
  PauseCircle, 
  ScreenShareOff, 
  UserPlus, 
  MinusCircle, 
  Maximize2, 
  Minimize2,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

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
  const [transcribedText, setTranscribedText] = useState<{speaker: string; text: string}[]>([]);
  
  // Simulate real-time transcription with this effect
  useEffect(() => {
    const transcriptItems = [
      { speaker: 'AI', text: 'Hello, this is Relay AI. Am I speaking with Michael Brown today?' },
      { speaker: 'Lead', text: 'Yes, this is Michael.' },
      { speaker: 'AI', text: 'Great, thank you for taking my call. I understand you\'re interested in refinancing your mortgage. Is that correct?' },
      { speaker: 'Lead', text: 'Yes, I\'m looking to potentially lower my rate and maybe get some cash out for home improvements.' },
      { speaker: 'AI', text: 'That\'s helpful information. What\'s your current interest rate, if you don\'t mind me asking?' },
      { speaker: 'Lead', text: 'I\'m at 4.75% right now on a 30-year fixed.' },
      { speaker: 'AI', text: 'I see. And how long have you had your current mortgage?' },
      { speaker: 'Lead', text: 'We\'ve had it for about 5 years now.' },
    ];
    
    const interval = setInterval(() => {
      if (transcribedText.length < transcriptItems.length) {
        setTranscribedText(prev => [
          ...prev, 
          transcriptItems[prev.length]
        ]);
      } else {
        clearInterval(interval);
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [transcribedText]);
  
  // Call timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 bg-background border border-border shadow-lg rounded-lg p-3 w-64 z-50">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="font-medium">{leadInfo.name}</span>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => setIsMinimized(false)}>
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <PhoneOff className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
        <div className="text-sm text-muted-foreground mt-1">
          Call duration: {formatTime(callDuration)}
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-4xl overflow-hidden">
        <div className="p-4 bg-muted flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 text-primary p-2 rounded-full">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-medium">{leadInfo.name}</h3>
              <p className="text-sm text-muted-foreground">{leadInfo.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {formatTime(callDuration)}
            </span>
            <div className="flex">
              <Button variant="ghost" size="icon" onClick={() => setIsMinimized(true)}>
                <Minimize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
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
                <ScrollArea className="h-full p-4">
                  <div className="space-y-4">
                    {transcribedText.map((item, index) => (
                      <div 
                        key={index} 
                        className={`flex max-w-[85%] ${item.speaker === 'AI' ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
                      >
                        <div 
                          className={`rounded-lg p-3 ${
                            item.speaker === 'AI' 
                              ? 'bg-secondary text-foreground rounded-tl-none' 
                              : 'bg-primary text-primary-foreground rounded-tr-none'
                          }`}
                        >
                          <div className="font-medium mb-1 text-sm">
                            {item.speaker}
                          </div>
                          <p>{item.text}</p>
                        </div>
                      </div>
                    ))}
                    {transcribedText.length > 0 && (
                      <div className="h-4 flex items-center text-xs text-muted-foreground justify-center">
                        <div className="w-4 h-1 rounded-full bg-muted-foreground mx-1 animate-pulse" />
                        <div className="w-3 h-1 rounded-full bg-muted-foreground mx-1 animate-pulse" />
                        <div className="w-2 h-1 rounded-full bg-muted-foreground mx-1 animate-pulse" />
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="highlights" className="mt-0 p-0 h-[448px]">
                <ScrollArea className="h-full p-4">
                  <div className="space-y-4">
                    <div className="border rounded-md p-3">
                      <h4 className="font-medium mb-1">Current Rate</h4>
                      <div className="flex items-center">
                        <span className="text-lg">4.75%</span>
                        <span className="ml-2 text-xs text-muted-foreground">(30-year fixed)</span>
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-3">
                      <h4 className="font-medium mb-1">Mortgage Age</h4>
                      <div className="flex items-center">
                        <span className="text-lg">5 years</span>
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-3">
                      <h4 className="font-medium mb-1">Refinance Goals</h4>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Lower Rate</span>
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Cash Out</span>
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-3">
                      <h4 className="font-medium mb-1">Home Improvement Plans</h4>
                      <p className="text-sm">Mentioned plans to use cash out for home improvements</p>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="border-t md:border-t-0 md:border-l border-border bg-muted/30">
            <div className="p-4">
              <h3 className="font-medium mb-3">Lead Information</h3>
              
              <div className="space-y-3">
                <div>
                  <h4 className="text-xs text-muted-foreground">Contact</h4>
                  <p className="text-sm">{leadInfo.email}</p>
                  <p className="text-sm">{leadInfo.phone}</p>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="text-xs text-muted-foreground">Source</h4>
                  <p className="text-sm">{leadInfo.source}</p>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="text-xs text-muted-foreground">Suggested Questions</h4>
                  <ul className="text-sm space-y-2 mt-2">
                    <li className="p-2 bg-primary/10 rounded-md">What's the estimated current value of your home?</li>
                    <li className="p-2 bg-primary/10 rounded-md">How much cash would you like to take out?</li>
                    <li className="p-2 bg-primary/10 rounded-md">What kind of home improvements are you planning?</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-muted border-t border-border flex justify-center">
          <div className="flex gap-2">
            <Button 
              variant={isMuted ? "default" : "outline"} 
              size="icon"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            
            <Button variant="outline" size="icon">
              <PauseCircle className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" size="icon">
              <ScreenShareOff className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" size="icon">
              <UserPlus className="h-4 w-4" />
            </Button>
            
            <Button variant="destructive" size="icon" onClick={onClose}>
              <PhoneOff className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
