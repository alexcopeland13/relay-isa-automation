
import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { format } from 'date-fns';
import { CheckCircle, Download, Filter, Search, Trash2, CalendarCheck, Phone, Mail, MessageSquare } from 'lucide-react';

// Define task types
type TaskType = 'call' | 'email' | 'text' | 'meeting';
type TaskStatus = 'completed' | 'cancelled';
type TaskPriority = 'high' | 'medium' | 'low';

// Define the task interface
interface CompletedTask {
  id: string;
  leadName: string;
  taskType: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  completedAt: string;
  completedBy: string;
  description: string;
  notes?: string;
  outcome: string;
  followUpCreated: boolean;
}

// Sample completed tasks data
const sampleCompletedTasks: CompletedTask[] = [
  {
    id: 'task-001',
    leadName: 'Michael Johnson',
    taskType: 'call',
    priority: 'high',
    status: 'completed',
    completedAt: '2025-04-10T14:30:00Z',
    completedBy: 'John Smith',
    description: 'Discuss mortgage options and rates',
    notes: 'Client was very interested in fixed-rate options. Scheduled follow-up meeting.',
    outcome: 'Positive',
    followUpCreated: true
  },
  {
    id: 'task-002',
    leadName: 'Sarah Williams',
    taskType: 'email',
    priority: 'medium',
    status: 'completed',
    completedAt: '2025-04-09T11:20:00Z',
    completedBy: 'Jane Doe',
    description: 'Send information about refinancing options',
    outcome: 'Neutral',
    followUpCreated: false
  },
  {
    id: 'task-003',
    leadName: 'David Anderson',
    taskType: 'meeting',
    priority: 'high',
    status: 'completed',
    completedAt: '2025-04-08T16:15:00Z',
    completedBy: 'John Smith',
    description: 'Property viewing and consultation',
    notes: 'Client liked the property but had concerns about the neighborhood. Sent additional information.',
    outcome: 'Positive',
    followUpCreated: true
  },
  {
    id: 'task-004',
    leadName: 'Jennifer Miller',
    taskType: 'call',
    priority: 'low',
    status: 'cancelled',
    completedAt: '2025-04-07T09:45:00Z',
    completedBy: 'Jane Doe',
    description: 'Follow up on pre-approval application',
    notes: 'Client rescheduled for next week due to personal reasons.',
    outcome: 'Neutral',
    followUpCreated: true
  },
  {
    id: 'task-005',
    leadName: 'Robert Brown',
    taskType: 'text',
    priority: 'medium',
    status: 'completed',
    completedAt: '2025-04-11T10:30:00Z',
    completedBy: 'John Smith',
    description: 'Confirm appointment time',
    outcome: 'Positive',
    followUpCreated: false
  },
  {
    id: 'task-006',
    leadName: 'Amanda Wilson',
    taskType: 'email',
    priority: 'high',
    status: 'completed',
    completedAt: '2025-04-06T13:20:00Z',
    completedBy: 'Jane Doe',
    description: 'Send mortgage comparison document',
    notes: 'Client had questions about closing costs. Scheduled a call to discuss.',
    outcome: 'Positive',
    followUpCreated: true
  },
  {
    id: 'task-007',
    leadName: 'James Thompson',
    taskType: 'call',
    priority: 'medium',
    status: 'completed',
    completedAt: '2025-04-05T15:10:00Z',
    completedBy: 'John Smith',
    description: 'Discuss investment property options',
    outcome: 'Neutral',
    followUpCreated: false
  },
  {
    id: 'task-008',
    leadName: 'Susan Martin',
    taskType: 'meeting',
    priority: 'high',
    status: 'completed',
    completedAt: '2025-04-04T11:00:00Z',
    completedBy: 'Jane Doe',
    description: 'Loan signing appointment',
    notes: 'All documents signed successfully. Client was very satisfied.',
    outcome: 'Positive',
    followUpCreated: false
  }
];

const CompletedTasks = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [timeRange, setTimeRange] = useState('all');
  const [taskTypeFilter, setTaskTypeFilter] = useState<string>('all');
  const [outcomeFilter, setOutcomeFilter] = useState<string>('all');
  
  // Filter tasks based on search term and filters
  const filteredTasks = sampleCompletedTasks.filter(task => {
    // Search filter
    const matchesSearch = 
      task.leadName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.completedBy.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Task type filter
    const matchesTaskType = taskTypeFilter === 'all' || task.taskType === taskTypeFilter;
    
    // Outcome filter
    const matchesOutcome = outcomeFilter === 'all' || task.outcome === outcomeFilter;
    
    // Time range filter (simplified for demo)
    let matchesTimeRange = true;
    if (timeRange === 'today') {
      // Check if completed today (simplified)
      const today = new Date().toISOString().split('T')[0];
      matchesTimeRange = task.completedAt.startsWith(today);
    }
    
    return matchesSearch && matchesTaskType && matchesOutcome && matchesTimeRange;
  });

  // Get task type icon
  const getTaskTypeIcon = (type: TaskType) => {
    switch (type) {
      case 'call':
        return <Phone className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'text':
        return <MessageSquare className="h-4 w-4" />;
      case 'meeting':
        return <CalendarCheck className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  // Get outcome badge
  const getOutcomeBadge = (outcome: string) => {
    switch (outcome) {
      case 'Positive':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Positive</Badge>;
      case 'Neutral':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Neutral</Badge>;
      case 'Negative':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Negative</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Unknown</Badge>;
    }
  };

  return (
    <PageLayout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Completed Tasks</h1>
          <p className="text-muted-foreground mt-1">
            Review and manage completed follow-ups, calls, and assignments
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button variant="destructive" className="gap-2">
            <Trash2 className="h-4 w-4" />
            Delete Selected
          </Button>
        </div>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Task Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search lead, task, or agent..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This week</SelectItem>
                  <SelectItem value="month">This month</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={taskTypeFilter} onValueChange={setTaskTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Task type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="call">Calls</SelectItem>
                  <SelectItem value="email">Emails</SelectItem>
                  <SelectItem value="text">Texts</SelectItem>
                  <SelectItem value="meeting">Meetings</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Outcome" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All outcomes</SelectItem>
                  <SelectItem value="Positive">Positive</SelectItem>
                  <SelectItem value="Neutral">Neutral</SelectItem>
                  <SelectItem value="Negative">Negative</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Lead Name</TableHead>
                <TableHead>Task Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Completed On</TableHead>
                <TableHead>Completed By</TableHead>
                <TableHead>Outcome</TableHead>
                <TableHead>Follow-up</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.leadName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {getTaskTypeIcon(task.taskType)}
                      <span className="capitalize">{task.taskType}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate" title={task.description}>
                    {task.description}
                  </TableCell>
                  <TableCell>{format(new Date(task.completedAt), 'MMM d, yyyy')}</TableCell>
                  <TableCell>{task.completedBy}</TableCell>
                  <TableCell>{getOutcomeBadge(task.outcome)}</TableCell>
                  <TableCell>
                    {task.followUpCreated ? (
                      <Badge variant="outline" className="bg-blue-50 text-blue-800 hover:bg-blue-50">
                        Created
                      </Badge>
                    ) : (
                      <Badge variant="outline">None</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <div className="p-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>1</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">2</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">3</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default CompletedTasks;
