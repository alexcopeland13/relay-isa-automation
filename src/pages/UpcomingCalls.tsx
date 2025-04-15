
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

// Sample call data for demonstration purposes
const sampleCalls = [
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
    notes: 'Interested in single-family homes in north area'
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
    notes: 'Wants to discuss financing options'
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
    notes: 'Interested in scheduling weekend viewings'
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
    notes: 'Ready to make offer on the Hillcrest property'
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
    notes: 'New lead, first contact'
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
              <CallCard key={call.id} call={call} />
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
              <CallCard key={call.id} call={call} />
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
                    <CallCard key={call.id} call={call} compact />
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

interface CallCardProps {
  call: {
    id: number;
    leadName: string;
    phone: string;
    date: Date;
    time: string;
    direction: string;
    purpose: string;
    duration: string;
    assignedAgent: string;
    notes: string;
  };
  compact?: boolean;
}

const CallCard = ({ call, compact = false }: CallCardProps) => {
  const isOutbound = call.direction === 'outbound';
  
  return (
    <Card className={compact ? "overflow-hidden" : ""}>
      <CardHeader className={compact ? "p-4" : ""}>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className={compact ? "text-base" : ""}>{call.leadName}</CardTitle>
            <CardDescription>{call.phone}</CardDescription>
          </div>
          <Badge variant={isOutbound ? "default" : "secondary"} className="flex items-center gap-1">
            {isOutbound ? (
              <>
                <PhoneOutgoing className="h-3 w-3" />
                Outbound
              </>
            ) : (
              <>
                <PhoneIncoming className="h-3 w-3" />
                Inbound
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className={compact ? "p-4 pt-0" : ""}>
        <div className="space-y-3">
          <div className="flex items-center text-sm">
            <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="font-medium">{format(call.date, 'MMMM d, yyyy')}</span>
            <span className="mx-2">•</span>
            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{call.time}</span>
            <span className="mx-2">•</span>
            <span className="text-muted-foreground">{call.duration}</span>
          </div>
          
          <div className="flex items-center text-sm">
            <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{call.purpose}</span>
          </div>
          
          {!compact && (
            <>
              <div className="flex items-center text-sm">
                <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>Assigned: {call.assignedAgent}</span>
              </div>
              
              {call.notes && (
                <div className="pt-2 text-sm">
                  <p className="text-muted-foreground">{call.notes}</p>
                </div>
              )}
              
              <div className="pt-3 flex gap-2">
                <Button size="sm" variant="default">
                  <Phone className="mr-2 h-4 w-4" />
                  Call Now
                </Button>
                <Button size="sm" variant="outline">
                  Reschedule
                </Button>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingCalls;
