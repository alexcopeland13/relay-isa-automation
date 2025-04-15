
import { format } from 'date-fns';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Clock, Phone, Users, PhoneOutgoing, PhoneIncoming } from 'lucide-react';
import { AgentAvailabilityIndicator } from '@/components/conversations/AgentAvailabilityIndicator';
import { cn } from '@/lib/utils';
import { sampleAgentsData } from '@/data/sampleAgentsData';

export interface CallInfo {
  id: number;
  leadName: string;
  phone: string;
  date: Date;
  time: string;
  direction: string;
  purpose: string;
  duration: string;
  assignedAgent: string;
  notes: string;
  status?: 'confirmed' | 'tentative' | 'rescheduled';
}

interface UpcomingCallCardProps {
  call: CallInfo;
  compact?: boolean;
}

export function UpcomingCallCard({ call, compact = false }: UpcomingCallCardProps) {
  const isOutbound = call.direction === 'outbound';
  
  // Find the agent by name
  const agent = sampleAgentsData.find(agent => agent.name === call.assignedAgent) || sampleAgentsData[0];
  
  return (
    <Card className={compact ? "overflow-hidden" : ""}>
      <CardHeader className={cn("flex flex-row items-start justify-between", compact ? "p-4" : "")}>
        <div>
          <div className="flex items-center gap-2">
            <h3 className={cn("font-medium", compact ? "text-base" : "text-lg")}>{call.leadName}</h3>
            {call.status && (
              <Badge 
                variant={call.status === 'confirmed' ? 'default' : 
                        call.status === 'tentative' ? 'outline' : 'secondary'}
              >
                {call.status}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{call.phone}</p>
        </div>
        <Badge variant={isOutbound ? "default" : "secondary"} className="flex items-center gap-1">
          {isOutbound ? (
            <>
              <PhoneOutgoing className="h-3 w-3" />
              Outbound
            </>
          ) : (
            <>
              <PhoneIncoming className="h-3 w-3" />
              Inbound
            </>
          )}
        </Badge>
      </CardHeader>
      <CardContent className={cn("grid gap-3", compact ? "p-4 pt-0" : "")}>
        <div className="flex flex-wrap items-center text-sm gap-2">
          <div className="flex items-center">
            <CalendarIcon className="h-4 w-4 mr-1 text-muted-foreground" />
            <span className="font-medium">{format(call.date, 'MMMM d, yyyy')}</span>
          </div>
          <span className="text-muted-foreground">•</span>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
            <span>{call.time}</span>
          </div>
          <span className="text-muted-foreground">•</span>
          <div className="text-muted-foreground">{call.duration}</div>
        </div>
        
        <div className="flex items-center text-sm">
          <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
          <span>{call.purpose}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm">
            <Users className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{call.assignedAgent}</span>
          </div>
          <AgentAvailabilityIndicator agent={agent} size="sm" />
        </div>
        
        {!compact && (
          <>
            {call.notes && (
              <div className="pt-2 text-sm">
                <p className="text-muted-foreground">{call.notes}</p>
              </div>
            )}
            
            <div className="pt-3 flex gap-2">
              <Button size="sm" variant="default">
                <Phone className="mr-2 h-4 w-4" />
                Call Now
              </Button>
              <Button size="sm" variant="outline">
                Reschedule
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
