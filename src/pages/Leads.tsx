
import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { LeadsHeader } from '@/components/leads/LeadsHeader';
import { LeadsViewTabs } from '@/components/leads/LeadsViewTabs';
import { LeadsList } from '@/components/leads/LeadsList';
import { LeadsBoard } from '@/components/leads/LeadsBoard';
import { LeadsStatsPanel } from '@/components/leads/LeadsStatsPanel';
import { sampleLeadsData } from '@/data/sampleLeadsData';

const Leads = () => {
  const [currentView, setCurrentView] = useState<'list' | 'board'>('list');
  const [leads] = useState(sampleLeadsData);

  return (
    <PageLayout>
      <div className="space-y-6">
        <LeadsHeader />
        <LeadsStatsPanel leads={leads} />
        <LeadsViewTabs 
          currentView={currentView}
          onViewChange={setCurrentView}
        />
        {currentView === 'list' ? (
          <LeadsList leads={leads} />
        ) : (
          <LeadsBoard leads={leads} />
        )}
      </div>
    </PageLayout>
  );
};

export default Leads;
