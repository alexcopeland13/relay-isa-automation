
import { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ConversationHeader } from './ConversationHeader';
import { TranscriptViewer } from './TranscriptViewer';
import { InformationPanel } from './InformationPanel';
import { AgentMatchingPanel } from './AgentMatchingPanel';
import { SentimentGraph } from './SentimentGraph';
import { FollowUpPanel } from './FollowUpPanel';
import { FeedbackModule } from './FeedbackModule';
import { CategoryItem } from './CategoryItem';
import { ProfileUpdateNotification } from './ProfileUpdateNotification';
import { FollowUpRecommendations } from '../follow-ups/FollowUpRecommendations'; 
import { useConversationData } from '@/hooks/use-conversation-data';
import { useFollowUpRecommendations } from '@/hooks/use-followup-recommendations';
import { useToast } from '@/hooks/use-toast';

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
  } = useConversationData(conversation.id);
  
  const {
    recommendations,
    isLoading: isLoadingRecommendations,
    createFollowUp,
    dismissRecommendation
  } = useFollowUpRecommendations(conversation.leadInfo.id);

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-15rem)]">
      <div className="lg:col-span-2 flex flex-col h-full">
        <ConversationHeader conversation={conversation} leadInfo={conversation.leadInfo} />
        
        {hasPendingUpdates && showNotification && (
          <ProfileUpdateNotification 
            updates={formatExtractedUpdates()}
            onApprove={handleApproveUpdates}
            onDismiss={() => setShowNotification(false)}
            className="mb-4"
          />
        )}
        
        <div className="flex-1 overflow-hidden border rounded-md">
          <div className="flex border-b">
            <Button
              variant={activeTab === 'transcript' ? 'default' : 'ghost'}
              className="rounded-none"
              onClick={() => setActiveTab('transcript')}
            >
              Transcript
            </Button>
            <Button
              variant={activeTab === 'sentiment' ? 'default' : 'ghost'}
              className="rounded-none"
              onClick={() => setActiveTab('sentiment')}
            >
              Sentiment Analysis
            </Button>
            <Button
              variant={activeTab === 'feedback' ? 'default' : 'ghost'}
              className="rounded-none"
              onClick={() => setActiveTab('feedback')}
            >
              Feedback
            </Button>
          </div>
          
          <div className="p-4 h-[calc(100%-3.5rem)]">
            {activeTab === 'transcript' && (
              <TranscriptViewer transcript={conversation.transcript} />
            )}
            {activeTab === 'sentiment' && (
              <SentimentGraph data={conversation.sentimentData} />
            )}
            {activeTab === 'feedback' && (
              <FeedbackModule conversationId={conversation.id} />
            )}
          </div>
        </div>
      </div>
      
      <div className="space-y-4 h-full overflow-y-auto">
        <ScrollArea className="h-full">
          <InformationPanel leadInfo={conversation.leadInfo} />
          
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Categories</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {conversation.categories.map((category: string, index: number) => (
                <CategoryItem key={index} category={category} />
              ))}
            </div>
          </div>
          
          <div className="mt-4">
            <FollowUpRecommendations
              recommendations={recommendations}
              isLoading={isLoadingRecommendations}
              onCreateFollowUp={createFollowUp}
              onDismiss={dismissRecommendation}
            />
          </div>
          
          <div className="mt-4">
            <AgentMatchingPanel leadInfo={conversation.leadInfo} />
          </div>
          
          <div className="mt-4 mb-8">
            <FollowUpPanel conversationId={conversation.id} />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
