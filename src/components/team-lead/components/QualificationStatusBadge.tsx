
import { Badge } from '@/components/ui/badge';
import { QualificationDecision, LeadOverrideStatus } from '../types/qualification-types';

interface StatusBadgeProps {
  decision: QualificationDecision;
}

export const QualificationStatusBadge = ({ decision }: StatusBadgeProps) => {
  switch (decision) {
    case 'Qualified':
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">{decision}</Badge>;
    case 'Not Qualified':
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">{decision}</Badge>;
    case 'Needs Review':
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">{decision}</Badge>;
    default:
      return <Badge variant="outline">{decision}</Badge>;
  }
};

interface OverrideStatusBadgeProps {
  status: LeadOverrideStatus;
}

export const OverrideStatusBadge = ({ status }: OverrideStatusBadgeProps) => {
  switch (status) {
    case 'Approved':
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Manually Approved</Badge>;
    case 'Rejected':
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Manually Rejected</Badge>;
    default:
      return <Badge variant="outline">Pending Review</Badge>;
  }
};
