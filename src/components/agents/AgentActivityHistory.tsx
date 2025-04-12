
import { Badge } from "@/components/ui/badge";
import { Agent } from "@/types/agent";
import {
  Phone,
  Mail,
  Home,
  Calendar,
  MessageSquare,
  User,
  CheckCircle,
  AlertTriangle,
  Clock
} from "lucide-react";

interface AgentActivityHistoryProps {
  agent: Agent;
}

// Sample data - in a real app, this would come from an API
const sampleActivities = [
  {
    id: "act-1",
    type: "call",
    icon: Phone,
    leadName: "Alex Johnson",
    description: "Completed call with lead to discuss property requirements",
    date: "2023-06-05T15:30:00",
    duration: "15 mins",
    status: "Completed"
  },
  {
    id: "act-2",
    type: "showing",
    icon: Home,
    leadName: "Sarah Kim",
    description: "Property showing at 1234 Lakefront Drive",
    date: "2023-06-04T13:00:00",
    duration: "45 mins",
    status: "Completed"
  },
  {
    id: "act-3",
    type: "message",
    icon: Mail,
    leadName: "Thomas Wright",
    description: "Sent follow-up email with property listings",
    date: "2023-06-03T09:15:00",
    status: "Sent"
  },
  {
    id: "act-4",
    type: "appointment",
    icon: Calendar,
    leadName: "Maria Garcia",
    description: "Initial consultation meeting",
    date: "2023-06-02T11:00:00",
    duration: "30 mins",
    status: "Completed"
  },
  {
    id: "act-5",
    type: "message",
    icon: MessageSquare,
    leadName: "Alex Johnson",
    description: "Sent text message about updated search criteria",
    date: "2023-06-01T16:45:00",
    status: "Sent"
  },
  {
    id: "act-6",
    type: "showing",
    icon: Home,
    leadName: "Sarah Kim",
    description: "Property showing at 567 Downtown Ave",
    date: "2023-05-30T14:30:00",
    duration: "1 hour",
    status: "Missed"
  }
];

export function AgentActivityHistory({ agent }: AgentActivityHistoryProps) {
  const getActivityIcon = (activity: any) => {
    switch (activity.type) {
      case "call":
        return <Phone className="h-4 w-4" />;
      case "showing":
        return <Home className="h-4 w-4" />;
      case "message":
        return activity.icon === Mail ? 
          <Mail className="h-4 w-4" /> : 
          <MessageSquare className="h-4 w-4" />;
      case "appointment":
        return <Calendar className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="mr-1 h-3 w-3" />
            {status}
          </Badge>
        );
      case "Missed":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <AlertTriangle className="mr-1 h-3 w-3" />
            {status}
          </Badge>
        );
      case "Sent":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {status}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    }) + ' at ' + date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="space-y-6">
      <div className="relative pl-8 space-y-6 before:absolute before:left-3.5 before:top-0 before:h-full before:w-px before:bg-border">
        {sampleActivities.map((activity, index) => (
          <div key={activity.id} className="relative">
            <div className="absolute -left-8 flex h-7 w-7 items-center justify-center rounded-full bg-background border">
              {getActivityIcon(activity)}
            </div>
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <span className="font-medium">{activity.leadName}</span>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>{formatDate(activity.date)}</span>
              </div>
            </div>
            <div className="mb-2">{activity.description}</div>
            <div className="flex flex-wrap items-center gap-2">
              {getStatusBadge(activity.status)}
              {activity.duration && (
                <Badge variant="secondary" className="text-xs">
                  {activity.duration}
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
