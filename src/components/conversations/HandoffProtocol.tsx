import { useState } from 'react';
import { ConversationData } from '@/types/conversation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  UserCheck, 
  Phone, 
  Mail, 
  Calendar, 
  CheckCircle,
  AlertTriangle,
  FileText,
  MessageSquare
} from 'lucide-react';
import { InformationPanel } from './InformationPanel';
import { ActionReview } from './ActionReview';
import { FollowUpPanel } from './FollowUpPanel';
import { AgentMatchingPanel } from './AgentMatchingPanel';

interface HandoffProtocolProps {
  conversation: ConversationData;
}

export const HandoffProtocol = ({ conversation }: HandoffProtocolProps) => {
  const [activeTab, setActiveTab] = useState('information');
  
  const qualificationPercentage = 75; // Example value
  const isReadyForHandoff = qualificationPercentage > 70;
  
  return (
    <div className="flex flex-col h-full">
      <Card className="flex-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Handoff Protocol</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
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
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                Financial Status
              </Badge>
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                Timeline
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex-1 flex flex-col mt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="flex-none">
            <TabsTrigger value="information">Information</TabsTrigger>
            <TabsTrigger value="actions">Action Review</TabsTrigger>
            <TabsTrigger value="followup">Follow Up</TabsTrigger>
            <TabsTrigger value="matching">Agent Matching</TabsTrigger>
          </TabsList>
          
          <div className="flex-1 overflow-auto">
            <TabsContent value="information" className="block">
              <InformationPanel extractedInfo={conversation.extractedInfo} />
            </TabsContent>
            <TabsContent value="actions" className="block">
              <ActionReview suggestedActions={conversation.suggestedActions} />
            </TabsContent>
            <TabsContent value="followup" className="block">
              <FollowUpPanel conversation={conversation} />
            </TabsContent>
            <TabsContent value="matching" className="block">
              <AgentMatchingPanel conversation={conversation} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
      
      <Card className="mt-4 flex-none">
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {isReadyForHandoff ? (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Ready for Agent Handoff
                </div>
              ) : (
                <div className="flex items-center text-amber-600">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Needs More Qualification
                </div>
              )}
            </div>
            <Button disabled={!isReadyForHandoff}>
              Begin Agent Handoff
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
