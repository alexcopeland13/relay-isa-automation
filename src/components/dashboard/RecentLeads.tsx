
import { CalendarClock, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';

// Sample data
const recentLeads = [
  {
    id: 'ld-001',
    name: 'Michael Johnson',
    email: 'michael@example.com',
    phone: '(555) 123-4567',
    source: 'Website',
    status: 'New',
    time: '10 mins ago',
    interest: 'Mortgage Refinancing'
  },
  {
    id: 'ld-002',
    name: 'Sarah Williams',
    email: 'sarah@example.com',
    phone: '(555) 987-6543',
    source: 'Facebook Ad',
    status: 'Qualified',
    time: '2 hours ago',
    interest: 'Home Purchase'
  },
  {
    id: 'ld-003',
    name: 'Robert Brown',
    email: 'robert@example.com',
    phone: '(555) 456-7890',
    source: 'Referral',
    status: 'Follow-up',
    time: '1 day ago',
    interest: 'Investment Property'
  },
  {
    id: 'ld-004',
    name: 'Emily Davis',
    email: 'emily@example.com',
    phone: '(555) 789-0123',
    source: 'Google Ads',
    status: 'New',
    time: '1 day ago',
    interest: 'Mortgage Pre-approval'
  }
];

// Get badge color based on status
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'new':
      return 'bg-blue-100 text-blue-800';
    case 'qualified':
      return 'bg-green-100 text-green-800';
    case 'follow-up':
      return 'bg-yellow-100 text-yellow-800';
    case 'converted':
      return 'bg-emmaccent-light text-emmaccent-dark';
    case 'lost':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const RecentLeads = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Recent Leads</CardTitle>
        <Link to="/leads" className="text-sm text-emmblue hover:underline flex items-center">
          View all <ArrowUpRight className="ml-1" size={14} />
        </Link>
      </CardHeader>
      <CardContent className="px-0 py-1">
        <div className="divide-y">
          {recentLeads.map((lead) => (
            <div key={lead.id} className="lead-item">
              <div className="flex justify-between items-start">
                <div>
                  <Link 
                    to={`/leads/${lead.id}`}
                    className="font-medium hover:text-emmblue hover:underline"
                  >
                    {lead.name}
                  </Link>
                  <div className="text-sm text-muted-foreground mt-1">
                    {lead.email} • {lead.phone}
                  </div>
                </div>
                <Badge
                  className={cn(
                    "font-normal",
                    getStatusColor(lead.status)
                  )}
                  variant="outline"
                >
                  {lead.status}
                </Badge>
              </div>
              <div className="mt-2 flex flex-wrap gap-y-2 gap-x-4 text-sm">
                <div className="flex items-center text-muted-foreground">
                  <CalendarClock size={14} className="mr-1" />
                  {lead.time}
                </div>
                <div className="flex items-center">
                  <span className="text-muted-foreground mr-1">Interest:</span> 
                  {lead.interest}
                </div>
                <div className="flex items-center">
                  <span className="text-muted-foreground mr-1">Source:</span> 
                  {lead.source}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
