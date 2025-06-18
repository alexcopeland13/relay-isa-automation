import { useState, useRef, useEffect } from 'react';
import { Message, HighlightItem, ConversationMessage } from '@/types/conversation';
import { Search, Download, Flag, MessageSquare, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SearchBar } from './transcript/SearchBar';
import { MessageBubble } from './transcript/MessageBubble';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { convertConversationMessagesToDisplayMessages } from '@/lib/transcriptUtils';
import React from 'react';

interface TranscriptViewerProps {
  messages: Message[];
  conversationId?: string;
}

export const TranscriptViewer = ({ messages, conversationId }: TranscriptViewerProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const [activeView, setActiveView] = useState<'all' | 'highlights' | 'questions'>('all');
  const [conversationMessages, setConversationMessages] = useState<ConversationMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [enhancedData, setEnhancedData] = useState<any>(null);
  const messageRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Load conversation messages and enhanced data if conversationId is provided
  useEffect(() => {
    if (!conversationId) return;

    const loadConversationData = async () => {
      try {
        setIsLoading(true);
        console.log('🔍 Loading enhanced conversation data for:', conversationId);
        
        // First get the conversation with enhanced Retell data
        const { data: conversation, error: convError } = await supabase
          .from('conversations')
          .select('retell_call_data, retell_call_analysis')
          .eq('id', conversationId)
          .single();
          
        if (!convError && conversation) {
          setEnhancedData({
            retell_call_data: conversation.retell_call_data,
            retell_call_analysis: conversation.retell_call_analysis
          });
          console.log('✅ Enhanced conversation data loaded:', {
            has_retell_data: !!conversation.retell_call_data,
            has_call_analysis: !!conversation.retell_call_analysis
          });
        }
        
        // Load conversation messages
        const { data, error } = await supabase
          .from('conversation_messages')
          .select('id, conversation_id, role, content, seq, ts, created_at')
          .eq('conversation_id', conversationId)
          .order('seq', { ascending: true });

        if (error) {
          console.error('❌ Error loading conversation messages:', error);
          return;
        }

        console.log('✅ Loaded conversation messages:', data?.length || 0, data);
        // Map the data to match our interface, handling missing created_at and type casting
        const mappedMessages: ConversationMessage[] = (data || []).map(msg => ({
          id: msg.id,
          conversation_id: msg.conversation_id,
          role: msg.role as 'agent' | 'lead', // Type cast the role
          content: msg.content,
          seq: msg.seq,
          ts: msg.ts,
          created_at: msg.created_at || msg.ts // Fallback to ts if created_at is missing
        }));
        setConversationMessages(mappedMessages);
      } catch (error) {
        console.error('❌ Error loading conversation data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConversationData();

    // Subscribe to real-time updates for conversation messages
    const channel = supabase
      .channel(`conversation-messages-${conversationId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversation_messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        console.log('📡 Real-time message update:', payload);
        if (payload.eventType === 'INSERT') {
          const newMessage = payload.new as any;
          // Convert to our typed interface
          const typedMessage: ConversationMessage = {
            id: newMessage.id,
            conversation_id: newMessage.conversation_id,
            role: newMessage.role as 'agent' | 'lead',
            content: newMessage.content,
            seq: newMessage.seq,
            ts: newMessage.ts,
            created_at: newMessage.created_at || newMessage.ts
          };
          setConversationMessages(prev => {
            const exists = prev.some(msg => msg.id === typedMessage.id);
            if (exists) return prev;
            return [...prev, typedMessage].sort((a, b) => a.seq - b.seq);
          });
        } else if (payload.eventType === 'UPDATE') {
          const updatedMessage = payload.new as any;
          // Convert to our typed interface
          const typedMessage: ConversationMessage = {
            id: updatedMessage.id,
            conversation_id: updatedMessage.conversation_id,
            role: updatedMessage.role as 'agent' | 'lead',
            content: updatedMessage.content,
            seq: updatedMessage.seq,
            ts: updatedMessage.ts,
            created_at: updatedMessage.created_at || updatedMessage.ts
          };
          setConversationMessages(prev => 
            prev.map(msg => msg.id === typedMessage.id ? typedMessage : msg)
              .sort((a, b) => a.seq - b.seq)
          );
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  // Convert conversation messages to Message format for display
  const displayMessages: Message[] = conversationMessages.length > 0 
    ? convertConversationMessagesToDisplayMessages(conversationMessages)
    : messages;
  
  // Ensure refs array length matches the number of messages
  useEffect(() => {
    messageRefs.current = messageRefs.current.slice(0, displayMessages.length);
    while (messageRefs.current.length < displayMessages.length) {
      messageRefs.current.push(null);
    }
  }, [displayMessages]);
  
  // search functionality
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }
    
    const matches: number[] = [];
    displayMessages.forEach((message, index) => {
      if (message.content.toLowerCase().includes(searchQuery.toLowerCase())) {
        matches.push(index);
      }
    });
    
    setSearchResults(matches);
    setCurrentSearchIndex(matches.length > 0 ? 0 : -1);
  }, [searchQuery, displayMessages]);
  
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
  const filteredMessages = displayMessages.filter(message => {
    if (activeView === 'all') return true;
    if (activeView === 'highlights') return message.highlights && message.highlights.length > 0;
    if (activeView === 'questions') return message.content.includes('?');
    return true;
  });

  // Debug logging
  console.log('🔍 TranscriptViewer Enhanced Debug:', {
    conversationId,
    conversationMessagesCount: conversationMessages.length,
    displayMessagesCount: displayMessages.length,
    filteredMessagesCount: filteredMessages.length,
    hasEnhancedData: !!enhancedData,
    isLoading
  });

  return (
    <div className="flex flex-col h-full border rounded-md overflow-hidden">
      {/* Transcript toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
        <div className="flex items-center gap-4">
          <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)} className="w-auto">
            <TabsList className="h-8">
              <TabsTrigger value="all" className="text-xs px-3">All</TabsTrigger>
              <TabsTrigger value="highlights" className="text-xs px-3">Highlights</TabsTrigger>
              <TabsTrigger value="questions" className="text-xs px-3">Questions</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {/* Enhanced data indicator */}
          {enhancedData?.retell_call_data && (
            <div className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
              Enhanced Data
            </div>
          )}
        </div>
        
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
          {isLoading ? (
            <div className="text-center text-muted-foreground py-8 flex flex-col items-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent mx-auto mb-4" />
              <p>Loading enhanced conversation data...</p>
            </div>
          ) : filteredMessages.length > 0 ? (
            filteredMessages.map((message, index) => (
              <MessageBubble
                key={message.id || index}
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
                  {conversationId && (
                    <div className="text-xs mt-2 space-y-1">
                      <p>Conversation ID: {conversationId}</p>
                      <p>Messages in DB: {conversationMessages.length}</p>
                      <p>Enhanced Data: {enhancedData ? 'Available' : 'Not Available'}</p>
                      <p>Transcript will appear here once messages are processed.</p>
                    </div>
                  )}
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
