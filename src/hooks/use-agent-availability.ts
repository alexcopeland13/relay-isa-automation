
import { useState, useEffect } from 'react';
import { Agent } from '@/types/agent';

type AgentAvailability = {
  available: boolean;
  nextAvailableSlots?: string[];
  timeOffReason?: string;
  availabilityColor: 'green' | 'yellow' | 'red';
};

type TimeSlot = {
  time: string;
  available: boolean;
  conflictReason?: string;
};

export function useAgentAvailability(agentId?: string) {
  const [availability, setAvailability] = useState<AgentAvailability>({
    available: false,
    availabilityColor: 'red',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);

  useEffect(() => {
    const fetchAgentAvailability = async () => {
      if (!agentId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Simulating API call to fetch agent availability
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // This would be replaced with actual API data
        const mockAvailability: AgentAvailability = {
          available: Math.random() > 0.3, // 70% chance of being available
          availabilityColor: Math.random() > 0.7 ? 'green' : (Math.random() > 0.5 ? 'yellow' : 'red'),
          nextAvailableSlots: ['9:00 AM - 10:00 AM', '2:00 PM - 3:00 PM', '4:30 PM - 5:30 PM'],
          timeOffReason: Math.random() > 0.7 ? undefined : 'Scheduled time off'
        };

        // Generate available time slots based on availability
        const slots: TimeSlot[] = [];
        const hours = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];
        
        hours.forEach(time => {
          const isAvailable = mockAvailability.available && Math.random() > 0.3;
          slots.push({
            time,
            available: isAvailable,
            conflictReason: isAvailable ? undefined : 'Meeting scheduled'
          });
        });

        setAvailability(mockAvailability);
        setAvailableTimeSlots(slots);
      } catch (error) {
        console.error('Error fetching agent availability:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgentAvailability();
  }, [agentId]);

  const getAvailableTimesForDate = (date: Date): TimeSlot[] => {
    // This would be replaced with actual logic based on the agent's calendar
    // For now, returning the mock data with some randomization
    return availableTimeSlots.map(slot => ({
      ...slot,
      available: Math.random() > 0.4
    }));
  };

  return {
    availability,
    isLoading,
    availableTimeSlots,
    getAvailableTimesForDate
  };
}
