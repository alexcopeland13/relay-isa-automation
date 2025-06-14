import { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ConversationHeader } from './ConversationHeader';
import { TranscriptViewer } from './TranscriptViewer';
import { InformationPanel } from './InformationPanel';
import { AgentMatchingPanel } from './AgentMatchingPanel';
import { SentimentGraph } from './SentimentGraph';
import { FeedbackModule } from './FeedbackModule';
import { CategoryItem } from './CategoryItem';
import { ProfileUpdateNotification } from './ProfileUpdateNotification';
import { FollowUpRecommendations } from '../follow-ups/FollowUpRecommendations'; 
import { useConversationData } from '@/hooks/use-conversation-data';
import { useFollowUpRecommendations } from '@/hooks/use-followup-recommendations';
import { useAIRecommendations } from '@/hooks/use-ai-recommendations';
import { useAILeadScoring } from '@/hooks/use-ai-lead-scoring';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Target, TrendingUp, Zap } from 'lucide-react';

export const ConversationInterface = ({ conversation }: { conversation: any }) => {
  const [activeTab, setActiveTab] = useState('transcript');
  const [showNotification, setShowNotification] = useState(true);
  const { toast } = useToast();
  
  // Debug logging for conversation data
  console.log('📋 ConversationInterface received conversation:', {
    id: conversation?.id,
    leadInfoId: conversation?.leadInfo?.id,
    hasMessages: conversation?.messages?.length || 0,
    hasTranscript: !!conversation?.transcript
  });
  
  // Integrate with our hooks
  const { 
    conversationData, 
    extractedUpdates, 
    updateLeadProfile, 
    hasPendingUpdates 
  } = useConversationData(conversation?.id);
  
  const {
    recommendations,
    isLoading: isLoadingRecommendations,
    createFollowUp,
    dismissRecommendation
  } = useFollowUpRecommendations(conversation?.leadInfo?.id);

  // NEW: AI Integration
  const { 
    getRecommendationsForLead,
    generateRecommendations,
    isGenerating
  } = useAIRecommendations();

  const {
    insights,
    generateLeadInsights,
    isProcessing: isGeneratingInsights
  } = useAILeadScoring();

  const leadId = conversation?.leadInfo?.id;
  const aiRecommendations = leadId ? getRecommendationsForLead(leadId) : [];
  const leadInsight = leadId && insights[leadId] ? insights[leadId] : null;

  // Auto-generate AI insights when conversation loads
  useEffect(() => {
    if (conversation?.leadInfo && conversation?.transcript && !leadInsight && !isGeneratingInsights) {
      console.log('🧠 Auto-generating AI insights for conversation');
      generateLeadInsights(conversation.leadInfo).then(() => {
        // Generate recommendations after insights
        generateRecommendations(conversation.leadInfo, { transcript: conversation.transcript });
      });
    }
  }, [conversation?.leadInfo, conversation?.transcript, leadInsight, isGeneratingInsights]);

  // Map extracted entities to the format expected by ProfileUpdateNotification
  const formatExtractedUpdates = () => {
    if (!extractedUpdates) return [];
    
    return Object.entries(extractedUpdates).map(([key, data]) => ({
      name: key,
      displayName: key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      value: data.value,
      confidence: data.confidence,
      source: data.source,
      timestamp: data.timestamp
    }));
  };

  const handleApproveUpdates = async () => {
    const success = await updateLeadProfile();
    if (success) {
      toast({
        title: "Profile Updated",
        description: "Lead profile has been updated with conversation data.",
      });
    }
    return success;
  };

  // Use only the regular recommendations for the FollowUpRecommendations component
  const safeRecommendations = recommendations || [];

  // Ensure we have the transcript messages for TranscriptViewer
  const transcriptMessages = conversation?.messages || [];
  const conversationId = conversation?.id;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-15rem)]">
      {/* Left column - Conversation view */}
      <div className="lg:col-span-2 flex flex-col h-full">
        <ConversationHeader 
          timestamp={conversation?.timestamp}
          duration={conversation?.duration}
          type={conversation?.type}
          qualification={conversation?.qualification}
          leadInfo={conversation?.leadInfo} 
        />
        
        {/* Profile update notification */}
        {hasPendingUpdates && showNotification && (
          <ProfileUpdateNotification 
            updates={formatExtractedUpdates()}
            onApprove={handleApproveUpdates}
            onDismiss={() => setShowNotification(false)}
            className="mb-4"
          />
        )}
        
        {/* Main content area with tabs */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="mx-4 mt-1 mb-2">
              <TabsTrigger value="transcript">Transcript</TabsTrigger>
              <TabsTrigger value="insights">AI Insights</TabsTrigger>
              <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
              <TabsTrigger value="feedback">AI Performance</TabsTrigger>
            </TabsList>
            
            <div className="flex-1">
              <TabsContent value="transcript" className="h-full m-0 p-0">
                <TranscriptViewer 
                  messages={transcriptMessages} 
                  conversationId={conversationId}
                />
              </TabsContent>
              
              <TabsContent value="insights" className="h-full m-0 p-4">
                {leadInsight ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-blue-600" />
                        AI Lead Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold">{leadInsight.score}</p>
                          <p className="text-sm text-muted-foreground">Lead Score</p>
                        </div>
                        <div className="text-center">
                          <Badge className={`${leadInsight.temperature === 'hot' ? 'bg-red-500' : leadInsight.temperature === 'warm' ? 'bg-orange-500' : 'bg-blue-500'} text-white`}>
                            {leadInsight.temperature.toUpperCase()}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">Temperature</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold">{Math.round(leadInsight.confidence * 100)}%</p>
                          <p className="text-sm text-muted-foreground">Confidence</p>
                        </div>
                        <div className="text-center">
                          <Badge variant={leadInsight.priority === 'high' ? 'destructive' : leadInsight.priority === 'medium' ? 'default' : 'secondary'}>
                            {leadInsight.priority}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">Priority</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold mb-2">AI Insights</h4>
                          <ul className="space-y-1">
                            {leadInsight.insights.map((item, index) => (
                              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-blue-600">•</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-2">Recommendations</h4>
                          <ul className="space-y-1">
                            {leadInsight.recommendations.map((item, index) => (
                              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-green-600">•</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold text-blue-900 mb-1">Next Best Action</h4>
                        <p className="text-sm text-blue-800">{leadInsight.nextBestAction}</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : isGeneratingInsights ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent mx-auto mb-4" />
                      <p className="text-muted-foreground">Generating AI insights...</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No AI insights available</p>
                      <p className="text-sm">Complete conversation to generate insights</p>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="sentiment" className="h-full m-0 p-0">
                {conversation?.sentimentData ? (
                  <SentimentGraph messages={conversation.sentimentData} />
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No sentiment data available
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="feedback" className="h-full m-0 p-0">
                {conversation?.aiPerformance ? (
                  <FeedbackModule aiPerformance={conversation.aiPerformance} />
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No AI performance data available
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
      
      {/* Right column - Information panels */}
      <div className="space-y-4 h-full overflow-y-auto">
        <ScrollArea className="h-full">
          {/* Lead information panel */}
          {conversation?.extractedInfo && (
            <InformationPanel extractedInfo={conversation.extractedInfo} />
          )}
          
          {/* AI Recommendations Panel */}
          {aiRecommendations.length > 0 && (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Zap className="h-4 w-4 text-blue-600" />
                  AI Recommendations
                  {isGenerating && (
                    <div className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {aiRecommendations.slice(0, 3).map((rec) => (
                  <div key={rec.id} className="p-2 border rounded text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium">{rec.title}</p>
                      <Badge variant={rec.priority === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                        {rec.priority}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{rec.description.substring(0, 80)}...</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
          
          {/* Categories */}
          {conversation?.categories && conversation.categories.length > 0 && (
            <div className="mt-4 p-4 border rounded-md bg-card">
              <h3 className="text-lg font-semibold mb-2">Categories</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {conversation.categories.map((category: string, index: number) => (
                  <CategoryItem key={index} category={category} />
                ))}
              </div>
            </div>
          )}
          
          {/* Follow-up recommendations */}
          <div className="mt-4">
            <FollowUpRecommendations
              recommendations={safeRecommendations}
              isLoading={isLoadingRecommendations}
              onCreateFollowUp={createFollowUp}
              onDismiss={dismissRecommendation}
            />
          </div>
          
          {/* Agent matching panel */}
          <div className="mt-4">
            <AgentMatchingPanel conversation={conversation} />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
