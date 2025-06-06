
import { format, parseISO } from 'date-fns';
import { Clock, Calendar, Phone, Mail, MessageSquare, BarChart, Download, Play, PhoneIncoming, PhoneOutgoing, PhoneCall } from 'lucide-react';
import { ExtractedInfo } from '@/types/conversation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { CallSchedulerModal } from './CallSchedulerModal';
import { ActiveCallInterface } from './ActiveCallInterface';
import { useState } from 'react';

interface ConversationHeaderProps {
  leadInfo?: {
    name: string;
    email: string;
    phone: string;
    source: string;
  };
  timestamp?: string;
  duration?: string;
  type?: string;
  qualification?: string | ExtractedInfo['qualification'];
}

const getQualificationBadgeColor = (status: string) => {
  switch (status) {
    case 'Highly Qualified':
      return 'bg-green-100 text-green-800';
    case 'Qualified':
      return 'bg-blue-100 text-blue-800';
    case 'Needs More Information':
      return 'bg-yellow-100 text-yellow-800';
    case 'Not Qualified':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getConversationTypeIcon = (type: string) => {
  switch (type) {
    case 'Inbound Call':
      return <PhoneIncoming className="h-4 w-4" />;
    case 'Outbound Call':
      return <PhoneOutgoing className="h-4 w-4" />;
    case 'Email Thread':
      return <Mail className="h-4 w-4" />;
    case 'Text Message':
      return <MessageSquare className="h-4 w-4" />;
    default:
      return <MessageSquare className="h-4 w-4" />;
  }
};

export const ConversationHeader = ({ 
  leadInfo, 
  timestamp, 
  duration, 
  type = 'Unknown',
  qualification
}: ConversationHeaderProps) => {
  const [showActiveCall, setShowActiveCall] = useState(false);
  
  // Null guards
  if (!leadInfo) {
    return (
      <div className="p-6 border-b border-border">
        <div className="text-center text-muted-foreground">
          <p>No conversation data available</p>
        </div>
      </div>
    );
  }
  
  const formattedDate = timestamp ? format(parseISO(timestamp), 'MMMM d, yyyy') : 'Unknown date';
  const formattedTime = timestamp ? format(parseISO(timestamp), 'h:mm a') : 'Unknown time';
  
  // Get the qualification status and confidence score, handling both string and object types
  const qualificationStatus = typeof qualification === 'string' 
    ? qualification 
    : qualification?.status || 'Unknown';
    
  const confidenceScore = typeof qualification === 'object' && qualification
    ? Math.round(qualification.confidenceScore * 100) 
    : null;
  
  const isCallConversation = type.includes('Call');
  
  return (
    <div className="p-6 border-b border-border">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-xl font-bold">{leadInfo.name}</h2>
          <div className="flex flex-wrap gap-3 mt-1">
            <span className="text-sm text-muted-foreground">{leadInfo.email}</span>
            <span className="text-sm text-muted-foreground">{leadInfo.phone}</span>
            <span className="text-sm text-muted-foreground">Source: {leadInfo.source}</span>
          </div>
        </div>
        
        <div className={`mt-3 md:mt-0 text-sm font-medium px-3 py-1 rounded-full flex items-center gap-1.5 ${getQualificationBadgeColor(qualificationStatus)}`}>
          <BarChart className="h-4 w-4" />
          {qualificationStatus}
          {confidenceScore && ` (${confidenceScore}% confidence)`}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          {getConversationTypeIcon(type)}
          <span>{type}</span>
        </div>
        
        <div className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4" />
          <span>{formattedDate} at {formattedTime}</span>
        </div>
        
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          <span>Duration: {duration || '0m 0s'}</span>
        </div>
      </div>
      
      {isCallConversation && (
        <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowActiveCall(true)}>
            <PhoneCall className="mr-2 h-4 w-4" />
            Call Lead
          </Button>
          
          <Button variant="outline" size="sm">
            <Play className="mr-2 h-4 w-4" />
            Listen to Recording
          </Button>
          
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download Transcript
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Phone className="mr-2 h-4 w-4" />
                Schedule Follow-up
              </Button>
            </DialogTrigger>
            <CallSchedulerModal />
          </Dialog>
        </div>
      )}
      
      {showActiveCall && <ActiveCallInterface leadInfo={leadInfo} onClose={() => setShowActiveCall(false)} />}
    </div>
  );
};
