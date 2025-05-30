
import { Badge } from '@/components/ui/badge';
import { Waves } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TranscriptUpdateIndicatorProps {
  isUpdating: boolean;
  lastUpdate?: string;
}

export const TranscriptUpdateIndicator = ({ 
  isUpdating, 
  lastUpdate 
}: TranscriptUpdateIndicatorProps) => {
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    if (isUpdating) {
      setShowIndicator(true);
      const timer = setTimeout(() => setShowIndicator(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isUpdating]);

  if (!showIndicator && !isUpdating) return null;

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <Badge variant="outline" className="gap-1">
        <Waves className="h-3 w-3 animate-pulse" />
        Transcript updating...
      </Badge>
      {lastUpdate && (
        <span>
          Last update: {new Date(lastUpdate).toLocaleTimeString()}
        </span>
      )}
    </div>
  );
};
