
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, CheckCircle2, X, ArrowUpDown } from 'lucide-react';
import { LeadOverrideStatus } from '../types/qualification-types';

interface ActionsDropdownProps {
  leadId: number;
  onOverride: (id: number, status: LeadOverrideStatus) => void;
}

export const QualificationActionsDropdown = ({ leadId, onOverride }: ActionsDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => onOverride(leadId, 'Approved')}
          className="flex items-center"
        >
          <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
          <span>Approve Qualification</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onOverride(leadId, 'Rejected')}
          className="flex items-center"
        >
          <X className="mr-2 h-4 w-4 text-red-500" />
          <span>Reject Qualification</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => onOverride(leadId, null)}
          className="flex items-center"
        >
          <ArrowUpDown className="mr-2 h-4 w-4" />
          <span>Reset to AI Decision</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
