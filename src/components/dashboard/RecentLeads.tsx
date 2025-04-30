
import { DollarSign, ArrowUpRight, FileCheck, TagIcon, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';

// Sample data with enhanced fields
const recentLeads = [
  {
    id: 'ld-001',
    name: 'Michael Johnson',
    email: 'michael@example.com',
    phone: '(555) 123-4567',
    source: 'Website',
    status: 'New',
    time: '10 mins ago',
    interest: 'Mortgage Refinancing',
    propertyPreferences: {
      type: 'Single Family Home',
      bedrooms: '3-4',
      location: 'Suburban'
    },
    mortgageDetails: {
      status: 'Pre-qualified',
      amount: '$450,000',
      type: 'Conventional'
    }
  },
  {
    id: 'ld-002',
    name: 'Sarah Williams',
    email: 'sarah@example.com',
    phone: '(555) 987-6543',
    source: 'Facebook Ad',
    status: 'Qualified',
    time: '2 hours ago',
    interest: 'Home Purchase',
    propertyPreferences: {
      type: 'Townhouse',
      bedrooms: '2-3',
      location: 'Urban'
    },
    mortgageDetails: {
      status: 'Needs Review',
      amount: '$320,000',
      type: 'FHA'
    }
  },
  {
    id: 'ld-003',
    name: 'Robert Brown',
    email: 'robert@example.com',
    phone: '(555) 456-7890',
    source: 'Referral',
    status: 'Follow-up',
    time: '1 day ago',
    interest: 'Investment Property',
    propertyPreferences: {
      type: 'Multi-family',
      bedrooms: '4+',
      location: 'Urban'
    },
    mortgageDetails: {
      status: 'Pre-approved',
      amount: '$550,000',
      type: 'Investment'
    }
  },
  {
    id: 'ld-004',
    name: 'Emily Davis',
    email: 'emily@example.com',
    phone: '(555) 789-0123',
    source: 'Google Ads',
    status: 'New',
    time: '1 day ago',
    interest: 'Mortgage Pre-approval',
    propertyPreferences: {
      type: 'Condominium',
      bedrooms: '1-2',
      location: 'Urban'
    },
    mortgageDetails: {
      status: 'Submitted',
      amount: '$275,000',
      type: 'Conventional'
    }
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
  // Enhanced helper function to safely access nested properties with better TypeScript support
  const safeGet = (obj: any | null | undefined, path: string, defaultValue: any = 'Unknown') => {
    if (!obj) return defaultValue;
    
    try {
      const keys = path.split('.');
      let result = obj;
      
      for (const key of keys) {
        if (result === undefined || result === null) return defaultValue;
        result = result[key];
      }
      
      return result !== undefined && result !== null ? result : defaultValue;
    } catch (error) {
      console.error(`Error accessing path ${path}:`, error);
      return defaultValue;
    }
  };

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
            <div key={lead.id} className="p-4">
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
              
              <div className="mt-3 space-y-2">
                {/* Check if mortgageDetails exists before accessing */}
                {lead.mortgageDetails && (
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {safeGet(lead, 'mortgageDetails.amount', 'N/A')}
                      </span>
                      <Badge variant="outline" className="ml-1 bg-blue-50 text-blue-700">
                        {safeGet(lead, 'mortgageDetails.status', 'Unknown')}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <FileCheck className="h-4 w-4" />
                      <span>{safeGet(lead, 'mortgageDetails.type', 'Unknown')}</span>
                    </div>
                  </div>
                )}
                
                {/* Check if propertyPreferences exists before accessing */}
                {lead.propertyPreferences && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <TagIcon className="h-4 w-4" />
                    <span>
                      {safeGet(lead, 'propertyPreferences.type', 'Unknown')} • 
                      {safeGet(lead, 'propertyPreferences.bedrooms', 'Unknown')} beds • 
                      {safeGet(lead, 'propertyPreferences.location', 'Unknown')}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{safeGet(lead, 'time', 'Unknown')}</span>
                  <span className="text-muted-foreground">via {safeGet(lead, 'source', 'Unknown')}</span>
                </div>
              </div>
              
              <div className="mt-3">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/leads/${lead.id}`}>View Details</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
