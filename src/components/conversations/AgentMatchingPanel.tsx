
import { useState } from 'react';
import { Conversation } from '@/data/sampleConversation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  User, 
  MessageSquare, 
  MapPin, 
  Clock,
  Star,
  CheckCircle,
  UserCheck
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TransactionTypeSection } from './TransactionTypeSection';
import { LocationPreferencesSection } from './LocationPreferencesSection';
import { PropertyInterestsSection } from './PropertyInterestsSection';
import { MotivationFactorsSection } from './MotivationFactorsSection';
import { MatchingWeightsSection } from './MatchingWeightsSection';
import { RecommendedAgentsList } from './RecommendedAgentsList';

interface AgentMatchingPanelProps {
  conversation: Conversation;
}

export function AgentMatchingPanel({ conversation }: AgentMatchingPanelProps) {
  const [isReadyForHandoff, setIsReadyForHandoff] = useState(
    conversation.extractedInfo.qualification.status === 'Highly Qualified' || 
    conversation.extractedInfo.qualification.status === 'Qualified'
  );
  
  const qualificationPercentage = 
    conversation.extractedInfo.qualification.status === 'Highly Qualified' ? 90 :
    conversation.extractedInfo.qualification.status === 'Qualified' ? 70 :
    conversation.extractedInfo.qualification.status === 'Needs More Information' ? 40 : 20;
  
  return (
    <div className="p-4 space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Agent Matching & Handoff</h3>
          <Badge 
            variant={isReadyForHandoff ? "default" : "outline"}
            className={isReadyForHandoff ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
          >
            {isReadyForHandoff ? "Ready for Handoff" : "Not Ready"}
          </Badge>
        </div>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Qualification Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span>Qualification Progress</span>
                <span className="font-medium">{qualificationPercentage}%</span>
              </div>
              <Progress value={qualificationPercentage} className="h-2" />
              
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Contact Info
                </Badge>
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Property Interests
                </Badge>
                {conversation.extractedInfo.financialInfo.preApproved && (
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Pre-Approved
                  </Badge>
                )}
                {conversation.extractedInfo.timeline.timeframe !== 'Unknown' && (
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Timeline
                  </Badge>
                )}
                {!conversation.extractedInfo.financialInfo.preApproved && (
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                    Financial Status
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div>
        <h4 className="text-sm font-medium mb-3">Matching Criteria</h4>
        <div className="space-y-4">
          <TransactionTypeSection preferences={conversation.extractedInfo.preferences} />
          <LocationPreferencesSection location={conversation.extractedInfo.location} />
          <PropertyInterestsSection preferences={conversation.extractedInfo.preferences} />
          <MotivationFactorsSection motivation={conversation.extractedInfo.motivation} />
          <MatchingWeightsSection />
        </div>
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium">Recommended Agents</h4>
          <Button size="sm" variant="outline">Adjust Matching</Button>
        </div>
        <RecommendedAgentsList />
      </div>
      
      <div className="pt-4 border-t border-border">
        <Button 
          className="w-full" 
          disabled={!isReadyForHandoff}
        >
          <UserCheck className="mr-2 h-4 w-4" />
          Begin Agent Handoff
        </Button>
        {!isReadyForHandoff && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            More qualification data needed before handoff
          </p>
        )}
      </div>
    </div>
  );
}
