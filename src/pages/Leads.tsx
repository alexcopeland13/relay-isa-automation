
import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeadsList, Lead } from '@/components/leads/LeadsList';
import { LeadsBoard } from '@/components/leads/LeadsBoard';
import { LeadMetrics } from '@/components/leads/LeadMetrics';
import { LeadDistribution } from '@/components/leads/LeadDistribution';
import { 
  PlusCircle, 
  UserPlus, 
  UploadCloud, 
  ArrowDownToLine, 
  ListFilter,
  RefreshCw,
  Filter
} from 'lucide-react';
import { sampleLeads } from '@/data/sampleLeadsData';
import { useAsyncData } from '@/hooks/use-async-data';
import { ErrorContainer } from '@/components/ui/error-container';
import { ExportMenu } from '@/components/ui/export-menu';
import { 
  TableSkeleton, 
  StatCardSkeleton, 
  ChartSkeleton 
} from '@/components/ui/loading-skeleton';

// Mock function to simulate API data fetch
const fetchLeadsData = async () => {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  // Return sample data
  return {
    leads: sampleLeads,
  };
};

const Leads = () => {
  const [activeView, setActiveView] = useState<'list' | 'board'>('list');
  
  const { 
    data, 
    isLoading, 
    error, 
    retry 
  } = useAsyncData(fetchLeadsData, null, []);
  
  // Function to handle selecting a lead (would navigate to lead detail page)
  const handleSelectLead = (lead: Lead) => {
    console.log('Selected lead:', lead);
    // In the future this would navigate to a lead detail page
    // navigate(`/leads/${lead.id}`)
  };

  const renderLoading = () => (
    <PageLayout>
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div>
            <h1 className="text-2xl font-bold">Leads Management</h1>
            <p className="text-muted-foreground mt-1">View, filter, and manage all your leads in one place</p>
          </div>
          
          <div className="flex gap-2 mt-4 sm:mt-0">
            <StatCardSkeleton />
          </div>
        </div>
      </div>
      
      {/* Metrics Dashboard - Loading */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      </div>
      
      {/* Lead Distribution Charts - Loading */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <ChartSkeleton />
      </div>
      
      {/* Lead List View - Loading */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <StatCardSkeleton />
          </div>
        </div>
        
        <TableSkeleton rows={6} cols={5} />
      </div>
    </PageLayout>
  );

  if (isLoading) {
    return renderLoading();
  }

  if (error) {
    return (
      <PageLayout>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Leads Management</h1>
          <p className="text-muted-foreground mt-1">View, filter, and manage all your leads in one place</p>
        </div>
        
        <div className="mb-6">
          <ErrorContainer
            title="Leads Data Error"
            description="We couldn't load your leads data."
            error={error}
            onRetry={retry}
            suggestions={[
              "Check your internet connection",
              "Verify your access permissions",
              "Try refreshing the page",
              "Contact support if the problem persists"
            ]}
          />
        </div>
        
        <div className="flex justify-end mb-6">
          <Button onClick={retry} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      </PageLayout>
    );
  }

  const leads = data?.leads || [];

  return (
    <PageLayout>
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div>
            <h1 className="text-2xl font-bold">Leads Management</h1>
            <p className="text-muted-foreground mt-1">View, filter, and manage all your leads in one place</p>
          </div>
          
          <div className="flex items-center gap-2 mt-4 sm:mt-0">
            <ExportMenu 
              data={leads}
              filename="relay_leads"
              exportableCols={['name', 'email', 'phone', 'status', 'source', 'date']}
              supportedFormats={['csv', 'email']}
            />
            
            <Button className="gap-1">
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">New Lead</span>
            </Button>
            
            <Button variant="outline" size="icon" title="Import Leads">
              <UploadCloud className="h-4 w-4" />
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
      </div>
      
      {/* Lead List View */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex justify-between items-center mb-4">
          <Tabs defaultValue={activeView} onValueChange={(value) => setActiveView(value as 'list' | 'board')}>
            <TabsList>
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="board">Board View</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-1">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
            
            <Button variant="outline" className="gap-1">
              <ListFilter className="h-4 w-4" />
              <span>Saved Filters</span>
            </Button>
          </div>
        </div>
        
        <div>
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
        </div>
      </div>
    </PageLayout>
  );
};

export default Leads;
