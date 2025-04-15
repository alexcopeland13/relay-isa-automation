
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Agent } from "@/types/agent";
import { Plus, Trash, Clock, RefreshCw, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AgentAvailabilityFormProps {
  agent?: Agent;
  onSave?: (availability: any) => void;
}

interface TimeSlot {
  start: string;
  end: string;
}

interface TimeOff {
  dates: Date[];
  type: string;
  notes: string;
}

export function AgentAvailabilityForm({ agent, onSave }: AgentAvailabilityFormProps) {
  const { toast } = useToast();
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

  const [timeSlots, setTimeSlots] = useState<Record<string, TimeSlot[]>>({
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

  const [timeOffDates, setTimeOffDates] = useState<Date[]>([]);
  const [timeOffType, setTimeOffType] = useState<string>("vacation");
  const [timeOffNotes, setTimeOffNotes] = useState<string>("");
  const [timeOffEntries, setTimeOffEntries] = useState<TimeOff[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Mock function to save the availability schedule
  const saveAvailability = async () => {
    setIsSaving(true);
    
    try {
      // Convert working days and time slots to proper format
      const availability = weekdays
        .filter(day => workingDays[day])
        .map(day => ({
          day,
          slots: timeSlots[day].map(slot => `${slot.start} - ${slot.end}`)
        }));
      
      // Simulate API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, we would make an API call to save the availability
      const savedData = {
        availability,
        timeOff: timeOffEntries
      };
      
      console.log('Saving agent availability:', savedData);
      
      // Store in localStorage for persistence
      localStorage.setItem(`agent_${agent?.id}_availability`, JSON.stringify(savedData));
      
      toast({
        title: "Availability Saved",
        description: "Agent availability schedule has been updated successfully.",
      });
      
      // Call the onSave callback if provided
      if (onSave) {
        onSave(savedData);
      }
    } catch (error) {
      console.error('Error saving availability:', error);
      toast({
        title: "Save Failed",
        description: "There was a problem saving the availability schedule. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Load saved time off entries from localStorage if available
  useEffect(() => {
    if (agent?.id) {
      const savedData = localStorage.getItem(`agent_${agent.id}_availability`);
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          if (parsedData.timeOff) {
            // Convert date strings back to Date objects
            const convertedTimeOff = parsedData.timeOff.map((item: any) => ({
              ...item,
              dates: item.dates.map((dateStr: string) => new Date(dateStr))
            }));
            setTimeOffEntries(convertedTimeOff);
          }
        } catch (error) {
          console.error('Error parsing saved availability data:', error);
        }
      }
    }
  }, [agent?.id]);

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

  const addTimeOffEntry = () => {
    if (timeOffDates.length === 0) {
      toast({
        title: "Select Dates",
        description: "Please select at least one date for time off.",
        variant: "destructive",
      });
      return;
    }

    const newEntry: TimeOff = {
      dates: [...timeOffDates],
      type: timeOffType,
      notes: timeOffNotes,
    };

    setTimeOffEntries([...timeOffEntries, newEntry]);
    setTimeOffDates([]);
    setTimeOffNotes("");
    
    toast({
      title: "Time Off Added",
      description: `${newEntry.dates.length} date(s) added as ${timeOffType}.`,
    });
  };

  const removeTimeOffEntry = (index: number) => {
    setTimeOffEntries(timeOffEntries.filter((_, i) => i !== index));
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="space-y-6">
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
                              disabled={timeSlots[day].length === 1}
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
                    selected={timeOffDates}
                    onSelect={(dates) => setTimeOffDates(dates || [])}
                    className="border rounded-md"
                  />
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="time-off-type">Time Off Type</Label>
                    <Select 
                      value={timeOffType}
                      onValueChange={setTimeOffType}
                    >
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
                    <Input 
                      id="time-off-notes" 
                      placeholder="Optional notes about this time off"
                      value={timeOffNotes}
                      onChange={(e) => setTimeOffNotes(e.target.value)}
                    />
                  </div>
                  
                  <Button 
                    className="w-full"
                    onClick={addTimeOffEntry}
                    disabled={timeOffDates.length === 0}
                  >
                    Add Time Off
                  </Button>
                </div>
              </div>
              
              {timeOffEntries.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-2">Scheduled Time Off</h4>
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-4 py-2 text-left">Dates</th>
                          <th className="px-4 py-2 text-left">Type</th>
                          <th className="px-4 py-2 text-left">Notes</th>
                          <th className="px-4 py-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {timeOffEntries.map((entry, index) => (
                          <tr key={index} className="border-t">
                            <td className="px-4 py-2">
                              {entry.dates.length === 1 
                                ? formatDate(entry.dates[0])
                                : `${formatDate(entry.dates[0])} - ${formatDate(entry.dates[entry.dates.length - 1])} (${entry.dates.length} days)`
                              }
                            </td>
                            <td className="px-4 py-2 capitalize">{entry.type}</td>
                            <td className="px-4 py-2">{entry.notes || "-"}</td>
                            <td className="px-4 py-2 text-right">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => removeTimeOffEntry(index)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            onClick={saveAvailability}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Availability
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
