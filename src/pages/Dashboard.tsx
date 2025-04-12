
import { useState } from 'react';
import { 
  BarChart3, 
  Users, 
  MessageSquare, 
  CalendarCheck, 
  UserCheck, 
  PhoneCall,
  RefreshCw 
} from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { LeadActivityChart } from '@/components/dashboard/LeadActivityChart';
import { RecentLeads } from '@/components/dashboard/RecentLeads';
import { UpcomingFollowUps } from '@/components/dashboard/UpcomingFollowUps';
import { AiActivitySummary } from '@/components/dashboard/AiActivitySummary';
import { Button } from '@/components/ui/button';
import { useAsyncData } from '@/hooks/use-async-data';
import { ErrorContainer } from '@/components/ui/error-container';
import { ExportMenu } from '@/components/ui/export-menu';
import { 
  DashboardSkeleton, 
  StatCardSkeleton 
} from '@/components/ui/loading-skeleton';

// Mock function to simulate API data fetch with occasional errors
const fetchDashboardData = async () => {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Occasionally simulate an error (10% chance)
  if (Math.random() < 0.1) {
    throw new Error("Failed to fetch dashboard data. Network error.");
  }
  
  // Return mock data
  return {
    stats: {
      totalLeads: 342,
      qualifiedLeads: 189,
      aiConversations: 256,
      todayFollowUps: 28,
      conversionRate: 24.8,
      scheduledFollowUps: 47
    }
  };
};

const Dashboard = () => {
  const { 
    data, 
    isLoading, 
    error, 
    retry 
  } = useAsyncData(fetchDashboardData, null, []);

  // Export data - this would be structured data from your dashboard
  const exportData = [
    { metric: 'Total Leads', value: data?.stats.totalLeads || 0 },
    { metric: 'Qualified Leads', value: data?.stats.qualifiedLeads || 0 },
    { metric: 'AI Conversations', value: data?.stats.aiConversations || 0 },
    { metric: 'Today\'s Follow-ups', value: data?.stats.todayFollowUps || 0 },
    { metric: 'Conversion Rate', value: `${data?.stats.conversionRate || 0}%` },
    { metric: 'Scheduled Follow-ups', value: data?.stats.scheduledFollowUps || 0 }
  ];

  if (isLoading) {
    return (
      <PageLayout>
        <DashboardSkeleton />
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, here's what's happening today.</p>
        </div>
        
        <div className="mb-6">
          <ErrorContainer
            title="Dashboard Data Error"
            description="We couldn't load your dashboard data."
            error={error}
            onRetry={retry}
            suggestions={[
              "Check your internet connection",
              "Try refreshing the page",
              "Contact support if the problem persists"
            ]}
          />
        </div>
        
        <div className="flex justify-end mb-6">
          <Button onClick={retry} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-start">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, here's what's happening today.</p>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <ExportMenu 
            data={exportData}
            filename="relay_dashboard"
            supportedFormats={['csv', 'pdf', 'email']}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Leads" 
          value={data?.stats.totalLeads.toString() || "—"} 
          icon={<Users size={20} />}
          trend={{
            value: 12,
            label: "vs last month",
            positive: true
          }}
        />
        <StatCard 
          title="Qualified Leads" 
          value={data?.stats.qualifiedLeads.toString() || "—"} 
          icon={<UserCheck size={20} />}
          trend={{
            value: 8,
            label: "vs last month",
            positive: true
          }}
        />
        <StatCard 
          title="AI Conversations" 
          value={data?.stats.aiConversations.toString() || "—"} 
          icon={<MessageSquare size={20} />}
          trend={{
            value: 23,
            label: "vs last month",
            positive: true
          }}
        />
        <StatCard 
          title="Today's Follow-ups" 
          value={data?.stats.todayFollowUps.toString() || "—"} 
          icon={<PhoneCall size={20} />}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <LeadActivityChart />
        <div className="space-y-6">
          <StatCard 
            title="Conversion Rate" 
            value={`${data?.stats.conversionRate.toString() || "—"}%`} 
            icon={<BarChart3 size={20} />}
            trend={{
              value: 3.2,
              label: "vs last month",
              positive: true
            }}
          />
          <StatCard 
            title="Scheduled Follow-ups" 
            value={data?.stats.scheduledFollowUps.toString() || "—"} 
            icon={<CalendarCheck size={20} />}
            trend={{
              value: 5,
              label: "vs last week",
              positive: false
            }}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentLeads />
        <UpcomingFollowUps />
        <AiActivitySummary />
      </div>
    </PageLayout>
  );
};

export default Dashboard;
