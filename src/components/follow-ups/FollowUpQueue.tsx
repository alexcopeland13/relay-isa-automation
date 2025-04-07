
import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { FollowUp } from '@/data/sampleFollowUpData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Mail, 
  Phone, 
  MessageSquare, 
  Calendar, 
  Clock, 
  Filter, 
  User, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  X, 
  Edit,
  AlertTriangle,
  ArrowUpDown
} from 'lucide-react';
import { FollowUpEditor } from './FollowUpEditor';

interface FollowUpQueueProps {
  followUps: FollowUp[];
}

export const FollowUpQueue = ({ followUps: initialFollowUps }: FollowUpQueueProps) => {
  const [followUps, setFollowUps] = useState(initialFollowUps);
  const [selectedFollowUps, setSelectedFollowUps] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [editingFollowUp, setEditingFollowUp] = useState<FollowUp | null>(null);
  
  const { toast } = useToast();

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const handleStatusChange = (followUpId: string, newStatus: FollowUp['status']) => {
    setFollowUps(followUps.map(followUp => 
      followUp.id === followUpId 
        ? { ...followUp, status: newStatus }
        : followUp
    ));

    toast({
      title: `Follow-up ${newStatus === 'approved' ? 'approved' : newStatus === 'declined' ? 'declined' : 'updated'}`,
      description: `The follow-up has been ${newStatus}`,
      duration: 3000,
    });
  };
  
  const handleBulkAction = (action: 'approve' | 'decline') => {
    setFollowUps(followUps.map(followUp => 
      selectedFollowUps.includes(followUp.id) 
        ? { ...followUp, status: action === 'approve' ? 'approved' : 'declined' }
        : followUp
    ));
    
    toast({
      title: `${selectedFollowUps.length} follow-ups ${action === 'approve' ? 'approved' : 'declined'}`,
      description: `Successfully ${action === 'approve' ? 'approved' : 'declined'} multiple follow-ups`,
      duration: 3000,
    });
    
    setSelectedFollowUps([]);
  };
  
  const toggleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedFollowUps(filteredFollowUps.map(f => f.id));
    } else {
      setSelectedFollowUps([]);
    }
  };
  
  const toggleFollowUpSelection = (followUpId: string) => {
    if (selectedFollowUps.includes(followUpId)) {
      setSelectedFollowUps(selectedFollowUps.filter(id => id !== followUpId));
    } else {
      setSelectedFollowUps([...selectedFollowUps, followUpId]);
    }
  };
  
  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <Mail className="h-4 w-4 text-blue-500" />;
      case 'phone':
        return <Phone className="h-4 w-4 text-green-500" />;
      case 'sms':
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      default:
        return null;
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_approval':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Completed</Badge>;
      case 'declined':
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Declined</Badge>;
      default:
        return null;
    }
  };
  
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Low</Badge>;
      default:
        return null;
    }
  };
  
  const filteredFollowUps = followUps.filter(followUp => {
    const matchesSearch = 
      followUp.leadInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      followUp.suggestedContent.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || followUp.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || followUp.priority === priorityFilter;
    const matchesChannel = channelFilter === 'all' || followUp.channel === channelFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesChannel;
  }).sort((a, b) => {
    if (sortBy === 'date') {
      return sortDirection === 'asc' 
        ? new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime()
        : new Date(b.scheduledFor).getTime() - new Date(a.scheduledFor).getTime();
    } else if (sortBy === 'priority') {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return sortDirection === 'asc'
        ? priorityOrder[a.priority] - priorityOrder[b.priority]
        : priorityOrder[b.priority] - priorityOrder[a.priority];
    } else if (sortBy === 'score') {
      return sortDirection === 'asc'
        ? a.leadInfo.qualificationScore - b.leadInfo.qualificationScore
        : b.leadInfo.qualificationScore - a.leadInfo.qualificationScore;
    }
    return 0;
  });
  
  return (
    <div className="space-y-4">
      {editingFollowUp ? (
        <FollowUpEditor 
          followUp={editingFollowUp} 
          onSave={(updatedFollowUp) => {
            setFollowUps(followUps.map(fu => 
              fu.id === updatedFollowUp.id ? updatedFollowUp : fu
            ));
            setEditingFollowUp(null);
            toast({
              title: "Follow-up updated",
              description: "Changes have been saved successfully",
              duration: 3000,
            });
          }}
          onCancel={() => setEditingFollowUp(null)}
        />
      ) : (
        <>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search leads or content..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-1" />
                Filters
                {showFilters ? 
                  <ChevronUp className="h-3 w-3 ml-1" /> : 
                  <ChevronDown className="h-3 w-3 ml-1" />
                }
              </Button>
              
              <Tabs 
                value={statusFilter} 
                onValueChange={setStatusFilter}
                className="hidden md:block"
              >
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="pending_approval">Pending</TabsTrigger>
                  <TabsTrigger value="approved">Approved</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="declined">Declined</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
          
          <Collapsible open={showFilters} className="mb-4">
            <CollapsibleContent>
              <div className="p-4 border rounded-md bg-muted/50 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Status</h4>
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <Checkbox 
                        id="status-all" 
                        checked={statusFilter === 'all'} 
                        onCheckedChange={() => setStatusFilter('all')} 
                      />
                      <label htmlFor="status-all" className="ml-2 text-sm">All</label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox 
                        id="status-pending" 
                        checked={statusFilter === 'pending_approval'} 
                        onCheckedChange={() => setStatusFilter('pending_approval')} 
                      />
                      <label htmlFor="status-pending" className="ml-2 text-sm">Pending</label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox 
                        id="status-approved" 
                        checked={statusFilter === 'approved'} 
                        onCheckedChange={() => setStatusFilter('approved')} 
                      />
                      <label htmlFor="status-approved" className="ml-2 text-sm">Approved</label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox 
                        id="status-completed" 
                        checked={statusFilter === 'completed'} 
                        onCheckedChange={() => setStatusFilter('completed')} 
                      />
                      <label htmlFor="status-completed" className="ml-2 text-sm">Completed</label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox 
                        id="status-declined" 
                        checked={statusFilter === 'declined'} 
                        onCheckedChange={() => setStatusFilter('declined')} 
                      />
                      <label htmlFor="status-declined" className="ml-2 text-sm">Declined</label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Priority</h4>
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <Checkbox 
                        id="priority-all" 
                        checked={priorityFilter === 'all'} 
                        onCheckedChange={() => setPriorityFilter('all')} 
                      />
                      <label htmlFor="priority-all" className="ml-2 text-sm">All</label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox 
                        id="priority-high" 
                        checked={priorityFilter === 'high'} 
                        onCheckedChange={() => setPriorityFilter('high')} 
                      />
                      <label htmlFor="priority-high" className="ml-2 text-sm">High</label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox 
                        id="priority-medium" 
                        checked={priorityFilter === 'medium'} 
                        onCheckedChange={() => setPriorityFilter('medium')} 
                      />
                      <label htmlFor="priority-medium" className="ml-2 text-sm">Medium</label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox 
                        id="priority-low" 
                        checked={priorityFilter === 'low'} 
                        onCheckedChange={() => setPriorityFilter('low')} 
                      />
                      <label htmlFor="priority-low" className="ml-2 text-sm">Low</label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Channel</h4>
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <Checkbox 
                        id="channel-all" 
                        checked={channelFilter === 'all'} 
                        onCheckedChange={() => setChannelFilter('all')} 
                      />
                      <label htmlFor="channel-all" className="ml-2 text-sm">All</label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox 
                        id="channel-email" 
                        checked={channelFilter === 'email'} 
                        onCheckedChange={() => setChannelFilter('email')} 
                      />
                      <label htmlFor="channel-email" className="ml-2 text-sm">Email</label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox 
                        id="channel-phone" 
                        checked={channelFilter === 'phone'} 
                        onCheckedChange={() => setChannelFilter('phone')} 
                      />
                      <label htmlFor="channel-phone" className="ml-2 text-sm">Phone</label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox 
                        id="channel-sms" 
                        checked={channelFilter === 'sms'} 
                        onCheckedChange={() => setChannelFilter('sms')} 
                      />
                      <label htmlFor="channel-sms" className="ml-2 text-sm">SMS</label>
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
          
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Follow-up Queue</CardTitle>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleSort('date')}
                  >
                    <Calendar className="h-4 w-4 mr-1" />
                    Date
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleSort('priority')}
                  >
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Priority
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleSort('score')}
                  >
                    <User className="h-4 w-4 mr-1" />
                    Score
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredFollowUps.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center p-6">
                  <div className="rounded-full bg-muted p-3 mb-3">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <h3 className="font-medium text-lg mb-1">No follow-ups found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your filters or search parameters
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedFollowUps.length > 0 && (
                    <div className="flex items-center justify-between bg-muted p-2 rounded">
                      <span className="text-sm font-medium">
                        {selectedFollowUps.length} follow-ups selected
                      </span>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-red-500 border-red-200 hover:bg-red-50"
                          onClick={() => handleBulkAction('decline')}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Decline All
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleBulkAction('approve')}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve All
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <div className="border rounded-md">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">
                            <Checkbox 
                              id="select-all" 
                              checked={
                                filteredFollowUps.length > 0 && 
                                selectedFollowUps.length === filteredFollowUps.length
                              }
                              onCheckedChange={toggleSelectAll}
                            />
                          </th>
                          <th className="text-left p-2 font-medium text-sm">Lead</th>
                          <th className="text-left p-2 font-medium text-sm">Channel</th>
                          <th className="text-left p-2 font-medium text-sm">Scheduled</th>
                          <th className="text-left p-2 font-medium text-sm">Priority</th>
                          <th className="text-left p-2 font-medium text-sm">Status</th>
                          <th className="text-right p-2 font-medium text-sm">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {filteredFollowUps.map((followUp) => (
                          <tr 
                            key={followUp.id}
                            className="hover:bg-muted/50"
                          >
                            <td className="p-2">
                              <Checkbox 
                                id={`select-${followUp.id}`} 
                                checked={selectedFollowUps.includes(followUp.id)}
                                onCheckedChange={() => toggleFollowUpSelection(followUp.id)}
                              />
                            </td>
                            <td className="p-2">
                              <div>
                                <div className="font-medium">{followUp.leadInfo.name}</div>
                                <div className="text-xs text-muted-foreground">{followUp.leadInfo.interestType}</div>
                              </div>
                            </td>
                            <td className="p-2">
                              <div className="flex items-center">
                                {getChannelIcon(followUp.channel)}
                                <span className="ml-1 capitalize">{followUp.channel}</span>
                              </div>
                            </td>
                            <td className="p-2">
                              <div className="flex flex-col">
                                <span className="text-sm">
                                  {format(parseISO(followUp.scheduledFor), 'MMM d, yyyy')}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {format(parseISO(followUp.scheduledFor), 'h:mm a')}
                                </span>
                              </div>
                            </td>
                            <td className="p-2">
                              {getPriorityBadge(followUp.priority)}
                            </td>
                            <td className="p-2">
                              {getStatusBadge(followUp.status)}
                            </td>
                            <td className="p-2 text-right">
                              <div className="flex items-center justify-end gap-1">
                                {followUp.status === 'pending_approval' && (
                                  <>
                                    <Button 
                                      size="icon" 
                                      variant="ghost" 
                                      className="h-8 w-8"
                                      onClick={() => setEditingFollowUp(followUp)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      size="icon" 
                                      variant="ghost" 
                                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                      onClick={() => handleStatusChange(followUp.id, 'declined')}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      size="icon" 
                                      variant="ghost" 
                                      className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                      onClick={() => handleStatusChange(followUp.id, 'approved')}
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                                {followUp.status !== 'pending_approval' && (
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={() => handleStatusChange(followUp.id, 'pending_approval')}
                                  >
                                    Reset
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
