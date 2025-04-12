
import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, PhoneOutgoing, PhoneIncoming, CalendarCheck2, Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface CallScheduleFormValues {
  date: Date | undefined;
  time: string;
  purpose: string;
  direction: 'inbound' | 'outbound';
  notes: string;
  addToCalendar: boolean;
}

export const CallSchedulerModal = () => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  
  const form = useForm<CallScheduleFormValues>({
    defaultValues: {
      date: undefined,
      time: '',
      purpose: '',
      direction: 'outbound',
      notes: '',
      addToCalendar: true,
    },
  });

  const onSubmit = (data: CallScheduleFormValues) => {
    // In a real implementation, this would save the scheduled call
    toast.success('Call scheduled successfully', {
      description: `${data.direction} call scheduled for ${format(data.date!, 'PPP')} at ${data.time}`,
    });
    
    console.log('Scheduled call:', data);
    // Close the dialog
    document.querySelector('[data-radix-dialog-close]')?.dispatchEvent(
      new MouseEvent('click', { bubbles: true })
    );
  };

  const timeOptions = Array.from({ length: 24 * 4 }, (_, i) => {
    const hour = Math.floor(i / 4);
    const minute = (i % 4) * 15;
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
    const period = hour < 12 ? 'AM' : 'PM';
    const formattedMinute = minute.toString().padStart(2, '0');
    return `${formattedHour}:${formattedMinute} ${period}`;
  });

  const purposeOptions = [
    'Initial consultation',
    'Follow-up discussion',
    'Property viewing coordination',
    'Financing options',
    'Contract negotiation',
    'Closing details',
    'Other',
  ];

  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Schedule a Call</DialogTitle>
        <DialogDescription>
          Plan a voice conversation with this lead at a specific time.
        </DialogDescription>
      </DialogHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          field.onChange(date);
                          setSelectedDate(date);
                        }}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {timeOptions.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="purpose"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Call Purpose</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select the purpose of this call" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {purposeOptions.map((purpose) => (
                      <SelectItem key={purpose} value={purpose}>
                        {purpose}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="direction"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Call Direction</FormLabel>
                <div className="flex space-x-4">
                  <div 
                    className={cn(
                      "flex-1 border rounded-md p-3 cursor-pointer flex items-center justify-center space-x-2",
                      field.value === 'outbound' ? "bg-primary/10 border-primary" : "border-input"
                    )}
                    onClick={() => field.onChange('outbound')}
                  >
                    <PhoneOutgoing size={16} />
                    <span>Outbound</span>
                  </div>
                  <div 
                    className={cn(
                      "flex-1 border rounded-md p-3 cursor-pointer flex items-center justify-center space-x-2",
                      field.value === 'inbound' ? "bg-primary/10 border-primary" : "border-input"
                    )}
                    onClick={() => field.onChange('inbound')}
                  >
                    <PhoneIncoming size={16} />
                    <span>Inbound</span>
                  </div>
                </div>
                <FormDescription>
                  Who will initiate the call
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pre-call Notes</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Add any preparation notes or topics to cover..." 
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="addToCalendar"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Add to Calendar</FormLabel>
                  <FormDescription>
                    Automatically add this call to your work calendar
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <DialogFooter>
            <Button type="submit">
              <CalendarCheck2 className="mr-2 h-4 w-4" />
              Schedule Call
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};
