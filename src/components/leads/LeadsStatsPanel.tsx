
import React from 'react';
import { LeadMetrics } from '@/components/leads/LeadMetrics';
import { LeadDistribution } from '@/components/leads/LeadDistribution';
import { Lead } from '@/types/lead';
import { cn } from '@/lib/utils';

interface LeadsStatsPanelProps {
  leads: Lead[];
  className?: string;
}

export const LeadsStatsPanel = ({ leads, className }: LeadsStatsPanelProps) => {
  // Placeholder for new leads today calculation
  const newLeadsToday = leads.filter(lead => {
    const leadDate = new Date(lead.createdAt).toDateString();
    const todayDate = new Date().toDateString();
    return leadDate === todayDate;
  }).length;

  return (
    <div className={cn(className)}>
      <div className="mb-6">
        <LeadMetrics leads={leads} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <LeadDistribution leads={leads} className="lg:col-span-2" />

        <div className="bg-card p-4 rounded-lg border lg:col-span-1">
          <h3 className="text-lg font-semibold mb-2">Quick Stats</h3>
          <p>Total Leads: {leads.length}</p>
          <p>New Leads (Today): {newLeadsToday}</p>
          {/* Placeholder for more quick stats */}
        </div>
      </div>
    </div>
  );
};
