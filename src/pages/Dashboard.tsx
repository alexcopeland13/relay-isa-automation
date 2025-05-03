
import { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TestVAPIClient } from '@/components/vapi/TestVAPIClient';
import { ArrowRight, Check, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalLeads: 0,
    newLeads: 0,
    qualifiedLeads: 0,
    totalCalls: 0
  });
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { count: totalLeads } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true });
          
        const { count: newLeads } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'new');
          
        const { count: qualifiedLeads } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'qualified');
          
        const { count: totalCalls } = await supabase
          .from('conversations')
          .select('*', { count: 'exact', head: true });
          
        setStats({
          totalLeads: totalLeads || 0,
          newLeads: newLeads || 0,
          qualifiedLeads: qualifiedLeads || 0,
          totalCalls: totalCalls || 0
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  return (
    <PageLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Relay Dashboard</h1>
          <p className="text-muted-foreground">Your mortgage lead management platform</p>
        </div>
        
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
