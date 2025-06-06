
import { Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RealTimeStatusIndicatorProps {
  status: 'connecting' | 'connected' | 'disconnected';
  className?: string;
}

export const RealTimeStatusIndicator = ({ status, className }: RealTimeStatusIndicatorProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          color: 'text-green-500',
          label: 'Real-time updates active',
          pulse: true
        };
      case 'connecting':
        return {
          color: 'text-yellow-500',
          label: 'Connecting to real-time updates...',
          pulse: true
        };
      case 'disconnected':
        return {
          color: 'text-red-500',
          label: 'Real-time updates disconnected',
          pulse: false
        };
    }
  };

  const config = getStatusConfig();

  return (
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
  );
};
