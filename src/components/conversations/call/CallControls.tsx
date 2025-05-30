
import { Button } from "@/components/ui/button";
import { Mic, MicOff, PhoneOff, Volume2, VolumeX } from "lucide-react";

interface CallControlsProps {
  isMuted: boolean;
  isActive?: boolean;
  onMuteToggle: () => void;
  onEndCall: () => void;
}

export const CallControls = ({ 
  isMuted, 
  isActive = true, 
  onMuteToggle, 
  onEndCall 
}: CallControlsProps) => {
  return (
    <div className="border-t border-border p-4 bg-muted/30">
      <div className="flex justify-center gap-4">
        <Button
          variant={isMuted ? "destructive" : "outline"}
          size="lg"
          onClick={onMuteToggle}
          disabled={!isActive}
          className="gap-2"
        >
          {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          {isMuted ? "Unmute" : "Mute"}
        </Button>
        
        <Button
          variant="destructive"
          size="lg"
          onClick={onEndCall}
          className="gap-2"
        >
          <PhoneOff className="h-4 w-4" />
          {isActive ? "End Call" : "Close"}
        </Button>
      </div>
      
      {!isActive && (
        <p className="text-center text-sm text-muted-foreground mt-2">
          Call has ended
        </p>
      )}
    </div>
  );
};
