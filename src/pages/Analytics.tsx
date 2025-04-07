
import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LeadAnalytics } from '@/components/analytics/LeadAnalytics';
import { ConversationAnalytics } from '@/components/analytics/ConversationAnalytics';
import { FollowUpAnalytics } from '@/components/analytics/FollowUpAnalytics';
import { AiPerformanceMetrics } from '@/components/analytics/AiPerformanceMetrics';
import { PipelineAnalytics } from '@/components/analytics/PipelineAnalytics';
import { BarChart4, Calendar, Download, Filter, RefreshCcw } from 'lucide-react';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('30days');
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <PageLayout>
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div>
            <h1 className="text-2xl font-bold">Analytics & Reporting</h1>
            <p className="text-muted-foreground mt-1">Monitor performance metrics and AI insights</p>
          </div>
          
          <div className="flex items-center gap-3 mt-4 sm:mt-0">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
                <SelectItem value="custom">Custom range</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="icon">
              <RefreshCcw className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Leads</CardTitle>
            <BarChart4 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">342</div>
            <div className="flex items-center pt-1">
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                +12.5%
              </Badge>
              <span className="text-xs text-muted-foreground ml-2">vs previous period</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <BarChart4 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24.8%</div>
            <div className="flex items-center pt-1">
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                +3.2%
              </Badge>
              <span className="text-xs text-muted-foreground ml-2">vs previous period</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Conversations</CardTitle>
            <BarChart4 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">518</div>
            <div className="flex items-center pt-1">
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                +18.7%
              </Badge>
              <span className="text-xs text-muted-foreground ml-2">vs previous period</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="bg-card rounded-lg border border-border p-6 mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="leads">Leads</TabsTrigger>
              <TabsTrigger value="conversations">Conversations</TabsTrigger>
              <TabsTrigger value="followups">Follow-ups</TabsTrigger>
              <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
              <TabsTrigger value="ai">AI Performance</TabsTrigger>
            </TabsList>
            
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
          
          <Separator className="mb-6" />
          
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LeadAnalytics compact />
              <PipelineAnalytics compact />
              <ConversationAnalytics compact />
              <FollowUpAnalytics compact />
            </div>
          </TabsContent>
          
          <TabsContent value="leads">
            <LeadAnalytics />
          </TabsContent>
          
          <TabsContent value="conversations">
            <ConversationAnalytics />
          </TabsContent>
          
          <TabsContent value="followups">
            <FollowUpAnalytics />
          </TabsContent>
          
          <TabsContent value="pipeline">
            <PipelineAnalytics />
          </TabsContent>
          
          <TabsContent value="ai">
            <AiPerformanceMetrics />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default Analytics;
