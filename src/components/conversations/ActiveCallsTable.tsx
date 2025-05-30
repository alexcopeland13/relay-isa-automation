
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Phone, User, Clock } from 'lucide-react';
import { LiveStatusIndicator } from './call/LiveStatusIndicator';
import { useActiveCalls } from '@/hooks/use-active-calls';
import { useRealtimeConversations } from '@/hooks/use-realtime-conversations';
import { format } from 'date-fns';

interface ActiveCallsTableProps {
  onSelectCall?: (callData: any) => void;
}

export const ActiveCallsTable = ({ onSelectCall }: ActiveCallsTableProps) => {
  const { activeCalls, isLoading } = useActiveCalls();
  
  // Use real-time updates for all active calls
  const { conversationUpdates } = useRealtimeConversations(
    activeCalls.map(call => call.conversation_id)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading active calls...</span>
      </div>
    );
  }

  if (activeCalls.length === 0) {
    return (
      <div className="text-center p-8">
        <Phone className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No Active Calls</h3>
        <p className="text-muted-foreground">All conversations are currently completed.</p>
      </div>
    );
  }

  const formatDuration = (startedAt: string) => {
    const start = new Date(startedAt);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - start.getTime()) / (1000 * 60));
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Lead</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Started</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activeCalls.map((call) => {
            const realtimeUpdate = conversationUpdates[call.conversation_id];
            const callStatus = realtimeUpdate?.call_status || call.call_status;
            const isStillActive = callStatus === 'active';
            
            return (
              <TableRow key={call.conversation_id} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <div>
                      <div className="font-medium">{call.lead_name}</div>
                      <div className="text-sm text-muted-foreground">ID: {call.lead_id}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {call.lead_phone || 'N/A'}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {formatDuration(call.started_at)}
                  </div>
                </TableCell>
                <TableCell>
                  {format(new Date(call.started_at), 'h:mm a')}
                </TableCell>
                <TableCell>
                  <LiveStatusIndicator 
                    status={isStillActive ? 'active' : 'completed'}
                    size="sm"
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSelectCall?.(call)}
                    disabled={!isStillActive}
                  >
                    {isStillActive ? 'Join Call' : 'View Details'}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
