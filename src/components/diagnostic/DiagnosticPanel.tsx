
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Code } from '@/components/ui/code';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { RetellTestClient } from './RetellTestClient';

export function DiagnosticPanel() {
  const [diagnosticData, setDiagnosticData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [directLeadsCount, setDirectLeadsCount] = useState<number | null>(null);
  const [directLeadsLoading, setDirectLeadsLoading] = useState<boolean>(false);

  const runDiagnostics = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: funcError } = await supabase.functions.invoke('diagnose-connection');
      
      if (funcError) {
        throw new Error(`Edge function error: ${funcError.message}`);
      }
      
      setDiagnosticData(data);
    } catch (err) {
      console.error('Diagnostic error:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const checkDirectLeadsCount = async () => {
    setDirectLeadsLoading(true);
    try {
      console.log('Checking direct leads count...');
      const { data, error, count } = await supabase
        .from('leads')
        .select('*', { count: 'exact' });
      
      if (error) throw error;
      
      console.log('Direct leads check:', { data, count });
      setDirectLeadsCount(data?.length || 0);
    } catch (err) {
      console.error('Direct leads count error:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setDirectLeadsLoading(false);
    }
  };

  const insertTestLead = async () => {
    try {
      setIsLoading(true);
      // Fix: Check the response structure properly
      const response = await supabase.functions.invoke('insert-lead', {
        body: {
          leadInfo: {
            firstName: 'Diagnostic',
            lastName: 'Test',
            email: `test${Date.now()}@example.com`,
            phone: '555-123-4567',
            source: 'diagnostic-test'
          }
        }
      });
      
      // Safely access response properties
      if (response.error) throw new Error(response.error.message);
      
      // Run diagnostics again after inserting
      await runDiagnostics();
      await checkDirectLeadsCount();
      
    } catch (err) {
      console.error('Test lead insertion error:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetellLeadCreated = async () => {
    // After a Retell test lead is created, refresh our diagnostics
    await runDiagnostics();
    await checkDirectLeadsCount();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>System Diagnostics</span>
          {error && <AlertTriangle className="h-5 w-5 text-destructive" />}
        </CardTitle>
        <CardDescription>
          Troubleshoot data flow between VAPI, Retell, Supabase, and the frontend
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          <Button 
            onClick={runDiagnostics} 
            variant="outline" 
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'hidden' : ''}`} />
            Run Diagnostics
          </Button>
          
          <Button 
            onClick={checkDirectLeadsCount}
            variant="outline"
            disabled={directLeadsLoading}
          >
            {directLeadsLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Check Direct Leads
          </Button>
          
          <Button 
            onClick={insertTestLead}
            variant="secondary"
            disabled={isLoading}
          >
            Insert Test Lead
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {directLeadsCount !== null && (
          <Alert className="mb-4">
            <AlertTitle>Direct Leads Count</AlertTitle>
            <AlertDescription>
              Found {directLeadsCount} leads in database via direct query
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <RetellTestClient onLeadCreated={handleRetellLeadCreated} />
          
          <Card>
            <CardHeader>
              <CardTitle>Integration Testing</CardTitle>
              <CardDescription>
                Test direct integrations with voice agents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Use these tools to test different voice agent integrations with your Relay CRM.
              </p>
              
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={insertTestLead}
                  variant="outline"
                  disabled={isLoading}
                >
                  Test VAPI Integration
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {diagnosticData && (
          <Tabs defaultValue="overview">
            <TabsList className="mb-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="leads">Leads</TabsTrigger>
              <TabsTrigger value="structure">Table Structure</TabsTrigger>
              <TabsTrigger value="raw">Raw Data</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="font-medium mb-2">Connection Status</h3>
                  <div className="flex items-center gap-2">
                    {/* Fix: Use valid Badge variants - 'default' or 'outline' instead of 'success' */}
                    <Badge variant={diagnosticData.environment.supabaseUrl ? "default" : "destructive"}>
                      Supabase URL {diagnosticData.environment.supabaseUrl ? "✓" : "✗"}
                    </Badge>
                    <Badge variant={diagnosticData.environment.hasServiceKey ? "default" : "destructive"}>
                      Service Key {diagnosticData.environment.hasServiceKey ? "✓" : "✗"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Data Overview</h3>
                  <div className="flex items-center gap-2">
                    <Badge>
                      {diagnosticData.leadsCount} leads found
                    </Badge>
                    <Badge variant={Object.values(diagnosticData.errors).some(e => e !== null) ? "destructive" : "outline"}>
                      {Object.values(diagnosticData.errors).filter(e => e !== null).length} errors
                    </Badge>
                  </div>
                </div>
              </div>
              
              <Accordion type="single" collapsible className="mt-4">
                <AccordionItem value="errors">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <span>Error Summary</span>
                      {Object.values(diagnosticData.errors).some(e => e !== null) ? (
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Error Type</TableHead>
                          <TableHead>Message</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(diagnosticData.errors).map(([key, value]) => (
                          <TableRow key={key}>
                            <TableCell>{key}</TableCell>
                            <TableCell>
                              {/* Fix: Convert unknown type to string */}
                              {value ? (
                                <span className="text-destructive">{String(value)}</span>
                              ) : (
                                <span className="text-green-500">No error</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>

            <TabsContent value="leads">
              <h3 className="font-medium mb-2">Lead Statuses (Check for case sensitivity)</h3>
              {diagnosticData.leadStatuses?.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lead ID</TableHead>
                      <TableHead>Status (exact value)</TableHead>
                      <TableHead>Source</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {diagnosticData.leadStatuses.map((lead: any) => (
                      <TableRow key={lead.id}>
                        <TableCell className="font-mono text-xs">{lead.id}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            "{lead.status}"
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {lead.source || 'Unknown'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Alert>
                  <AlertTitle>No leads found</AlertTitle>
                  <AlertDescription>
                    No lead status data is available to analyze
                  </AlertDescription>
                </Alert>
              )}
              
              {diagnosticData.recentLead && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Most Recent Lead</h3>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-sm font-medium">Name</p>
                          <p>{diagnosticData.recentLead.first_name} {diagnosticData.recentLead.last_name}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Status</p>
                          <p>"{diagnosticData.recentLead.status}"</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Email</p>
                          <p>{diagnosticData.recentLead.email}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Source</p>
                          <p>{diagnosticData.recentLead.source}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Created</p>
                          <p>{new Date(diagnosticData.recentLead.created_at).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">ID</p>
                          <p className="font-mono text-xs">{diagnosticData.recentLead.id}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="structure">
              {diagnosticData.tableInfo ? (
                <div>
                  <h3 className="font-medium mb-2">Leads Table Structure</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Column</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Nullable</TableHead>
                        <TableHead>Default</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {diagnosticData.tableInfo.map((column: any) => (
                        <TableRow key={column.column_name}>
                          <TableCell>{column.column_name}</TableCell>
                          <TableCell>{column.data_type}</TableCell>
                          <TableCell>{column.is_nullable}</TableCell>
                          <TableCell className="font-mono text-xs">{column.column_default}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Table structure unavailable</AlertTitle>
                  <AlertDescription>
                    Could not retrieve table structure information
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
            
            <TabsContent value="raw">
              <h3 className="font-medium mb-2">Raw Diagnostic Data</h3>
              <Code className="text-xs overflow-auto max-h-96">
                {JSON.stringify(diagnosticData, null, 2)}
              </Code>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
