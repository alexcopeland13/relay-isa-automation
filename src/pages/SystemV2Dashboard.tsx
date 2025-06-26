
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SystemConfigPanel } from '@/components/system/SystemConfigPanel';
import { LeadsV2Dashboard } from '@/components/v2/LeadsV2Dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, Settings, Workflow } from 'lucide-react';

export default function SystemV2Dashboard() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System V2 Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage the new streamlined workflow system with Make.com integration
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Database className="h-4 w-4" />
          V2 System
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="leads" className="flex items-center gap-2">
            <Workflow className="h-4 w-4" />
            Leads V2
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  V2 Architecture
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Leads V2 Table</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Conversations V2</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">AI Profiles</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Migration Status</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Workflow className="h-5 w-5" />
                  Make.com Workflows
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">CINC Ingestion V2</span>
                    <Badge variant="secondary">Ready</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Retell Processing V2</span>
                    <Badge variant="secondary">Ready</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">AI Profile Generation</span>
                    <Badge variant="secondary">Ready</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Lead Scoring</span>
                    <Badge variant="secondary">Ready</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Parallel Operation</span>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Migration Tools</span>
                    <Badge variant="default">Available</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Feature Flags</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Data Integrity</span>
                    <Badge variant="default">Protected</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leads">
          <LeadsV2Dashboard />
        </TabsContent>

        <TabsContent value="config">
          <SystemConfigPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
