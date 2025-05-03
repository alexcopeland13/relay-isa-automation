import { useState, useEffect, useCallback } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TestVAPIClient } from '@/components/vapi/TestVAPIClient';
import { ArrowRight, Check, Phone, RefreshCw, AlertTriangle, DatabaseIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
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
  const { toast } = useToast();

  const checkDatabaseConnection = useCallback(async () => {
    try {
      setConnectionStatus('checking');
      console.log('🔄 Checking database connection...');
      
      // Get Supabase URL and key for debug logging
      const url = supabase.supabaseUrl;
      console.log('🔌 Connection details - URL:', url, 'Has valid key:', !!supabase.supabaseKey);
      
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
      
      console.log('📊 Dashboard: Fetching totalLeads count');
      const { count: totalLeads, error: totalError } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true });
        
      if (totalError) {
        console.error('❌ Error fetching total leads:', totalError);
        throw totalError;
      }
      
      console.log('📊 Dashboard: Fetching newLeads count');
      const { count: newLeads, error: newError } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'new');
        
      if (newError) {
        console.error('❌ Error fetching new leads:', newError);
        throw newError;
      }
      
      console.log('📊 Dashboard: Fetching qualifiedLeads count');
      const { count: qualifiedLeads, error: qualifiedError } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'qualified');
        
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
      
      // Check leads table
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select('*');
      
      if (leadsError) {
        console.error('❌ Leads diagnostics error:', leadsError);
        toast({
          title: 'Leads Error',
          description: `Error accessing leads: ${leadsError.message}`,
          variant: 'destructive',
        });
      } else {
        console.log('📋 Leads diagnostics:', leadsData);
        toast({
          title: 'Leads Check',
          description: `Found ${leadsData.length} leads in database`,
        });
      }
      
      // Check conversations table
      const { data: convsData, error: convsError } = await supabase
        .from('conversations')
        .select('*');
      
      if (convsError) {
        console.error('❌ Conversations diagnostics error:', convsError);
      } else {
        console.log('📋 Conversations diagnostics:', convsData);
      }
      
      // Check qualification_data table
      const { data: qualData, error: qualError } = await supabase
        .from('qualification_data')
        .select('*');
      
      if (qualError) {
        console.error('❌ Qualification data diagnostics error:', qualError);
      } else {
        console.log('📋 Qualification data diagnostics:', qualData);
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
  const insertTestLead = async () => {
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
      
      // Log the request we're about to make for debugging
      const testLead = {
        first_name: 'Test',
        last_name: `User ${new Date().toLocaleTimeString()}`,
        email: `test${Date.now()}@example.com`,
        phone: '555-123-4567',
        status: 'new',
        source: 'manual-test'
      };
      
      console.log('📝 Test lead to insert:', testLead);
      
      const { data, error } = await supabase
        .from('leads')
        .insert(testLead)
        .select();
      
      if (error) {
        console.error('❌ Test lead insertion failed:', error);
        toast({
          title: 'Test Failed',
          description: `Could not insert test lead: ${error.message}`,
          variant: 'destructive',
        });
      } else {
        console.log('✅ Test lead inserted successfully:', data);
        toast({
          title: 'Test Lead Added',
          description: 'A test lead was successfully added to the database',
        });
        
        // Try to verify the lead was actually inserted
        setTimeout(async () => {
          const { data: verifyData, error: verifyError } = await supabase
            .from('leads')
            .select('*')
            .eq('email', testLead.email)
            .single();
            
          if (verifyError) {
            console.error('❌ Could not verify lead was inserted:', verifyError);
          } else {
            console.log('✅ Lead verified in database:', verifyData);
          }
        }, 1000);
        
        // Immediately refresh stats
        fetchStats();
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

  // Add a function to check specifically for leads
  const checkLeadsTable = async () => {
    try {
      console.log('🔍 Checking leads table directly...');
      toast({
        title: 'Checking Leads',
        description: 'Querying the leads table directly...',
      });
      
      // Try to list all leads with a more detailed query
      const { data, error, count } = await supabase
        .from('leads')
        .select('*', { count: 'exact' });
      
      if (error) {
        console.error('❌ Error querying leads table:', error);
        toast({
          title: 'Database Error',
          description: `Error querying leads: ${error.message}`,
          variant: 'destructive',
        });
        return;
      }
      
      console.log('📋 Leads check result:', { data, count });
      
      toast({
        title: 'Leads Check',
        description: `Found ${count || 0} leads in database`,
      });
      
      // Try another approach with a different query method
      const rawQuery = await supabase.rpc('get_leads_needing_followup', {
        follow_up_date: new Date().toISOString()
      });
      
      console.log('🔍 Raw RPC query result:', rawQuery);
      
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
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={runDiagnostics}>
                  Run Diagnostics
                </Button>
                <Button size="sm" variant="outline" onClick={insertTestLead}>
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
                  Database URL: <span className="ml-1 font-mono text-xs opacity-70">{supabase.supabaseUrl}</span>
                </div>
                <div>API Key: {supabase.supabaseKey ? '✓ Present' : '✗ Missing'}</div>
              </div>
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
        
        {/* Recent Leads component with refresh capabilities */}
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
