import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, PhoneOutgoing, PhoneIncoming, CalendarCheck2, Plus, Minus, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AvailableTimeSlots } from './AvailableTimeSlots';
import { AgentAvailabilityIndicator } from './AgentAvailabilityIndicator';
import { sampleAgentsData } from '@/data/sampleAgentsData';

const checkForConflicts = (date: Date, time: string): { hasConflict: boolean, conflictDetails?: string } => {
  const isConflict = date && 
    format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') && 
    time === '2:00 PM';
  
  return isConflict 
    ? { 
        hasConflict: true, 
        conflictDetails: 'You already have a call with Jennifer Martinez at this time.' 
      } 
    : { hasConflict: false };
};

const callScheduleSchema = z.object({
  date: z.date({
    required_error: "Please select a date",
  }),
  time: z.string({
    required_error: "Please select a time",
  }),
  duration: z.number({
    required_error: "Please select a duration",
  }),
  direction: z.enum(['inbound', 'outbound'], {
    required_error: "Please select a call direction",
  }),
  purpose: z.string({
    required_error: "Please select a purpose",
  }),
  notes: z.string().optional(),
  addToCalendar: z.boolean().default(true),
  sendReminder: z.boolean().default(true),
  reminderTime: z.string().optional(),
});

type CallScheduleFormValues = z.infer<typeof callScheduleSchema>;

export const CallSchedulerModal = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conflict, setConflict] = useState<{ hasConflict: boolean, conflictDetails?: string }>({ hasConflict: false });
  const [selectedAgent, setSelectedAgent] = useState(sampleAgentsData[0]);

  const form = useForm<CallScheduleFormValues>({
    resolver: zodResolver(callScheduleSchema),
    defaultValues: {
      date: new Date(),
      time: '',
      duration: 30,
      direction: 'outbound',
      purpose: '',
      notes: '',
    },
  });

  const watchDate = form.watch('date');
  const watchTime = form.watch('time');
  
  const checkConflicts = () => {
    if (watchDate && watchTime) {
      const conflictResult = checkForConflicts(watchDate, watchTime);
      if (conflictResult.hasConflict) {
        setConflict(conflictResult);
      }
    }
  };
  
  useEffect(() => {
    if (watchDate && watchTime) {
      checkConflicts();
    }
  }, [watchDate, watchTime]);

  const onSubmit = async (data: CallScheduleFormValues) => {
    const conflictResult = checkForConflicts(data.date, data.time);
    if (conflictResult.hasConflict) {
      setConflict(conflictResult);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Scheduled call:', data);
      
      toast.success('Call scheduled successfully', {
        description: `${data.direction} call scheduled for ${format(data.date, 'PPP')} at ${data.time}`,
      });
      
      document.querySelector('[data-radix-dialog-close]')?.dispatchEvent(
        new MouseEvent('click', { bubbles: true })
      );
    } catch (error) {
      toast.error('Failed to schedule call', {
        description: 'An error occurred while scheduling the call. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectTime = (time: string) => {
    form.setValue('time', time);
    
    if (conflict.hasConflict) {
      setConflict({ hasConflict: false });
    }
  };

  return (
    <DialogContent className="max-w-3xl overflow-y-auto max-h-[90vh]">
      <DialogHeader>
        <DialogTitle>Schedule a Call</DialogTitle>
        <DialogDescription>
          Set up a call with the selected lead or contact.
        </DialogDescription>
      </DialogHeader>
      
      <div className="mt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <img 
              src={selectedAgent.photoUrl || '/placeholder.svg'} 
              alt={selectedAgent.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <h3 className="font-medium">{selectedAgent.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedAgent.title || 'Agent'}</p>
            </div>
          </div>
          <AgentAvailabilityIndicator agent={selectedAgent} showNextAvailable={true} />
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-4">
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
                              variant={"outline"}
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
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <AvailableTimeSlots 
                  selectedDate={watchDate}
                  agent={selectedAgent}
                  onSelectTime={handleSelectTime}
                  selectedTime={watchTime}
                />
              </div>
              
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="direction"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Call Direction</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="outbound" id="outbound" />
                            <Label htmlFor="outbound" className="flex items-center cursor-pointer">
                              <PhoneOutgoing className="mr-2 h-4 w-4" />
                              Outbound (you call them)
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="inbound" id="inbound" />
                            <Label htmlFor="inbound" className="flex items-center cursor-pointer">
                              <PhoneIncoming className="mr-2 h-4 w-4" />
                              Inbound (they call you)
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <div className="flex items-center space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => form.setValue('duration', Math.max(15, field.value - 15))}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            className="w-20 text-center"
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => form.setValue('duration', field.value + 15)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="purpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purpose</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Initial consultation, Property review" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Any additional information about this call"
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {conflict.hasConflict && (
              <div className="flex p-3 text-sm border border-yellow-200 bg-yellow-50 rounded-md items-start">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 text-yellow-500 mt-0.5" />
                <div>
                  <p className="font-medium">Scheduling Conflict</p>
                  <p>{conflict.conflictDetails}</p>
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  document.querySelector('[data-radix-dialog-close]')?.dispatchEvent(
                    new MouseEvent('click', { bubbles: true })
                  );
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <CalendarCheck2 className="mr-2 h-4 w-4" />
                    Schedule Call
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </DialogContent>
  );
};
