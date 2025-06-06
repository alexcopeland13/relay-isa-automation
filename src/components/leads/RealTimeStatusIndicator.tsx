
import { Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface RealTimeStatusIndicatorProps {
  status: 'connecting' | 'connected' | 'disconnected';
  connectionError?: string;
  className?: string;
}

export const RealTimeStatusIndicator = ({ 
  status, 
  connectionError, 
  className 
}: RealTimeStatusIndicatorProps) => {
  const getStatusConfig = () => {
    if (connectionError) {
      return {
        color: 'text-red-500',
        label: 'Connection error',
        pulse: false,
        tooltip: connectionError
      };
    }

    switch (status) {
      case 'connected':
        return {
          color: 'text-green-500',
          label: 'Real-time updates active',
          pulse: true,
          tooltip: 'Successfully connected to real-time updates'
        };
      case 'connecting':
        return {
          color: 'text-yellow-500',
          label: 'Connecting to real-time updates...',
          pulse: true,
          tooltip: 'Establishing connection to real-time updates'
        };
      case 'disconnected':
        return {
          color: 'text-red-500',
          label: 'Real-time updates disconnected',
          pulse: false,
          tooltip: 'Real-time updates are not available'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex items-center gap-2 text-xs text-muted-foreground", className)}>
            <Circle 
              className={cn(
                "h-2 w-2 fill-current", 
                config.color,
                config.pulse && "animate-pulse"
              )} 
            />
            <span>{config.label}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{config.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
