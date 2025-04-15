
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EntityUpdate {
  name: string;
  displayName: string;
  value: string;
  confidence: number;
  source: 'conversation' | 'user-input' | 'system';
  timestamp: string;
}

interface ProfileUpdateNotificationProps {
  updates: EntityUpdate[];
  onApprove: () => Promise<boolean>;
  onDismiss: () => void;
  className?: string;
}

export function ProfileUpdateNotification({
  updates,
  onApprove,
  onDismiss,
  className
}: ProfileUpdateNotificationProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = async () => {
    setIsProcessing(true);
    const success = await onApprove();
    setIsProcessing(false);
    if (success) {
      onDismiss();
    }
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.9) {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">High</Badge>;
    } else if (confidence >= 0.7) {
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Medium</Badge>;
    } else {
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Low</Badge>;
    }
  };

  if (updates.length === 0) return null;

  return (
    <Card className={cn("w-full border-blue-200 bg-blue-50", className)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-500" />
            <span>Profile Update Available</span>
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
        <CardDescription>
          New information detected in conversation
        </CardDescription>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pb-3">
          <div className="space-y-2">
            {updates.map((update, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-white rounded border border-blue-100">
                <div>
                  <div className="font-medium text-sm">{update.displayName}</div>
                  <div className="text-sm text-blue-800">{update.value}</div>
                </div>
                <div className="flex items-center gap-2">
                  {getConfidenceBadge(update.confidence)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
      
      <CardFooter className="flex justify-end space-x-2 pt-0">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onDismiss}
          disabled={isProcessing}
        >
          <X className="mr-2 h-4 w-4" />
          Dismiss
        </Button>
        <Button 
          variant="default" 
          size="sm" 
          onClick={handleApprove}
          disabled={isProcessing}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isProcessing ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Update Profile
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
