
import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { format, addDays, addHours, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';
import { Search, Filter, Clock, Mail, MessageSquare, Phone, CalendarCheck, CheckCircle, AlertTriangle, BarChart } from 'lucide-react';

// Sample follow-up data for demonstration purposes
const sampleFollowUps = [
  {
    id: 1,
    leadName: 'Sarah Martinez',
    email: 'sarah.martinez@example.com',
    dueDate: addHours(new Date(), 2),
    type: 'email',
    priority: 'high',
    status: 'pending',
    description: 'Send information about new listings in Westwood area',
    lastContact: addDays(new Date(), -3),
    assignedAgent: 'David Wilson'
  },
  {
    id: 2,
    leadName: 'Robert Johnson',
    email: 'robert.j@example.com',
    dueDate: addHours(new Date(), 5),
    type: 'call',
    priority: 'medium',
    status: 'pending',
    description: 'Follow up on mortgage pre-approval status',
    lastContact: addDays(new Date(), -2),
    assignedAgent: 'Emily Taylor'
  },
  {
    id: 3,
    leadName: 'Melissa Chang',
    email: 'melissa.c@example.com',
    dueDate: addHours(new Date(), 8),
    type: 'text',
    priority: 'low',
    status: 'pending',
    description: 'Check if they want to schedule second viewing of the property',
    lastContact: addDays(new Date(), -1),
    assignedAgent: 'Sarah Johnson'
  },
  {
    id: 4,
    leadName: 'Thomas Anderson',
    email: 'tanderson@example.com',
    dueDate: addDays(new Date(), 1),
    type: 'email',
    priority: 'medium',
    status: 'pending',
    description: 'Send additional photos of the backyard and garage',
    lastContact: addDays(new Date(), -4),
    assignedAgent: 'Michael Scott'
  },
  {
    id: 5,
    leadName: 'Jennifer Lewis',
    email: 'jlewis@example.com',
    dueDate: addDays(new Date(), 1),
    type: 'call',
    priority: 'high',
    status: 'pending',
    description: 'Discuss offer terms and pricing strategy',
    lastContact: addDays(new Date(), -1),
    assignedAgent: 'David Wilson'
  },
  {
    id: 6,
    leadName: 'Christopher Martin',
    email: 'c.martin@example.com',
    dueDate: addDays(new Date(), 2),
    type: 'email',
    priority: 'medium',
    status: 'pending',
    description: 'Send market analysis report for downtown properties',
    lastContact: addDays(new Date(), -5),
    assignedAgent: 'Emily Taylor'
  }
];

const PendingFollowups = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('due-today');
  
  // Filter follow-ups based on selected tab and search term
  const getFilteredFollowUps = () => {
    const today = new Date();
    
    let filtered = sampleFollowUps;
    
    // Apply search filter if search term exists
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.leadName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.assignedAgent.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply tab filter
    switch (activeTab) {
      case 'due-today':
        return filtered.filter(item => 
          isAfter(item.dueDate, startOfDay(today)) && 
          isBefore(item.dueDate, endOfDay(today))
        );
      case 'overdue':
        return filtered.filter(item => 
          isBefore(item.dueDate, startOfDay(today))
        );
      case 'upcoming':
        return filtered.filter(item => 
          isAfter(item.dueDate, endOfDay(today))
        );
      case 'all':
      default:
        return filtered;
    }
  };
  
  const filteredFollowUps = getFilteredFollowUps();
  
  // Count follow-ups by type
  const emailCount = filteredFollowUps.filter(item => item.type === 'email').length;
  const callCount = filteredFollowUps.filter(item => item.type === 'call').length;
  const textCount = filteredFollowUps.filter(item => item.type === 'text').length;
  
  return (
    <PageLayout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Pending Follow-ups</h1>
          <p className="text-muted-foreground mt-1">
            Manage and complete follow-up tasks with your leads
          </p>
        </div>
        <div className="flex gap-2">
          <Button>
            <CheckCircle className="mr-2 h-4 w-4" />
            Complete Selected
          </Button>
          <Button variant="outline">
            <BarChart className="mr-2 h-4 w-4" />
            Analytics
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search lead, task, or agent..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
              <Mail className="h-3.5 w-3.5" />
              {emailCount} Emails
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
              <Phone className="h-3.5 w-3.5" />
              {callCount} Calls
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
              <MessageSquare className="h-3.5 w-3.5" />
              {textCount} Texts
            </Badge>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full md:w-auto grid-cols-4">
            <TabsTrigger value="due-today" className="data-[state=active]:bg-secondary">
              Due Today
            </TabsTrigger>
            <TabsTrigger value="overdue" className="data-[state=active]:bg-secondary">
              Overdue
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="data-[state=active]:bg-secondary">
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="all" className="data-[state=active]:bg-secondary">
              All Tasks
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="due-today" className="mt-6">
            <FollowUpsList followUps={filteredFollowUps} />
          </TabsContent>
          
          <TabsContent value="overdue" className="mt-6">
            <FollowUpsList followUps={filteredFollowUps} />
          </TabsContent>
          
          <TabsContent value="upcoming" className="mt-6">
            <FollowUpsList followUps={filteredFollowUps} />
          </TabsContent>
          
          <TabsContent value="all" className="mt-6">
            <FollowUpsList followUps={filteredFollowUps} />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

interface FollowUp {
  id: number;
  leadName: string;
  email: string;
  dueDate: Date;
  type: 'email' | 'call' | 'text';
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'completed';
  description: string;
  lastContact: Date;
  assignedAgent: string;
}

interface FollowUpsListProps {
  followUps: FollowUp[];
}

const FollowUpsList = ({ followUps }: FollowUpsListProps) => {
  if (followUps.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-muted-foreground">No follow-ups found matching your criteria</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {followUps.map(followUp => (
        <FollowUpCard key={followUp.id} followUp={followUp} />
      ))}
    </div>
  );
};

