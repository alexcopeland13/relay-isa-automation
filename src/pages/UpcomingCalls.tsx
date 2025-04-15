
import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { format, addDays, isToday, isTomorrow } from 'date-fns';
import { CalendarPlus, Phone, Users, Calendar as CalendarIcon, PhoneIncoming, PhoneOutgoing, Clock, PhoneCall } from 'lucide-react';
import { CallSchedulerModal } from '@/components/conversations/CallSchedulerModal';
import { UpcomingCallCard, CallInfo } from '@/components/calls/UpcomingCallCard';

// Sample call data for demonstration purposes
const sampleCalls: CallInfo[] = [
  {
    id: 1,
    leadName: 'Michael Brown',
    phone: '(555) 123-4567',
    date: new Date(),
    time: '10:30 AM',
    direction: 'outbound',
    purpose: 'Initial consultation',
    duration: '30 min',
    assignedAgent: 'Sarah Johnson',
    notes: 'Interested in single-family homes in north area',
    status: 'confirmed'
  },
  {
    id: 2,
    leadName: 'Jennifer Martinez',
    phone: '(555) 987-6543',
    date: new Date(),
    time: '2:15 PM',
    direction: 'inbound',
    purpose: 'Follow-up discussion',
    duration: '15 min',
    assignedAgent: 'David Wilson',
    notes: 'Wants to discuss financing options',
    status: 'tentative'
  },
  {
    id: 3,
    leadName: 'Robert Davis',
    phone: '(555) 456-7890',
    date: addDays(new Date(), 1),
    time: '11:00 AM',
    direction: 'outbound',
    purpose: 'Property viewing coordination',
    duration: '20 min',
    assignedAgent: 'Emily Taylor',
    notes: 'Interested in scheduling weekend viewings',
    status: 'confirmed'
  },
  {
    id: 4,
    leadName: 'Amanda Johnson',
    phone: '(555) 234-5678',
    date: addDays(new Date(), 1),
    time: '3:45 PM',
    direction: 'outbound',
    purpose: 'Contract negotiation',
    duration: '45 min',
    assignedAgent: 'Michael Scott',
    notes: 'Ready to make offer on the Hillcrest property',
    status: 'rescheduled'
  },
  {
    id: 5,
    leadName: 'Thomas Wilson',
    phone: '(555) 876-5432',
    date: addDays(new Date(), 2),
    time: '1:30 PM',
    direction: 'outbound',
    purpose: 'Initial consultation',
    duration: '30 min',
    assignedAgent: 'Sarah Johnson',
    notes: 'New lead, first contact',
    status: 'confirmed'
  }
];

const UpcomingCalls = () => {
  const [selectedTab, setSelectedTab] = useState('today');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // Filter calls based on selected tab
  const filterCalls = () => {
    if (!selectedDate) return [];
    
    switch(selectedTab) {
      case 'today':
        return sampleCalls.filter(call => isToday(call.date));
      case 'tomorrow':
        return sampleCalls.filter(call => isTomorrow(call.date));
      case 'calendar':
        return sampleCalls.filter(call => 
          format(call.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd'));
      default:
        return sampleCalls;
    }
  };
  
  const filteredCalls = filterCalls();

  return (
    <PageLayout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Upcoming Calls</h1>
          <p className="text-muted-foreground mt-1">
            Schedule and manage your upcoming calls with leads
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <CalendarPlus className="mr-2 h-4 w-4" />
              Schedule New Call
            </Button>
          </DialogTrigger>
          <CallSchedulerModal />
        </Dialog>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="today" className="data-[state=active]:bg-secondary">
              Today
            </TabsTrigger>
            <TabsTrigger value="tomorrow" className="data-[state=active]:bg-secondary">
              Tomorrow
            </TabsTrigger>
            <TabsTrigger value="calendar" className="data-[state=active]:bg-secondary">
              Calendar View
            </TabsTrigger>
          </TabsList>
          
          <div className="text-sm text-muted-foreground">
            <PhoneCall className="inline-block mr-1 h-4 w-4" />
            {filteredCalls.length} calls scheduled
          </div>
        </div>

        <TabsContent value="today" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCalls.length > 0 ? filteredCalls.map(call => (
              <UpcomingCallCard key={call.id} call={call} />
            )) : (
              <p className="col-span-2 text-center py-8 text-muted-foreground">
                No calls scheduled for today
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="tomorrow" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCalls.length > 0 ? filteredCalls.map(call => (
              <UpcomingCallCard key={call.id} call={call} />
            )) : (
              <p className="col-span-2 text-center py-8 text-muted-foreground">
                No calls scheduled for tomorrow
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Pick a date</CardTitle>
                <CardDescription>View scheduled calls by date</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="border rounded-md"
                />
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>
                  Calls for {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Selected Date'}
                </CardTitle>
                <CardDescription>
                  {filteredCalls.length} calls scheduled
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredCalls.length > 0 ? filteredCalls.map(call => (
                    <UpcomingCallCard key={call.id} call={call} compact />
                  )) : (
                    <p className="text-center py-8 text-muted-foreground">
                      No calls scheduled for this date
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

export default UpcomingCalls;
