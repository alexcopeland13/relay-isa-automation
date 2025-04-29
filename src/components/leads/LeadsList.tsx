
import { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Lead } from '@/types/lead';
import { LeadSearchFilters } from './LeadSearchFilters';
import { LeadTableRow } from './LeadTableRow';
import { LeadEmptyState } from './LeadEmptyState';

interface LeadsListProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onAssignLead?: (lead: Lead) => void;
  onScheduleFollowUp?: (lead: Lead) => void;
}

export const LeadsList = ({ 
  leads, 
  onSelectLead, 
  onAssignLead,
  onScheduleFollowUp
}: LeadsListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  
  const filteredLeads = leads.filter(lead => {
    if (searchQuery && !lead.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !lead.email.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    if (filterStatus !== 'all' && lead.status !== filterStatus) {
      return false;
    }
    
    if (filterSource !== 'all' && lead.source !== filterSource) {
      return false;
    }
    
    if (filterType !== 'all' && lead.type !== filterType) {
      return false;
    }
    
    return true;
  });
  
  return (
    <div className="space-y-4">
      <LeadSearchFilters
        searchQuery={searchQuery}
        filterStatus={filterStatus}
        filterSource={filterSource}
        filterType={filterType}
        onSearchChange={setSearchQuery}
        onFilterStatusChange={setFilterStatus}
        onFilterSourceChange={setFilterSource}
        onFilterTypeChange={setFilterType}
      />
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[25%]">Lead Name</TableHead>
              <TableHead className="w-[12%]">Status</TableHead>
              <TableHead className="w-[12%]">Type</TableHead>
              <TableHead className="w-[15%]">Source</TableHead>
              <TableHead className="w-[10%]">Score</TableHead>
              <TableHead className="w-[15%]">Last Contact</TableHead>
              <TableHead className="w-[11%]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.length === 0 ? (
              <LeadEmptyState />
            ) : (
              filteredLeads.map((lead) => (
                <LeadTableRow 
                  key={lead.id}
                  lead={lead}
                  onSelectLead={onSelectLead}
                  onAssignLead={onAssignLead}
                  onScheduleFollowUp={onScheduleFollowUp}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
