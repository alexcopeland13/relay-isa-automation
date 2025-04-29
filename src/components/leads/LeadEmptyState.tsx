
import { TableRow, TableCell } from '@/components/ui/table';

interface LeadEmptyStateProps {
  message?: string;
}

export const LeadEmptyState = ({ 
  message = "No leads found matching your filters. Try adjusting your search criteria."
}: LeadEmptyStateProps) => {
  return (
    <TableRow>
      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
        {message}
      </TableCell>
    </TableRow>
  );
};
