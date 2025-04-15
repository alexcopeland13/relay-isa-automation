
import { Separator } from "@/components/ui/separator";

interface LeadInfoPanelProps {
  leadInfo: {
    email: string;
    phone: string;
    source: string;
  };
}

export const LeadInfoPanel = ({ leadInfo }: LeadInfoPanelProps) => {
  return (
    <div className="p-4">
      <h3 className="font-medium mb-3">Lead Information</h3>
      
      <div className="space-y-3">
        <div>
          <h4 className="text-xs text-muted-foreground">Contact</h4>
          <p className="text-sm">{leadInfo.email}</p>
          <p className="text-sm">{leadInfo.phone}</p>
        </div>
        
        <Separator />
        
        <div>
          <h4 className="text-xs text-muted-foreground">Source</h4>
          <p className="text-sm">{leadInfo.source}</p>
        </div>
        
        <Separator />
        
        <div>
          <h4 className="text-xs text-muted-foreground">Suggested Questions</h4>
          <ul className="text-sm space-y-2 mt-2">
            <li className="p-2 bg-primary/10 rounded-md">What's the estimated current value of your home?</li>
            <li className="p-2 bg-primary/10 rounded-md">How much cash would you like to take out?</li>
            <li className="p-2 bg-primary/10 rounded-md">What kind of home improvements are you planning?</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
