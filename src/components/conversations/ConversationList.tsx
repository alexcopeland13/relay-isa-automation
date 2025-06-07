
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Phone, 
  PhoneOutgoing,
  PhoneIncoming,
  Mail, 
  MessageSquare, 
  Calendar, 
  Clock, 
  ArrowUpRight,
  Filter,
  PhoneOff,
  PhoneMissed
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { CallSchedulerModal } from './CallSchedulerModal';
import { useActiveCalls } from '@/hooks/use-active-calls';
import { useConversationHistory } from '@/hooks/use-conversation-history';

const getConversationTypeIcon = (direction: string) => {
  switch (direction) {
    case 'inbound':
      return <PhoneIncoming className="h-4 w-4" />;
    case 'outbound':
      return <PhoneOutgoing className="h-4 w-4" />;
    default:
      return <MessageSquare className="h-4 w-4" />;
  }
};

const getCallStatusBadge = (status?: string) => {
  if (!status) return null;
  
  switch (status) {
    case 'completed':
      return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
    case 'active':
      return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Active</Badge>;
    case 'missed':
      return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Missed</Badge>;
    case 'recording':
      return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">Recording</Badge>;
    default:
      return null;
  }
};

const getQualificationBadgeColor = (extractionsCount: number) => {
  if (extractionsCount > 0) {
    return 'bg-green-100 text-green-800';
  }
  return 'bg-gray-100 text-gray-800';
};

const formatDuration = (duration: number | null) => {
  if (!duration) return '0m 0s';
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  return `${minutes}m ${seconds}s`;
};

interface ConversationListProps {
  onSelectConversation: (conversation: any) => void;
}

export const ConversationList = ({ onSelectConversation }: ConversationListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string | null>(null);
  const { activeCallLeadIds, isLeadOnCall } = useActiveCalls();
  const { conversations, isLoading } = useConversationHistory();
  
  const filteredConversations = conversations.filter(conv => {
    // Apply search filter
    const matchesSearch = conv.lead_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.direction.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.call_status.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Apply type filter
    const matchesType = !filterType || 
      (filterType === 'calls' && (conv.direction === 'inbound' || conv.direction === 'outbound')) ||
      (filterType === 'messages' && false); // No message types in current data
    
    return matchesSearch && matchesType;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading conversations...</div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <Input 
            placeholder="Search conversations..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setFilterType(null)}>
              All Conversations
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterType('calls')}>
              <Phone className="mr-2 h-4 w-4" />
              <span>Voice Calls Only</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Phone className="mr-2 h-4 w-4" />
              Schedule Call
            </Button>
          </DialogTrigger>
          <CallSchedulerModal />
        </Dialog>
      </div>
      
      {filteredConversations.length === 0 ? (
        <div className="text-center p-8 text-muted-foreground">
          {conversations.length === 0 
            ? "No conversations found. Make a test call to see conversations appear here."
            : "No conversations match your search criteria."
          }
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredConversations.map((conversation) => {
            // Check if this lead is currently on a live call using real data
            const isLive = isLeadOnCall(conversation.lead_name);
            
            return (
              <Card 
                key={conversation.id} 
                className={`hover:border-primary/50 transition-all cursor-pointer ${
                  isLive ? 'border-green-500 ring-2 ring-green-200' : ''
                }`} 
                onClick={() => onSelectConversation(conversation)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-lg">{conversation.lead_name}</div>
                        {isLive && (
                          <Badge className="bg-green-500 text-white animate-pulse">
                            LIVE CALL
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        {getConversationTypeIcon(conversation.direction)}
                        <span className="capitalize">{conversation.direction} Call</span>
                        <span className="mx-1">•</span>
                        <Clock className="h-3.5 w-3.5" />
                        <span>{formatDuration(conversation.duration)}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className={`text-xs font-medium px-2 py-1 rounded-full ${getQualificationBadgeColor(conversation.extractions.length)}`}>
                        {conversation.extractions.length > 0 ? 'AI Analyzed' : 'Not Analyzed'}
                      </div>
                      <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {format(parseISO(conversation.created_at), 'MMM d, yyyy')}
                      </div>
                      {conversation.call_status && (
                        <div className="mt-1">
                          {getCallStatusBadge(conversation.call_status)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-sm">
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Sentiment:</span>
                        <span className={`px-1.5 py-0.5 rounded text-xs ${
                          conversation.sentiment_score > 0.6 ? 'bg-green-100 text-green-800' :
                          conversation.sentiment_score > 0.3 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {conversation.sentiment_score > 0.6 ? 'Positive' :
                           conversation.sentiment_score > 0.3 ? 'Neutral' : 'Negative'}
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="gap-1">
                      <span>Details</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
