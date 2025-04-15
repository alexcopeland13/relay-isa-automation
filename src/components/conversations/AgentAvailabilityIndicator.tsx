
import { Agent } from '@/types/agent';
import { Badge } from '@/components/ui/badge';
import { useAgentAvailability } from '@/hooks/use-agent-availability';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Calendar, Clock, AlertCircle } from 'lucide-react';

interface AgentAvailabilityIndicatorProps {
  agent: Agent;
  showNextAvailable?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function AgentAvailabilityIndicator({ 
  agent, 
  showNextAvailable = false, 
  size = 'md' 
}: AgentAvailabilityIndicatorProps) {
  const { availability, isLoading } = useAgentAvailability(agent.id);

  if (isLoading) {
    return (
      <Badge variant="outline" className="animate-pulse bg-gray-200">
        Checking...
      </Badge>
    );
  }

  const getAvailabilityLabel = () => {
    if (availability.available) {
      return availability.availabilityColor === 'yellow' ? 'Limited Availability' : 'Available';
    }
    return 'Unavailable';
  };

  const getVariant = () => {
    if (availability.available) {
      return availability.availabilityColor === 'yellow' ? 'outline' : 'default';
    }
    return 'destructive';
  };

  const getBadgeClass = () => {
    if (availability.available) {
      return availability.availabilityColor === 'yellow' 
        ? 'border-yellow-500 text-yellow-700 bg-yellow-50' 
        : 'border-green-500 text-green-700 bg-green-50';
    }
    return 'border-red-300';
  };

  const sizeClasses = {
    sm: 'text-xs py-0 px-1.5',
    md: 'text-sm py-0.5 px-2',
    lg: 'py-1 px-3'
  };

  return (
    <div className="flex flex-col space-y-1">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant={getVariant()} 
              className={`${getBadgeClass()} ${sizeClasses[size]} flex items-center gap-1`}
            >
              <span className={`w-2 h-2 rounded-full bg-${availability.availabilityColor === 'yellow' ? 'yellow' : (availability.available ? 'green' : 'red')}-500`} />
              {getAvailabilityLabel()}
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            {availability.available ? (
              availability.availabilityColor === 'yellow' ? 
                "The agent has limited availability today." : 
                "The agent is available for calls today."
            ) : (
              <div className="flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4" />
                {availability.timeOffReason || "The agent is not available today."}
              </div>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {showNextAvailable && !availability.available && availability.nextAvailableSlots && (
        <div className="text-xs text-muted-foreground mt-1">
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            <span>Next available:</span>
          </div>
          <div className="flex flex-col mt-1 space-y-1">
            {availability.nextAvailableSlots.slice(0, 2).map((slot, index) => (
              <div key={index} className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                <span>{slot}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
