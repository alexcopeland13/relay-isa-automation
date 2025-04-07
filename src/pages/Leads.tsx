
import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeadsList, Lead } from '@/components/leads/LeadsList';
import { LeadsBoard } from '@/components/leads/LeadsBoard';
import { LeadMetrics } from '@/components/leads/LeadMetrics';
import { LeadDistribution } from '@/components/leads/LeadDistribution';
import { PlusCircle, UserPlus, UploadCloud, ArrowDownToLine, ListFilter } from 'lucide-react';
import { sampleLeads } from '@/data/sampleLeadsData';

const Leads = () => {
  const [activeView, setActiveView] = useState<'list' | 'board'>('list');
  
  // Eventually this would come from API or state management
  const leads = sampleLeads;
  
  // Function to handle selecting a lead (would navigate to lead detail page)
  const handleSelectLead = (lead: Lead) => {
    console.log('Selected lead:', lead);
    // In the future this would navigate to a lead detail page
    // navigate(`/leads/${lead.id}`)
  };

  return (
    <PageLayout>
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div>
            <h1 className="text-2xl font-bold">Leads Management</h1>
            <p className="text-muted-foreground mt-1">View, filter, and manage all your leads in one place</p>
          </div>
          
          <div className="flex gap-2 mt-4 sm:mt-0">
            <Button className="gap-1">
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">New Lead</span>
            </Button>
            
            <Button variant="outline" size="icon" title="Import Leads">
              <UploadCloud className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" title="Export Leads">
              <ArrowDownToLine className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Metrics Dashboard */}
      <div className="mb-6">
        <LeadMetrics leads={leads} />
      </div>
      
      {/* Lead Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <LeadDistribution leads={leads} />
        
        <div className="col-span-1 grid gap-4">
          {/* Recent Activity and Top Performing Sources could go here */}
        </div>
      </div>
      
      {/* Lead List View */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex justify-between items-center mb-4">
          <Tabs defaultValue={activeView} onValueChange={(value) => setActiveView(value as 'list' | 'board')}>
            <TabsList>
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="board">Board View</TabsTrigger>
            </TabsList>
          
            <TabsContent value="list" className="mt-0">
              <LeadsList 
                leads={leads}
                onSelectLead={handleSelectLead}
              />
            </TabsContent>
            
            <TabsContent value="board" className="mt-0">
              <LeadsBoard
                leads={leads}
                onSelectLead={handleSelectLead}
              />
            </TabsContent>
          </Tabs>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-1">
              <ListFilter className="h-4 w-4" />
              <span>Saved Filters</span>
            </Button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Leads;
