
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";

interface TranscriptTabProps {
  initialTranscript?: { speaker: string; text: string }[];
}

export const TranscriptTab = ({ initialTranscript = [] }: TranscriptTabProps) => {
  const [transcribedText, setTranscribedText] = useState<{speaker: string; text: string}[]>(initialTranscript);
  
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
    
    // Only populate if we don't have initial transcript
    if (initialTranscript.length === 0) {
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
    }
  }, [transcribedText, initialTranscript]);

  return (
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
  );
};
