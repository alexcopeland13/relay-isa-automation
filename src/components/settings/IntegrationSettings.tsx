import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Link2, 
  Database, 
  Calendar, 
  Mail, 
  CreditCard, 
  RefreshCw,
  AlertCircle,
  Check, 
  X,
  ArrowRight,
  Clock,
  Home,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CincIntegrationModal } from "@/components/integrations/CincIntegrationModal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface IntegrationStatus {
  name: string;
  connected: boolean;
  lastSync?: string;
}

interface CincConfig {
  apiKey: string;
  syncFrequency: "realtime" | "hourly" | "daily";
  filterOption: "all" | "new" | "active";
  isConnected: boolean;
  lastSync?: string;
}

export const IntegrationSettings = () => {
  const { toast } = useToast();
  const [showCincModal, setShowCincModal] = useState(false);
  const [integrations, setIntegrations] = useState<Record<string, IntegrationStatus>>({
    salesforce: { name: "Salesforce", connected: false },
    hubspot: { name: "HubSpot", connected: true, lastSync: new Date().toISOString() },
    zoho: { name: "Zoho CRM", connected: false },
    cinc: { name: "CINC", connected: false },
    googleCalendar: { name: "Google Calendar", connected: true, lastSync: new Date().toISOString() },
    googleMail: { name: "Google Mail", connected: true, lastSync: new Date().toISOString() },
    microsoftCalendar: { name: "Microsoft Calendar", connected: false },
    microsoftMail: { name: "Microsoft Mail", connected: false },
  });
  const [cincConfig, setCincConfig] = useState<CincConfig | null>(null);
  const [isSavingApiSettings, setIsSavingApiSettings] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [apiSettings, setApiSettings] = useState({
    apiKey: "••••••••••••••••••••••••••••••",
    webhooksEnabled: true
  });

  // New state for SimplyRETS integration
  const [simplyRETSForm, setSimplyRETSForm] = useState({
    apiKey: "",
    apiSecret: "",
    mlsSelection: ""
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnectionTested, setIsConnectionTested] = useState(false);
  
  // Handler for SimplyRETS form changes
  const handleSimplyRETSChange = (field: string, value: string) => {
    setSimplyRETSForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Reset connection tested status when form changes
    if (isConnectionTested) {
      setIsConnectionTested(false);
    }
  };
  
  // Handler for testing SimplyRETS connection
  const handleTestConnection = () => {
    // Validate form
    if (!simplyRETSForm.apiKey || !simplyRETSForm.apiSecret || !simplyRETSForm.mlsSelection) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields to test the connection.",
        variant: "destructive"
      });
      return;
    }
    
    setIsConnecting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnectionTested(true);
      
      toast({
        title: "Connection successful",
        description: "Successfully connected to SimplyRETS API with provided credentials.",
      });
    }, 1500);
  };
  
  // Handler for connecting SimplyRETS
  const handleConnectSimplyRETS = () => {
    if (!isConnectionTested) {
      toast({
        title: "Test connection first",
        description: "Please test the connection before connecting.",
        variant: "destructive"
      });
      return;
    }
    
    setIsConnecting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsConnecting(false);
      
      // Update integrations state to show SimplyRETS as connected
      setIntegrations(prev => ({
        ...prev,
        simplyrets: { 
          name: "SimplyRETS", 
          connected: true,
          lastSync: new Date().toISOString()
        }
      }));
      
      toast({
        title: "SimplyRETS connected",
        description: "SimplyRETS integration has been successfully set up.",
      });
    }, 1500);
  };

  // Load CINC configuration on component mount
  useEffect(() => {
    // Load CINC configuration from localStorage
    const savedCincConfig = localStorage.getItem('cincConfig');
    if (savedCincConfig) {
      try {
        const config = JSON.parse(savedCincConfig) as CincConfig;
        setCincConfig(config);
        
        // Update integrations state with CINC connection status
        setIntegrations(prev => ({
          ...prev,
          cinc: { 
            name: "CINC", 
            connected: config.isConnected,
            lastSync: config.lastSync
          }
        }));
      } catch (error) {
        console.error("Error parsing CINC configuration:", error);
      }
    }
  }, []);

  const handleConnect = (service: string) => {
    if (service === 'CINC') {
      setShowCincModal(true);
      return;
    }
    
    // For other services, just show a toast for now
    toast({
      title: `${service} integration`,
      description: `${service} integration has been initiated. Complete setup in the popup window.`,
    });
  };

  const handleDisconnect = (service: string) => {
    if (service === 'CINC' && cincConfig) {
      // Remove CINC configuration from localStorage
      localStorage.removeItem('cincConfig');
      setCincConfig(null);
      
      // Update integrations state
      setIntegrations(prev => ({
        ...prev,
        cinc: { name: "CINC", connected: false }
      }));
      
      toast({
        title: "CINC disconnected",
        description: "CINC integration has been disconnected.",
      });
      return;
    }
    
    // For other services, just update the state and show a toast
    setIntegrations(prev => ({
      ...prev,
      [service.toLowerCase().replace(/\s+/g, '')]: { 
        ...prev[service.toLowerCase().replace(/\s+/g, '')],
        connected: false,
        lastSync: undefined 
      }
    }));
    
    toast({
      title: `${service} disconnected`,
      description: `${service} integration has been disconnected.`,
    });
  };

  const handleSaveApiSettings = async () => {
    setIsSavingApiSettings(true);
    
    try {
      // Simulate API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save API settings to localStorage
      localStorage.setItem('apiSettings', JSON.stringify(apiSettings));
      
      toast({
        title: "API settings saved",
        description: "Your API configuration has been updated.",
      });
    } catch (error) {
      console.error("Error saving API settings:", error);
      toast({
        title: "Error",
        description: "There was a problem saving your API settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSavingApiSettings(false);
    }
  };

  const handleCincSuccess = () => {
    setShowCincModal(false);
    
    // Reload CINC configuration from localStorage
    const savedCincConfig = localStorage.getItem('cincConfig');
    if (savedCincConfig) {
      try {
        const config = JSON.parse(savedCincConfig) as CincConfig;
        setCincConfig(config);
        
        // Update integrations state
        setIntegrations(prev => ({
          ...prev,
          cinc: { 
            name: "CINC", 
            connected: config.isConnected,
            lastSync: config.lastSync
          }
        }));
        
        toast({
          title: "CINC integration successful",
          description: "Your CINC account is now connected to Relay.",
        });
      } catch (error) {
        console.error("Error parsing CINC configuration:", error);
      }
    }
  };

  const formatLastSync = (dateString?: string) => {
    if (!dateString) return null;
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins} minutes ago`;
      
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} hours ago`;
      
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays} days ago`;
      
      return date.toLocaleDateString();
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Unknown";
    }
  };

  return (
    <>
      {showCincModal && (
        <CincIntegrationModal
          onClose={() => setShowCincModal(false)}
          onSuccess={handleCincSuccess}
          existingConfig={cincConfig || undefined}
        />
      )}
      
      <div className="space-y-6">
        {/* CRM Integration Section - Keep existing */}
        <Card>
          <CardHeader>
            <CardTitle>CRM Integration</CardTitle>
            <CardDescription>Connect your CRM system to synchronize leads and contacts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-blue-500" />
                    <h3 className="font-medium">Salesforce</h3>
                  </div>
                  <Badge variant="outline" className="text-red-500 border-red-200 bg-red-50">Disconnected</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">Sync leads, contacts, and activities with Salesforce CRM.</p>
                <Button 
                  className="w-full" 
                  onClick={() => handleConnect('Salesforce')}
                >
                  Connect
                </Button>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-green-500" />
                    <h3 className="font-medium">HubSpot</h3>
                  </div>
                  <Badge variant="outline" className="text-green-500 border-green-200 bg-green-50">Connected</Badge>
                </div>
                {integrations.hubspot.lastSync && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                    <Clock className="h-3 w-3" />
                    <span>Last sync: {formatLastSync(integrations.hubspot.lastSync)}</span>
                  </div>
                )}
                <p className="text-sm text-muted-foreground mb-4">Integrate with HubSpot for marketing automation and CRM.</p>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => handleDisconnect('HubSpot')}
                >
                  Disconnect
                </Button>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-purple-500" />
                    <h3 className="font-medium">Zoho CRM</h3>
                  </div>
                  <Badge variant="outline" className="text-red-500 border-red-200 bg-red-50">Disconnected</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">Connect with Zoho CRM for lead and contact management.</p>
                <Button 
                  className="w-full" 
                  onClick={() => handleConnect('Zoho CRM')}
                >
                  Connect
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* New MLS Integration Section */}
        <Card>
          <CardHeader>
            <CardTitle>MLS Integration</CardTitle>
            <CardDescription>Connect to MLS property data to enhance conversations with real-time listings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 bg-[#4a90e2] rounded-md flex items-center justify-center text-white">
                      <Home className="h-4 w-4" />
                    </div>
                    <h3 className="font-medium">SimplyRETS</h3>
                  </div>
                  <Badge variant="outline" className="text-red-500 border-red-200 bg-red-50">Disconnected</Badge>
                </div>
                
                {integrations.simplyrets?.connected && integrations.simplyrets.lastSync && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                    <Clock className="h-3 w-3" />
                    <span>Last sync: {formatLastSync(integrations.simplyrets.lastSync)}</span>
                  </div>
                )}
                
                <p className="text-sm text-muted-foreground mb-4">
                  Access real estate listing data from your MLS via SimplyRETS API.
                </p>
                
                {!integrations.simplyrets?.connected ? (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label htmlFor="api-key">API Key</Label>
                        <Input 
                          id="api-key" 
                          type="password" 
                          placeholder="Enter your SimplyRETS API key"
                          value={simplyRETSForm.apiKey}
                          onChange={(e) => handleSimplyRETSChange('apiKey', e.target.value)}
                          className="font-mono"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <Label htmlFor="api-secret">API Secret</Label>
                        <Input 
                          id="api-secret" 
                          type="password" 
                          placeholder="Enter your SimplyRETS API secret"
                          value={simplyRETSForm.apiSecret}
                          onChange={(e) => handleSimplyRETSChange('apiSecret', e.target.value)}
                          className="font-mono"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <Label htmlFor="mls-selection">MLS Selection</Label>
                        <Select 
                          value={simplyRETSForm.mlsSelection} 
                          onValueChange={(value) => handleSimplyRETSChange('mlsSelection', value)}
                        >
                          <SelectTrigger id="mls-selection">
                            <SelectValue placeholder="Select your MLS" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ARMLS">ARMLS</SelectItem>
                            <SelectItem value="CRMLS">CRMLS</SelectItem>
                            <SelectItem value="GAMLS">GAMLS</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button 
                        variant="outline" 
                        onClick={handleTestConnection}
                        disabled={isConnecting || !simplyRETSForm.apiKey || !simplyRETSForm.apiSecret || !simplyRETSForm.mlsSelection}
                        className="flex-1"
                      >
                        {isConnecting ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Testing...
                          </>
                        ) : (
                          'Test Connection'
                        )}
                      </Button>
                      
                      <Button 
                        onClick={handleConnectSimplyRETS}
                        disabled={isConnecting || !isConnectionTested}
                        className="flex-1"
                      >
                        {isConnecting ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          'Connect'
                        )}
                      </Button>
                    </div>
                    
                    <Button 
                      variant="secondary" 
                      disabled={true}
                      className="w-full"
                    >
                      Configure Settings
                    </Button>
                    
                    <div className="text-sm text-muted-foreground p-3 bg-secondary/50 rounded-md">
                      <p className="mb-2">
                        SimplyRETS provides access to MLS listing data for use during conversations. 
                        This integration allows agents to reference property details and search listings in real-time.
                      </p>
                      <a 
                        href="https://docs.simplyrets.com/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-primary text-xs font-medium hover:underline"
                      >
                        <ExternalLink className="mr-1 h-3 w-3" />
                        Documentation
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1" 
                      onClick={() => {
                        // Disconnect SimplyRETS integration
                        setIntegrations(prev => ({
                          ...prev,
                          simplyrets: { name: "SimplyRETS", connected: false }
                        }));
                        
                        // Clear form data
                        setSimplyRETSForm({
                          apiKey: "",
                          apiSecret: "",
                          mlsSelection: ""
                        });
                        
                        // Reset connection tested status
                        setIsConnectionTested(false);
                        
                        toast({
                          title: "SimplyRETS disconnected",
                          description: "SimplyRETS integration has been disconnected.",
                        });
                      }}
                    >
                      Disconnect
                    </Button>
                    <Button 
                      className="flex-1" 
                      onClick={() => {
                        toast({
                          title: "Settings",
                          description: "Configure SimplyRETS settings.",
                        });
                      }}
                    >
                      Settings
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Lead Sources Integration</CardTitle>
            <CardDescription>Connect lead generation platforms to automatically import leads.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 bg-[#9b87f5] rounded-md flex items-center justify-center text-white font-bold text-xs">CI</div>
                    <h3 className="font-medium">CINC</h3>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={integrations.cinc.connected 
                      ? "text-green-500 border-green-200 bg-green-50" 
                      : "text-red-500 border-red-200 bg-red-50"}
                  >
                    {integrations.cinc.connected ? "Connected" : "Disconnected"}
                  </Badge>
                </div>
                
                {integrations.cinc.connected && integrations.cinc.lastSync && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                    <Clock className="h-3 w-3" />
                    <span>Last sync: {formatLastSync(integrations.cinc.lastSync)}</span>
                  </div>
                )}
                
                {cincConfig && (
                  <div className="mb-4 text-xs text-muted-foreground">
                    <p><strong>Sync:</strong> {cincConfig.syncFrequency === 'realtime' ? 'Real-time' : cincConfig.syncFrequency === 'hourly' ? 'Hourly' : 'Daily'}</p>
                    <p><strong>Filter:</strong> {cincConfig.filterOption === 'all' ? 'All Leads' : cincConfig.filterOption === 'new' ? 'New Leads Only' : 'Active Leads Only'}</p>
                  </div>
                )}
                
                <p className="text-sm text-muted-foreground mb-4">Sync leads and property information from CINC's real estate lead generation platform.</p>
                
                {integrations.cinc.connected ? (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1" 
                      onClick={() => handleDisconnect('CINC')}
                    >
                      Disconnect
                    </Button>
                    <Button 
                      className="flex-1" 
                      onClick={() => setShowCincModal(true)}
                    >
                      Settings
                    </Button>
                  </div>
                ) : (
                  <Button 
                    className="w-full" 
                    onClick={() => handleConnect('CINC')}
                  >
                    Connect
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Calendar & Email Integration</CardTitle>
            <CardDescription>Connect your calendar and email services.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    <h3 className="font-medium">Google Calendar</h3>
                  </div>
                  <Badge variant="outline" className="text-green-500 border-green-200 bg-green-50">Connected</Badge>
                </div>
                {integrations.googleCalendar.lastSync && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                    <Clock className="h-3 w-3" />
                    <span>Last sync: {formatLastSync(integrations.googleCalendar.lastSync)}</span>
                  </div>
                )}
                <p className="text-sm text-muted-foreground mb-4">Sync follow-ups and appointments with Google Calendar.</p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1" 
                    onClick={() => handleDisconnect('Google Calendar')}
                  >
                    Disconnect
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                  >
                    Settings
                  </Button>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-blue-500" />
                    <h3 className="font-medium">Google Mail</h3>
                  </div>
                  <Badge variant="outline" className="text-green-500 border-green-200 bg-green-50">Connected</Badge>
                </div>
                {integrations.googleMail.lastSync && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                    <Clock className="h-3 w-3" />
                    <span>Last sync: {formatLastSync(integrations.googleMail.lastSync)}</span>
                  </div>
                )}
                <p className="text-sm text-muted-foreground mb-4">Integrate with Gmail for email tracking and synchronization.</p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1" 
                    onClick={() => handleDisconnect('Google Mail')}
                  >
                    Disconnect
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                  >
                    Settings
                  </Button>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    <h3 className="font-medium">Microsoft Calendar</h3>
                  </div>
                  <Badge variant="outline" className="text-red-500 border-red-200 bg-red-50">Disconnected</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">Sync follow-ups and appointments with Outlook Calendar.</p>
                <Button 
                  className="w-full" 
                  onClick={() => handleConnect('Microsoft Calendar')}
                >
                  Connect
                </Button>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-blue-500" />
                    <h3 className="font-medium">Microsoft Mail</h3>
                  </div>
                  <Badge variant="outline" className="text-red-500 border-red-200 bg-red-50">Disconnected</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">Integrate with Outlook for email tracking and synchronization.</p>
                <Button 
                  className="w-full" 
                  onClick={() => handleConnect('Microsoft Mail')}
                >
                  Connect
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Payment Integrations</CardTitle>
            <CardDescription>Connect payment processing services.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-blue-500" />
                    <h3 className="font-medium">Stripe</h3>
                  </div>
                  <Badge variant="secondary">Coming Soon</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">Process payments and subscriptions with Stripe.</p>
                <Button disabled className="w-full">
                  Connect
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
            <CardDescription>Configure external API access and webhooks.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <div className="flex gap-2">
                <Input 
                  id="api-key" 
                  value={apiSettings.apiKey} 
                  onChange={(e) => setApiSettings(prev => ({ ...prev, apiKey: e.target.value }))}
                  readOnly 
                  type="password"
                />
                <Button 
                  variant="outline"
                  onClick={() => {
                    // Generate a new API key
                    const newKey = Array.from({ length: 32 }, () => 
                      Math.floor(Math.random() * 36).toString(36)
                    ).join('');
                    
                    setApiSettings(prev => ({ ...prev, apiKey: newKey }));
                    
                    toast({
                      title: "New API key generated",
                      description: "Your API key has been regenerated. Save changes to apply."
                    });
                  }}
                >
                  Regenerate
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">Use this key to authenticate API requests.</p>
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-2">
              <Label htmlFor="webhook-url">Webhook URL</Label>
              <Input 
                id="webhook-url" 
                placeholder="https://your-service.com/webhook" 
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">URL to receive event notifications.</p>
            </div>
            
            <div className="space-y-2 mt-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Enable Webhooks</Label>
                  <p className="text-sm text-muted-foreground">Send event notifications to external services.</p>
                </div>
                <Switch 
                  checked={apiSettings.webhooksEnabled}
                  onCheckedChange={(checked) => setApiSettings(prev => ({ ...prev, webhooksEnabled: checked }))}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleSaveApiSettings}
              disabled={isSavingApiSettings}
            >
              {isSavingApiSettings ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save API Settings'
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};
