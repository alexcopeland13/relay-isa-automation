
import { TimeSlot } from '@/components/ui/time-slot';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState, useEffect } from 'react';
import { useAgentAvailability } from '@/hooks/use-agent-availability';
import { format } from 'date-fns';
import { Agent } from '@/types/agent';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';

interface AvailableTimeSlotsProps {
  selectedDate: Date;
  agent: Agent;
  onSelectTime: (time: string) => void;
  selectedTime?: string;
}

export function AvailableTimeSlots({ 
  selectedDate, 
  agent, 
  onSelectTime,
  selectedTime
}: AvailableTimeSlotsProps) {
  const { getAvailableTimesForDate, availability } = useAgentAvailability(agent.id);
  const [timeSlots, setTimeSlots] = useState<{time: string, available: boolean, conflictReason?: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTimeSlots = async () => {
      setIsLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const slots = getAvailableTimesForDate(selectedDate);
      setTimeSlots(slots);
      setIsLoading(false);
    };

    if (selectedDate) {
      loadTimeSlots();
    }
  }, [selectedDate, agent.id, getAvailableTimesForDate]);

  if (!selectedDate) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        Please select a date first
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-10 bg-muted animate-pulse rounded-md" />
        ))}
      </div>
    );
  }

  const availableSlots = timeSlots.filter(slot => slot.available);
  const unavailableSlots = timeSlots.filter(slot => !slot.available);

  if (!availability.available) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-muted-foreground p-4 border border-red-200 bg-red-50 rounded-md">
        <Badge variant="destructive" className="mb-2">Agent Unavailable</Badge>
        <p className="text-center text-sm mb-2">
          {agent.name} is not available on {format(selectedDate, 'MMMM d, yyyy')}.
        </p>
        {availability.nextAvailableSlots && (
          <div className="mt-3">
            <div className="text-sm font-medium">Next available times:</div>
            <div className="flex flex-col gap-1 mt-1">
              {availability.nextAvailableSlots.map((slot, i) => (
                <div key={i} className="flex items-center text-sm">
                  <Clock className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                  <span>{slot}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (availableSlots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-muted-foreground p-4 border border-yellow-200 bg-yellow-50 rounded-md">
        <Badge variant="outline" className="border-yellow-500 text-yellow-700 mb-2">No Available Slots</Badge>
        <p className="text-center text-sm">
          There are no available time slots for {format(selectedDate, 'MMMM d, yyyy')}.
        </p>
        <p className="text-center text-sm mt-2">
          Please try another date.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium mb-2">Available Time Slots</h4>
        <ScrollArea className="h-48 rounded-md border p-2">
          <div className="space-y-2">
            {availableSlots.map((slot) => (
              <TimeSlot
                key={slot.time}
                time={slot.time}
                selected={selectedTime === slot.time}
                onClick={() => onSelectTime(slot.time)}
                available={true}
              />
            ))}
          </div>
        </ScrollArea>
      </div>

      {unavailableSlots.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2 text-muted-foreground">Unavailable Time Slots</h4>
          <ScrollArea className="h-32 rounded-md border border-muted p-2">
            <div className="space-y-2">
              {unavailableSlots.map((slot) => (
                <TimeSlot
                  key={slot.time}
                  time={slot.time}
                  selected={false}
                  available={false}
                  conflictReason={slot.conflictReason}
                />
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
