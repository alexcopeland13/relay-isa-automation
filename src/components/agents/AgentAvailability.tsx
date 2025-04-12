
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { 
  Clock, 
  Sun, 
  Zap, 
  Calendar as CalendarIcon,
  Plus
} from "lucide-react";
import { Agent } from "@/types/agent";

interface AgentAvailabilityProps {
  agent: Agent;
}

const defaultAvailability = [
  { day: "Monday", slots: ["9:00 AM - 12:00 PM", "1:00 PM - 5:00 PM"] },
  { day: "Tuesday", slots: ["9:00 AM - 12:00 PM", "1:00 PM - 5:00 PM"] },
  { day: "Wednesday", slots: ["9:00 AM - 12:00 PM", "1:00 PM - 5:00 PM"] },
  { day: "Thursday", slots: ["9:00 AM - 12:00 PM", "1:00 PM - 5:00 PM"] },
  { day: "Friday", slots: ["9:00 AM - 12:00 PM", "1:00 PM - 3:00 PM"] },
  { day: "Saturday", slots: ["10:00 AM - 2:00 PM"] },
  { day: "Sunday", slots: [] }
];

const defaultTimeOff = [
  { date: new Date(2023, 5, 15), reason: "Personal Day" },
  { date: new Date(2023, 5, 25), reason: "Vacation" },
  { date: new Date(2023, 5, 26), reason: "Vacation" },
  { date: new Date(2023, 5, 27), reason: "Vacation" }
];

export function AgentAvailability({ agent }: AgentAvailabilityProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [availability] = useState(defaultAvailability);
  const [timeOff] = useState(defaultTimeOff);

  const dayAvailability = availability.find(
    day => day.day === date?.toLocaleDateString('en-US', { weekday: 'long' })
  );

  // Function to highlight dates with time off
  const isDayHighlighted = (date: Date) => {
    return timeOff.some(
      off => off.date.toDateString() === date.toDateString()
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Regular Schedule</h3>
          <Button variant="outline" size="sm">
            <Clock className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
        <div className="space-y-2">
          {availability.map((day) => (
            <div key={day.day} className="flex items-start gap-2">
              <div className="w-24 font-medium">{day.day}</div>
              <div className="flex-1">
                {day.slots.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {day.slots.map((slot, i) => (
                      <Badge 
                        key={i} 
                        variant="outline"
                        className="bg-secondary/30"
                      >
                        {slot}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">Not available</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Time Off</h3>
          <Button variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add
          </Button>
        </div>
        <Card>
          <CardContent className="p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
              modifiers={{
                highlighted: isDayHighlighted
              }}
              modifiersStyles={{
                highlighted: {
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  fontWeight: 'bold'
                }
              }}
            />
          </CardContent>
        </Card>
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Scheduled Time Off:</h4>
          {timeOff.map((item, index) => (
            <div key={index} className="flex items-center justify-between py-1 border-b last:border-0">
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4 text-amber-500" />
                <span>{item.date.toLocaleDateString()}</span>
              </div>
              <Badge variant="outline">{item.reason}</Badge>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Today's Availability</h3>
          <Button variant="outline" size="sm">
            <Zap className="mr-2 h-4 w-4" />
            Quick Add
          </Button>
        </div>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <CalendarIcon className="h-5 w-5 text-muted-foreground" />
              <span>
                {date?.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>

            {timeOff.some(off => off.date.toDateString() === date?.toDateString()) ? (
              <div className="p-4 bg-red-50 rounded-md text-red-700 text-sm">
                Time off scheduled for this date
              </div>
            ) : dayAvailability?.slots && dayAvailability.slots.length > 0 ? (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Available Time Slots:</h4>
                {dayAvailability.slots.map((slot, index) => (
                  <div key={index} className="p-2 bg-secondary/10 rounded-md flex items-center justify-between">
                    <span>{slot}</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Available
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-muted rounded-md text-center text-muted-foreground">
                No availability set for this day
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
