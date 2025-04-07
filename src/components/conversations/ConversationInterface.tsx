
import { useState } from 'react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Conversation } from '@/data/sampleConversation';
import { ConversationHeader } from './ConversationHeader';
import { TranscriptViewer } from './TranscriptViewer';
import { InformationPanel } from './InformationPanel';
import { SentimentGraph } from './SentimentGraph';
import { ActionReview } from './ActionReview';
import { FeedbackModule } from './FeedbackModule';

interface ConversationInterfaceProps {
  conversation: Conversation;
}

export const ConversationInterface = ({ conversation }: ConversationInterfaceProps) => {
  const [activeTab, setActiveTab] = useState('transcript');
  
  return (
    <div className="rounded-lg border border-border bg-card">
      <ConversationHeader 
        leadInfo={conversation.leadInfo}
        timestamp={conversation.timestamp}
        duration={conversation.duration}
        type={conversation.type}
        qualification={conversation.extractedInfo.qualification}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
        <div className="lg:col-span-2 border-r border-border">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-border px-6">
              <TabsList className="h-14">
                <TabsTrigger value="transcript" className="data-[state=active]:bg-secondary">
                  Transcript
                </TabsTrigger>
                <TabsTrigger value="sentiment" className="data-[state=active]:bg-secondary">
                  Sentiment Analysis
                </TabsTrigger>
                <TabsTrigger value="actions" className="data-[state=active]:bg-secondary">
                  Suggested Actions
                </TabsTrigger>
                <TabsTrigger value="feedback" className="data-[state=active]:bg-secondary">
                  AI Feedback
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="transcript" className="mt-0 p-0 focus-visible:outline-none focus-visible:ring-0">
              <TranscriptViewer messages={conversation.messages} />
            </TabsContent>
            
            <TabsContent value="sentiment" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <SentimentGraph messages={conversation.messages} />
            </TabsContent>
            
            <TabsContent value="actions" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <ActionReview suggestedActions={conversation.suggestedActions} />
            </TabsContent>
            
            <TabsContent value="feedback" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <FeedbackModule aiPerformance={conversation.aiPerformance} />
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="lg:col-span-1">
          <InformationPanel extractedInfo={conversation.extractedInfo} />
        </div>
      </div>
    </div>
  );
};
