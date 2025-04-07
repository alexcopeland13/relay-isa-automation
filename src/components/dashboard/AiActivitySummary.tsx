
import { BrainCircuit, MessagesSquare, BarChart4, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

// Sample data
const aiActivities = [
  {
    id: 'act-001',
    type: 'Qualification',
    description: 'Lead qualification completed',
    time: '10 mins ago',
    lead: 'Michael Johnson',
    leadId: 'ld-001',
    confidence: 92
  },
  {
    id: 'act-002',
    type: 'Information Extraction',
    description: 'Financial information collected',
    time: '1 hour ago',
    lead: 'Sarah Williams',
    leadId: 'ld-002',
    confidence: 87
  },
  {
    id: 'act-003',
    type: 'Follow-up Scheduled',
    description: 'Follow-up email scheduled',
    time: '3 hours ago',
    lead: 'Robert Brown',
    leadId: 'ld-003',
    confidence: 96
  }
];

export const AiActivitySummary = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2">
          <BrainCircuit size={20} className="text-emmblue" />
          AI Activity
        </CardTitle>
        <Link to="/analytics" className="text-sm text-emmblue hover:underline flex items-center">
          View insights <ArrowUpRight className="ml-1" size={14} />
        </Link>
      </CardHeader>
      <CardContent className="px-0 py-1">
        <div className="space-y-1">
          {aiActivities.map((activity) => (
            <div key={activity.id} className="activity-item pl-6">
              <div className="flex justify-between items-start mb-1">
                <div className="font-medium">{activity.type}</div>
                <div className="text-xs text-muted-foreground">{activity.time}</div>
              </div>
              <p className="text-sm mb-1">{activity.description}</p>
              <div className="flex items-center justify-between mt-2">
                <Link 
                  to={`/leads/${activity.leadId}`}
                  className="text-sm text-emmblue hover:underline"
                >
                  {activity.lead}
                </Link>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Confidence</span>
                  <Progress value={activity.confidence} className="w-20 h-2" />
                  <span className="text-xs font-medium">{activity.confidence}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
