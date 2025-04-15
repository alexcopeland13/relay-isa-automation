
import { useState } from 'react';
import { Conversation } from '@/data/sampleConversation';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Mail, MessageSquare, Phone, AlertCircle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ReactNode } from 'react';

interface FollowUpPanelProps {
  conversation: Conversation;
}

interface ChannelOption {
  value: string;
  label: string;
  icon: ReactNode;
}

const channelOptions: ChannelOption[] = [
  { value: 'call', label: 'Phone Call', icon: <Phone className="h-4 w-4" /> },
  { value: 'email', label: 'Email', icon: <Mail className="h-4 w-4" /> },
  { value: 'sms', label: 'Text Message', icon: <MessageSquare className="h-4 w-4" /> }
];

const recommendedFollowUps = [
  {
    type: 'call',
    title: 'Discuss pre-approval requirements',
    timeframe: '3 days',
    priority: 'high',
    scheduledFor: null,
    template: 'mortgage_preapproval_followup'
  },
  {
    type: 'email',
    title: 'Share property listings in desired area',
    timeframe: '1 week',
    priority: 'medium',
    scheduledFor: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    template: 'property_listings_followup'
  }
];

export function FollowUpPanel({ conversation }: FollowUpPanelProps) {
  const [selectedChannel, setSelectedChannel] = useState('call');
  const [notes, setNotes] = useState('');
  
  const getChannelIcon = (type: string) => {
    switch(type) {
      case 'call': return <Phone className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'sms': return <MessageSquare className="h-4 w-4" />;
      default: return <Mail className="h-4 w-4" />;
    }
  };
  
  const getPriorityBadge = (priority: string) => {
    switch(priority) {
      case 'high':
        return <Badge variant="outline" className="bg-red-100 text-red-800">High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Low</Badge>;
      default:
        return <Badge variant="outline">Normal</Badge>;
    }
  };
  
  return (
    <div className="p-4 space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Follow Up Planning</h3>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Schedule Follow-Up</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Channel
                  </label>
                  <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select channel" />
                    </SelectTrigger>
                    <SelectContent>
                      {channelOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center">
                            {option.icon}
                            <span className="ml-2">{option.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    When
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-left font-normal"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        Select date & time
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      {/* Simplified calendar picker placeholder */}
                      <div className="p-4">
                        <div className="text-center">Calendar Picker</div>
                        <div className="mt-2 flex justify-end">
                          <Button size="sm">Select</Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Template
                </label>
                <Select defaultValue="custom">
                  <SelectTrigger>
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Custom Message</SelectItem>
                    <SelectItem value="property_interest">Property Interest Follow-up</SelectItem>
                    <SelectItem value="mortgage_information">Mortgage Information</SelectItem>
                    <SelectItem value="agent_introduction">Agent Introduction</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Notes
                </label>
                <Textarea 
                  placeholder="Add details for this follow-up..." 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="resize-none h-24"
                />
              </div>
              
              <Button className="w-full">
                <Clock className="mr-2 h-4 w-4" />
                Schedule Follow-up
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div>
        <h4 className="text-sm font-medium mb-3">Recommended Follow-ups</h4>
        <div className="space-y-3">
          {recommendedFollowUps.map((followUp, index) => (
            <Card key={index}>
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <div className="bg-muted rounded-full p-2 mr-3">
                      {getChannelIcon(followUp.type)}
                    </div>
                    <div>
                      <h5 className="font-medium text-sm">{followUp.title}</h5>
                      <div className="flex items-center mt-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>Suggested timeframe: {followUp.timeframe}</span>
                      </div>
                      {followUp.scheduledFor && (
                        <div className="flex items-center mt-1 text-xs">
                          <Calendar className="h-3 w-3 mr-1 text-primary" />
                          <span className="text-primary">
                            Scheduled for {format(followUp.scheduledFor, 'MMM d, yyyy')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    {getPriorityBadge(followUp.priority)}
                    {!followUp.scheduledFor && (
                      <Button size="sm" variant="link" className="h-auto py-0 px-1 mt-1">
                        <span className="text-xs">Use this</span>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <div className="border-t border-border pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-muted-foreground mr-2" />
            <span className="text-sm text-muted-foreground">Lead response time: 12h avg</span>
          </div>
          <Button variant="outline" size="sm">View History</Button>
        </div>
      </div>
    </div>
  );
}
