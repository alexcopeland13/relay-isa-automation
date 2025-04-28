
import { 
  Table, TableHeader, TableRow, TableHead, 
  TableBody, TableCell 
} from '@/components/ui/table';
import { QualificationLead, LeadOverrideStatus } from '../types/qualification-types';
import { QualificationStatusBadge, OverrideStatusBadge } from './QualificationStatusBadge';
import { QualificationScoreCell } from './QualificationScoreCell';
import { LeadMetricsCell } from './LeadMetricsCell';
import { TimestampCell } from './TimestampCell';
import { QualificationActionsDropdown } from './QualificationActionsDropdown';

interface QualificationTableProps {
  leads: QualificationLead[];
  onOverride: (id: number, status: LeadOverrideStatus) => void;
}

export const QualificationTable = ({ leads, onOverride }: QualificationTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Lead</TableHead>
            <TableHead>AI Decision</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Key Metrics</TableHead>
            <TableHead>Timestamp</TableHead>
            <TableHead>Override Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No matching leads found
              </TableCell>
            </TableRow>
          ) : (
            leads.map(lead => (
              <TableRow key={lead.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{lead.name}</div>
                    <div className="text-sm text-muted-foreground">{lead.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <QualificationStatusBadge decision={lead.aiDecision} />
                </TableCell>
                <TableCell>
                  <QualificationScoreCell score={lead.qualificationScore} />
                </TableCell>
                <TableCell>
                  <LeadMetricsCell 
                    income={lead.income} 
                    debt={lead.debt} 
                    creditScore={lead.creditScore} 
                  />
                </TableCell>
                <TableCell>
                  <TimestampCell timestamp={lead.timestamp} />
                </TableCell>
                <TableCell>
                  <OverrideStatusBadge status={lead.overrideStatus} />
                </TableCell>
                <TableCell className="text-right">
                  <QualificationActionsDropdown 
                    leadId={lead.id}
                    onOverride={onOverride}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
