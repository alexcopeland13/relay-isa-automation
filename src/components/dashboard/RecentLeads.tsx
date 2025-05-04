
import { useEffect, useState, useCallback } from 'react';
import { DollarSign, ArrowUpRight, FileCheck, TagIcon, Calendar, RefreshCw, AlertCircle, Database, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

interface RecentLeadsProps {
  onRefresh?: number;
}

// Define interfaces for better type safety
interface QualificationData {
  loan_type?: string;
  property_type?: string;
  estimated_credit_score?: string;
  loan_amount?: number;
  down_payment_percentage?: number;
  time_frame?: string;
  debt_to_income_ratio?: number;
  property_use?: string;
  annual_income?: number;
  is_self_employed?: boolean;
  has_co_borrower?: boolean;
  qualifying_notes?: string;
  id?: string;
  created_at?: string;
}

interface EnrichedLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  source: string;
  time: string;
  interest?: string;
  propertyPreferences: {
    type: string;
    bedrooms: string;
    location: string;
  };
  mortgageDetails: {
    status: string;
    amount: string;
    type: string;
  };
}

export const RecentLeads = ({ onRefresh }: RecentLeadsProps) => {
  const [leads, setLeads] = useState<EnrichedLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastLoadTime, setLastLoadTime] = useState<Date | null>(null);
  const [hasError, setHasError] = useState(false);
  const [debugInfo, setDebugInfo] = useState<{
    lastQueryTime: string | null;
    rawDataCount: number;
    rawData: any[] | null;
    errorDetails: string | null;
    hasRun: boolean;
  }>({
    lastQueryTime: null,
    rawDataCount: 0,
    rawData: null,
    errorDetails: null,
    hasRun: false
  });
  const { toast } = useToast();

  // Get badge color based on status
  const getStatusColor = (status: string) => {
    // Normalize status to lowercase for consistent comparison
    const normalizedStatus = status?.toLowerCase() || '';
    
    switch (normalizedStatus) {
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
    setHasError(false);
    const queryStartTime = new Date();
    
    try {
      console.log('🔄 RecentLeads: Fetching data from Supabase...');
      
      // Perform direct test on database connection
      const { data: testData, error: testError } = await supabase
        .from('leads')
        .select('count')
        .limit(1);
        
      if (testError) {
        console.error('❌ Connection test failed:', testError);
        throw new Error(`Connection test failed: ${testError.message}`);
      }
      
      // Log the full query for debugging
      console.log('🔍 RecentLeads: Executing query: leads with qualification_data and conversations');
      
      // Fetch ALL leads first for deeper debugging (no limit yet)
      const { data: allData, error: allError } = await supabase
        .from('leads')
        .select('*');
        
      if (allError) {
        console.error('❌ Error fetching all leads:', allError);
      } else {
        console.log('📊 RecentLeads: All leads in database:', allData);
      }
      
      // Now fetch leads with qualification data and conversations
      const { data, error, count } = await supabase
        .from('leads')
        .select(`
          *,
          qualification_data(*),
          conversations(*)
        `)
        .order('created_at', { ascending: false })
        .limit(4);

      if (error) {
        console.error('❌ Error fetching recent leads:', error);
        setDebugInfo(prev => ({
          ...prev,
          lastQueryTime: queryStartTime.toISOString(),
          errorDetails: error.message,
          hasRun: true
        }));
        setHasError(true);
        throw error;
      }

      console.log('📋 RecentLeads: Raw data from Supabase:', data);
      console.log('📋 RecentLeads: Number of leads found:', data?.length || 0);
      
      setDebugInfo({
        lastQueryTime: queryStartTime.toISOString(),
        rawDataCount: data?.length || 0,
        rawData: data || [],
        errorDetails: null,
        hasRun: true
      });
      
      if (!data || data.length === 0) {
        console.warn('⚠️ No leads found in the database');
        setLeads([]);
        setLastLoadTime(new Date());
        return;
      }
      
      // Transform and enrich data
      const enrichedLeads = data.map(lead => {
        // Make sure qualification_data is not undefined and get the first item safely
        const qualificationArray = lead.qualification_data || [];
        const qualification: QualificationData = qualificationArray.length > 0 ? qualificationArray[0] : {};
        
        return {
          id: lead.id,
          name: `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Unnamed Lead',
          email: lead.email || '',
          phone: lead.phone || '',
          status: lead.status || 'new',
          source: lead.source || 'Unknown',
          time: formatTime(lead.created_at),
          interest: qualification?.loan_type || 'Mortgage',
          propertyPreferences: {
            type: qualification?.property_type || 'Unknown',
            bedrooms: '3-4', // Default as this isn't in the schema
            location: 'Unknown' // Default as this isn't in the schema
          },
          mortgageDetails: {
            status: qualification?.estimated_credit_score ? 'Pre-qualified' : 'Needs Review',
            amount: qualification?.loan_amount ? `$${qualification.loan_amount.toLocaleString()}` : 'Unknown',
            type: qualification?.loan_type || 'Unknown'
          }
        };
      });

      console.log('✅ RecentLeads: Processed enriched leads:', enrichedLeads);
      setLeads(enrichedLeads);
      setLastLoadTime(new Date());
    } catch (error) {
      console.error('❌ RecentLeads: Error in fetchLeads:', error);
      setHasError(true);
      setDebugInfo(prev => ({
        ...prev,
        lastQueryTime: queryStartTime.toISOString(),
        errorDetails: error instanceof Error ? error.message : String(error),
        hasRun: true
      }));
      toast({
        title: 'Error',
        description: 'Failed to load recent leads. Please try refreshing.',
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

  // Check database directly for debugging
  const checkDatabase = async () => {
    try {
      toast({
        title: 'Checking Database',
        description: 'Directly querying the leads table...'
      });
      
      console.log('🔍 RecentLeads: Direct database check...');
      
      // Query ALL data without any filters to see what's actually there
      const { data, error } = await supabase
        .from('leads')
        .select('*');
        
      if (error) {
        console.error('❌ Database check error:', error);
        toast({
          title: 'Database Error',
          description: error.message,
          variant: 'destructive'
        });
        return;
      }
      
      console.log('📊 Direct database check result:', { data, count: data?.length });
      
      // Update debug info with raw data for deeper inspection
      setDebugInfo(prev => ({
        ...prev,
        lastQueryTime: new Date().toISOString(),
        rawDataCount: data?.length || 0,
        rawData: data || [],
        errorDetails: null,
        hasRun: true
      }));
      
      toast({
        title: 'Database Check',
        description: `Found ${data?.length || 0} leads in the database`
      });
      
      // If we found leads but they're not showing up in the component,
      // manually refresh to see if that helps
      if (data?.length && data.length > 0) {
        fetchLeads();
      }
    } catch (err) {
      console.error('❌ Error checking database:', err);
    }
  };

  // Initial data fetch
  useEffect(() => {
    console.log('🔄 RecentLeads: Initial fetch or dependency changed');
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
        (payload) => {
          console.log('🔔 RecentLeads: Lead data changed, payload:', payload);
          console.log('🔄 RecentLeads: Refreshing recent leads...');
          fetchLeads();
          
          // Show toast notification for data changes
          const eventType = payload.eventType;
          if (eventType === 'INSERT') {
            toast({
              title: 'New Lead Added',
              description: 'A new lead has been added to the database',
            });
          } else if (eventType === 'UPDATE') {
            toast({
              title: 'Lead Updated',
              description: 'Lead information has been updated',
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 RecentLeads: Subscription status:', status);
      });

    return () => {
      console.log('🧹 RecentLeads: Cleaning up subscription');
      supabase.removeChannel(channel);
    };
  }, [fetchLeads, toast]);

  // Refresh data when onRefresh changes
  useEffect(() => {
    if (onRefresh) {
      console.log('🔄 RecentLeads: onRefresh triggered:', onRefresh);
      fetchLeads();
    }
  }, [onRefresh, fetchLeads]);

  return (
    <Card className="overflow-visible">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Recent Leads</CardTitle>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={() => {
              console.log('🔄 Manual refresh clicked');
              fetchLeads();
            }}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="sr-only">Refresh</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-muted-foreground"
            onClick={checkDatabase}
          >
            <Database className="h-3 w-3 mr-1" />
            Check DB
          </Button>
          
          {lastLoadTime && (
            <span className="text-xs text-muted-foreground">
              Last updated: {lastLoadTime.toLocaleTimeString()}
            </span>
          )}
          <Link to="/leads" className="text-sm text-emmblue hover:underline flex items-center">
            View all <ArrowUpRight className="ml-1" size={14} />
          </Link>
        </div>
      </CardHeader>
      
      {debugInfo.hasRun && (
        <div className="mx-6 mb-1 p-2 bg-slate-50 rounded-sm border border-slate-200 text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium">Debug Info:</span>
            <Badge variant="outline" className={debugInfo.errorDetails ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}>
              {debugInfo.errorDetails ? 'Error' : 'Success'}
            </Badge>
          </div>
          <div>Raw leads count: <span className="font-mono">{debugInfo.rawDataCount}</span></div>
          {debugInfo.errorDetails && (
            <div className="text-red-600 font-mono truncate" title={debugInfo.errorDetails}>
              Error: {debugInfo.errorDetails}
            </div>
          )}
          <div className="text-muted-foreground">
            Query time: {debugInfo.lastQueryTime ? new Date(debugInfo.lastQueryTime).toLocaleTimeString() : 'N/A'}
          </div>
          
          {/* Add raw data viewer for debugging */}
          {debugInfo.rawData && debugInfo.rawData.length > 0 && (
            <div className="mt-2 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <span className="font-medium flex items-center">
                  <Search className="h-3 w-3 mr-1" />Raw Data:
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-5 text-xs p-0 px-1"
                  onClick={() => setDebugInfo(prev => ({
                    ...prev, 
                    rawData: null
                  }))}
                >
                  Hide
                </Button>
              </div>
              <div className="mt-1 p-1 bg-slate-100 rounded text-xs font-mono overflow-x-auto max-h-32">
                {debugInfo.rawData.map((lead, i) => (
                  <div key={i} className="mb-1 pb-1 border-b border-slate-200 last:border-0">
                    ID: {lead.id}<br/>
                    Name: {lead.first_name} {lead.last_name}<br/>
                    Status: "{lead.status}"<br/>
                    Created: {new Date(lead.created_at).toLocaleString()}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      <CardContent className="px-0 py-1">
        {isLoading ? (
          <div className="p-4 text-center text-muted-foreground">
            Loading recent leads...
          </div>
        ) : hasError ? (
          <div className="p-4 text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <div className="text-red-500 font-medium">Error loading leads</div>
            <p className="text-sm text-muted-foreground mt-1">
              Could not connect to the database
            </p>
            <div className="mt-3 space-y-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={fetchLeads}
              >
                Try Again
              </Button>
              
              <div className="text-xs text-muted-foreground pt-2">
                <Separator className="my-2" />
                <p>If problems persist, check:</p>
                <ul className="list-disc pl-5 pt-1 space-y-1">
                  <li>Database connection settings</li>
                  <li>Supabase service is operational</li>
                  <li>Network connectivity</li>
                </ul>
              </div>
            </div>
          </div>
        ) : leads.length === 0 ? (
          <div className="p-4 text-center">
            <div className="text-muted-foreground">
              No leads found. Create new leads using the VAPI integration or add leads manually.
            </div>
            <div className="mt-2">
              {debugInfo.rawDataCount > 0 ? (
                <div className="p-2 mb-2 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
                  <AlertTriangle className="h-4 w-4 inline-block mr-1 text-amber-600" />
                  Data found in database ({debugInfo.rawDataCount} leads) but couldn't be processed.
                  Check status values and case sensitivity.
                </div>
              ) : null}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={checkDatabase}
              className="mt-3"
            >
              <Database className="h-4 w-4 mr-2" />
              Check Database
            </Button>
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
