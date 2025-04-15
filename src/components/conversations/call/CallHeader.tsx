
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Minimize2 } from 'lucide-react';

interface CallHeaderProps {
  leadInfo: {
    name: string;
    phone: string;
  };
  callDuration: number;
  onMinimize: () => void;
}

export const CallHeader = ({ leadInfo, callDuration, onMinimize }: CallHeaderProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="p-4 bg-muted flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div className="bg-primary/10 text-primary p-2 rounded-full">
          <User className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-medium">{leadInfo.name}</h3>
          <p className="text-sm text-muted-foreground">{leadInfo.phone}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {formatTime(callDuration)}
        </span>
        <div className="flex">
          <Button variant="ghost" size="icon" onClick={onMinimize}>
            <Minimize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
