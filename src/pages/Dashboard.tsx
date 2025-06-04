
import { PageLayout } from '@/components/layout/PageLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { LeadActivityChart } from '@/components/dashboard/LeadActivityChart';
import { RecentLeads } from '@/components/dashboard/RecentLeads';
import { UpcomingFollowUps } from '@/components/dashboard/UpcomingFollowUps';
import { QualificationQueue } from '@/components/dashboard/QualificationQueue';
import { AiActivitySummary } from '@/components/dashboard/AiActivitySummary';
import { TrendingUp, Users, Phone, Calendar } from 'lucide-react';

const Dashboard = () => {
  return (
    <PageLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's what's happening with your leads today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Leads"
            value="2,429"
            description="+20.1% from last month"
            icon={Users}
            trend="up"
          />
          <StatCard
            title="Active Calls"
            value="12"
            description="+5 from yesterday"
            icon={Phone}
            trend="up"
          />
          <StatCard
            title="Conversion Rate"
            value="12.5%"
            description="+2.1% from last month"
            icon={TrendingUp}
            trend="up"
          />
          <StatCard
            title="Scheduled Today"
            value="24"
            description="3 upcoming in 2 hours"
            icon={Calendar}
            trend="neutral"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <LeadActivityChart />
            <QualificationQueue />
          </div>
          
          <div className="space-y-6">
            <AiActivitySummary />
            <RecentLeads />
            <UpcomingFollowUps />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Dashboard;
