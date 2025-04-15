
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
import { HandoffProtocol } from './HandoffProtocol';
import { Button } from "@/components/ui/button";
import { AgentMatchingPanel } from './AgentMatchingPanel';
import { FollowUpPanel } from './FollowUpPanel';
import { 
  User, 
  UserCheck, 
  Calendar, 
  Phone, 
  Mail, 
  MessageSquare, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConversationInterfaceProps {
  conversation: Conversation;
}

export const ConversationInterface = ({ conversation }: ConversationInterfaceProps) => {
  const [activeTab, setActiveTab] = useState('transcript');
  const [activePanel, setActivePanel] = useState('lead-info');
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  
  const qualification = typeof conversation.extractedInfo.qualification === 'object' 
    ? conversation.extractedInfo.qualification.status 
    : conversation.extractedInfo.qualification;
  
  const getQualificationStatus = () => {
    const status = typeof conversation.extractedInfo.qualification === 'object'
      ? conversation.extractedInfo.qualification.status
      : conversation.extractedInfo.qualification;
      
    switch(status) {
      case 'Highly Qualified':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: <UserCheck className="h-4 w-4 mr-1" />
        };
      case 'Qualified':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: <UserCheck className="h-4 w-4 mr-1" />
        };
      case 'Not Qualified':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: <User className="h-4 w-4 mr-1" />
        };
      case 'Needs More Information':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: <User className="h-4 w-4 mr-1" />
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: <User className="h-4 w-4 mr-1" />
        };
    }
  };
  
  const statusInfo = getQualificationStatus();
  
  return (
    <div className="rounded-lg border border-border bg-card flex flex-col h-[calc(100vh-12rem)]">
      <ConversationHeader 
        leadInfo={conversation.leadInfo}
        timestamp={conversation.timestamp}
        duration={conversation.duration}
        type={conversation.type}
        qualification={qualification}
      />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Main Content Area */}
        <div className={cn(
          "transition-all duration-300 h-full",
          isPanelCollapsed ? "w-full" : "w-2/3"
        )}>
          {/* Action Bar */}
          <div className="border-b border-border p-3 flex items-center justify-between bg-muted/30">
            <div className="flex items-center">
              <div className={`px-3 py-1 rounded-full flex items-center ${statusInfo.color} text-sm font-medium`}>
                {statusInfo.icon}
                {qualification}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline">
                <Phone className="mr-2 h-4 w-4" />
                Schedule Call
              </Button>
              <Button size="sm" variant="outline">
                <Mail className="mr-2 h-4 w-4" />
                Send Email
              </Button>
              <Button size="sm" variant="outline">
                <MessageSquare className="mr-2 h-4 w-4" />
                Send Text
              </Button>
              <Button size="sm">
                <Calendar className="mr-2 h-4 w-4" />
                Agent Handoff
              </Button>
            </div>
          </div>
          
          {/* Tabs Area */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-[calc(100%-3.5rem)]">
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
            
            <TabsContent value="transcript" className="mt-0 p-0 focus-visible:outline-none focus-visible:ring-0 h-full">
              <TranscriptViewer messages={conversation.messages} />
            </TabsContent>
            
            <TabsContent value="sentiment" className="mt-0 focus-visible:outline-none focus-visible:ring-0 h-full">
              <SentimentGraph messages={conversation.messages} />
            </TabsContent>
            
            <TabsContent value="actions" className="mt-0 focus-visible:outline-none focus-visible:ring-0 h-full">
              <ActionReview suggestedActions={conversation.suggestedActions} />
            </TabsContent>
            
            <TabsContent value="feedback" className="mt-0 focus-visible:outline-none focus-visible:ring-0 h-full">
              <FeedbackModule aiPerformance={conversation.aiPerformance} />
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Contextual Side Panel */}
        <div className={cn(
          "border-l border-border transition-all duration-300 h-full bg-background",
          isPanelCollapsed ? "w-0 opacity-0 hidden" : "w-1/3 opacity-100"
        )}>
          {/* Side Panel Header with Tabs */}
          <div className="border-b border-border p-2 flex items-center">
            <button 
              className="mr-2 p-1 hover:bg-muted rounded"
              onClick={() => setIsPanelCollapsed(true)}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            
            <Tabs value={activePanel} onValueChange={setActivePanel} className="w-full">
              <TabsList className="bg-transparent h-8">
                <TabsTrigger 
                  value="lead-info"
                  className="text-xs data-[state=active]:bg-secondary h-8 px-3"
                >
                  Lead Info
                </TabsTrigger>
                <TabsTrigger 
                  value="agent-matching" 
                  className="text-xs data-[state=active]:bg-secondary h-8 px-3"
                >
                  Agent Matching
                </TabsTrigger>
                <TabsTrigger 
                  value="follow-ups" 
                  className="text-xs data-[state=active]:bg-secondary h-8 px-3"
                >
                  Follow-ups
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {/* Side Panel Content */}
          <div className="h-[calc(100%-3rem)] overflow-auto">
            {activePanel === 'lead-info' && (
              <InformationPanel extractedInfo={conversation.extractedInfo} />
            )}
            
            {activePanel === 'agent-matching' && (
              <AgentMatchingPanel conversation={conversation} />
            )}
            
            {activePanel === 'follow-ups' && (
              <FollowUpPanel conversation={conversation} />
            )}
          </div>
        </div>
        
        {/* Expand Panel Button (when collapsed) */}
        {isPanelCollapsed && (
          <button 
            className="border-l border-border bg-background p-2 hover:bg-muted transition-colors"
            onClick={() => setIsPanelCollapsed(false)}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};
