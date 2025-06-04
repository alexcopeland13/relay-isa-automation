
import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { LeadsHeader } from '@/components/leads/LeadsHeader';
import { LeadsViewTabs } from '@/components/leads/LeadsViewTabs';
import { LeadsStatsPanel } from '@/components/leads/LeadsStatsPanel';
import { sampleLeads } from '@/data/sampleLeadsData';
import { Lead } from '@/types/lead';

const Leads = () => {
  const [currentView, setCurrentView] = useState<'list' | 'board'>('list');
  const [leads] = useState(sampleLeads);

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
  };

  const handleExportData = async (format: string, options: any) => {
    console.log('Exporting data:', format, options);
  };

  const handleNewLeadClick = () => {
    console.log('New lead clicked');
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        <LeadsHeader 
          isLoading={false}
          onManualRefresh={handleManualRefresh}
          leads={leads}
          onExportData={handleExportData}
          onNewLeadClick={handleNewLeadClick}
        />
        <LeadsStatsPanel leads={leads} />
        <LeadsViewTabs 
          leads={leads}
          activeView={currentView}
          onActiveViewChange={setCurrentView}
          onSelectLead={handleSelectLead}
          onOpenAssignmentModal={handleAssignLead}
          onScheduleFollowUp={handleScheduleFollowUp}
        />
      </div>
    </PageLayout>
  );
};

export default Leads;
