
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Agent } from "@/types/agent";
import { Plus, Trash, Clock } from "lucide-react";

interface AgentAvailabilityFormProps {
  agent?: Agent;
}

export function AgentAvailabilityForm({ agent }: AgentAvailabilityFormProps) {
  const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const [workingDays, setWorkingDays] = useState<Record<string, boolean>>({
    Monday: true,
    Tuesday: true,
    Wednesday: true,
    Thursday: true,
    Friday: true,
    Saturday: false,
    Sunday: false,
    ...agent?.availability?.reduce((acc, day) => ({
      ...acc,
      [day.day]: true
    }), {})
  });

  const [timeSlots, setTimeSlots] = useState<Record<string, {start: string, end: string}[]>>({
    Monday: [{ start: "09:00", end: "17:00" }],
    Tuesday: [{ start: "09:00", end: "17:00" }],
    Wednesday: [{ start: "09:00", end: "17:00" }],
    Thursday: [{ start: "09:00", end: "17:00" }],
    Friday: [{ start: "09:00", end: "17:00" }],
    Saturday: [],
    Sunday: [],
    ...agent?.availability?.reduce((acc, day) => ({
      ...acc,
      [day.day]: day.slots.map(slot => {
        const [start, end] = slot.split(" - ");
        return { 
          start: start.replace(" AM", "").replace(" PM", ""), 
          end: end.replace(" AM", "").replace(" PM", "")
        };
      })
    }), {})
  });

  const addTimeSlot = (day: string) => {
    setTimeSlots({
      ...timeSlots,
      [day]: [...(timeSlots[day] || []), { start: "09:00", end: "17:00" }]
    });
  };

  const removeTimeSlot = (day: string, index: number) => {
    setTimeSlots({
      ...timeSlots,
      [day]: timeSlots[day].filter((_, i) => i !== index)
    });
  };

  const updateTimeSlot = (day: string, index: number, field: 'start' | 'end', value: string) => {
    const newSlots = [...timeSlots[day]];
    newSlots[index] = { ...newSlots[index], [field]: value };
    setTimeSlots({
      ...timeSlots,
      [day]: newSlots
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Availability Schedule</CardTitle>
        <CardDescription>
          Set the agent's regular working hours and availability
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-4">Regular Working Hours</h3>
            <div className="space-y-6">
              {weekdays.map((day) => (
                <div key={day} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id={`day-${day}`} 
                        checked={workingDays[day] || false}
                        onCheckedChange={(checked) => {
                          setWorkingDays({...workingDays, [day]: checked});
                          if (checked && !timeSlots[day]?.length) {
                            addTimeSlot(day);
                          }
                        }}
                      />
                      <Label htmlFor={`day-${day}`}>{day}</Label>
                    </div>
                    <Badge variant={workingDays[day] ? "default" : "secondary"}>
                      {workingDays[day] ? "Working" : "Off"}
                    </Badge>
                  </div>

                  {workingDays[day] && (
                    <div className="ml-7 space-y-2">
                      {timeSlots[day]?.map((slot, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-muted-foreground mr-2" />
                            <Input
                              type="time"
                              value={slot.start}
                              onChange={(e) => updateTimeSlot(day, index, 'start', e.target.value)}
                              className="w-32"
                            />
                            <span className="mx-2">to</span>
                            <Input
                              type="time"
                              value={slot.end}
                              onChange={(e) => updateTimeSlot(day, index, 'end', e.target.value)}
                              className="w-32"
                            />
                          </div>
                          
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon"
                            onClick={() => removeTimeSlot(day, index)}
                            className="h-8 w-8"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => addTimeSlot(day)}
                        className="mt-1"
                      >
                        <Plus className="mr-1 h-4 w-4" />
                        Add Time Slot
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t">
            <h3 className="text-lg font-medium mb-2">Time Off & Special Availability</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Manage vacations, holidays, and other special scheduling needs
            </p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium mb-2">Select Dates</h4>
                <Calendar
                  mode="multiple"
                  className="border rounded-md"
                />
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="time-off-type">Time Off Type</Label>
                  <Select defaultValue="vacation">
                    <SelectTrigger id="time-off-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vacation">Vacation</SelectItem>
                      <SelectItem value="personal">Personal Day</SelectItem>
                      <SelectItem value="sick">Sick Leave</SelectItem>
                      <SelectItem value="holiday">Holiday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="time-off-notes">Notes</Label>
                  <Input id="time-off-notes" placeholder="Optional notes about this time off" />
                </div>
                
                <Button className="w-full">
                  Add Time Off
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
