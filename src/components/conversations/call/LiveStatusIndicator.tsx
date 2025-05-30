
import { Badge } from '@/components/ui/badge';
import { Phone, PhoneOff, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LiveStatusIndicatorProps {
  status: 'active' | 'completed' | 'connecting' | 'error';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showText?: boolean;
}

export const LiveStatusIndicator = ({ 
  status, 
  size = 'md', 
  showIcon = true, 
  showText = true 
}: LiveStatusIndicatorProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return {
          icon: Phone,
          text: 'LIVE',
          className: 'bg-green-500 text-white animate-pulse',
          iconClassName: 'text-green-400'
        };
      case 'connecting':
        return {
          icon: Clock,
          text: 'Connecting',
          className: 'bg-yellow-500 text-white',
          iconClassName: 'text-yellow-400'
        };
      case 'completed':
        return {
          icon: PhoneOff,
          text: 'Ended',
          className: 'bg-gray-500 text-white',
          iconClassName: 'text-gray-400'
        };
      case 'error':
        return {
          icon: PhoneOff,
          text: 'Error',
          className: 'bg-red-500 text-white',
          iconClassName: 'text-red-400'
        };
      default:
        return {
          icon: PhoneOff,
          text: 'Unknown',
          className: 'bg-gray-500 text-white',
          iconClassName: 'text-gray-400'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5'
  };
  
  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <Badge className={cn(config.className, sizeClasses[size])}>
      {showIcon && <Icon className={cn(iconSizes[size], 'mr-1')} />}
      {showText && config.text}
    </Badge>
  );
};
