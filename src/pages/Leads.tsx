
import { PageLayout } from '@/components/layout/PageLayout';
import { LeadsHeader } from '@/components/leads/LeadsHeader';
import { LeadsViewTabs } from '@/components/leads/LeadsViewTabs';
import { LeadsStatsPanel } from '@/components/leads/LeadsStatsPanel';
import { useLeadsData } from '@/hooks/use-leads-data';
import { Lead } from '@/types/lead';

const Leads = () => {
  const { leads, isLoading, error, createLead, updateLead, deleteLead } = useLeadsData();
  
  const handleSelectLead = (lead: Lead) => {
    console.log('Selected lead:', lead);
  };

  const handleAssignLead = (lead: Lead) => {
    console.log('Assign lead:', lead);
  };

  const handleScheduleFollowUp = (lead: Lead) => {
    console.log('Schedule follow up for:', lead);
  };

  const handleManualRefresh = () => {
    console.log('Refreshing leads...');
    // The useLeadsData hook already handles real-time updates, but we can call fetchLeads if needed
  };

  const handleExportData = async (format: string, options: any) => {
    console.log('Exporting data:', format, options);
  };

  const handleNewLeadClick = () => {
    console.log('New lead clicked');
  };

  // Show loading state
  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading leads...</div>
        </div>
      </PageLayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">Error loading leads: {error}</div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        <LeadsHeader 
          isLoading={isLoading}
          onManualRefresh={handleManualRefresh}
          leads={leads}
          onExportData={handleExportData}
          onNewLeadClick={handleNewLeadClick}
        />
        <LeadsStatsPanel leads={leads} />
        <LeadsViewTabs 
          leads={leads}
          activeView="list"
          onActiveViewChange={() => {}}
          onSelectLead={handleSelectLead}
          onOpenAssignmentModal={handleAssignLead}
          onScheduleFollowUp={handleScheduleFollowUp}
        />
      </div>
    </PageLayout>
  );
};

export default Leads;
