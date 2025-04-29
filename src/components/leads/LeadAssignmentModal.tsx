import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Lead } from '@/types/lead';
import { Agent } from '@/types/agent';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { sampleAgentsData } from '@/data/sampleAgentsData';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const assignmentFormSchema = z.object({
  agentId: z.string().min(1, { message: 'Please select an agent' }),
  priority: z.string(),
  notes: z.string().optional(),
});

type AssignmentFormValues = z.infer<typeof assignmentFormSchema>;

interface LeadAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (leadId: string, agentId: string, data: { priority: string; notes: string }) => void;
  lead: Lead;
}

export function LeadAssignmentModal({ isOpen, onClose, onAssign, lead }: LeadAssignmentModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [recommendedAgents, setRecommendedAgents] = useState<Agent[]>([]);

  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentFormSchema),
    defaultValues: {
      agentId: '',
      priority: 'Medium',
      notes: '',
    },
  });

  useEffect(() => {
    setAgents(sampleAgentsData);

    const sortedAgents = [...sampleAgentsData].sort((a, b) => {
      let aScore = 0;
      let bScore = 0;

      if (a.specializations?.includes(lead.interestType)) aScore += 3;
      if (b.specializations?.includes(lead.interestType)) bScore += 3;

      const agentLocationA = a.location || '';
      const agentLocationB = b.location || '';
      const leadLocation = lead.location.split(',')[0] || '';

      if (agentLocationA.includes(leadLocation)) aScore += 2;
      if (agentLocationB.includes(leadLocation)) bScore += 2;

      if (a.availability === "High") aScore += 2;
      else if (a.availability === "Medium") aScore += 1;
      if (b.availability === "High") bScore += 2;
      else if (b.availability === "Medium") bScore += 1;

      return bScore - aScore;
    });

    setRecommendedAgents(sortedAgents.slice(0, 3));
  }, [lead]);

  const handleSubmit = async (values: AssignmentFormValues) => {
    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      onAssign(lead.id, values.agentId, {
        priority: values.priority,
        notes: values.notes || '',
      });

      const assignedAgent = agents.find(agent => agent.id === values.agentId);
      toast({
        title: 'Lead assigned successfully',
        description: `${lead.name} has been assigned to ${assignedAgent?.name}`,
      });

      onClose();
    } catch (error) {
      console.error('Error assigning lead:', error);
      toast({
        title: 'Error',
        description: 'There was a problem assigning the lead. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedAgentId = form.watch('agentId');
  const selectedAgent = agents.find(agent => agent.id === selectedAgentId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign Lead to Agent</DialogTitle>
          <DialogDescription>
            Select an agent to handle this lead. The system has recommended agents based on compatibility.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {recommendedAgents.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Recommended Agents</h3>
                <RadioGroup
                  onValueChange={value => form.setValue('agentId', value)}
                  className="space-y-2"
                >
                  {recommendedAgents.map(agent => (
                    <div
                      key={agent.id}
                      className="flex items-start space-x-3 border rounded-md p-3 hover:border-primary/50 transition-colors"
                    >
                      <RadioGroupItem value={agent.id} id={agent.id} className="mt-1" />
                      <div className="flex flex-1 gap-3">
                        <Avatar className="h-10 w-10">
                          {agent.photoUrl ? (
                            <img src={agent.photoUrl} alt={agent.name} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-medium">
                              {agent.name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                        </Avatar>
                        <div className="flex-1">
                          <label
                            htmlFor={agent.id}
                            className="text-sm font-medium block cursor-pointer"
                          >
                            {agent.name}
                          </label>
                          <p className="text-xs text-muted-foreground">{agent.title || 'Agent'}</p>
                          <div className="flex mt-1 gap-2">
                            {agent.specializations?.map((spec, index) => (
                              <span
                                key={index}
                                className="bg-secondary text-secondary-foreground text-xs px-1.5 py-0.5 rounded"
                              >
                                {spec}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-xs text-right">
                          <div className="font-medium">
                            {agent.activeLeads || 0} active leads
                          </div>
                          <div
                            className={`mt-1 px-2 py-0.5 rounded-full inline-block 
                              ${
                                agent.availability === 'High'
                                  ? 'bg-green-100 text-green-800'
                                  : agent.availability === 'Medium'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                          >
                            {agent.availability} availability
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            <div className="space-y-3">
              <h3 className="text-sm font-medium">All Agents</h3>
              <FormField
                control={form.control}
                name="agentId"
                render={({ field }) => (
                  <FormItem>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an agent" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {agents.map(agent => (
                          <SelectItem key={agent.id} value={agent.id}>
                            {agent.name} - {agent.title || 'Agent'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {selectedAgent && (
              <div className="p-3 border rounded-md bg-muted/50">
                <div className="flex items-center gap-3">
                  <Avatar>
                    {selectedAgent.photoUrl ? (
                      <img src={selectedAgent.photoUrl} alt={selectedAgent.name} />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </Avatar>
                  <div>
                    <h4 className="font-medium">{selectedAgent.name}</h4>
                    <p className="text-sm text-muted-foreground">{selectedAgent.email}</p>
                  </div>
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assignment Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any notes for the agent about this lead..."
                      className="h-20 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Assigning Lead...
                  </>
                ) : (
                  'Assign Lead'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
