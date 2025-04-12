
import { AlertTriangle, X, RefreshCw, HelpCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export interface ErrorContainerProps {
  title?: string;
  description?: string;
  error?: Error | string;
  onRetry?: () => void;
  onDismiss?: () => void;
  suggestions?: string[];
  children?: React.ReactNode;
}

export function ErrorContainer({
  title = 'An error occurred',
  description = 'We encountered a problem while processing your request.',
  error,
  onRetry,
  onDismiss,
  suggestions,
  children
}: ErrorContainerProps) {
  const errorMessage = error 
    ? typeof error === 'string' 
      ? error 
      : error.message || 'Unknown error' 
    : null;

  return (
    <Alert variant="destructive" className="relative border-red-300 bg-red-50">
      <AlertTriangle className="h-5 w-5" />
      <div className="flex flex-col w-full">
        <div className="flex items-start justify-between w-full">
          <AlertTitle className="mb-1">{title}</AlertTitle>
          {onDismiss && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 -mt-1 -mr-1"
              onClick={onDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <AlertDescription>
          <p>{description}</p>
          {errorMessage && (
            <div className="mt-2 text-sm bg-red-100 p-2 rounded border border-red-200 overflow-auto max-h-24">
              {errorMessage}
            </div>
          )}
        </AlertDescription>
        
        {children}
        
        {suggestions && suggestions.length > 0 && (
          <div className="mt-3">
            <Separator className="my-2 bg-red-200" />
            <p className="text-sm font-medium mb-1 flex items-center gap-1">
              <HelpCircle className="h-3.5 w-3.5" />
              Suggestions:
            </p>
            <ul className="text-sm list-disc pl-5 space-y-1">
              {suggestions.map((suggestion, idx) => (
                <li key={idx}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}
        
        {onRetry && (
          <div className="mt-3 flex justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRetry}
              className="text-red-700 border-red-200 hover:bg-red-100"
            >
              <RefreshCw className="mr-2 h-3.5 w-3.5" />
              Try Again
            </Button>
          </div>
        )}
      </div>
    </Alert>
  );
}
