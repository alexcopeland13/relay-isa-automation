
import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SuggestedAction } from '@/data/sampleConversation';
import { 
  Mail, 
  Calendar, 
  Clock, 
  PhoneCall, 
  UserCheck, 
  Edit, 
  Check, 
  X, 
  FileText,
  MessageSquare,
  PenSquare,
  AlertTriangle
} from 'lucide-react';

interface ActionReviewProps {
  suggestedActions: SuggestedAction[];
}

export const ActionReview = ({ suggestedActions }: ActionReviewProps) => {
  const [actions, setActions] = useState(suggestedActions);
  const [editingAction, setEditingAction] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  
  const getActionIcon = (type: string) => {
    switch (type) {
      case 'follow_up':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'task':
        return <PenSquare className="h-5 w-5 text-purple-500" />;
      case 'call':
        return <PhoneCall className="h-5 w-5 text-green-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const getChannelIcon = (channel?: string) => {
    if (!channel) return null;
    
    switch (channel) {
      case 'Email':
        return <Mail className="h-4 w-4 text-blue-500" />;
      case 'Call':
        return <PhoneCall className="h-4 w-4 text-green-500" />;
      case 'Text':
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      default:
        return null;
    }
  };
  
  const handleUpdateAction = (index: number, updates: Partial<SuggestedAction>) => {
    const newActions = [...actions];
    newActions[index] = { ...newActions[index], ...updates };
    setActions(newActions);
    setEditingAction(null);
  };
  
  const handleApproveAction = (index: number) => {
    handleUpdateAction(index, { status: 'Approved' });
  };
  
  const handleRejectAction = (index: number) => {
    handleUpdateAction(index, { status: 'Rejected' });
  };
  
  const filteredActions = actions.filter(action => {
    if (filter === 'all') return true;
    if (filter === 'pending') return action.status === 'Pending Approval';
    if (filter === 'approved') return action.status === 'Approved';
    if (filter === 'rejected') return action.status === 'Rejected';
    return true;
  });
  
  return (
    <div className="p-6 h-[600px] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold">AI Suggested Actions</h2>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="grid grid-cols-1 gap-4 overflow-y-auto">
        {filteredActions.length === 0 ? (
          <div className="flex items-center justify-center h-32 border border-dashed border-border rounded-lg">
            <p className="text-muted-foreground">No actions found</p>
          </div>
        ) : (
          filteredActions.map((action, index) => (
            <Card key={index} className={`
              border-l-4 
              ${action.status === 'Approved' ? 'border-l-green-500' : 
                action.status === 'Rejected' ? 'border-l-red-500' : 
                'border-l-amber-500'}
            `}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {getActionIcon(action.type)}
                    <CardTitle className="text-base">{action.type === 'follow_up' ? 'Follow-up' : action.type === 'task' ? 'Task' : action.type}</CardTitle>
                    {action.channel && (
                      <div className="flex items-center bg-secondary text-xs rounded-full px-2 py-0.5">
                        {getChannelIcon(action.channel)}
                        <span className="ml-1">{action.channel}</span>
                      </div>
                    )}
                    {action.priority && (
                      <div className={`
                        text-xs rounded-full px-2 py-0.5
                        ${action.priority === 'High' ? 'bg-red-100 text-red-800' : 
                          action.priority === 'Medium' ? 'bg-amber-100 text-amber-800' : 
                          'bg-blue-100 text-blue-800'}
                      `}>
                        {action.priority}
                      </div>
                    )}
                  </div>
                  
                  <div className={`
                    text-xs font-medium px-2 py-1 rounded-full
                    ${action.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                      action.status === 'Rejected' ? 'bg-red-100 text-red-800' : 
                      'bg-amber-100 text-amber-800'}
                  `}>
                    {action.status}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {editingAction === `${index}` ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Content</label>
                      <Textarea 
                        value={action.content}
                        onChange={(e) => {
                          const newActions = [...actions];
                          newActions[index] = { ...newActions[index], content: e.target.value };
                          setActions(newActions);
                        }}
                        className="resize-none"
                      />
                    </div>
                    
                    {action.scheduledFor && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Date</label>
                          <Input 
                            type="date"
                            value={format(parseISO(action.scheduledFor), 'yyyy-MM-dd')}
                            onChange={(e) => {
                              const date = e.target.value;
                              const time = format(parseISO(action.scheduledFor), 'HH:mm:ss');
                              const newDateTime = `${date}T${time}Z`;
                              
                              const newActions = [...actions];
                              newActions[index] = { ...newActions[index], scheduledFor: newDateTime };
                              setActions(newActions);
                            }}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Time</label>
                          <Input 
                            type="time"
                            value={format(parseISO(action.scheduledFor), 'HH:mm')}
                            onChange={(e) => {
                              const date = format(parseISO(action.scheduledFor), 'yyyy-MM-dd');
                              const time = e.target.value + ':00';
                              const newDateTime = `${date}T${time}Z`;
                              
                              const newActions = [...actions];
                              newActions[index] = { ...newActions[index], scheduledFor: newDateTime };
                              setActions(newActions);
                            }}
                          />
                        </div>
                      </div>
                    )}
                    
                    {action.assignedTo && (
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Assigned To</label>
                        <Input 
                          value={action.assignedTo}
                          onChange={(e) => {
                            const newActions = [...actions];
                            newActions[index] = { ...newActions[index], assignedTo: e.target.value };
                            setActions(newActions);
                          }}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <p className="text-sm mb-3">{action.content}</p>
                    
                    <div className="text-xs space-y-2">
                      {action.scheduledFor && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{format(parseISO(action.scheduledFor), 'MMMM d, yyyy')}</span>
                          <Clock className="h-3.5 w-3.5 ml-1.5" />
                          <span>{format(parseISO(action.scheduledFor), 'h:mm a')}</span>
                        </div>
                      )}
                      
                      {action.assignedTo && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <UserCheck className="h-3.5 w-3.5" />
                          <span>Assigned to: {action.assignedTo}</span>
                        </div>
                      )}
                      
                      <div className="pt-1 border-t border-border mt-2">
                        <div className="flex items-start gap-1.5">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5" />
                          <span className="text-muted-foreground">Reasoning: {action.reasoning}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
              
              <CardFooter className="flex justify-end gap-2">
                {editingAction === `${index}` ? (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setEditingAction(null)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => setEditingAction(null)}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                  </>
                ) : (
                  <>
                    {action.status === 'Pending Approval' && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setEditingAction(`${index}`)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleRejectAction(index)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleApproveAction(index)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      </>
                    )}
                    
                    {action.status !== 'Pending Approval' && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            const newActions = [...actions];
                            newActions[index] = { ...newActions[index], status: 'Pending Approval' };
                            setActions(newActions);
                          }}
                        >
                          Reset Status
                        </Button>
                      </>
                    )}
                  </>
                )}
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
