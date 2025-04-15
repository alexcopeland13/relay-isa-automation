
import { Button } from '@/components/ui/button';
import { 
  MicOff, 
  Mic, 
  PhoneOff, 
  PauseCircle, 
  ScreenShareOff, 
  UserPlus
} from 'lucide-react';

interface CallControlsProps {
  isMuted: boolean;
  onMuteToggle: () => void;
  onEndCall: () => void;
}

export const CallControls = ({ isMuted, onMuteToggle, onEndCall }: CallControlsProps) => {
  return (
    <div className="p-4 bg-muted border-t border-border flex justify-center">
      <div className="flex gap-2">
        <Button 
          variant={isMuted ? "default" : "outline"} 
          size="icon"
          onClick={onMuteToggle}
        >
          {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
        
        <Button variant="outline" size="icon">
          <PauseCircle className="h-4 w-4" />
        </Button>
        
        <Button variant="outline" size="icon">
          <ScreenShareOff className="h-4 w-4" />
        </Button>
        
        <Button variant="outline" size="icon">
          <UserPlus className="h-4 w-4" />
        </Button>
        
        <Button variant="destructive" size="icon" onClick={onEndCall}>
          <PhoneOff className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
