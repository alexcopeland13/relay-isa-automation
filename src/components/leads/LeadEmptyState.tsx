
import { TableRow, TableCell } from '@/components/ui/table';

interface LeadEmptyStateProps {
  message?: string;
  colSpan?: number; // Added colSpan prop
}

export const LeadEmptyState = ({ 
  message = "No leads found matching your filters. Try adjusting your search criteria.",
  colSpan = 7 // Default value if not provided, matching previous usage
}: LeadEmptyStateProps) => {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="text-center py-8 text-muted-foreground">
        {message}
      </TableCell>
    </TableRow>
  );
};
