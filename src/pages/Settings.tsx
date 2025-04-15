
import { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AiServiceConfig } from '@/components/ai-integration/AiServiceConfig';
import { ConversationBehaviorConfig } from '@/components/ai-integration/ConversationBehaviorConfig';
import { FollowUpRulesConfig } from '@/components/ai-integration/FollowUpRulesConfig';
import { AiMonitoringDashboard } from '@/components/ai-integration/AiMonitoringDashboard';
import { ConversationSimulator } from '@/components/ai-integration/ConversationSimulator';
import { GeneralSettings } from '@/components/settings/GeneralSettings';
import { CommunicationSettings } from '@/components/settings/CommunicationSettings';
import { IntegrationSettings } from '@/components/settings/IntegrationSettings';
import { ComplianceSettings } from '@/components/settings/ComplianceSettings';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { VoiceSettings } from '@/components/settings/VoiceSettings';
import { Badge } from '@/components/ui/badge';
import { 
  Server, 
  MessageSquare, 
  CalendarClock, 
  Activity, 
  Gauge, 
  TestTube2,
  Settings2,
  Headphones,
  Link,
  ShieldCheck,
  Bell,
  Mic
} from 'lucide-react';

const Settings = () => {
  // Load active tab from localStorage or default to 'general'
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem('settingsActiveTab');
    return savedTab || 'general';
  });

  // Save active tab to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('settingsActiveTab', activeTab);
  }, [activeTab]);

  return (
    <PageLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure the AI system and application preferences.</p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-12 w-full mb-6">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            <span className="hidden md:inline">General</span>
          </TabsTrigger>
          
          <TabsTrigger value="communication" className="flex items-center gap-2">
            <Headphones className="h-4 w-4" />
            <span className="hidden md:inline">Communication</span>
          </TabsTrigger>
          
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Link className="h-4 w-4" />
            <span className="hidden md:inline">Integrations</span>
          </TabsTrigger>
          
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            <span className="hidden md:inline">Compliance</span>
          </TabsTrigger>
          
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden md:inline">Notifications</span>
          </TabsTrigger>
          
          <TabsTrigger value="ai-services" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            <span className="hidden md:inline">AI Services</span>
            <Badge variant="secondary" className="ml-1 hidden lg:inline-flex">New</Badge>
          </TabsTrigger>
          
          <TabsTrigger value="conversation" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden md:inline">Conversation</span>
          </TabsTrigger>
          
          <TabsTrigger value="voice-settings" className="flex items-center gap-2">
            <Mic className="h-4 w-4" />
            <span className="hidden md:inline">Voice</span>
            <Badge variant="secondary" className="ml-1 hidden lg:inline-flex">New</Badge>
          </TabsTrigger>
          
          <TabsTrigger value="follow-up" className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4" />
            <span className="hidden md:inline">Follow-ups</span>
          </TabsTrigger>
          
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Gauge className="h-4 w-4" />
            <span className="hidden md:inline">Monitoring</span>
            <Badge variant="secondary" className="ml-1 hidden lg:inline-flex">New</Badge>
          </TabsTrigger>
          
          <TabsTrigger value="simulator" className="flex items-center gap-2">
            <TestTube2 className="h-4 w-4" />
            <span className="hidden md:inline">Simulator</span>
            <Badge variant="secondary" className="ml-1 hidden lg:inline-flex">New</Badge>
          </TabsTrigger>
          
          <TabsTrigger value="debug" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden md:inline">Debug</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="mt-0">
          <GeneralSettings />
        </TabsContent>
        
        <TabsContent value="communication" className="mt-0">
          <CommunicationSettings />
        </TabsContent>
        
        <TabsContent value="integrations" className="mt-0">
          <IntegrationSettings />
        </TabsContent>
        
        <TabsContent value="compliance" className="mt-0">
          <ComplianceSettings />
        </TabsContent>
        
        <TabsContent value="notifications" className="mt-0">
          <NotificationSettings />
        </TabsContent>
        
        <TabsContent value="ai-services" className="mt-0">
          <AiServiceConfig />
        </TabsContent>
        
        <TabsContent value="conversation" className="mt-0">
          <ConversationBehaviorConfig />
        </TabsContent>
        
        <TabsContent value="voice-settings" className="mt-0">
          <VoiceSettings />
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
        
        <TabsContent value="debug" className="mt-0">
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex justify-center items-center h-64 text-muted-foreground">
              <p>Debug tools will be implemented in the next phase.</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

export default Settings;
