
import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Clipboard, Users, CheckCircle, FileText, Filter, Download } from 'lucide-react';
import { QualificationOverrides } from '@/components/team-lead/QualificationOverrides';
import { ExpertAssignmentManager } from '@/components/team-lead/ExpertAssignmentManager';
import { MortgageProgramMatcher } from '@/components/team-lead/MortgageProgramMatcher';
import { BulkActionCenter } from '@/components/team-lead/BulkActionCenter';
import { TeamLeadAnalytics } from '@/components/team-lead/TeamLeadAnalytics';

const TeamLeadControls = () => {
  const [activeTab, setActiveTab] = useState('qualification');
  const { toast } = useToast();
  
  const handleExportData = () => {
    toast({
      title: "Export started",
      description: "Your data export is being prepared and will download shortly.",
    });
    
    // Simulate export delay
    setTimeout(() => {
      toast({
        title: "Export complete",
        description: "Your data has been exported successfully.",
      });
    }, 1500);
  };

  return (
    <PageLayout>
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div>
            <h1 className="text-2xl font-bold">Team Lead Control Center</h1>
            <p className="text-muted-foreground mt-1">
              Manage AI decisions, expert assignments, and lead processing
            </p>
          </div>
          
          <div className="flex items-center gap-2 mt-4 sm:mt-0">
            <Button variant="outline" onClick={handleExportData}>
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="qualification">
                <CheckCircle className="mr-2 h-4 w-4" />
                Qualification Overrides
              </TabsTrigger>
              <TabsTrigger value="assignments">
                <Users className="mr-2 h-4 w-4" />
                Expert Assignments
              </TabsTrigger>
              <TabsTrigger value="mortgage">
                <Clipboard className="mr-2 h-4 w-4" />
                Mortgage Programs
              </TabsTrigger>
              <TabsTrigger value="bulk">
                <FileText className="mr-2 h-4 w-4" />
                Bulk Actions
              </TabsTrigger>
              <TabsTrigger value="analytics">
                <Filter className="mr-2 h-4 w-4" />
                Analytics
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="qualification" className="space-y-4">
            <QualificationOverrides />
          </TabsContent>
          
          <TabsContent value="assignments" className="space-y-4">
            <ExpertAssignmentManager />
          </TabsContent>
          
          <TabsContent value="mortgage" className="space-y-4">
            <MortgageProgramMatcher />
          </TabsContent>
          
          <TabsContent value="bulk" className="space-y-4">
            <BulkActionCenter />
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-4">
            <TeamLeadAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default TeamLeadControls;
