
import { 
  BarChart3, 
  Users, 
  MessageSquare, 
  CalendarCheck, 
  UserCheck, 
  PhoneCall 
} from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { LeadActivityChart } from '@/components/dashboard/LeadActivityChart';
import { RecentLeads } from '@/components/dashboard/RecentLeads';
import { UpcomingFollowUps } from '@/components/dashboard/UpcomingFollowUps';
import { AiActivitySummary } from '@/components/dashboard/AiActivitySummary';

const Dashboard = () => {
  return (
    <PageLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back, here's what's happening today.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Leads" 
          value="342" 
          icon={<Users size={20} />}
          trend={{
            value: 12,
            label: "vs last month",
            positive: true
          }}
        />
        <StatCard 
          title="Qualified Leads" 
          value="189" 
          icon={<UserCheck size={20} />}
          trend={{
            value: 8,
            label: "vs last month",
            positive: true
          }}
        />
        <StatCard 
          title="AI Conversations" 
          value="256" 
          icon={<MessageSquare size={20} />}
          trend={{
            value: 23,
            label: "vs last month",
            positive: true
          }}
        />
        <StatCard 
          title="Today's Follow-ups" 
          value="28" 
          icon={<PhoneCall size={20} />}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <LeadActivityChart />
        <div className="space-y-6">
          <StatCard 
            title="Conversion Rate" 
            value="24.8%" 
            icon={<BarChart3 size={20} />}
            trend={{
              value: 3.2,
              label: "vs last month",
              positive: true
            }}
          />
          <StatCard 
            title="Scheduled Follow-ups" 
            value="47" 
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