interface FollowUpCardProps {
  followUp: FollowUp;
}

const FollowUpCard = ({ followUp }: FollowUpCardProps) => {
  const now = new Date();
  const isOverdue = isBefore(followUp.dueDate, now);
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'call':
        return <Phone className="h-4 w-4" />;
      case 'text':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };
  
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Medium</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Low</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Unknown</Badge>;
    }
  };
  
  const getTimeDisplay = (date: Date) => {
    if (isOverdue) {
      return (
        <div className="flex items-center text-red-600">
          <AlertTriangle className="h-4 w-4 mr-1" />
          Overdue: {format(date, 'MMM d, h:mm a')}
        </div>
      );
    }
    
    return (
      <div className="flex items-center text-muted-foreground">
        <Clock className="h-4 w-4 mr-1" />
        Due: {format(date, 'MMM d, h:mm a')}
      </div>
    );
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base">{followUp.leadName}</CardTitle>
            <CardDescription>{followUp.email}</CardDescription>
          </div>
          {getPriorityBadge(followUp.priority)}
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            {getTimeDisplay(followUp.dueDate)}
            <div className="flex items-center gap-1">
              {getTypeIcon(followUp.type)}
              <span className="capitalize">{followUp.type}</span>
            </div>
          </div>
          
          <p className="text-sm">{followUp.description}</p>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <span>Last contact: {format(followUp.lastContact, 'MMM d')}</span>
            <span className="mx-2">•</span>
            <span>Agent: {followUp.assignedAgent}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0 flex gap-2">
        <Button className="flex-1" variant="default" size="sm">
          {followUp.type === 'email' ? (
            <Mail className="mr-2 h-4 w-4" />
          ) : followUp.type === 'call' ? (
            <Phone className="mr-2 h-4 w-4" />
          ) : (
            <MessageSquare className="mr-2 h-4 w-4" />
          )}
          {followUp.type === 'email' ? 'Send Email' : followUp.type === 'call' ? 'Make Call' : 'Send Text'}
        </Button>
        <Button className="flex-1" variant="outline" size="sm">
          <CalendarCheck className="mr-2 h-4 w-4" />
          Complete
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PendingFollowups;
