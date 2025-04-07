
import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FollowUpQueue } from '@/components/follow-ups/FollowUpQueue';
import { FollowUpCalendar } from '@/components/follow-ups/FollowUpCalendar';
import { TemplateLibrary } from '@/components/follow-ups/TemplateLibrary';
import { PerformanceMetrics } from '@/components/follow-ups/PerformanceMetrics';
import { SequenceBuilder } from '@/components/follow-ups/SequenceBuilder';
import { sampleFollowUps, sampleTemplates, sampleSequences } from '@/data/sampleFollowUpData';

const FollowUps = () => {
  const [activeTab, setActiveTab] = useState('queue');

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
          <FollowUpQueue followUps={sampleFollowUps} />
        </TabsContent>

        <TabsContent value="calendar" className="mt-0">
          <FollowUpCalendar followUps={sampleFollowUps} />
        </TabsContent>

        <TabsContent value="templates" className="mt-0">
          <TemplateLibrary templates={sampleTemplates} />
        </TabsContent>

        <TabsContent value="sequences" className="mt-0">
          <SequenceBuilder sequences={sampleSequences} />
        </TabsContent>

        <TabsContent value="performance" className="mt-0">
          <PerformanceMetrics 
            followUps={sampleFollowUps} 
            templates={sampleTemplates} 
            sequences={sampleSequences}
          />
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

export default FollowUps;
