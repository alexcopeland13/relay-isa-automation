
import { CalendarCheck, ArrowUpRight, Phone, Mail, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';

// Sample data
const upcomingFollowUps = [
  {
    id: 'fu-001',
    leadName: 'Michael Johnson',
    leadId: 'ld-001',
    time: new Date(2025, 3, 8, 10, 30),
    type: 'Phone Call',
    notes: 'Discuss mortgage refinancing options',
    reviewed: true
  },
  {
    id: 'fu-002',
    leadName: 'Sarah Williams',
    leadId: 'ld-002',
    time: new Date(2025, 3, 8, 13, 0),
    type: 'Email',
    notes: 'Send pre-approval information',
    reviewed: true
  },
  {
    id: 'fu-003',
    leadName: 'Robert Brown',
    leadId: 'ld-003',
    time: new Date(2025, 3, 9, 11, 15),
    type: 'SMS',
    notes: 'Follow up on property viewing interest',
    reviewed: false
  }
];

// Get icon based on follow-up type
const getTypeIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'phone call':
      return <Phone size={14} />;
    case 'email':
      return <Mail size={14} />;
    case 'sms':
      return <MessageSquare size={14} />;
    default:
      return <CalendarCheck size={14} />;
  }
};

export const UpcomingFollowUps = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Upcoming Follow-ups</CardTitle>
        <Link to="/follow-ups" className="text-sm text-emmblue hover:underline flex items-center">
          View all <ArrowUpRight className="ml-1" size={14} />
        </Link>
      </CardHeader>
      <CardContent className="px-0 py-1">
        <div className="divide-y">
          {upcomingFollowUps.map((followUp) => (
            <div key={followUp.id} className="p-4">
              <div className="flex justify-between items-start mb-2">
                <Link 
                  to={`/leads/${followUp.leadId}`}
                  className="font-medium hover:text-emmblue hover:underline"
                >
                  {followUp.leadName}
                </Link>
                <div className="flex items-center text-sm">
                  <CalendarCheck size={14} className="mr-1 text-muted-foreground" />
                  <span>
                    {format(followUp.time, "MMM d, h:mm a")}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-1 text-sm">
                <div className="flex items-center text-muted-foreground">
                  {getTypeIcon(followUp.type)}
                  <span className="ml-1">{followUp.type}</span>
                </div>
                <span className="text-muted-foreground mx-1">•</span>
                <div className="font-medium">{followUp.notes}</div>
              </div>
              
              <div className="mt-3 flex gap-2">
                <Button 
                  size="sm" 
                  variant={followUp.reviewed ? "outline" : "default"}
                  className={cn(
                    !followUp.reviewed && "bg-emmaccent hover:bg-emmaccent-dark"
                  )}
                >
                  {followUp.reviewed ? "Approved" : "Review"}
                </Button>
                <Button size="sm" variant="outline">Edit</Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
