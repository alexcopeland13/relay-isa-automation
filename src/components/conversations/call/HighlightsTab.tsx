
import { ScrollArea } from "@/components/ui/scroll-area";

export const HighlightsTab = () => {
  return (
    <ScrollArea className="h-full p-4">
      <div className="space-y-4">
        <div className="border rounded-md p-3">
          <h4 className="font-medium mb-1">Current Rate</h4>
          <div className="flex items-center">
            <span className="text-lg">4.75%</span>
            <span className="ml-2 text-xs text-muted-foreground">(30-year fixed)</span>
          </div>
        </div>
        
        <div className="border rounded-md p-3">
          <h4 className="font-medium mb-1">Mortgage Age</h4>
          <div className="flex items-center">
            <span className="text-lg">5 years</span>
          </div>
        </div>
        
        <div className="border rounded-md p-3">
          <h4 className="font-medium mb-1">Refinance Goals</h4>
          <div className="flex flex-wrap gap-2 mt-1">
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Lower Rate</span>
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Cash Out</span>
          </div>
        </div>
        
        <div className="border rounded-md p-3">
          <h4 className="font-medium mb-1">Home Improvement Plans</h4>
          <p className="text-sm">Mentioned plans to use cash out for home improvements</p>
        </div>
      </div>
    </ScrollArea>
  );
};
