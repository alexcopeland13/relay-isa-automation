
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
import { Agent } from '@/types/agent'; 
import { CategoryItem } from '@/data/sampleConversation';

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
  
  // Default matching weights for agent matching
  const [matchingWeights, setMatchingWeights] = useState({
    propertyType: 0.3,
    location: 0.3,
    priceRange: 0.2,
    timeline: 0.1,
    financing: 0.1,
  });
  
  const [isEditingWeights, setIsEditingWeights] = useState(false);
  
  // Sample agents for demonstration
  const sampleAgents: Agent[] = [
    {
      id: 'agent-1',
      name: 'Sarah Johnson',
      agency: 'Prestige Real Estate',
      email: 'sarah.j@prestigere.com',
      phone: '555-123-4567',
      areas: ['Downtown', 'Metro West', 'Suburbia'],
      specializations: ['Luxury Homes', 'Condos', 'First-time Buyers'],
      yearsOfExperience: 8,
      successRate: 94,
      activeListings: 12,
      status: 'Active',
      rating: 4.9,
      photoUrl: 'https://randomuser.me/api/portraits/women/32.jpg'
    },
    {
      id: 'agent-2',
      name: 'Michael Patel',
      agency: 'Horizon Properties',
      email: 'michael.p@horizonprop.com',
      phone: '555-987-6543',
      areas: ['Metro East', 'Lakeside', 'University District'],
      specializations: ['Investment Properties', 'Single Family Homes', 'Relocation'],
      yearsOfExperience: 5,
      successRate: 89,
      activeListings: 8,
      status: 'Active',
      rating: 4.7,
      photoUrl: 'https://randomuser.me/api/portraits/men/45.jpg'
    }
  ];
  
  // Handle weight editing
  const handleEditWeight = (key: string, value: number) => {
    setMatchingWeights(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Create transaction type object from extracted info
  const transactionType = {
    role: conversation.extractedInfo.transactionType?.role || { value: "Unknown", confidence: 0.5, source: "AI" as "AI" | "User" | "Agent", verified: false },
    transactionTimeline: conversation.extractedInfo.timeline?.urgency 
      ? { value: conversation.extractedInfo.timeline.urgency, confidence: conversation.extractedInfo.timeline.confidence, source: "AI" as "AI" | "User" | "Agent", verified: false } 
      : { value: "Unknown", confidence: 0.5, source: "AI" as "AI" | "User" | "Agent", verified: false },
    financingStatus: conversation.extractedInfo.financialInfo?.estimatedCredit 
      ? { value: "Pre-approved", confidence: conversation.extractedInfo.financialInfo.confidence, source: "AI" as "AI" | "User" | "Agent", verified: false } 
      : { value: "Unknown", confidence: 0.5, source: "AI" as "AI" | "User" | "Agent", verified: false },
    firstTimeBuyer: conversation.extractedInfo.transactionType?.firstTimeBuyer || { value: "Unknown", confidence: 0.5, source: "AI" as "AI" | "User" | "Agent", verified: false },
    confidence: conversation.extractedInfo.transactionType?.confidence || 0.7
  };
  
  // Create empty objects with required structure for conditional props to avoid TypeScript errors
  const emptyLocationPreferences = {
    areasOfInterest: [],
    neighborhoodType: [],
    commuteConsiderations: {
      maxCommuteDuration: 0,
      commuteToLocations: [],
      confidence: 0,
      source: "AI" as "AI" | "User" | "Agent",
      verified: false
    },
    confidence: 0
  };
  
  const emptyPropertyInterests = {
    propertyType: [],
    priceRange: {
      min: 0,
      max: 0,
      confidence: 0,
      source: "AI" as "AI" | "User" | "Agent",
      verified: false
    },
    sizeRequirements: {
      bedrooms: 0,
      bathrooms: 0,
      squareFootage: {
        min: 0,
        max: 0
      },
      confidence: 0,
      source: "AI" as "AI" | "User" | "Agent",
      verified: false
    },
    mustHaveFeatures: [],
    dealBreakers: [],
    confidence: 0
  };
  
  const emptyMotivationFactors = {
    primaryMotivation: { 
      value: "", 
      confidence: 0, 
      source: "AI" as "AI" | "User" | "Agent", 
      verified: false 
    },
    urgencyLevel: {
      value: 0,
      confidence: 0,
      source: "AI" as "AI" | "User" | "Agent",
      verified: false
    },
    decisionFactors: [],
    potentialObstacles: [],
    confidence: 0
  };
  
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
                {conversation.extractedInfo.financialInfo && (
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Pre-Approved
                  </Badge>
                )}
                {conversation.extractedInfo.timeline && (
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Timeline
                  </Badge>
                )}
                {!conversation.extractedInfo.financialInfo && (
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
          <TransactionTypeSection 
            transactionType={transactionType} 
            isEditing={false} 
            onEdit={() => {}}
          />
          <LocationPreferencesSection 
            locationPreferences={conversation.extractedInfo.locationPreferences || emptyLocationPreferences} 
            isEditing={false} 
            onEdit={() => {}}
          />
          <PropertyInterestsSection 
            propertyInterests={conversation.extractedInfo.propertyInterests || emptyPropertyInterests} 
            isEditing={false} 
            onEdit={() => {}}
          />
          <MotivationFactorsSection 
            motivationFactors={conversation.extractedInfo.motivationFactors || emptyMotivationFactors} 
            isEditing={false} 
            onEdit={() => {}}
          />
          <MatchingWeightsSection 
            matchingWeights={matchingWeights}
            isEditing={isEditingWeights}
            onEdit={handleEditWeight}
          />
        </div>
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium">Recommended Agents</h4>
          <Button size="sm" variant="outline" onClick={() => setIsEditingWeights(!isEditingWeights)}>
            {isEditingWeights ? 'Save Matching' : 'Adjust Matching'}
          </Button>
        </div>
        <RecommendedAgentsList 
          agents={sampleAgents}
          leadInfo={conversation.leadInfo}
          onSelectAgent={(agent) => console.log('Selected agent:', agent)}
        />
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
