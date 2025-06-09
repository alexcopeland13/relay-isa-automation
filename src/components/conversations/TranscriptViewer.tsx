
import { useState, useRef, useEffect } from 'react';
import { Message, HighlightItem } from '@/types/conversation';
import { Search, Download, Flag, MessageSquare, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SearchBar } from './transcript/SearchBar';
import { MessageBubble } from './transcript/MessageBubble';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import React from 'react';

interface TranscriptViewerProps {
  messages: Message[];
}

export const TranscriptViewer = ({ messages }: TranscriptViewerProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const [activeView, setActiveView] = useState<'all' | 'highlights' | 'questions'>('all');
  const messageRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Ensure refs array length matches the number of messages
  useEffect(() => {
    messageRefs.current = messageRefs.current.slice(0, messages.length);
    while (messageRefs.current.length < messages.length) {
      messageRefs.current.push(null);
    }
  }, [messages]);
  
  // Search for matches when query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }
    
    const matches: number[] = [];
    messages.forEach((message, index) => {
      if (message.content.toLowerCase().includes(searchQuery.toLowerCase())) {
        matches.push(index);
      }
    });
    
    setSearchResults(matches);
    setCurrentSearchIndex(matches.length > 0 ? 0 : -1);
  }, [searchQuery, messages]);
  
  // Scroll to current search result
  useEffect(() => {
    if (currentSearchIndex >= 0 && searchResults.length > 0) {
      const messageIndex = searchResults[currentSearchIndex];
      messageRefs.current[messageIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentSearchIndex, searchResults]);
  
  const handleNextSearchResult = () => {
    if (searchResults.length === 0) return;
    setCurrentSearchIndex((prevIndex) => (prevIndex + 1) % searchResults.length);
  };
  
  const handlePrevSearchResult = () => {
    if (searchResults.length === 0) return;
    setCurrentSearchIndex((prevIndex) => (prevIndex - 1 + searchResults.length) % searchResults.length);
  };

  // Helper function to convert sentiment number to string
  const getSentimentString = (sentiment?: number): 'positive' | 'negative' | 'neutral' => {
    if (!sentiment) return 'neutral';
    if (sentiment > 0) return 'positive';
    if (sentiment < 0) return 'negative';
    return 'neutral';
  };

  // Helper function to convert highlights to proper format
  const getHighlights = (highlights?: (string | HighlightItem)[]): { type: string; text: string; confidence: number }[] => {
    if (!highlights) return [];
    return highlights.map(highlight => {
      if (typeof highlight === 'string') {
        return {
          type: 'general',
          text: highlight,
          confidence: 0.8
        };
      } else {
        return highlight;
      }
    });
  };

  // Filter messages based on active view
  const filteredMessages = messages.filter(message => {
    if (activeView === 'all') return true;
    if (activeView === 'highlights') return message.highlights && message.highlights.length > 0;
    if (activeView === 'questions') return message.content.includes('?');
    return true;
  });

  return (
    <div className="flex flex-col h-full border rounded-md overflow-hidden">
      {/* Transcript toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
        <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)} className="w-auto">
          <TabsList className="h-8">
            <TabsTrigger value="all" className="text-xs px-3">All</TabsTrigger>
            <TabsTrigger value="highlights" className="text-xs px-3">Highlights</TabsTrigger>
            <TabsTrigger value="questions" className="text-xs px-3">Questions</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <Flag className="h-4 w-4 mr-1" />
            <span className="text-xs">Flag</span>
          </Button>
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <Download className="h-4 w-4 mr-1" />
            <span className="text-xs">Export</span>
          </Button>
          <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => setIsSearching(true)}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Search bar */}
      {isSearching && (
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchResults={searchResults}
          currentSearchIndex={currentSearchIndex}
          onPrevResult={handlePrevSearchResult}
          onNextResult={handleNextSearchResult}
          onClose={() => setIsSearching(false)}
        />
      )}
      
      {/* Message area */}
      <ScrollArea className="flex-1 px-4 py-2">
        <div className="space-y-2 pb-4">
          {filteredMessages.length > 0 ? (
            filteredMessages.map((message, index) => (
              <MessageBubble
                key={index}
                ref={(el) => {
                  messageRefs.current[index] = el;
                }}
                speaker={message.role === 'user' ? 'Lead' : 'AI Agent'}
                timestamp={message.timestamp}
                text={message.content}
                sentiment={getSentimentString(message.sentiment)}
                highlights={getHighlights(message.highlights)}
                searchQuery={searchQuery}
                isCurrentSearchResult={searchResults.includes(index) && currentSearchIndex === searchResults.indexOf(index)}
              />
            ))
          ) : (
            <div className="text-center text-muted-foreground py-8 flex flex-col items-center">
              {activeView === 'all' ? (
                <>
                  <MessageSquare className="h-8 w-8 mb-2 opacity-40" />
                  <p>No messages available in this conversation.</p>
                </>
              ) : activeView === 'highlights' ? (
                <>
                  <Info className="h-8 w-8 mb-2 opacity-40" />
                  <p>No highlighted text found in this conversation.</p>
                </>
              ) : (
                <>
                  <Info className="h-8 w-8 mb-2 opacity-40" />
                  <p>No questions found in this conversation.</p>
                </>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
