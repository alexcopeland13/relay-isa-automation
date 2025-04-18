
import { useState, useRef, useEffect } from 'react';
import { Message } from '@/data/sampleConversation';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SearchBar } from './transcript/SearchBar';
import { MessageBubble } from './transcript/MessageBubble';
import React from 'react';

interface TranscriptViewerProps {
  messages: Message[];
}

export const TranscriptViewer = ({ messages }: TranscriptViewerProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
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
      if (message.text.toLowerCase().includes(searchQuery.toLowerCase())) {
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

  return (
    <div className="flex flex-col h-full">
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
      
      {/* Message area with tabs */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full">
          <ScrollArea className="h-full px-4 py-2">
            <div className="space-y-2">
              {messages && messages.length > 0 ? (
                messages.map((message, index) => (
                  <MessageBubble
                    key={index}
                    ref={(el) => {
                      messageRefs.current[index] = el;
                    }}
                    speaker={message.speaker}
                    timestamp={message.timestamp}
                    text={message.text}
                    sentiment={message.sentiment}
                    highlights={message.highlights}
                    searchQuery={searchQuery}
                    isCurrentSearchResult={searchResults.includes(index) && currentSearchIndex === searchResults.indexOf(index)}
                  />
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No messages available in this conversation.
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
      
      {/* Search toggle button */}
      {!isSearching && (
        <div className="border-t border-border p-4 flex justify-end">
          <Button variant="outline" size="sm" onClick={() => setIsSearching(true)}>
            <Search className="mr-2 h-4 w-4" />
            Search Transcript
          </Button>
        </div>
      )}
    </div>
  );
};
