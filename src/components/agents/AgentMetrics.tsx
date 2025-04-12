
import {
  Card,
  CardContent
} from "@/components/ui/card";
import {
  Target,
  TrendingUp,
  Clock,
  ThumbsUp,
  Users,
  Calendar
} from "lucide-react";
import { Agent } from "@/types/agent";

interface AgentMetricsProps {
  agent: Agent;
}

export function AgentMetrics({ agent }: AgentMetricsProps) {
  // We'd use real data here in a production app
  const metrics = [
    {
      name: "Showing Completion Rate",
      value: `${agent.showingCompletionRate}%`,
      change: "+2.5%",
      icon: Target,
      positive: true
    },
    {
      name: "Client Satisfaction",
      value: `${agent.clientSatisfaction}/10`,
      change: "+0.3",
      icon: ThumbsUp,
      positive: true
    },
    {
      name: "Avg. Response Time",
      value: `${agent.avgResponseTime} hrs`,
      change: "-0.5 hrs",
      icon: Clock,
      positive: true
    },
    {
      name: "Conversion Rate",
      value: `${agent.conversionRate}%`,
      change: "+1.2%",
      icon: TrendingUp,
      positive: true
    },
    {
      name: "Leads Assigned",
      value: agent.leadsAssigned,
      change: "+3",
      icon: Users,
      positive: true
    },
    {
      name: "Showings This Month",
      value: agent.showingsThisMonth,
      change: "+5",
      icon: Calendar,
      positive: true
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{metric.name}</p>
                  <h3 className="text-2xl font-bold">{metric.value}</h3>
                </div>
                <div className="bg-primary/10 p-2 rounded-full">
                  <metric.icon className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className={`text-sm mt-2 ${metric.positive ? "text-green-500" : "text-red-500"}`}>
                {metric.change} from last month
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="pt-4">
        <h3 className="text-lg font-medium mb-4">Performance Over Time</h3>
        <div className="h-80 bg-muted rounded-md flex items-center justify-center">
          <p className="text-muted-foreground">Performance chart will be displayed here</p>
        </div>
      </div>
    </div>
  );
}
