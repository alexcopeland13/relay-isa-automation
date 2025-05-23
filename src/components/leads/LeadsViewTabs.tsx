
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { LeadsList } from '@/components/leads/LeadsList';
import { LeadsBoard } from '@/components/leads/LeadsBoard';
import { Lead } from '@/types/lead';
import { ListFilter, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeadsViewTabsProps {
  leads: Lead[];
  activeView: 'list' | 'board';
  onActiveViewChange: (view: 'list' | 'board') => void;
  onSelectLead: (lead: Lead) => void;
  onOpenAssignmentModal: (lead: Lead) => void;
  onScheduleFollowUp: (lead: Lead) => void;
  className?: string;
}

export const LeadsViewTabs = ({
  leads,
  activeView,
  onActiveViewChange,
  onSelectLead,
  onOpenAssignmentModal,
  onScheduleFollowUp,
  className,
}: LeadsViewTabsProps) => {
  return (
    <div className={cn("bg-card rounded-lg border border-border p-6", className)}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Button 
            variant={activeView === 'list' ? 'default' : 'outline'}
            onClick={() => onActiveViewChange('list')}
            className="gap-1"
          >
            List View
          </Button>
          <Button 
            variant={activeView === 'board' ? 'default' : 'outline'}
            onClick={() => onActiveViewChange('board')}
            className="gap-1"
          >
            Board View
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-1" disabled>
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </Button>

          <Button variant="outline" className="gap-1" disabled>
            <ListFilter className="h-4 w-4" />
            <span>Saved Filters</span>
          </Button>
        </div>
      </div>

      <div>
        {activeView === 'list' ? (
          <LeadsList
            leads={leads}
            onSelectLead={onSelectLead}
            onAssignLead={onOpenAssignmentModal}
            onScheduleFollowUp={onScheduleFollowUp}
          />
        ) : (
          <LeadsBoard
            leads={leads}
            onSelectLead={onSelectLead}
          />
        )}
      </div>
    </div>
  );
};
