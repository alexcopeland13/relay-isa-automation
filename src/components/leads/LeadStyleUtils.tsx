
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'New':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Contacted':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'Qualified':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Proposal':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Converted':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'Lost':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getTypeColor = (type: string) => {
  switch (type) {
    case 'Mortgage':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    case 'Realtor':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getScoreColor = (score: number) => {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 60) return 'bg-green-500';
  if (score >= 40) return 'bg-yellow-500';
  if (score >= 20) return 'bg-orange-500';
  return 'bg-red-500';
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => (
  <Badge 
    variant="outline" 
    className={cn("font-normal", getStatusColor(status), className)}
  >
    {status}
  </Badge>
);

interface TypeBadgeProps {
  type: string;
  className?: string;
}

export const TypeBadge = ({ type, className }: TypeBadgeProps) => (
  <Badge 
    variant="outline" 
    className={cn("font-normal", getTypeColor(type), className)}
  >
    {type}
  </Badge>
);

interface ScoreIndicatorProps {
  score: number;
  showValue?: boolean;
}

export const ScoreIndicator = ({ score, showValue = true }: ScoreIndicatorProps) => (
  <div className="flex items-center gap-2">
    <div className={`w-10 h-2 rounded-full ${getScoreColor(score)}`} />
    {showValue && <span>{score}</span>}
  </div>
);
