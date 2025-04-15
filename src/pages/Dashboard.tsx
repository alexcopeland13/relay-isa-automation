import { useState } from 'react';
import { 
  BarChart3, 
  Users, 
  MessageSquare, 
  CalendarCheck, 
  UserCheck, 
  PhoneCall,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowRight
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { MessageSquareCheck } from '@/components/ui/icons/MessageSquareCheck';

const fetchDashboardData = async () => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  if (Math.random() < 0.1) {
    throw new Error("Failed to fetch dashboard data. Network error.");
  }
  
  return {
    stats: {
      totalLeads: 342,
      qualifiedLeads: 189,
      aiConversations: 256,
      todayFollowUps: 28,
      conversionRate: 24.8,
      scheduledFollowUps: 47
    },
    priorityTasks: [
      { 
        id: 'task1', 
        title: 'Follow up with Michael Brown', 
        type: 'followup', 
        dueTime: '2 hours', 
        path: '/follow-ups'
      },
      { 
        id: 'task2', 
        title: 'Review conversation with Sarah Martinez', 
        type: 'conversation', 
        status: 'Needs Approval', 
        path: '/conversations'
      },
      { 
        id: 'task3', 
        title: 'Assign Thomas Wilson to an agent', 
        type: 'handoff', 
        status: 'Qualified Lead', 
        path: '/leads'
      },
    ],
    activeAgents: {
      available: 5,
      busy: 3,
      offline: 2,
      totalCapacity: 15,
      usedCapacity: 8
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

  const getTaskIcon = (type: string) => {
    switch(type) {
      case 'followup': return <Clock className="h-5 w-5 text-blue-500" />;
      case 'conversation': return <MessageSquare className="h-5 w-5 text-purple-500" />;
      case 'handoff': return <UserCheck className="h-5 w-5 text-green-500" />;
      default: return <AlertCircle className="h-5 w-5 text-orange-500" />;
    }
  };

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
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Today's Priority Tasks</CardTitle>
            <CardDescription>Tasks requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.priorityTasks.map((task) => (
                <div key={task.id} className="flex items-center border rounded-lg p-4 bg-card hover:bg-accent/10 transition-colors">
                  <div className="mr-4">
                    {getTaskIcon(task.type)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{task.title}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {task.dueTime && (
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Due in {task.dueTime}
                        </span>
                      )}
                      {task.status && <span>{task.status}</span>}
                    </div>
                  </div>
                  <Link to={task.path}>
                    <Button variant="outline" size="sm" className="gap-1">
                      <span>View</span>
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="link" size="sm" className="gap-1">
              <span>Show all tasks</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Available Resources</CardTitle>
            <CardDescription>Current capacity and availability</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium">Agent Availability</h4>
                <Link to="/agents">
                  <Button variant="ghost" size="sm" className="h-auto py-1 px-2">
                    <span className="text-xs">View All</span>
                  </Button>
                </Link>
              </div>
              <div className="flex justify-between mb-2">
                <div className="flex items-center">
                  <Badge variant="outline" className="bg-green-100 text-green-800">Available</Badge>
                  <span className="ml-2 font-medium">{data?.activeAgents.available}</span>
                </div>
                <div className="flex items-center">
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Busy</Badge>
                  <span className="ml-2 font-medium">{data?.activeAgents.busy}</span>
                </div>
                <div className="flex items-center">
                  <Badge variant="outline" className="bg-gray-100 text-gray-800">Offline</Badge>
                  <span className="ml-2 font-medium">{data?.activeAgents.offline}</span>
                </div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium">Conversation Capacity</h4>
                <span className="text-sm font-medium">{data?.activeAgents.usedCapacity}/{data?.activeAgents.totalCapacity}</span>
              </div>
              <Progress 
                value={(data?.activeAgents.usedCapacity / data?.activeAgents.totalCapacity) * 100} 
                className="h-2" 
              />
              <p className="text-xs text-muted-foreground mt-2">
                {data?.activeAgents.totalCapacity - data?.activeAgents.usedCapacity} slots available for new conversations
              </p>
            </div>
            
            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-3">Quick Actions</h4>
              <div className="grid grid-cols-2 gap-3">
                <Link to="/conversations">
                  <Button variant="outline" size="sm" className="w-full">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    <span>Start Conversation</span>
                  </Button>
                </Link>
                <Link to="/follow-ups">
                  <Button variant="outline" size="sm" className="w-full">
                    <CalendarCheck className="mr-2 h-4 w-4" />
                    <span>Schedule Follow-up</span>
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Real-Time Activity</CardTitle>
            <CardDescription>Live conversation and lead status updates</CardDescription>
          </CardHeader>
          <CardContent>
            <LeadActivityChart />
          </CardContent>
        </Card>
        
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
            icon={<MessageSquareCheck className="h-5 w-5" />}
            trend={{
              value: 23,
              label: "vs last month",
              positive: true
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
