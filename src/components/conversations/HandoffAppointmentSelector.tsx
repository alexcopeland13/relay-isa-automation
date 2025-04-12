
import { useState } from 'react';
import { Agent } from '@/types/agent';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, ArrowRight, Save, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface HandoffAppointmentSelectorProps {
  agent: Agent;
  onComplete: (timeSlot: string, meetingType: string) => void;
  onBack: () => void;
  onSaveDraft: () => void;
}

export const HandoffAppointmentSelector = ({ 
  agent, 
  onComplete,
  onBack,
  onSaveDraft
}: HandoffAppointmentSelectorProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [timeSlot, setTimeSlot] = useState<string>('');
  const [meetingType, setMeetingType] = useState<string>('Video Call');
  const [location, setLocation] = useState<string>('');
  
  // Sample available time slots
  const availableTimeSlots = [
    '9:00 AM - 10:00 AM',
    '11:00 AM - 12:00 PM',
    '2:00 PM - 3:00 PM',
    '4:00 PM - 5:00 PM',
  ];
  
  // Recommended slots (would be calculated based on agent & lead availability)
  const recommendedSlots = [
    '11:00 AM - 12:00 PM',
    '2:00 PM - 3:00 PM',
  ];
  
  const handleSubmit = () => {
    const formattedDate = date ? format(date, 'EEE, MMM d, yyyy') : '';
    const fullTimeSlot = `${formattedDate} at ${timeSlot}`;
    onComplete(fullTimeSlot, meetingType);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">Suggest Appointment</h3>
        <div className="flex gap-2 items-center">
          <span className="text-sm text-muted-foreground">Agent:</span>
          <Badge variant="outline" className="px-2 py-1">
            {agent.name}
          </Badge>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label>Select Date</Label>
            <div className="mt-2 border rounded-md">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="meetingType">Meeting Type</Label>
            <Select value={meetingType} onValueChange={setMeetingType}>
              <SelectTrigger id="meetingType">
                <SelectValue placeholder="Select meeting type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Phone Call">Phone Call</SelectItem>
                <SelectItem value="Video Call">Video Call</SelectItem>
                <SelectItem value="In-Person Meeting">In-Person Meeting</SelectItem>
                <SelectItem value="Property Showing">Property Showing</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {(meetingType === 'In-Person Meeting' || meetingType === 'Property Showing') && (
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Textarea
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter the address or location details"
                rows={2}
              />
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <div>
            <Label>Select Time Slot</Label>
            <div className="mt-2 space-y-2">
              {recommendedSlots.length > 0 && (
                <div className="mb-3">
                  <Badge variant="outline" className="mb-2">Recommended Slots</Badge>
                  {recommendedSlots.map((slot) => (
                    <div 
                      key={slot} 
                      className={`
                        flex items-center justify-between p-3 border rounded-md cursor-pointer
                        ${timeSlot === slot ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}
                        mb-2
                      `}
                      onClick={() => setTimeSlot(slot)}
                    >
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-primary" />
                        {slot}
                      </div>
                      <Badge variant="secondary" className="text-xs">Recommended</Badge>
                    </div>
                  ))}
                </div>
              )}
              
              <div>
                <Badge variant="outline" className="mb-2">All Available Slots</Badge>
                {availableTimeSlots.map((slot) => (
                  <div 
                    key={slot} 
                    className={`
                      flex items-center p-3 border rounded-md cursor-pointer
                      ${timeSlot === slot ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}
                      mb-2
                    `}
                    onClick={() => setTimeSlot(slot)}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    {slot}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <div className="space-x-2">
          <Button variant="outline" onClick={onSaveDraft}>
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!date || !timeSlot}
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
