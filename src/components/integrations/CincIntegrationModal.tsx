
import { useState, useEffect } from "react";
import { AlertCircle, Check, X, ArrowRight, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface CincIntegrationModalProps {
  onClose: () => void;
  onSuccess: () => void;
  existingConfig?: CincConfig;
}

interface CincConfig {
  apiKey: string;
  syncFrequency: "realtime" | "hourly" | "daily";
  filterOption: "all" | "new" | "active";
  isConnected: boolean;
  lastSync?: string;
}

// Mock function to simulate API connection test
const testCincConnection = async (apiKey: string): Promise<boolean> => {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // In a real app, this would make an API call to CINC to test the connection
  // For demo, we'll simulate an 80% success rate
  const success = apiKey.length > 5 && Math.random() > 0.2;
  
  console.log('CINC connection test:', success ? 'successful' : 'failed');
  return success;
};

// Mock function to save CINC configuration
const saveCincConfig = async (config: Omit<CincConfig, 'isConnected'>): Promise<boolean> => {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // In a real app, this would make an API call to save the configuration
  const savedConfig = {
    ...config,
    isConnected: true,
    lastSync: new Date().toISOString()
  };
  
  localStorage.setItem('cincConfig', JSON.stringify(savedConfig));
  console.log('CINC configuration saved:', savedConfig);
  return true;
};

export const CincIntegrationModal = ({ onClose, onSuccess, existingConfig }: CincIntegrationModalProps) => {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState(existingConfig?.apiKey || "");
  const [showAdvanced, setShowAdvanced] = useState(!!existingConfig);
  const [syncFrequency, setSyncFrequency] = useState<"realtime" | "hourly" | "daily">(
    existingConfig?.syncFrequency || "realtime"
  );
  const [filterOption, setFilterOption] = useState<"all" | "new" | "active">(
    existingConfig?.filterOption || "all"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [testStatus, setTestStatus] = useState<"idle" | "loading" | "success" | "error">(
    existingConfig?.isConnected ? "success" : "idle"
  );
  
  const webhookUrl = "https://api.relay.app/webhooks/cinc";

  useEffect(() => {
    // If we have an existing config with API key, consider it tested successfully
    if (existingConfig?.apiKey && existingConfig.isConnected) {
      setTestStatus("success");
    }
  }, [existingConfig]);

  const handleTest = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your CINC API key to test the connection.",
        variant: "destructive"
      });
      return;
    }

    setTestStatus("loading");
    
    try {
      const success = await testCincConnection(apiKey);
      
      if (success) {
        setTestStatus("success");
        toast({
          title: "Connection Test Successful",
          description: "Successfully connected to CINC with the provided API key."
        });
      } else {
        setTestStatus("error");
        toast({
          title: "Connection Test Failed",
          description: "Unable to connect to CINC. Please verify your API key and try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      setTestStatus("error");
      toast({
        title: "Connection Error",
        description: "An error occurred while testing the connection. Please try again.",
        variant: "destructive"
      });
      console.error("CINC connection test error:", error);
    }
  };

  const handleSubmit = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your CINC API key to complete the integration.",
        variant: "destructive"
      });
      return;
    }

    if (testStatus !== "success") {
      toast({
        title: "Connection Test Required",
        description: "Please test the connection before saving the integration.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await saveCincConfig({
        apiKey,
        syncFrequency,
        filterOption
      });
      
      if (success) {
        toast({
          title: "Integration Successful",
          description: "CINC integration has been successfully configured."
        });
        onSuccess();
      } else {
        throw new Error("Failed to save CINC configuration");
      }
    } catch (error) {
      console.error("Error saving CINC configuration:", error);
      toast({
        title: "Integration Error",
        description: "There was a problem saving your CINC integration. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(webhookUrl);
    toast({
      title: "Copied to clipboard",
      description: "Webhook URL has been copied to clipboard."
    });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-[#9b87f5] rounded-md flex items-center justify-center text-white font-bold text-xs">CI</div>
            <DialogTitle>{existingConfig ? "Update CINC Integration" : "Connect to CINC"}</DialogTitle>
          </div>
          <DialogDescription>
            {existingConfig 
              ? "Update your CINC integration settings to customize lead synchronization."
              : "Connect Relay to your CINC account to automatically import leads and property information."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="api-key">CINC API Key</Label>
            <Input 
              id="api-key" 
              placeholder="Enter your CINC API key" 
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              type="password"
            />
            <p className="text-sm text-muted-foreground">
              You can find your API key in your CINC admin dashboard under Settings &gt; Integrations.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <div className="flex gap-2">
              <Input id="webhook-url" value={webhookUrl} readOnly className="bg-muted" />
              <Button variant="outline" size="icon" onClick={handleCopyToClipboard}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c0-1.1.9-2 2-2h2"/><path d="M4 12c0-1.1.9-2 2-2h2"/><path d="M4 8c0-1.1.9-2 2-2h2"/></svg>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Add this webhook URL in your CINC account to receive real-time lead notifications.
            </p>
          </div>
          
          <div className="pt-2">
            <div 
              className="flex items-center justify-between cursor-pointer" 
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <span className="text-sm font-medium">Advanced Settings</span>
              <Button variant="ghost" size="sm">
                <ArrowRight className={`h-4 w-4 transition-transform duration-200 ${showAdvanced ? 'rotate-90' : ''}`} />
              </Button>
            </div>
            
            {showAdvanced && (
              <div className="space-y-4 mt-2 pt-2 border-t">
                <div className="space-y-2">
                  <Label>Lead Sync Frequency</Label>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant={syncFrequency === "realtime" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setSyncFrequency("realtime")}
                    >
                      Real-time
                    </Button>
                    <Button 
                      variant={syncFrequency === "hourly" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setSyncFrequency("hourly")}
                    >
                      Hourly
                    </Button>
                    <Button 
                      variant={syncFrequency === "daily" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setSyncFrequency("daily")}
                    >
                      Daily
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Lead Filtering</Label>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant={filterOption === "all" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setFilterOption("all")}
                    >
                      All Leads
                    </Button>
                    <Button 
                      variant={filterOption === "new" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setFilterOption("new")}
                    >
                      New Leads Only
                    </Button>
                    <Button 
                      variant={filterOption === "active" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setFilterOption("active")}
                    >
                      Active Leads Only
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Field Mapping</Label>
                  <div className="border rounded-md p-3 bg-muted/50 text-center">
                    <p className="text-sm text-muted-foreground">
                      Field mapping configuration will be available in the next update.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Test Connection</Label>
              <div>
                {testStatus === "idle" && (
                  <Button variant="outline" size="sm" onClick={handleTest}>
                    Test
                  </Button>
                )}
                
                {testStatus === "loading" && (
                  <Button variant="outline" size="sm" disabled>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Testing...
                  </Button>
                )}
                
                {testStatus === "success" && (
                  <Badge variant="outline" className="text-green-500 border-green-200 bg-green-50 flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    Connected
                  </Badge>
                )}
                
                {testStatus === "error" && (
                  <Badge variant="outline" className="text-red-500 border-red-200 bg-red-50 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Connection Failed
                  </Badge>
                )}
              </div>
            </div>
            
            {testStatus === "error" && (
              <p className="text-sm text-red-500">
                Unable to connect to CINC. Please verify your API key and try again.
              </p>
            )}
          </div>
        </div>
        
        <DialogFooter className="flex justify-end gap-2 sm:justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            disabled={isLoading || testStatus !== "success"} 
            onClick={handleSubmit}
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                {existingConfig ? "Updating..." : "Connecting..."}
              </>
            ) : (
              existingConfig ? 'Update' : 'Connect'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
