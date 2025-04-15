
import { Button } from "@/components/ui/button";
import { Maximize2, PhoneOff } from "lucide-react";

interface MinimizedCallViewProps {
  leadInfo: {
    name: string;
  };
  callDuration: number;
  onMaximize: () => void;
  onEndCall: () => void;
}

export const MinimizedCallView = ({ 
  leadInfo, 
  callDuration, 
  onMaximize, 
  onEndCall 
}: MinimizedCallViewProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed bottom-4 right-4 bg-background border border-border shadow-lg rounded-lg p-3 w-64 z-50">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="font-medium">{leadInfo.name}</span>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={onMaximize}>
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onEndCall}>
            <PhoneOff className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </div>
      <div className="text-sm text-muted-foreground mt-1">
        Call duration: {formatTime(callDuration)}
      </div>
    </div>
  );
};
