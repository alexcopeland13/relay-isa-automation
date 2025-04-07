
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Bot, UserCircle, Play, RefreshCw, Zap, Save, ChevronRight } from 'lucide-react';

import { aiServiceGateway, ConversationMessage, ConversationResponse } from '@/lib/ai-integration/apiGateway';
import { 
  createNewConversation, 
  addMessageToConversation, 
  getConversationById
} from '@/lib/ai-integration/conversationStateManager';

export const ConversationSimulator = () => {
  const { toast } = useToast();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResponse, setLastResponse] = useState<ConversationResponse | null>(null);
  const [scenarioTemplate, setScenarioTemplate] = useState<string>('refinance');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sample scenario templates
  const scenarioTemplates = {
    refinance: "Hello, I'm interested in refinancing my home. I've been with my current lender for about 5 years, but I think I could get a better rate now.",
    purchase: "Hi there, I'm looking to buy my first home. I'm just starting the process and wanted to know what I need to qualify for a mortgage.",
    investment: "Hello, I'm thinking of buying an investment property. I already own my primary residence but this would be my first rental property.",
    heloc: "I'm interested in getting a home equity line of credit. My home has appreciated quite a bit over the last few years and I'd like to access some of that equity."
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const startNewConversation = async () => {
    try {
      const conversationId = `sim-${Date.now()}`;
      await createNewConversation(conversationId, {
        leadInfo: {
          name: 'Simulated Lead',
        },
        source: 'simulator',
        channel: 'chat'
      });
      
      setActiveConversationId(conversationId);
      setMessages([]);
      setLastResponse(null);
      
      toast({
        title: "Conversation started",
        description: `New conversation ID: ${conversationId}`,
      });
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Error starting conversation",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const sendMessage = async () => {
    if (!activeConversationId || !userInput.trim()) return;
    
    try {
      setIsProcessing(true);
      
      // Add user message to the conversation
      const userMessage = await addMessageToConversation(activeConversationId, {
        role: 'user',
        content: userInput
      });
      
      // Update UI with user message
      setMessages(prev => [...prev, userMessage]);
      setUserInput('');
      
      // Get conversation context
      const conversation = await getConversationById(activeConversationId);
      if (!conversation) {
        throw new Error('Conversation not found');
      }
      
      // Get AI response
      const context = {
        conversationId: activeConversationId,
        leadInfo: conversation.leadInfo,
        extractedEntities: conversation.extractedEntities,
        conversationHistory: conversation.history
      };
      
      const response = await aiServiceGateway.generateResponse(context, userInput);
      
      // Add AI response to the conversation
      const assistantMessage = await addMessageToConversation(activeConversationId, {
        role: 'assistant',
        content: response.message.content
      });
      
      // Update UI with assistant message
      setMessages(prev => [...prev, assistantMessage]);
      
      // Set the response data for the details panel
      setLastResponse(response);
      
      toast({
        title: "Response received",
        description: "The AI has responded to your message",
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error processing message",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const loadScenarioTemplate = (template: keyof typeof scenarioTemplates) => {
    setUserInput(scenarioTemplates[template]);
    setScenarioTemplate(template);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>AI Conversation Simulator</CardTitle>
          <CardDescription>
            Test AI conversation capabilities with simulated user inputs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4 mb-2">
            <Button
              onClick={startNewConversation}
              variant="default"
              className="gap-2"
            >
              <Play className="h-4 w-4" />
              Start New Conversation
            </Button>
            
            {activeConversationId && (
              <div className="text-sm text-muted-foreground">
                Active Conversation: <span className="font-mono">{activeConversationId}</span>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 space-y-4">
              <Card className="border-dashed">
                <CardContent className="p-4">
                  <div className="flex flex-col h-[350px]">
                    <ScrollArea className="flex-1 pr-4">
                      {messages.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                          <div className="text-center">
                            <Bot className="h-12 w-12 mx-auto mb-2 opacity-20" />
                            <p>Start a new conversation to begin testing</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4 pt-4">
                          {messages.map((message, index) => (
                            <div 
                              key={message.id} 
                              className={`flex ${
                                message.role === 'user' ? 'justify-end' : 'justify-start'
                              }`}
                            >
                              <div 
                                className={`max-w-[80%] px-4 py-2 rounded-lg ${
                                  message.role === 'user' 
                                    ? 'bg-primary text-primary-foreground rounded-tr-none'
                                    : 'bg-secondary rounded-tl-none'
                                }`}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  {message.role === 'user' ? (
                                    <UserCircle className="h-4 w-4" />
                                  ) : (
                                    <Bot className="h-4 w-4" />
                                  )}
                                  <span className="text-xs font-medium">
                                    {message.role === 'user' ? 'You' : 'AI Assistant'}
                                  </span>
                                </div>
                                <p className="text-sm">{message.content}</p>
                              </div>
                            </div>
                          ))}
                          <div ref={messagesEndRef} />
                        </div>
                      )}
                    </ScrollArea>
                    
                    <div className="mt-4 flex gap-2">
                      <Input
                        placeholder="Type your message..."
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                        disabled={!activeConversationId || isProcessing}
                      />
                      <Button 
                        onClick={sendMessage} 
                        disabled={!activeConversationId || !userInput.trim() || isProcessing}
                      >
                        {isProcessing ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Scenario Templates</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(scenarioTemplates).map((template) => (
                    <Badge
                      key={template}
                      className={`cursor-pointer ${
                        scenarioTemplate === template ? 'bg-primary' : 'bg-secondary'
                      }`}
                      onClick={() => loadScenarioTemplate(template as keyof typeof scenarioTemplates)}
                    >
                      {template.charAt(0).toUpperCase() + template.slice(1)}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-2">
              <Tabs defaultValue="response">
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="response">Response Details</TabsTrigger>
                  <TabsTrigger value="entities">Extracted Entities</TabsTrigger>
                </TabsList>
                
                <TabsContent value="response" className="mt-0">
                  <Card className="border-dashed h-[350px]">
                    <CardContent className="p-4">
                      {!lastResponse ? (
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                          <div className="text-center">
                            <Zap className="h-8 w-8 mx-auto mb-2 opacity-20" />
                            <p>AI response details will appear here</p>
                          </div>
                        </div>
                      ) : (
                        <ScrollArea className="h-full pr-4">
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-sm font-medium mb-1">Confidence Score</h3>
                              <div className="w-full bg-secondary rounded-full h-2.5">
                                <div 
                                  className="bg-primary h-2.5 rounded-full" 
                                  style={{ width: `${(lastResponse.confidenceScore || 0) * 100}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                <span>0%</span>
                                <span>{Math.round((lastResponse.confidenceScore || 0) * 100)}%</span>
                                <span>100%</span>
                              </div>
                            </div>
                            
                            <div>
                              <h3 className="text-sm font-medium mb-1">Sentiment Analysis</h3>
                              <Badge 
                                className={
                                  lastResponse.sentiment === 'positive' 
                                    ? 'bg-green-500' 
                                    : lastResponse.sentiment === 'negative'
                                      ? 'bg-red-500'
                                      : 'bg-blue-500'
                                }
                              >
                                {lastResponse.sentiment?.charAt(0).toUpperCase() + lastResponse.sentiment?.slice(1)}
                              </Badge>
                            </div>
                            
                            <div>
                              <h3 className="text-sm font-medium mb-1">Suggested Actions</h3>
                              {lastResponse.suggestedActions && lastResponse.suggestedActions.length > 0 ? (
                                <div className="space-y-2">
                                  {lastResponse.suggestedActions.map((action, index) => (
                                    <div key={index} className="border rounded-md p-2">
                                      <div className="flex justify-between items-start">
                                        <span className="text-sm font-medium capitalize">{action.type.replace('_', ' ')}</span>
                                        {action.priority && (
                                          <Badge 
                                            className={
                                              action.priority === 'high' 
                                                ? 'bg-red-500' 
                                                : action.priority === 'medium'
                                                  ? 'bg-yellow-500'
                                                  : 'bg-blue-500'
                                            }
                                          >
                                            {action.priority}
                                          </Badge>
                                        )}
                                      </div>
                                      <p className="text-xs text-muted-foreground mt-1">{action.reason}</p>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground">No actions suggested</p>
                              )}
                            </div>
                          </div>
                        </ScrollArea>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="entities" className="mt-0">
                  <Card className="border-dashed h-[350px]">
                    <CardContent className="p-4">
                      {!lastResponse || !lastResponse.extractedEntities || Object.keys(lastResponse.extractedEntities).length === 0 ? (
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                          <div className="text-center">
                            <RefreshCw className="h-8 w-8 mx-auto mb-2 opacity-20" />
                            <p>Extracted entities will appear here</p>
                          </div>
                        </div>
                      ) : (
                        <ScrollArea className="h-full pr-4">
                          <div className="space-y-3">
                            {Object.entries(lastResponse.extractedEntities).map(([key, entity]) => (
                              <div key={key} className="border rounded-md p-3">
                                <div className="flex justify-between items-center">
                                  <h4 className="text-sm font-medium capitalize">{key.replace('_', ' ')}</h4>
                                  <Badge variant="outline" className="text-xs">
                                    {Math.round((entity.confidence || 0) * 100)}% confidence
                                  </Badge>
                                </div>
                                <p className="mt-1 text-sm">{entity.value}</p>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
              
              <div className="mt-4 flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  disabled={!lastResponse}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Scenario
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
