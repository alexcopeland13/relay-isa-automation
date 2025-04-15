
import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FollowUpQueue } from '@/components/follow-ups/FollowUpQueue';
import { FollowUpCalendar } from '@/components/follow-ups/FollowUpCalendar';
import { TemplateLibrary } from '@/components/follow-ups/TemplateLibrary';
import { PerformanceMetrics } from '@/components/follow-ups/PerformanceMetrics';
import { SequenceBuilder } from '@/components/follow-ups/SequenceBuilder';
import { sampleTemplates, sampleSequences, sampleFollowUps, FollowUp } from '@/data/sampleFollowUpData';
import { useToast } from '@/hooks/use-toast';

const FollowUps = () => {
  const [activeTab, setActiveTab] = useState('queue');
  const [followUps, setFollowUps] = useState(sampleFollowUps);
  const { toast } = useToast();

  const handleStatusChange = (followUpId: string, newStatus: FollowUp['status']) => {
    setFollowUps(prevFollowUps => 
      prevFollowUps.map(followUp => 
        followUp.id === followUpId ? { ...followUp, status: newStatus } : followUp
      )
    );
    
    toast({
      title: "Status updated",
      description: `Follow-up status has been updated to ${newStatus}`,
    });
  };

  const handleEditFollowUp = (updatedFollowUp: FollowUp) => {
    setFollowUps(prevFollowUps => 
      prevFollowUps.map(followUp => 
        followUp.id === updatedFollowUp.id ? updatedFollowUp : followUp
      )
    );
    
    toast({
      title: "Follow-up updated",
      description: "The follow-up has been updated successfully",
    });
  };

  const handleDeleteFollowUp = (followUpId: string) => {
    setFollowUps(prevFollowUps => 
      prevFollowUps.filter(followUp => followUp.id !== followUpId)
    );
    
    toast({
      title: "Follow-up deleted",
      description: "The follow-up has been deleted successfully",
    });
  };

  return (
    <PageLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Follow-up Management</h1>
        <p className="text-muted-foreground mt-1">Review, manage, and optimize AI-suggested follow-ups</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 w-full mb-6">
          <TabsTrigger value="queue">Queue</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="sequences">Sequences</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="mt-0">
          <FollowUpQueue 
            followUps={followUps}
            onStatusChange={handleStatusChange}
            onEditFollowUp={handleEditFollowUp}
            onDeleteFollowUp={handleDeleteFollowUp}
          />
        </TabsContent>

        <TabsContent value="calendar" className="mt-0">
          <FollowUpCalendar followUps={followUps} />
        </TabsContent>

        <TabsContent value="templates" className="mt-0">
          <TemplateLibrary templates={sampleTemplates} />
        </TabsContent>

        <TabsContent value="sequences" className="mt-0">
          <SequenceBuilder sequences={sampleSequences} />
        </TabsContent>

        <TabsContent value="performance" className="mt-0">
          <PerformanceMetrics 
            followUps={followUps} 
            templates={sampleTemplates} 
            sequences={sampleSequences}
          />
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

export default FollowUps;
