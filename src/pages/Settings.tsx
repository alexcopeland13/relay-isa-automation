
import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AiServiceConfig } from '@/components/ai-integration/AiServiceConfig';
import { ConversationBehaviorConfig } from '@/components/ai-integration/ConversationBehaviorConfig';
import { FollowUpRulesConfig } from '@/components/ai-integration/FollowUpRulesConfig';
import { AiMonitoringDashboard } from '@/components/ai-integration/AiMonitoringDashboard';
import { ConversationSimulator } from '@/components/ai-integration/ConversationSimulator';
import { Badge } from '@/components/ui/badge';
import { Server, MessageSquare, CalendarClock, Activity, Gauge, TestTube2 } from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <PageLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure the AI system and application preferences.</p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-6 w-full mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="ai-services" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            AI Services
            <Badge variant="secondary" className="ml-1">New</Badge>
          </TabsTrigger>
          <TabsTrigger value="conversation" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Conversation
          </TabsTrigger>
          <TabsTrigger value="follow-up" className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4" />
            Follow-ups
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Gauge className="h-4 w-4" />
            Monitoring
            <Badge variant="secondary" className="ml-1">New</Badge>
          </TabsTrigger>
          <TabsTrigger value="simulator" className="flex items-center gap-2">
            <TestTube2 className="h-4 w-4" />
            Simulator
            <Badge variant="secondary" className="ml-1">New</Badge>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="mt-0">
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex justify-center items-center h-64 text-muted-foreground">
              <p>General configuration interface will be implemented in the next phase.</p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="ai-services" className="mt-0">
          <AiServiceConfig />
        </TabsContent>
        
        <TabsContent value="conversation" className="mt-0">
          <ConversationBehaviorConfig />
        </TabsContent>
        
        <TabsContent value="follow-up" className="mt-0">
          <FollowUpRulesConfig />
        </TabsContent>

        <TabsContent value="monitoring" className="mt-0">
          <AiMonitoringDashboard />
        </TabsContent>

        <TabsContent value="simulator" className="mt-0">
          <ConversationSimulator />
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

export default Settings;
