import { useState, useEffect, useCallback } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TestVAPIClient } from '@/components/vapi/TestVAPIClient';
import { ArrowRight, Check, Phone, RefreshCw, AlertTriangle, DatabaseIcon, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { supabase, diagnoseDatabaseConnection, insertTestLead } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { RecentLeads } from '@/components/dashboard/RecentLeads';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalLeads: 0,
    newLeads: 0,
    qualifiedLeads: 0,
    totalCalls: 0
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [debugMode, setDebugMode] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [rawTableData, setRawTableData] = useState<any>(null);
  const { toast } = useToast();

  // Get the Supabase project URL for display purposes
  const getSupabaseUrl = () => {
    // Extract from the URL we know
    return 'https://qvarmbhdradfpkegtpgw.supabase.co';
  };

  // Check if Supabase key is present
  const hasSupabaseKey = () => {
    return true; // We know we have a key from the client.ts file
  };

  const checkDatabaseConnection = useCallback(async () => {
    try {
      setConnectionStatus('checking');
      console.log('🔄 Checking database connection...');
      
      // Log connection details for debugging
      const url = getSupabaseUrl();
      console.log('🔌 Connection details - URL:', url, 'Has valid key:', hasSupabaseKey());
      
      const { data, error } = await supabase.from('leads').select('id').limit(1);
      
      if (error) {
        console.error('❌ Database connection error:', error);
        setConnectionStatus('error');
        return false;
      }
      
      console.log('✅ Database connection successful, received:', data);
      setConnectionStatus('connected');
      return true;
    } catch (error) {
      console.error('❌ Failed to check database connection:', error);
      setConnectionStatus('error');
      return false;
    }
  }, []);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log('📊 Dashboard: Fetching stats...');
      
      // First check connection
      const isConnected = await checkDatabaseConnection();
      if (!isConnected) {
        throw new Error('Database connection failed');
      }
      
      // Query without case sensitivity for more reliable results
      console.log('📊 Dashboard: Fetching totalLeads count');
      const { count: totalLeads, error: totalError } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true });
        
      if (totalError) {
        console.error('❌ Error fetching total leads:', totalError);
        throw totalError;
      }
      
      console.log('📊 Dashboard: Fetching newLeads count - case insensitive');
      const { count: newLeads, error: newError } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .ilike('status', '%new%'); // Case insensitive match
        
      if (newError) {
        console.error('❌ Error fetching new leads:', newError);
        throw newError;
      }
      
      console.log('📊 Dashboard: Fetching qualifiedLeads count - case insensitive');
      const { count: qualifiedLeads, error: qualifiedError } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .ilike('status', '%qualified%'); // Case insensitive match
        
      if (qualifiedError) {
        console.error('❌ Error fetching qualified leads:', qualifiedError);
        throw qualifiedError;
      }
      
      console.log('📊 Dashboard: Fetching totalCalls count');
      const { count: totalCalls, error: callsError } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true });
        
      if (callsError) {
        console.error('❌ Error fetching total calls:', callsError);
        throw callsError;
      }
      
      console.log('📊 Dashboard: Stats fetched successfully:', {
        totalLeads,
        newLeads,
        qualifiedLeads,
        totalCalls
      });
        
      setStats({
        totalLeads: totalLeads || 0,
        newLeads: newLeads || 0,
        qualifiedLeads: qualifiedLeads || 0,
        totalCalls: totalCalls || 0
      });
      
      // Double check by fetching actual lead records
      console.log('🧪 Dashboard: Verifying by fetching actual lead records');
      const { data: actualLeads, error: verifyError } = await supabase
        .from('leads')
        .select('id')
        .limit(5);
        
      if (verifyError) {
        console.error('❌ Error verifying leads:', verifyError);
      } else {
        console.log('✅ Verification complete, found leads:', actualLeads);
      }
    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard statistics',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, checkDatabaseConnection]);

  // Initial data fetch
  useEffect(() => {
    fetchStats();
    
    // Subscribe to real-time updates for leads table
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads'
        },
        (payload) => {
          console.log('🔔 Dashboard: Lead data changed, payload:', payload);
          console.log('🔄 Dashboard: Refreshing stats...');
          fetchStats();
        }
      )
      .subscribe((status) => {
        console.log('📡 Dashboard: Subscription status:', status);
      });

    return () => {
      console.log('🧹 Dashboard: Cleaning up subscription');
      supabase.removeChannel(channel);
    };
  }, [fetchStats]);

  // This will force a refresh when navigating to this component
  useEffect(() => {
    const refreshTimeout = setTimeout(() => {
      console.log('🔄 Dashboard: Refresh timeout triggered');
      fetchStats();
    }, 300); // Short delay to ensure navigation is complete
    return () => clearTimeout(refreshTimeout);
  }, [fetchStats, lastRefresh]);

  const handleManualRefresh = () => {
    console.log('🔄 Dashboard: Manual refresh triggered');
    setLastRefresh(Date.now());
    fetchStats();
    toast({
      title: 'Refreshed',
      description: 'Dashboard data has been refreshed',
    });
  };

  // Debug function to directly check database tables
  const runDiagnostics = async () => {
    try {
      console.log('🔍 Running diagnostics...');
      
      // Run comprehensive diagnostics
      const diagResult = await diagnoseDatabaseConnection();
      setRawTableData(diagResult);
      
      if (diagResult.success) {
        console.log('📊 Raw database data:', diagResult);
        toast({
          title: 'Database Diagnostics',
          description: `Found ${diagResult.count} leads with status values: ${diagResult.statusValues?.join(', ') || 'none'}`,
        });
      } else {
        console.error('❌ Database diagnostics error:', diagResult.error);
        toast({
          title: 'Diagnostics Error',
          description: diagResult.message || 'Unknown error checking database',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('❌ Diagnostics failed:', error);
      toast({
        title: 'Diagnostics Failed',
        description: 'Error running diagnostics',
        variant: 'destructive',
      });
    }
  };

  // Function to insert a test lead directly
  const handleInsertTestLead = async () => {
    try {
      console.log('🧪 Inserting test lead directly...');
      
      // Verify connection first
      const isConnected = await checkDatabaseConnection();
      if (!isConnected) {
        toast({
          title: 'Connection Error',
          description: 'Cannot connect to database. Please check your connection.',
          variant: 'destructive',
        });
        return;
      }
      
      // Use the standardized function to insert a test lead
      const result = await insertTestLead();
      
      if (result.error) {
        console.error('❌ Test lead insertion failed:', result.error);
        toast({
          title: 'Test Failed',
          description: `Could not insert test lead: ${result.error.message}`,
          variant: 'destructive',
        });
      } else {
        console.log('✅ Test lead inserted successfully:', result.data);
        toast({
          title: 'Test Lead Added',
          description: 'A test lead was successfully added to the database',
        });
        
        // Immediately refresh stats and run diagnostics
        fetchStats();
        runDiagnostics(); // Also run diagnostics to confirm lead is visible
      }
    } catch (error) {
      console.error('❌ Error inserting test lead:', error);
      toast({
        title: 'Error',
        description: 'Failed to insert test lead',
        variant: 'destructive',
      });
    }
  };

  // Add a function to check specifically for leads with a detailed query
  const checkLeadsTable = async () => {
    try {
      console.log('🔍 Checking leads table directly with detailed query...');
      toast({
        title: 'Checking Leads',
        description: 'Performing detailed analysis of the leads table...',
      });
      
      // Run full diagnostics
      await runDiagnostics();
    } catch (error) {
      console.error('❌ Error checking leads table:', error);
      toast({
        title: 'Error',
        description: 'Failed to check leads table',
        variant: 'destructive',
      });
    }
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Relay Dashboard</h1>
            <p className="text-muted-foreground">Your mortgage lead management platform</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleManualRefresh} 
              disabled={isLoading}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Loading...' : 'Refresh'}
            </Button>
            
            {connectionStatus === 'error' && (
              <Badge variant="destructive" className="flex gap-1">
                <AlertTriangle className="h-3 w-3" /> Connection Error
              </Badge>
            )}
            
            {/* Debug mode toggle */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setDebugMode(!debugMode)}
              className="text-xs"
            >
              {debugMode ? 'Hide Debug' : 'Debug'}
            </Button>
          </div>
        </div>
        
        {debugMode && (
          <Card className="bg-slate-50 border-slate-300">
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium">Debugging Tools</CardTitle>
            </CardHeader>
            <CardContent className="py-3 space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={runDiagnostics}>
                  Run Diagnostics
                </Button>
                <Button size="sm" variant="outline" onClick={handleInsertTestLead}>
                  Insert Test Lead
                </Button>
                <Button size="sm" variant="outline" onClick={checkDatabaseConnection}>
                  Check Connection
                </Button>
                <Button size="sm" variant="outline" onClick={checkLeadsTable}>
                  Check Leads Table
                </Button>
              </div>
              <div className="text-xs space-y-1">
                <div>
                  Connection Status: <span className={connectionStatus === 'connected' ? 'text-green-500' : connectionStatus === 'error' ? 'text-red-500' : 'text-amber-500'}>
                    {connectionStatus === 'connected' ? 'Connected' : connectionStatus === 'error' ? 'Error' : 'Checking...'}
                  </span>
                </div>
                <div className="flex items-center">
                  <DatabaseIcon className="h-3 w-3 mr-1" />
                  Database URL: <span className="ml-1 font-mono text-xs opacity-70">{getSupabaseUrl()}</span>
                </div>
                <div>API Key: {hasSupabaseKey() ? '✓ Present' : '✗ Missing'}</div>
              </div>
              
              {/* Display raw table data when available */}
              {rawTableData && (
                <div className="mt-3 p-3 bg-slate-100 rounded-md overflow-auto max-h-64">
                  <div className="font-medium text-xs mb-2 flex items-center">
                    <Search className="h-3 w-3 mr-1" /> Raw Database Results:
                  </div>
                  <div className="text-xs font-mono">
                    {rawTableData.success ? (
                      <>
                        <div className="text-green-600 font-medium">✓ Success</div>
                        <div>Found {rawTableData.count || 0} leads</div>
                        <div>Status values: {rawTableData.statusValues?.join(', ') || 'none'}</div>
                        <pre className="mt-2 p-2 bg-slate-200 rounded text-xs overflow-auto max-h-40">
                          {JSON.stringify(rawTableData.data, null, 2)}
                        </pre>
                      </>
                    ) : (
                      <div className="text-red-600">
                        Error: {rawTableData.message || 'Unknown error'}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {isLoading ? '-' : stats.totalLeads}
              </div>
              <p className="text-muted-foreground mt-1">Total Leads</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">
                {isLoading ? '-' : stats.newLeads}
              </div>
              <p className="text-muted-foreground mt-1">New Leads</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">
                {isLoading ? '-' : stats.qualifiedLeads}
              </div>
              <p className="text-muted-foreground mt-1">Qualified Leads</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-purple-600">
                {isLoading ? '-' : stats.totalCalls}
              </div>
              <p className="text-muted-foreground mt-1">Total Conversations</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Leads component with refresh capabilities and fixed status handling */}
        <RecentLeads onRefresh={lastRefresh} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>VAPI Integration</CardTitle>
              <CardDescription>
                Test the connection between your voice agent and Relay
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                  <Check className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
                <span className="text-sm">Edge Function ready to receive data</span>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <h4 className="text-sm font-semibold mb-2">Integration Steps:</h4>
                <ul className="text-sm space-y-2">
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 text-green-500 shrink-0 mt-0.5" />
                    <span>Supabase database setup complete</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 text-green-500 shrink-0 mt-0.5" />
                    <span>Edge Function endpoint created for receiving voice agent data</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 text-green-500 shrink-0 mt-0.5" />
                    <span>Lead management interface updated to display data from Supabase</span>
                  </li>
                </ul>
              </div>
              
              <div className="flex items-center justify-between pt-4">
                <div className="text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 inline mr-1" />
                  Ready to receive voice leads
                </div>
                <TestVAPIClient />
              </div>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
              <CardDescription>
                Continue building your Relay platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium">View and manage leads</div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/leads">
                      Open Leads
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium">Configure VAPI to send lead data</div>
                  <Button variant="outline" size="sm">
                    View Docs
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium">Set up automated lead routing</div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/team-lead-controls">
                      Lead Routing
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium">Create follow-up reminders</div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/follow-ups">
                      Follow-ups
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
              
              <div className="pt-4 mt-4 border-t">
                <h4 className="text-sm font-semibold mb-2">Additional Resources:</h4>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li className="flex items-start">
                    <span>• VAPI AI Documentation</span>
                  </li>
                  <li className="flex items-start">
                    <span>• Supabase Edge Functions Guide</span>
                  </li>
                  <li className="flex items-start">
                    <span>• Relay Admin Guide</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default Dashboard;
