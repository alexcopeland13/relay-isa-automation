
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Phone, Mail, MessageSquare, Calendar, Clock, ArrowUpRight } from 'lucide-react';
import { sampleConversation } from '@/data/sampleConversation';
import { format, parseISO } from 'date-fns';

// Create several copies of the sample conversation with modified properties for the list
const generateSampleConversations = () => {
  const baseConversation = sampleConversation;
  const conversations = [];
  
  // Use the original conversation
  conversations.push({ ...baseConversation });
  
  // Create some variations
  conversations.push({
    ...baseConversation,
    id: "conv-12346",
    leadInfo: { ...baseConversation.leadInfo, name: "Jennifer Williams" },
    timestamp: "2025-04-05T10:15:00Z",
    type: "Outbound Call",
    extractedInfo: {
      ...baseConversation.extractedInfo,
      qualification: {
        ...baseConversation.extractedInfo.qualification,
        status: "Highly Qualified"
      }
    }
  });
  
  conversations.push({
    ...baseConversation,
    id: "conv-12347",
    leadInfo: { ...baseConversation.leadInfo, name: "Robert Chen" },
    timestamp: "2025-04-04T16:45:00Z",
    type: "Email Thread",
    extractedInfo: {
      ...baseConversation.extractedInfo,
      qualification: {
        ...baseConversation.extractedInfo.qualification,
        status: "Needs More Information"
      }
    }
  });
  
  conversations.push({
    ...baseConversation,
    id: "conv-12348",
    leadInfo: { ...baseConversation.leadInfo, name: "Sarah Martinez" },
    timestamp: "2025-04-04T09:30:00Z",
    type: "Text Message",
    extractedInfo: {
      ...baseConversation.extractedInfo,
      qualification: {
        ...baseConversation.extractedInfo.qualification,
        status: "Not Qualified"
      }
    }
  });
  
  conversations.push({
    ...baseConversation,
    id: "conv-12349",
    leadInfo: { ...baseConversation.leadInfo, name: "David Thompson" },
    timestamp: "2025-04-03T14:00:00Z",
    type: "Inbound Call",
    extractedInfo: {
      ...baseConversation.extractedInfo,
      qualification: {
        ...baseConversation.extractedInfo.qualification,
        status: "Qualified"
      }
    }
  });
  
  return conversations;
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

interface ConversationListProps {
  onSelectConversation: () => void;
}

export const ConversationList = ({ onSelectConversation }: ConversationListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const conversations = generateSampleConversations();
  
  const filteredConversations = conversations.filter(conv => 
    conv.leadInfo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.extractedInfo.qualification.status.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
        <Input 
          placeholder="Search conversations..." 
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {filteredConversations.map((conversation) => (
          <Card key={conversation.id} className="hover:border-primary/50 transition-all cursor-pointer" onClick={onSelectConversation}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-lg">{conversation.leadInfo.name}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    {getConversationTypeIcon(conversation.type)}
                    <span>{conversation.type}</span>
                    <span className="mx-1">•</span>
                    <Clock className="h-3.5 w-3.5" />
                    <span>{conversation.duration}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className={`text-xs font-medium px-2 py-1 rounded-full ${getQualificationBadgeColor(conversation.extractedInfo.qualification.status)}`}>
                    {conversation.extractedInfo.qualification.status}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {format(parseISO(conversation.timestamp), 'MMM d, yyyy')}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm">
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Refinance Goals:</span>
                    {conversation.extractedInfo.refinanceGoals.lowerRate && <span className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded">Lower Rate</span>}
                    {conversation.extractedInfo.refinanceGoals.shortenTerm && <span className="bg-purple-100 text-purple-800 text-xs px-1.5 py-0.5 rounded">Shorter Term</span>}
                    {conversation.extractedInfo.refinanceGoals.cashOut && <span className="bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded">Cash Out</span>}
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="gap-1">
                  <span>Details</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
