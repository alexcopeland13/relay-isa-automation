
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
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const ConversationInterface = ({ conversation }: { conversation: any }) => {
  const [activeTab, setActiveTab] = useState('transcript');
  const [showNotification, setShowNotification] = useState(true);
  const { toast } = useToast();
  
  // Integrate with our new hooks
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

  // Safely check if we have recommendations before rendering
  const safeRecommendations = recommendations || [];

  // Ensure we have the transcript messages for TranscriptViewer
  const transcriptMessages = conversation?.messages || [];

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
              <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
              <TabsTrigger value="feedback">AI Performance</TabsTrigger>
            </TabsList>
            
            <div className="flex-1">
              <TabsContent value="transcript" className="h-full m-0 p-0">
                <TranscriptViewer messages={transcriptMessages} />
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
