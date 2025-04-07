
import { format, parseISO } from 'date-fns';
import { Clock, Calendar, Phone, Mail, MessageSquare, BarChart } from 'lucide-react';
import { ExtractedInfo } from '@/data/sampleConversation';

interface ConversationHeaderProps {
  leadInfo: {
    name: string;
    email: string;
    phone: string;
    source: string;
  };
  timestamp: string;
  duration: string;
  type: string;
  qualification: ExtractedInfo['qualification'];
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
    case 'Outbound Call':
      return <Phone className="h-4 w-4" />;
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
  type,
  qualification
}: ConversationHeaderProps) => {
  const formattedDate = format(parseISO(timestamp), 'MMMM d, yyyy');
  const formattedTime = format(parseISO(timestamp), 'h:mm a');
  
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
        
        <div className={`mt-3 md:mt-0 text-sm font-medium px-3 py-1 rounded-full flex items-center gap-1.5 ${getQualificationBadgeColor(qualification.status)}`}>
          <BarChart className="h-4 w-4" />
          {qualification.status} ({Math.round(qualification.confidenceScore * 100)}% confidence)
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
          <span>Duration: {duration}</span>
        </div>
      </div>
    </div>
  );
};
