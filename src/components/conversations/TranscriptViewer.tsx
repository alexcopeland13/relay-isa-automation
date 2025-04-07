
import { useState, useRef, useEffect } from 'react';
import { Message } from '@/data/sampleConversation';
import { Clock, Search, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface TranscriptViewerProps {
  messages: Message[];
}

export const TranscriptViewer = ({ messages }: TranscriptViewerProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const messageRefs = useRef<(HTMLDivElement | null)[]>([]);
  
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
  
  const highlightSearchMatches = (text: string) => {
    if (searchQuery.trim() === '') return text;
    
    const regex = new RegExp(`(${searchQuery})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) => 
      regex.test(part) ? <span key={i} className="bg-yellow-200 text-black">{part}</span> : part
    );
  };
  
  const highlightExtractedInfo = (text: string, highlights?: { type: string; text: string; confidence: number }[]) => {
    if (!highlights || highlights.length === 0) return highlightSearchMatches(text);
    
    let result = text;
    const highlightStyles: Record<string, string> = {
      interest: 'bg-blue-100 text-blue-800',
      mortgage_info: 'bg-purple-100 text-purple-800',
      property_value: 'bg-green-100 text-green-800',
      purchase_info: 'bg-teal-100 text-teal-800',
      refinance_goal: 'bg-indigo-100 text-indigo-800',
      location: 'bg-pink-100 text-pink-800',
      timeline: 'bg-orange-100 text-orange-800',
      credit_score: 'bg-lime-100 text-lime-800',
      debt: 'bg-amber-100 text-amber-800',
      contact_preference: 'bg-cyan-100 text-cyan-800',
      availability: 'bg-violet-100 text-violet-800',
    };
    
    // Sort highlights by their position in the text (to avoid overlap issues)
    const sortedHighlights = [...(highlights || [])].sort((a, b) => 
      text.indexOf(a.text) - text.indexOf(b.text)
    );
    
    // Split text into parts to highlight
    let parts: Array<{ text: string; highlight?: { type: string; confidence: number } }> = [{ text: result }];
    
    // Apply each highlight
    sortedHighlights.forEach(highlight => {
      const newParts: typeof parts = [];
      
      parts.forEach(part => {
        if (!part.highlight) {
          const index = part.text.indexOf(highlight.text);
          if (index !== -1) {
            // Text before the highlight
            if (index > 0) {
              newParts.push({ text: part.text.substring(0, index) });
            }
            
            // The highlighted part
            newParts.push({ 
              text: highlight.text, 
              highlight: { type: highlight.type, confidence: highlight.confidence } 
            });
            
            // Text after the highlight
            if (index + highlight.text.length < part.text.length) {
              newParts.push({ text: part.text.substring(index + highlight.text.length) });
            }
          } else {
            newParts.push(part);
          }
        } else {
          newParts.push(part);
        }
      });
      
      parts = newParts;
    });
    
    // Render each part with appropriate styling
    return parts.map((part, index) => {
      if (part.highlight) {
        const style = highlightStyles[part.highlight.type] || 'bg-gray-100 text-gray-800';
        return (
          <span 
            key={index} 
            className={`${style} rounded px-1 relative group cursor-help`}
            title={`${part.highlight.type.replace('_', ' ')} (${Math.round(part.highlight.confidence * 100)}% confidence)`}
          >
            {highlightSearchMatches(part.text)}
            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
              {part.highlight.type.replace('_', ' ')} ({Math.round(part.highlight.confidence * 100)}%)
            </span>
          </span>
        );
      }
      return <span key={index}>{highlightSearchMatches(part.text)}</span>;
    });
  };
  
  return (
    <div className="flex flex-col h-[600px]">
      {/* Search bar */}
      {isSearching && (
        <div className="border-b border-border p-4 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="Search in transcript..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex items-center gap-1">
            <Button 
              variant="outline" 
              size="sm"
              disabled={searchResults.length === 0}
              onClick={handlePrevSearchResult}
            >
              <ChevronUp size={16} />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              disabled={searchResults.length === 0}
              onClick={handleNextSearchResult}
            >
              <ChevronDown size={16} />
            </Button>
            <span className="text-sm text-muted-foreground">
              {searchResults.length > 0 ? `${currentSearchIndex + 1}/${searchResults.length}` : 'No results'}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsSearching(false)}>
            <X size={16} />
          </Button>
        </div>
      )}
      
      {/* Message area */}
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6">
          {messages.map((message, index) => (
            <div 
              key={index}
              ref={el => messageRefs.current[index] = el}
              className={cn(
                "flex max-w-[85%]",
                message.speaker === "AI" ? "mr-auto" : "ml-auto flex-row-reverse"
              )}
            >
              <div 
                className={cn(
                  "rounded-lg p-4 relative",
                  message.speaker === "AI" 
                    ? "bg-secondary text-foreground rounded-tl-none" 
                    : "bg-primary text-primary-foreground rounded-tr-none",
                  searchResults.includes(index) && currentSearchIndex === searchResults.indexOf(index)
                    ? "ring-2 ring-yellow-400"
                    : ""
                )}
              >
                <div className="font-medium mb-1 flex items-center justify-between">
                  <span>{message.speaker}</span>
                  <div className="flex items-center text-xs opacity-70">
                    <Clock className="mr-1" size={12} />
                    <span>{message.timestamp}</span>
                  </div>
                </div>
                <p className={cn(
                  "text-sm",
                  message.speaker === "Lead" && "text-primary-foreground"
                )}>
                  {highlightExtractedInfo(message.text, message.highlights)}
                </p>
                
                {/* Sentiment indicator */}
                <div className="absolute top-2 right-2">
                  {message.sentiment === 'positive' && (
                    <div className="w-2 h-2 rounded-full bg-green-500" title="Positive sentiment" />
                  )}
                  {message.sentiment === 'negative' && (
                    <div className="w-2 h-2 rounded-full bg-red-500" title="Negative sentiment" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      
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
