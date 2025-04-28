
import { Clock } from 'lucide-react';

interface TimestampCellProps {
  timestamp: string;
}

export const TimestampCell = ({ timestamp }: TimestampCellProps) => {
  return (
    <div className="flex items-center">
      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
      <span className="text-sm">
        {new Date(timestamp).toLocaleString()}
      </span>
    </div>
  );
};
