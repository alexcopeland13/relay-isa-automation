
import { useState } from 'react';
import { format, parseISO, isAfter, isBefore, startOfToday, startOfTomorrow, addDays } from 'date-fns';
import { FollowUp } from '@/data/sampleFollowUpData';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Mail, 
  Phone, 
  MessageSquare, 
  Search, 
  UserPlus, 
  Check, 
  X, 
  Edit, 
  Trash2, 
  Clock, 
  Filter, 
  ChevronDown,
  Calendar,
  ArrowUpDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FollowUpQueueProps {
  followUps: FollowUp[];
  onStatusChange: (followUpId: string, newStatus: FollowUp['status']) => void;
  onEditFollowUp: (followUp: FollowUp) => void;
  onDeleteFollowUp: (followUpId: string) => void;
}

export const FollowUpQueue = ({ 
  followUps, 
  onStatusChange, 
  onEditFollowUp, 
  onDeleteFollowUp 
}: FollowUpQueueProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<FollowUp['status'] | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<FollowUp['priority'] | 'all'>('all');
  const [channelFilter, setChannelFilter] = useState<FollowUp['channel'] | 'all'>('all');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'scheduledFor',
    direction: 'asc'
  });

  // Filter follow-ups based on search term and filters
  const filteredFollowUps = followUps.filter(followUp => {
    const matchesSearch = 
      followUp.leadInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      followUp.leadInfo.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      followUp.leadInfo.interestType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      followUp.suggestedContent.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || followUp.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || followUp.priority === priorityFilter;
    const matchesChannel = channelFilter === 'all' || followUp.channel === channelFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesChannel;
  });

  // Sort follow-ups
  const sortedFollowUps = [...filteredFollowUps].sort((a, b) => {
    if (sortConfig.key === 'scheduledFor') {
      const dateA = new Date(a.scheduledFor).getTime();
      const dateB = new Date(b.scheduledFor).getTime();
      return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
    }
    
    if (sortConfig.key === 'priority') {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const orderA = priorityOrder[a.priority as keyof typeof priorityOrder];
      const orderB = priorityOrder[b.priority as keyof typeof priorityOrder];
      return sortConfig.direction === 'asc' ? orderA - orderB : orderB - orderA;
    }
    
    if (sortConfig.key === 'leadName') {
      const nameA = a.leadInfo.name.toLowerCase();
      const nameB = b.leadInfo.name.toLowerCase();
      if (nameA < nameB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (nameA > nameB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    }
    
    return 0;
  });

  const handleSort = (key: string) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const getChannelIcon = (channel: FollowUp['channel']) => {
    switch (channel) {
      case 'email':
        return <Mail className="h-4 w-4 text-blue-500" />;
      case 'phone':
        return <Phone className="h-4 w-4 text-green-500" />;
      case 'sms':
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
    }
  };

  const getStatusBadge = (status: FollowUp['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Approved</Badge>;
      case 'scheduled':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">Scheduled</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Completed</Badge>;
      case 'declined':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Declined</Badge>;
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: FollowUp['priority']) => {
    switch (priority) {
      case 'high':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Low</Badge>;
      default:
        return null;
    }
  };

  const getRelativeTimeLabel = (dateStr: string) => {
    const today = startOfToday();
    const tomorrow = startOfTomorrow();
    const date = parseISO(dateStr);
    
    if (isBefore(date, today)) {
      return <Badge variant="destructive">Overdue</Badge>;
    } else if (isBefore(date, tomorrow)) {
      return <Badge>Today</Badge>;
    } else if (isBefore(date, addDays(today, 2))) {
      return <Badge>Tomorrow</Badge>;
    } else if (isBefore(date, addDays(today, 7))) {
      return <Badge variant="outline">This Week</Badge>;
    } else {
      return <Badge variant="secondary">{format(date, 'MMM d')}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-2 lg:space-y-0">
          <CardTitle className="text-xl">Follow-up Queue</CardTitle>
          
          <div className="flex items-center space-x-2">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search follow-ups..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <Filter className="h-4 w-4 mr-1" />
                  Filter
                  <ChevronDown className="h-3.5 w-3.5 ml-1 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filter By</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <div className="p-2">
                  <p className="text-xs font-medium mb-1">Status</p>
                  <Select 
                    value={statusFilter} 
                    onValueChange={(value: typeof statusFilter) => setStatusFilter(value)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="declined">Declined</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="p-2">
                  <p className="text-xs font-medium mb-1">Priority</p>
                  <Select 
                    value={priorityFilter} 
                    onValueChange={(value: typeof priorityFilter) => setPriorityFilter(value)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="p-2">
                  <p className="text-xs font-medium mb-1">Channel</p>
                  <Select 
                    value={channelFilter} 
                    onValueChange={(value: typeof channelFilter) => setChannelFilter(value)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select channel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Channels</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead className="w-[250px]">
                  <div 
                    className="flex items-center cursor-pointer"
                    onClick={() => handleSort('leadName')}
                  >
                    Lead
                    <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                  </div>
                </TableHead>
                <TableHead>Details</TableHead>
                <TableHead>
                  <div 
                    className="flex items-center cursor-pointer"
                    onClick={() => handleSort('scheduledFor')}
                  >
                    Scheduled For
                    <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                  </div>
                </TableHead>
                <TableHead>
                  <div 
                    className="flex items-center cursor-pointer"
                    onClick={() => handleSort('priority')}
                  >
                    Priority
                    <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                  </div>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedFollowUps.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No follow-ups match your filters
                  </TableCell>
                </TableRow>
              ) : (
                sortedFollowUps.map((followUp) => (
                  <TableRow key={followUp.id}>
                    <TableCell className="w-12">
                      <div className="flex justify-center">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div>
                                {getChannelIcon(followUp.channel)}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{followUp.channel === 'email' ? 'Email' : 
                                  followUp.channel === 'phone' ? 'Phone Call' : 
                                  'SMS Message'}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{followUp.leadInfo.name}</div>
                      <div className="text-sm text-muted-foreground">{followUp.leadInfo.email}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <span className="font-medium">{followUp.leadInfo.interestType}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {followUp.suggestedContent.substring(0, 60)}...
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="text-sm mb-1">
                          {format(parseISO(followUp.scheduledFor), 'MMM d, yyyy')}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {format(parseISO(followUp.scheduledFor), 'h:mm a')}
                          </span>
                          <div className="ml-auto">
                            {getRelativeTimeLabel(followUp.scheduledFor)}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getPriorityBadge(followUp.priority)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(followUp.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center space-x-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => onEditFollowUp(followUp)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            
                            {followUp.status === 'pending' && (
                              <DropdownMenuItem onClick={() => onStatusChange(followUp.id, 'approved')}>
                                <Check className="h-4 w-4 mr-2 text-green-500" />
                                Approve
                              </DropdownMenuItem>
                            )}
                            
                            {(followUp.status === 'pending' || followUp.status === 'approved') && (
                              <DropdownMenuItem onClick={() => onStatusChange(followUp.id, 'scheduled')}>
                                <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                                Mark as Scheduled
                              </DropdownMenuItem>
                            )}
                            
                            {followUp.status !== 'completed' && (
                              <DropdownMenuItem onClick={() => onStatusChange(followUp.id, 'completed')}>
                                <Check className="h-4 w-4 mr-2 text-green-500" />
                                Mark as Completed
                              </DropdownMenuItem>
                            )}
                            
                            {followUp.status === 'pending' && (
                              <DropdownMenuItem onClick={() => onStatusChange(followUp.id, 'declined')}>
                                <X className="h-4 w-4 mr-2 text-red-500" />
                                Decline
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuItem 
                              className="text-red-600" 
                              onClick={() => onDeleteFollowUp(followUp.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
