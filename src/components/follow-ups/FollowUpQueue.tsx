import { useState, useEffect } from 'react';
import { format, parseISO, isPast } from 'date-fns';
import { FollowUp, sampleTemplates } from '@/data/sampleFollowUpData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Calendar as CalendarIcon,
  Clock,
  Mail,
  Phone,
  MessageSquare,
  User,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  ArrowRight,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FollowUpEditor } from '@/components/follow-ups/FollowUpEditor';

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
  const { toast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState<FollowUp['status']>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isApprovingAll, setIsApprovingAll] = useState(false);
  const [isRejectingAll, setIsRejectingAll] = useState(false);
  const [editingFollowUp, setEditingFollowUp] = useState<FollowUp | null>(null);

  const filteredFollowUps = followUps.filter(followUp => {
    const searchTerm = searchQuery.toLowerCase();
    const leadName = followUp.leadInfo.name.toLowerCase();
    const leadEmail = followUp.leadInfo.email.toLowerCase();
    
    return (
      (selectedStatus === 'all' || followUp.status === selectedStatus) &&
      (searchTerm === '' || leadName.includes(searchTerm) || leadEmail.includes(searchTerm))
    );
  });

  const sortedFollowUps = [...filteredFollowUps].sort((a, b) => {
    const dateA = parseISO(a.scheduledFor);
    const dateB = parseISO(b.scheduledFor);
    
    return sortOrder === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
  });

  const handleApproveAll = async () => {
    setIsApprovingAll(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Approve all follow-ups with the selected status
      filteredFollowUps.forEach(followUp => {
        onStatusChange(followUp.id, 'approved');
      });
      
      toast({
        title: "Follow-ups Approved",
        description: "All follow-ups have been approved successfully.",
      });
    } catch (error) {
      console.error("Error approving follow-ups:", error);
      toast({
        title: "Approval Failed",
        description: "There was a problem approving the follow-ups. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsApprovingAll(false);
    }
  };

  const handleRejectAll = async () => {
    setIsRejectingAll(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reject all follow-ups with the selected status
      filteredFollowUps.forEach(followUp => {
        onStatusChange(followUp.id, 'declined');
      });
      
      toast({
        title: "Follow-ups Rejected",
        description: "All follow-ups have been rejected successfully.",
      });
    } catch (error) {
      console.error("Error rejecting follow-ups:", error);
      toast({
        title: "Rejection Failed",
        description: "There was a problem rejecting the follow-ups. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRejectingAll(false);
    }
  };

  const handleStatusChange = (followUpId: string, newStatus: FollowUp['status']) => {
    onStatusChange(followUpId, newStatus);
  };

  const handleEdit = (followUp: FollowUp) => {
    setEditingFollowUp(followUp);
  };

  const handleSave = (updatedFollowUp: FollowUp) => {
    // Simulate API call delay
    setTimeout(() => {
      // Update the follow-up in the list
      onEditFollowUp(updatedFollowUp);
      
      toast({
        title: "Follow-up Updated",
        description: "The follow-up has been updated successfully.",
      });
    }, 500);
    
    setEditingFollowUp(null);
  };

  const handleCancel = () => {
    setEditingFollowUp(null);
  };

  const handleDelete = (followUpId: string) => {
    onDeleteFollowUp(followUpId);
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'phone':
        return <Phone className="h-4 w-4" />;
      case 'sms':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'declined':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'scheduled':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-amber-500';
      case 'low':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  const getTemplatePerformance = (templateId: string) => {
    const template = sampleTemplates.find(t => t.id === templateId);
    
    if (template && template.performanceMetrics) {
      const { openRate, clickRate, responseRate } = template.performanceMetrics;
      return { openRate, clickRate, responseRate };
    }
    
    return { openRate: 0, clickRate: 0, responseRate: 0 };
  };

  return (
    <div className="space-y-4">
      {editingFollowUp ? (
        <FollowUpEditor
          followUp={editingFollowUp}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      ) : (
        <>
          <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2 md:items-center md:justify-between">
            <div className="relative w-full md:max-w-md">
              <Input
                placeholder="Search leads by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                Sort by Date ({sortOrder === 'asc' ? 'Asc' : 'Desc'})
              </Button>
              
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleRejectAll}
                disabled={isRejectingAll || filteredFollowUps.length === 0}
              >
                {isRejectingAll ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Rejecting All...
                  </>
                ) : (
                  <>
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject All
                  </>
                )}
              </Button>
              
              <Button 
                variant="default" 
                size="sm"
                onClick={handleApproveAll}
                disabled={isApprovingAll || filteredFollowUps.length === 0}
              >
                {isApprovingAll ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Approving All...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve All
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[20%]">Lead</TableHead>
                  <TableHead className="w-[20%]">Details</TableHead>
                  <TableHead className="w-[15%]">Schedule</TableHead>
                  <TableHead className="w-[15%]">Template Performance</TableHead>
                  <TableHead className="w-[15%]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedFollowUps.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No follow-ups found matching your filters. Try adjusting your search criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedFollowUps.map((followUp) => {
                    const { openRate, clickRate, responseRate } = getTemplatePerformance(followUp.suggestedTemplate);
                    
                    // Ensure mail.opened and mail.sent are numbers before division
                    const openRateDisplay = openRate !== 0 ? Number(openRate) : 0;
                    const clickRateDisplay = clickRate !== 0 ? Number(clickRate) : 0;
                    const responseRateDisplay = responseRate !== 0 ? Number(responseRate) : 0;
                    
                    return (
                      <TableRow key={followUp.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Avatar>
                              <AvatarImage src="https://github.com/shadcn.png" alt={followUp.leadInfo.name} />
                              <AvatarFallback>{followUp.leadInfo.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{followUp.leadInfo.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {followUp.leadInfo.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              {getChannelIcon(followUp.channel)}
                              <span className="font-medium">{followUp.channel}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              <span className="font-medium">Priority:</span>
                              <span className={`ml-1 ${getPriorityColor(followUp.priority)}`}>
                                {followUp.priority}
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              <span className="font-medium">Status:</span>
                              <Badge variant="outline" className={getStatusColor(followUp.status)}>
                                {followUp.status}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground flex items-start gap-1.5">
                              <AlertTriangle className="h-3.5 w-3.5 mt-0.5" />
                              {followUp.aiReasoning}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                              <span>{format(parseISO(followUp.scheduledFor), 'MMMM d, yyyy')}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{format(parseISO(followUp.scheduledFor), 'h:mm a')}</span>
                            </div>
                            {isPast(parseISO(followUp.scheduledFor)) && followUp.status === 'pending' && (
                              <Badge variant="destructive" className="text-xs">
                                Overdue
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">
                              <span className="font-medium">Open Rate:</span> {openRateDisplay}%
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">Click Rate:</span> {clickRateDisplay}%
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">Response Rate:</span> {responseRateDisplay}%
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleStatusChange(followUp.id, 'approved')}>
                                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(followUp.id, 'declined')}>
                                  <XCircle className="h-4 w-4 mr-2 text-red-500" />
                                  Reject
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEdit(followUp)}>
                                  <User className="h-4 w-4 mr-2" />
                                  Edit Follow-up
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDelete(followUp.id)}>
                                  <XCircle className="h-4 w-4 mr-2 text-red-500" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
};
