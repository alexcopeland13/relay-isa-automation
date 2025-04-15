
import React from 'react';
import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';
import { MessageHighlighter } from './MessageHighlighter';

interface MessageBubbleProps {
  speaker: string;
  timestamp: string;
  text: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  highlights?: { type: string; text: string; confidence: number }[];
  searchQuery: string;
  isCurrentSearchResult: boolean;
  ref?: React.RefObject<HTMLDivElement>;
}

export const MessageBubble = React.forwardRef<HTMLDivElement, MessageBubbleProps>(
  ({ speaker, timestamp, text, sentiment, highlights, searchQuery, isCurrentSearchResult }, ref) => {
    return (
      <div 
        ref={ref}
        className={cn(
          "flex max-w-[85%]",
          speaker === "AI" ? "mr-auto" : "ml-auto flex-row-reverse"
        )}
      >
        <div 
          className={cn(
            "rounded-lg p-4 relative",
            speaker === "AI" 
              ? "bg-secondary text-foreground rounded-tl-none" 
              : "bg-primary text-primary-foreground rounded-tr-none",
            isCurrentSearchResult
              ? "ring-2 ring-yellow-400"
              : ""
          )}
        >
          <div className="font-medium mb-1 flex items-center justify-between">
            <span>{speaker}</span>
            <div className="flex items-center text-xs opacity-70">
              <Clock className="mr-1" size={12} />
              <span>{timestamp}</span>
            </div>
          </div>
          <p className={cn(
            "text-sm",
            speaker === "Lead" && "text-primary-foreground"
          )}>
            <MessageHighlighter 
              text={text} 
              searchQuery={searchQuery} 
              highlights={highlights} 
            />
          </p>
          
          {/* Sentiment indicator */}
          <div className="absolute top-2 right-2">
            {sentiment === 'positive' && (
              <div className="w-2 h-2 rounded-full bg-green-500" title="Positive sentiment" />
            )}
            {sentiment === 'negative' && (
              <div className="w-2 h-2 rounded-full bg-red-500" title="Negative sentiment" />
            )}
          </div>
        </div>
      </div>
    );
  }
);

MessageBubble.displayName = 'MessageBubble';
