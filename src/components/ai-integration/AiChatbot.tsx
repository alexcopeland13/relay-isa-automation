
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  Loader2,
  RefreshCw,
  Settings
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface AiChatbotProps {
  mode?: 'prospect' | 'agent';
  leadId?: string;
  conversationId?: string;
}

export const AiChatbot = ({ 
  mode = 'prospect', 
  leadId, 
  conversationId 
}: AiChatbotProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Add welcome message based on mode
    const welcomeMessage: ChatMessage = {
      id: 'welcome-1',
      role: 'assistant',
      content: mode === 'prospect' 
        ? "Hi! I'm here to help you with your real estate needs. I can answer questions about buying, selling, mortgages, and help connect you with the right specialist. What can I help you with today?"
        : "Hello! I'm your AI assistant. I can help you analyze leads, suggest follow-ups, provide property insights, and answer questions about your prospects. How can I assist you?",
      timestamp: new Date().toISOString()
    };
    setMessages([welcomeMessage]);
  }, [mode]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const context = {
        conversationId: conversationId || `chat-${Date.now()}`,
        leadInfo: leadId ? { id: leadId } : undefined,
        conversationHistory: [...messages, userMessage],
        mode,
        currentTimestamp: new Date().toISOString()
      };

      const systemPrompt = mode === 'prospect'
        ? "You are a helpful real estate AI assistant talking to a potential buyer/seller. Be friendly, professional, and focus on their real estate needs. Ask qualifying questions and offer to connect them with specialists when appropriate."
        : "You are an AI assistant helping a real estate agent. Provide insights about leads, suggest follow-up strategies, help analyze conversations, and offer professional guidance.";

      const { data, error } = await supabase.functions.invoke('ai-conversation-processor', {
        body: {
          action: 'generate_response',
          data: {
            context,
            prompt: `${systemPrompt}\n\nUser message: ${inputMessage}`
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      const assistantMessage: ChatMessage = {
        id: data.message.id,
        role: 'assistant',
        content: data.message.content,
        timestamp: data.message.timestamp
      };

      setMessages(prev => [...prev, assistantMessage]);

      // If this is a prospect conversation, we might want to extract entities
      if (mode === 'prospect' && leadId) {
        try {
          await supabase.functions.invoke('ai-conversation-processor', {
            body: {
              action: 'extract_entities',
              data: { text: inputMessage }
            }
          });
        } catch (extractionError) {
          console.log('Entity extraction failed (non-critical):', extractionError);
        }
      }

    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, errorMessage]);
      setIsConnected(false);

      toast({
        title: 'Connection Error',
        description: 'Unable to reach AI assistant. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      id: 'welcome-clear',
      role: 'assistant',
      content: mode === 'prospect' 
        ? "Chat cleared. How can I help you with your real estate needs?"
        : "Chat cleared. How can I assist you today?",
      timestamp: new Date().toISOString()
    }]);
  };

  const getMessageIcon = (role: string) => {
    return role === 'assistant' ? (
      <Bot className="h-4 w-4 text-blue-600" />
    ) : (
      <User className="h-4 w-4 text-gray-600" />
    );
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            AI Assistant
            <Badge variant={mode === 'prospect' ? 'default' : 'secondary'}>
              {mode === 'prospect' ? 'Prospect Chat' : 'Agent Support'}
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <Button variant="outline" size="sm" onClick={clearChat}>
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-4">
        <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 mt-1">
                    {getMessageIcon(message.role)}
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>

                {message.role === 'user' && (
                  <div className="flex-shrink-0 mt-1">
                    {getMessageIcon(message.role)}
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 mt-1">
                  <Bot className="h-4 w-4 text-blue-600" />
                </div>
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span className="text-sm text-gray-600">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex gap-2 mt-4">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={mode === 'prospect' 
              ? "Ask me about real estate, mortgages, or finding properties..." 
              : "Ask about leads, strategies, or get assistance..."
            }
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={sendMessage} 
            disabled={!inputMessage.trim() || isLoading}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
