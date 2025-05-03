
import { useEffect, useState, useCallback } from 'react';
import { DollarSign, ArrowUpRight, FileCheck, TagIcon, Calendar, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RecentLeadsProps {
  onRefresh?: number;
}

export const RecentLeads = ({ onRefresh }: RecentLeadsProps) => {
  const [leads, setLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Get badge color based on status
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'contacted':
        return 'bg-purple-100 text-purple-800';
      case 'qualified':
        return 'bg-green-100 text-green-800';
      case 'proposal':
        return 'bg-yellow-100 text-yellow-800';
      case 'converted':
        return 'bg-emmaccent-light text-emmaccent-dark';
      case 'lost':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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

  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch leads with qualification data and conversations
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          qualification_data(*),
          conversations(*)
        `)
        .order('created_at', { ascending: false })
        .limit(4);

      if (error) {
        console.error('Error fetching recent leads:', error);
        throw error;
      }

      console.log('Fetched recent leads:', data);
      
      // Transform and enrich data
      const enrichedLeads = data.map(lead => {
        const qualification = lead.qualification_data?.[0] || {};
        return {
          id: lead.id,
          name: `${lead.first_name || ''} ${lead.last_name || ''}`.trim(),
          email: lead.email || '',
          phone: lead.phone || '',
          status: lead.status,
          source: lead.source || 'Unknown',
          time: formatTime(lead.created_at),
          interest: qualification.loan_type || 'Mortgage',
          propertyPreferences: {
            type: qualification.property_type || 'Unknown',
            bedrooms: '3-4', // Default as this isn't in the schema
            location: 'Unknown' // Default as this isn't in the schema
          },
          mortgageDetails: {
            status: qualification.estimated_credit_score ? 'Pre-qualified' : 'Needs Review',
            amount: qualification.loan_amount ? `$${qualification.loan_amount.toLocaleString()}` : 'Unknown',
            type: qualification.loan_type || 'Unknown'
          }
        };
      });

      setLeads(enrichedLeads);
    } catch (error) {
      console.error('Error in fetchLeads:', error);
      toast({
        title: 'Error',
        description: 'Failed to load recent leads',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Format relative time
  const formatTime = (timestamp: string) => {
    if (!timestamp) return 'Unknown';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);
    
    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchLeads();
    
    // Subscribe to real-time updates for leads table
    const channel = supabase
      .channel('schema-db-changes-recent')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads'
        },
        () => {
          console.log('Lead data changed, refreshing recent leads...');
          fetchLeads();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLeads]);

  // Refresh data when onRefresh changes
  useEffect(() => {
    if (onRefresh) {
      fetchLeads();
    }
  }, [onRefresh, fetchLeads]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Recent Leads</CardTitle>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={fetchLeads}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="sr-only">Refresh</span>
          </Button>
          <Link to="/leads" className="text-sm text-emmblue hover:underline flex items-center">
            View all <ArrowUpRight className="ml-1" size={14} />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="px-0 py-1">
        {isLoading ? (
          <div className="p-4 text-center text-muted-foreground">
            Loading recent leads...
          </div>
        ) : leads.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No leads found. Create new leads using the VAPI integration or add leads manually.
          </div>
        ) : (
          <div className="divide-y">
            {leads.map((lead) => (
              <div key={lead.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <Link 
                      to={`/leads`}
                      className="font-medium hover:text-emmblue hover:underline"
                    >
                      {lead.name || 'Unnamed Lead'}
                    </Link>
                    <div className="text-sm text-muted-foreground mt-1">
                      {lead.email} • {lead.phone || 'No phone'}
                    </div>
                  </div>
                  <Badge
                    className={cn(
                      "font-normal",
                      getStatusColor(lead.status)
                    )}
                    variant="outline"
                  >
                    {lead.status || 'New'}
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
                        {safeGet(lead, 'propertyPreferences.type', 'Unknown')}
                        {safeGet(lead, 'propertyPreferences.bedrooms', '') ? 
                          ` • ${safeGet(lead, 'propertyPreferences.bedrooms')} beds` : ''}
                        {safeGet(lead, 'propertyPreferences.location', '') !== 'Unknown' ? 
                          ` • ${safeGet(lead, 'propertyPreferences.location')}` : ''}
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
                    <Link to={`/leads`}>View Details</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
