import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { ConversationInterface } from '@/components/conversations/ConversationInterface';
import { ConversationList } from '@/components/conversations/ConversationList';
import { Button } from '@/components/ui/button';
import { MessageSquare, List, Filter, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { CallSchedulerModal } from '@/components/conversations/CallSchedulerModal';
import { HandoffProtocol } from '@/components/conversations/HandoffProtocol';
import { ConversationContextBar } from '@/components/conversations/ConversationContextBar';
import { ActiveCallInterface } from '@/components/conversations/ActiveCallInterface';
import { ActiveCallsTable } from '@/components/conversations/ActiveCallsTable';
import { ActiveCallsOverview } from '@/components/conversations/ActiveCallsOverview';
import { useActiveCalls } from '@/hooks/use-active-calls';

const Conversations = () => {
  const [activeView, setActiveView] = useState<'list' | 'detail'>('list');
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [activeTasks] = useState([
    { id: '1', title: 'Follow up with Michael Brown', due: '2h' },
    { id: '2', title: 'Review qualification data for Sarah Martinez', due: '4h' }
  ]);
  const [isHandoffDialogOpen, setIsHandoffDialogOpen] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [selectedActiveCall, setSelectedActiveCall] = useState(null);
  
  const { activeCalls } = useActiveCalls();

  const handleSelectConversation = (conversation: any) => {
    // Transform real conversation data to match expected interface format
    const transformedConversation = {
      id: conversation.id,
      leadInfo: {
        name: conversation.lead_name,
        email: 'N/A', // Not available in current conversation data
        phone: 'N/A', // Not available in current conversation data
        source: 'Voice Agent'
      },
      timestamp: conversation.created_at,
      duration: conversation.duration ? `${Math.floor(conversation.duration / 60)}m ${conversation.duration % 60}s` : '0m 0s',
      type: conversation.direction === 'inbound' ? 'Inbound Call' : 'Outbound Call',
      messages: [], // Will need to parse transcript if available
      extractedInfo: {
        // Default structure - would need to map from conversation.extractions
        propertyInfo: {
          currentMortgage: 'N/A',
          currentTerm: 'N/A',
          estimatedValue: 'N/A',
          location: 'N/A',
          confidence: 0
        },
        refinanceGoals: {
          lowerRate: false,
          cashOut: false,
          shortenTerm: false,
          confidence: 0
        },
        timeline: {
          urgency: 'Unknown',
          lookingToDecide: 'Unknown',
          confidence: 0
        },
        financialInfo: {
          estimatedCredit: 'Unknown',
          hasOtherDebts: false,
          confidence: 0
        },
        qualification: {
          status: conversation.extractions.length > 0 ? 'Analyzed' : 'Pending',
          confidenceScore: conversation.sentiment_score || 0,
          reasoning: 'AI analysis available'
        },
        propertyInterests: {
          propertyType: [],
          priceRange: { min: 0, max: 0, confidence: 0, source: 'AI' as const, verified: false },
          sizeRequirements: { bedrooms: 0, bathrooms: 0, squareFootage: { min: 0, max: 0 }, confidence: 0, source: 'AI' as const, verified: false },
          mustHaveFeatures: [],
          dealBreakers: [],
          confidence: 0
        },
        locationPreferences: {
          areasOfInterest: [],
          neighborhoodType: [],
          commuteConsiderations: { maxCommuteDuration: 0, commuteToLocations: [], confidence: 0, source: 'AI' as const, verified: false },
          confidence: 0
        },
        transactionType: {
          role: { value: 'Unknown', confidence: 0, source: 'AI' as const, verified: false },
          transactionTimeline: { value: 'Unknown', confidence: 0, source: 'AI' as const, verified: false },
          financingStatus: { value: 'Unknown', confidence: 0, source: 'AI' as const, verified: false },
          firstTimeBuyer: { value: 'Unknown', confidence: 0, source: 'AI' as const, verified: false },
          confidence: 0
        },
        motivationFactors: {
          primaryMotivation: { value: 'Unknown', confidence: 0, source: 'AI' as const, verified: false },
          urgencyLevel: { value: 0, confidence: 0, source: 'AI' as const, verified: false },
          decisionFactors: [],
          potentialObstacles: [],
          confidence: 0
        },
        matchingWeights: {
          propertyType: 0,
          location: 0,
          priceRange: 0,
          timeline: 0,
          financing: 0
        }
      },
      suggestedActions: [],
      aiPerformance: {
        informationGathering: 0.5,
        leadEngagement: conversation.sentiment_score || 0.5,
        qualificationAccuracy: 0.5,
        actionRecommendation: 0.5
      }
    };

    setSelectedConversation(transformedConversation);
    setActiveView('detail');
  };

  const handleBackToList = () => {
    setActiveView('list');
  };
  
  const handleJoinActiveCall = (callData: any) => {
    setSelectedActiveCall(callData);
    setIsCallActive(true);
  };
  
  const handleEndCall = () => {
    setIsCallActive(false);
    setSelectedActiveCall(null);
  };

  // Convert active call data to lead info format for ActiveCallInterface
  const getLeadInfoFromCall = (callData: any) => {
    if (!callData) return null;
    
    return {
      id: callData.lead_id,
      name: callData.lead_name,
      email: 'N/A',
      phone: callData.lead_phone,
      source: 'Live Call'
    };
  };

  return (
    <PageLayout>
      {/* Persistent Context Bar */}
      <ConversationContextBar activeTasks={activeTasks} />
      
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">AI Conversations</h1>
          <p className="text-muted-foreground mt-1">
            {activeView === 'list' 
              ? 'Monitor live calls and review AI-handled conversations with leads.' 
              : 'Analyzing conversation with ' + (selectedConversation?.leadInfo?.name || 'Unknown')}
          </p>
        </div>
        <div className="flex gap-2">
          {activeView === 'detail' && (
            <>
              <Button variant="outline" onClick={handleBackToList}>
                <List className="mr-2 h-4 w-4" />
                Back to List
              </Button>
              <Dialog open={isHandoffDialogOpen} onOpenChange={setIsHandoffDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Phone className="mr-2 h-4 w-4" />
                    Agent Handoff
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl h-[80vh] p-0 overflow-hidden">
                  <HandoffProtocol conversation={selectedConversation} />
                </DialogContent>
              </Dialog>
            </>
          )}
          {activeView === 'list' && (
            <>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Phone className="mr-2 h-4 w-4" />
                    Schedule Call
                  </Button>
                </DialogTrigger>
                <CallSchedulerModal />
              </Dialog>
            </>
          )}
        </div>
      </div>

      {/* Active Calls Section - Only show in list view */}
      {activeView === 'list' && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <h2 className="text-lg font-semibold">Live Conversations</h2>
            <span className="text-sm text-muted-foreground">
              ({activeCalls.length} active)
            </span>
          </div>
          
          <ActiveCallsOverview />
          <ActiveCallsTable onSelectCall={handleJoinActiveCall} />
        </div>
      )}
      
      <div className={cn(
        "transition-all duration-300",
        activeView === 'list' ? 'opacity-100' : 'opacity-0 hidden'
      )}>
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Conversation History</h2>
        </div>
        <ConversationList onSelectConversation={handleSelectConversation} />
      </div>
      
      <div className={cn(
        "transition-all duration-300",
        activeView === 'detail' ? 'opacity-100' : 'opacity-0 hidden'
      )}>
        {selectedConversation && (
          <ConversationInterface conversation={selectedConversation} />
        )}
      </div>
      
      {isCallActive && selectedActiveCall && (
        <ActiveCallInterface 
          callData={selectedActiveCall}
          leadInfo={getLeadInfoFromCall(selectedActiveCall)} 
          onClose={handleEndCall} 
        />
      )}
    </PageLayout>
  );
};

export default Conversations;
