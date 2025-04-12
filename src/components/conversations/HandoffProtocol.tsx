
import { useState } from 'react';
import { Conversation } from '@/data/sampleConversation';
import { Agent } from '@/types/agent';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CalendarDays, Users, Check, Edit, Send, Save, ArrowRight } from 'lucide-react';
import { HandoffAppointmentSelector } from './HandoffAppointmentSelector';
import { RecommendedAgentsList } from './RecommendedAgentsList';
import { sampleAgentsData } from '@/data/sampleAgentsData';

interface HandoffProtocolProps {
  conversation: Conversation;
}

export const HandoffProtocol = ({ conversation }: HandoffProtocolProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState<'agents' | 'summary' | 'appointment' | 'preview'>('agents');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [qualification, setQualification] = useState(
    typeof conversation.extractedInfo.qualification === 'object' 
      ? conversation.extractedInfo.qualification.status 
      : 'Qualified'
  );
  const [priority, setPriority] = useState('Medium');
  
  // Get property information from propertyInfo
  const propertyType = conversation.extractedInfo.propertyInfo?.location || 'a property';
  const location = conversation.extractedInfo.propertyInfo?.location || 'the area';
  const budget = '$300,000-$450,000';
  const timeframe = 'within 3 months';
  const requirements = ['3 bedrooms', '2 bathrooms', 'garage'];
  
  const [summaryText, setSummaryText] = useState(
    `${conversation.leadInfo.name} is looking for ${propertyType} in ${location}. ` +
    `They have a budget of ${budget} and are hoping to move in ${timeframe}. ` +
    `Key requirements include ${requirements.join(', ')}.`
  );
  
  const [contactPreference, setContactPreference] = useState('');
  const [meetingType, setMeetingType] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [handoffInProgress, setHandoffInProgress] = useState(false);

  // Filter to show at most 3 recommended agents
  const recommendedAgents = sampleAgentsData.slice(0, 3);

  const handleAgentSelect = (agent: Agent) => {
    setSelectedAgent(agent);
    setStep('summary');
  };

  const handleSummaryComplete = () => {
    setStep('appointment');
  };

  const handleAppointmentComplete = (timeSlot: string, type: string) => {
    setSelectedTimeSlot(timeSlot);
    setMeetingType(type);
    setStep('preview');
  };

  const handleSaveDraft = () => {
    toast({
      title: "Draft saved",
      description: "Handoff has been saved as a draft and can be completed later.",
    });
  };

  const handleSendHandoff = () => {
    setHandoffInProgress(true);
    
    // Simulate API call
    setTimeout(() => {
      setHandoffInProgress(false);
      toast({
        title: "Handoff sent successfully!",
        description: `${selectedAgent?.name} has been notified of this lead assignment.`,
      });
    }, 1500);
  };

  const renderStepContent = () => {
    switch (step) {
      case 'agents':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Recommended Agents</h3>
              <Badge variant="outline" className="px-2 py-1">
                Based on lead preferences
              </Badge>
            </div>
            <RecommendedAgentsList 
              agents={recommendedAgents} 
              leadInfo={conversation.extractedInfo}
              onSelectAgent={handleAgentSelect}
            />
          </div>
        );
        
      case 'summary':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Handoff Summary</h3>
              <div className="flex gap-2 items-center">
                <div className="text-sm text-muted-foreground">Agent:</div>
                <Badge variant="outline" className="px-2 py-1 flex items-center gap-2">
                  {selectedAgent?.name}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-5 w-5" 
                    onClick={() => setStep('agents')}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </Badge>
              </div>
            </div>
            
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="qualification">Lead Qualification</Label>
                  <Select value={qualification} onValueChange={setQualification}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select qualification" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Highly Qualified">Highly Qualified</SelectItem>
                      <SelectItem value="Qualified">Qualified</SelectItem>
                      <SelectItem value="Needs More Information">Needs More Information</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="summary">Lead Summary</Label>
                <Textarea
                  id="summary"
                  value={summaryText}
                  onChange={(e) => setSummaryText(e.target.value)}
                  rows={5}
                  className="resize-none"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contactPreference">Contact Preferences</Label>
                <Textarea
                  id="contactPreference"
                  value={contactPreference}
                  onChange={(e) => setContactPreference(e.target.value)}
                  placeholder="E.g., Prefers evening calls, text messages first, available after 5pm weekdays..."
                  rows={2}
                  className="resize-none"
                />
              </div>
            </div>
            
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep('agents')}>
                Back
              </Button>
              <div className="space-x-2">
                <Button variant="outline" onClick={handleSaveDraft}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Draft
                </Button>
                <Button onClick={handleSummaryComplete}>
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        );
        
      case 'appointment':
        return (
          <HandoffAppointmentSelector
            agent={selectedAgent!}
            onComplete={handleAppointmentComplete}
            onBack={() => setStep('summary')}
            onSaveDraft={handleSaveDraft}
          />
        );
        
      case 'preview':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Handoff Preview</h3>
              <Badge variant="outline" className="px-2 py-1">Final Review</Badge>
            </div>
            
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <div>
                      <h4 className="font-medium">Lead Information</h4>
                      <p className="text-sm text-muted-foreground">{conversation.leadInfo.name} ({conversation.leadInfo.email})</p>
                    </div>
                    <Badge>{qualification}</Badge>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">Summary</h4>
                    <p className="text-sm">{summaryText}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium">Assigned Agent</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-primary/10">
                          {selectedAgent?.photoUrl ? (
                            <img 
                              src={selectedAgent.photoUrl} 
                              alt={selectedAgent.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-medium text-sm">
                              {selectedAgent?.name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <span className="text-sm">{selectedAgent?.name}</span>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium">Priority</h4>
                      <Badge variant="outline" className="mt-1">
                        {priority} Priority
                      </Badge>
                    </div>
                  </div>
                  
                  {selectedTimeSlot && (
                    <div>
                      <h4 className="font-medium">Suggested Appointment</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{selectedTimeSlot} - {meetingType}</span>
                      </div>
                    </div>
                  )}
                  
                  {contactPreference && (
                    <div>
                      <h4 className="font-medium">Contact Preferences</h4>
                      <p className="text-sm">{contactPreference}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep('appointment')}>
                Back
              </Button>
              <div className="space-x-2">
                <Button variant="outline" onClick={handleSaveDraft}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Draft
                </Button>
                <Button 
                  onClick={handleSendHandoff} 
                  disabled={handoffInProgress}
                  className="min-w-[120px]"
                >
                  {handoffInProgress ? (
                    <div className="flex items-center">
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full"></div>
                      Sending...
                    </div>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Handoff
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex space-x-2 mb-2">
          <Badge 
            variant={step === 'agents' ? 'default' : 'outline'} 
            className="px-2 py-1"
          >
            1. Select Agent
          </Badge>
          <Badge 
            variant={step === 'summary' ? 'default' : 'outline'} 
            className="px-2 py-1"
          >
            2. Create Summary
          </Badge>
          <Badge 
            variant={step === 'appointment' ? 'default' : 'outline'} 
            className="px-2 py-1"
          >
            3. Suggest Appointment
          </Badge>
          <Badge 
            variant={step === 'preview' ? 'default' : 'outline'} 
            className="px-2 py-1"
          >
            4. Review & Send
          </Badge>
        </div>
      </div>
      
      {renderStepContent()}
    </div>
  );
};
