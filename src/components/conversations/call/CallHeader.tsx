
import { Button } from "@/components/ui/button";
import { Minimize2 } from "lucide-react";
import { LiveStatusIndicator } from "./LiveStatusIndicator";

interface CallHeaderProps {
  leadInfo: {
    name: string;
    phone: string;
  };
  callDuration: number;
  callSid?: string;
  isActive?: boolean;
  onMinimize: () => void;
}

export const CallHeader = ({ 
  leadInfo, 
  callDuration, 
  callSid, 
  isActive = true,
  onMinimize 
}: CallHeaderProps) => {
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="bg-primary text-primary-foreground p-4 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="font-semibold text-lg">{leadInfo.name}</h3>
            <p className="text-sm opacity-90">{leadInfo.phone}</p>
          </div>
          
          <LiveStatusIndicator 
            status={isActive ? 'active' : 'completed'} 
            size="md"
          />
        </div>
        
        <div className="text-sm">
          <div>Duration: {formatTime(callDuration)}</div>
          {callSid && (
            <div className="text-xs opacity-75">ID: {callSid}</div>
          )}
        </div>
      </div>
      
      <Button variant="ghost" size="icon" onClick={onMinimize}>
        <Minimize2 className="h-4 w-4" />
      </Button>
    </div>
  );
};
