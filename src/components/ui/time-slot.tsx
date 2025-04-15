
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Clock, AlarmClockOff, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TimeSlotProps {
  time: string;
  selected: boolean;
  available: boolean;
  onClick?: () => void;
  conflictReason?: string;
}

export function TimeSlot({ 
  time, 
  selected, 
  available, 
  onClick,
  conflictReason
}: TimeSlotProps) {
  if (!available) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center justify-between px-3 py-2 rounded-md border border-gray-200 bg-gray-50 text-gray-500">
              <div className="flex items-center">
                <AlarmClockOff className="h-4 w-4 mr-2 text-gray-400" />
                <span>{time}</span>
              </div>
              <Info className="h-4 w-4 text-gray-400" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{conflictReason || "Unavailable time slot"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Button
      variant={selected ? "default" : "outline"}
      onClick={onClick}
      className={cn(
        "w-full justify-start",
        selected ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
      )}
    >
      <Clock className="h-4 w-4 mr-2" />
      {time}
    </Button>
  );
}
