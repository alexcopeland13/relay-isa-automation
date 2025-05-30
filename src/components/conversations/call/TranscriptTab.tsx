
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useEffect, useRef } from "react";

interface TranscriptTabProps {
  transcript?: string;
}

export const TranscriptTab = ({ transcript }: TranscriptTabProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when new transcript data arrives
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [transcript]);

  // Parse transcript if it's a string (could be JSON or plain text)
  const parseTranscript = (transcript: string) => {
    if (!transcript) return [];
    
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(transcript);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      // If it's an object with messages
      if (parsed.messages) {
        return parsed.messages;
      }
    } catch {
      // If not JSON, treat as plain text and split by common patterns
      const lines = transcript.split(/\n|\. (?=[A-Z])/);
      return lines.map((line, index) => ({
        id: index,
        speaker: index % 2 === 0 ? 'AI Agent' : 'Lead',
        content: line.trim(),
        timestamp: new Date().toISOString()
      })).filter(item => item.content.length > 0);
    }
    
    return [];
  };

  const messages = transcript ? parseTranscript(transcript) : [];

  if (!transcript || messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <div className="animate-pulse mb-2">●</div>
          <p>Waiting for conversation to begin...</p>
          <p className="text-xs mt-1">Transcript will appear here in real-time</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full" ref={scrollAreaRef}>
      <div className="p-4 space-y-4">
        {messages.map((message: any, index: number) => (
          <div key={message.id || index} className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant={message.speaker === 'AI Agent' ? 'default' : 'secondary'}>
                {message.speaker || (index % 2 === 0 ? 'AI Agent' : 'Lead')}
              </Badge>
              {message.timestamp && (
                <span className="text-xs text-muted-foreground">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              )}
            </div>
            <p className="text-sm leading-relaxed">
              {message.content || message.text || message}
            </p>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};
