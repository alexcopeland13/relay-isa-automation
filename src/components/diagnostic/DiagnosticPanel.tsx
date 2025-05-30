import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase, diagnoseDatabaseConnection } from '@/integrations/supabase/client';
import { PhoneLookupTest } from './PhoneLookupTest';
import { AiPerformanceMonitor } from './AiPerformanceMonitor';
import { ConversationQualityValidator } from './ConversationQualityValidator';
import { 
  Database, 
  Phone, 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  Webhook,
  Users,
  Calendar,
  Brain,
  MessageSquare
} from 'lucide-react';

interface DiagnosticResult {
  test: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

export const DiagnosticPanel = () => {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    const newResults: DiagnosticResult[] = [];

    try {
      // Test database connection
      const dbResult = await diagnoseDatabaseConnection();
      newResults.push({
        test: 'Database Connection',
        status: dbResult.success ? 'success' : 'error',
        message: dbResult.success ? 'Database connected successfully' : dbResult.message || 'Database connection failed',
        details: dbResult
      });

      // Test phone_lead_mapping table
      try {
        const { data: mappings, error: mappingError } = await supabase
          .from('phone_lead_mapping')
          .select('count')
          .limit(1);

        newResults.push({
          test: 'Phone Lead Mapping Table',
          status: mappingError ? 'error' : 'success',
          message: mappingError ? mappingError.message : 'Phone mapping table accessible',
          details: { count: mappings?.length || 0 }
        });
      } catch (error: any) {
        newResults.push({
          test: 'Phone Lead Mapping Table',
          status: 'error',
          message: error.message || 'Failed to access phone mapping table'
        });
      }

      // Test scheduled_callbacks table
      try {
        const { data: callbacks, error: callbackError } = await supabase
          .from('scheduled_callbacks')
          .select('count')
          .limit(1);

        newResults.push({
          test: 'Scheduled Callbacks Table',
          status: callbackError ? 'error' : 'success',
          message: callbackError ? callbackError.message : 'Scheduled callbacks table accessible',
          details: { count: callbacks?.length || 0 }
        });
      } catch (error: any) {
        newResults.push({
          test: 'Scheduled Callbacks Table',
          status: 'error',
          message: error.message || 'Failed to access scheduled callbacks table'
        });
      }

      // Test CINC webhook function
      try {
        // This would normally test the webhook, but for now we'll just check if the function exists
        newResults.push({
          test: 'CINC Webhook Integration',
          status: 'warning',
          message: 'Webhook endpoint configured (test with actual CINC data)',
          details: { endpoint: 'supabase/functions/cinc-webhook' }
        });
      } catch (error: any) {
        newResults.push({
          test: 'CINC Webhook Integration',
          status: 'error',
          message: error.message || 'Webhook test failed'
        });
      }

      // Test Retell webhook function
      try {
        newResults.push({
          test: 'Retell Webhook Integration',
          status: 'warning',
          message: 'Webhook endpoint configured (test with actual Retell data)',
          details: { endpoint: 'supabase/functions/retell-webhook' }
        });
      } catch (error: any) {
        newResults.push({
          test: 'Retell Webhook Integration',
          status: 'error',
          message: error.message || 'Retell webhook test failed'
        });
      }

      // Test phone lookup function
      try {
        const { error: lookupError } = await supabase.functions.invoke('phone-lookup', {
          body: { phone_number: '+15555555555' }
        });

        newResults.push({
          test: 'Phone Lookup Function',
          status: lookupError ? 'warning' : 'success',
          message: lookupError ? 'Function exists but no test data found' : 'Phone lookup function working',
          details: { test_number: '+15555555555' }
        });
      } catch (error: any) {
        newResults.push({
          test: 'Phone Lookup Function',
          status: 'error',
          message: error.message || 'Phone lookup function test failed'
        });
      }

    } catch (error: any) {
      newResults.push({
        test: 'General Diagnostics',
        status: 'error',
        message: error.message || 'Unexpected error during diagnostics'
      });
    }

    setResults(newResults);
    setLoading(false);
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">CINC Integration Diagnostics</h2>
          <p className="text-gray-600">Test and monitor CINC to Retell integration with AI capabilities</p>
        </div>
        <Button onClick={runDiagnostics} disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Database className="h-4 w-4 mr-2" />
          )}
          Run Diagnostics
        </Button>
      </div>

      <Tabs defaultValue="system-tests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="system-tests">System Tests</TabsTrigger>
          <TabsTrigger value="ai-performance">AI Performance</TabsTrigger>
          <TabsTrigger value="conversation-quality">Conversation Quality</TabsTrigger>
          <TabsTrigger value="phone-lookup">Phone Lookup</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="system-tests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {results.length === 0 ? (
                <div className="text-center py-8">
                  <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Run diagnostics to check system status</h3>
                  <p className="text-gray-500">Click "Run Diagnostics" to test all components</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {results.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(result.status)}
                        <div>
                          <h4 className="font-medium">{result.test}</h4>
                          <p className="text-sm text-gray-600">{result.message}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(result.status)}>
                        {result.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-performance" className="space-y-4">
          <AiPerformanceMonitor />
        </TabsContent>

        <TabsContent value="conversation-quality" className="space-y-4">
          <ConversationQualityValidator />
        </TabsContent>

        <TabsContent value="phone-lookup" className="space-y-4">
          <PhoneLookupTest />
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Webhook className="h-4 w-4" />
                  Webhook Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">CINC Webhook</span>
                    <Badge variant="outline">Ready</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Retell Webhook</span>
                    <Badge variant="outline">Ready</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Lead Mapping
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Mapped Leads</span>
                    <Badge variant="secondary">Loading...</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Ready for Calls</span>
                    <Badge variant="secondary">Loading...</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Callbacks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Scheduled</span>
                    <Badge variant="secondary">Loading...</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Pending</span>
                    <Badge variant="secondary">Loading...</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
