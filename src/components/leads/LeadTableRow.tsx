
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { 
  Phone, Mail, MapPin, Clock, Tag, MoreHorizontal,
  User, FileEdit, CalendarPlus, Users
} from 'lucide-react';
import { StatusBadge, TypeBadge, ScoreIndicator } from './LeadStyleUtils';
import { Lead } from '@/types/lead';

interface LeadTableRowProps {
  lead: Lead;
  onSelectLead: (lead: Lead) => void;
  onAssignLead?: (lead: Lead) => void;
  onScheduleFollowUp?: (lead: Lead) => void;
}

export const LeadTableRow = ({ 
  lead, 
  onSelectLead, 
  onAssignLead, 
  onScheduleFollowUp 
}: LeadTableRowProps) => {
  // Add safety checks for null/undefined values
  const displayLocation = lead.location || 'Unknown';
  const displayScore = lead.score || 0;
  const displayLastContact = lead.lastContact ? new Date(lead.lastContact).toLocaleDateString() : 'Never';
  const displayCreatedAt = lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'Unknown';
  const displayAssignedTo = lead.assignedTo === 'unassigned' ? 'Unassigned' : 
    (lead.assignedTo ? lead.assignedTo.split('@')[0] : 'Unassigned');
  
  return (
    <TableRow 
      key={lead.id} 
      className="cursor-pointer hover:bg-muted/50"
      onClick={() => onSelectLead(lead)}
    >
      <TableCell>
        <div>
          <div className="font-medium">{lead.name}</div>
          <div className="text-sm text-muted-foreground flex flex-col md:flex-row md:gap-3">
            <div className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              <span className="truncate max-w-[150px]">{lead.email}</span>
            </div>
            <div className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              <span>{lead.phone}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <MapPin className="h-3 w-3" />
            <span>{displayLocation}</span>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <StatusBadge status={lead.status} />
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <TypeBadge type={lead.type} />
          <div className="flex items-center gap-1 text-xs">
            <Tag className="h-3 w-3 text-muted-foreground" />
            <span>{lead.interestType || 'General'}</span>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm">{lead.source}</div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{displayCreatedAt}</span>
        </div>
      </TableCell>
      <TableCell>
        <ScoreIndicator score={displayScore} />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1 text-sm">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span>{displayLastContact}</span>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {displayAssignedTo}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onSelectLead(lead);
              }}>
                <User className="h-4 w-4 mr-2" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onSelectLead(lead);
              }}>
                <FileEdit className="h-4 w-4 mr-2" />
                Edit Lead
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onScheduleFollowUp?.(lead);
              }}>
                <CalendarPlus className="h-4 w-4 mr-2" />
                Schedule Follow-up
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onAssignLead?.(lead);
              }}>
                <Users className="h-4 w-4 mr-2" />
                Assign Lead
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
};
