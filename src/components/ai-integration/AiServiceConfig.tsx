
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, HelpCircle, RotateCw, ServerOff, ServerCrash, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type ServiceProvider = {
  id: string;
  name: string;
  description: string;
  status: 'connected' | 'disconnected' | 'error';
  isDefault: boolean;
};

type ServiceStatus = 'operational' | 'degraded' | 'outage' | 'unknown';

export const AiServiceConfig = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('providers');
  const [selectedProvider, setSelectedProvider] = useState<string>('anthropic');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  // Sample service providers
  const serviceProviders: ServiceProvider[] = [
    { id: 'anthropic', name: 'Anthropic Claude', description: 'Advanced language model with strong reasoning capabilities', status: 'connected', isDefault: true },
    { id: 'openai', name: 'OpenAI GPT-4', description: 'State-of-the-art general purpose AI model', status: 'disconnected', isDefault: false },
    { id: 'perplexity', name: 'Perplexity', description: 'Research-focused language model with knowledge capabilities', status: 'disconnected', isDefault: false },
    { id: 'mistral', name: 'Mistral AI', description: 'Efficient and cost-effective language models', status: 'error', isDefault: false },
  ];

  // Sample service status data
  const serviceStatus: Record<string, ServiceStatus> = {
    'anthropic': 'operational',
    'openai': 'operational',
    'perplexity': 'degraded',
    'mistral': 'outage',
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    
    // Simulate API connection test
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Connection successful",
      description: "Successfully connected to Anthropic Claude API",
    });
    
    setIsTestingConnection(false);
  };

  const handleSaveConfig = () => {
    toast({
      title: "Configuration saved",
      description: "AI service configuration has been updated",
    });
  };

  const renderStatusBadge = (status: ServiceStatus) => {
    switch (status) {
      case 'operational':
        return <Badge className="bg-green-500">Operational</Badge>;
      case 'degraded':
        return <Badge className="bg-yellow-500">Degraded</Badge>;
      case 'outage':
        return <Badge className="bg-red-500">Outage</Badge>;
      default:
        return <Badge className="bg-gray-500">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="providers" className="flex-1">AI Service Providers</TabsTrigger>
          <TabsTrigger value="performance" className="flex-1">Performance Settings</TabsTrigger>
          <TabsTrigger value="fallbacks" className="flex-1">Fallback Configuration</TabsTrigger>
        </TabsList>
        
        <TabsContent value="providers" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Service Provider Selection */}
            <div className="md:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Available Providers</CardTitle>
                  <CardDescription>
                    Select and configure AI service providers
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {serviceProviders.map((provider) => (
                    <div 
                      key={provider.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedProvider === provider.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedProvider(provider.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{provider.name}</h3>
                          <p className="text-sm text-muted-foreground">{provider.description}</p>
                        </div>
                        <div>
                          {provider.status === 'connected' && <CheckCircle className="h-5 w-5 text-green-500" />}
                          {provider.status === 'disconnected' && <ServerOff className="h-5 w-5 text-muted-foreground" />}
                          {provider.status === 'error' && <ServerCrash className="h-5 w-5 text-red-500" />}
                        </div>
                      </div>
                      
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center">
                          {renderStatusBadge(serviceStatus[provider.id])}
                        </div>
                        {provider.isDefault && (
                          <Badge variant="outline" className="text-xs">Default</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
            
            {/* Service Configuration */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {serviceProviders.find(p => p.id === selectedProvider)?.name || "Service"} Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure API credentials and service-specific settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">API Credentials</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="api-key">API Key</Label>
                      <div className="flex">
                        <Input 
                          id="api-key" 
                          type={showApiKey ? "text" : "password"} 
                          placeholder="Enter your API key" 
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          className="flex-1"
                        />
                        <Button 
                          variant="outline" 
                          type="button" 
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="ml-2"
                        >
                          {showApiKey ? "Hide" : "Show"}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="model-version">Model Version</Label>
                      <Select defaultValue="claude-3-opus">
                        <SelectTrigger id="model-version">
                          <SelectValue placeholder="Select model version" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                          <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                          <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col space-y-1">
                        <Label htmlFor="default-provider">Set as Default Provider</Label>
                        <span className="text-xs text-muted-foreground">Use this provider for all AI interactions</span>
                      </div>
                      <Switch id="default-provider" checked={true} />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Advanced Settings</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="temperature">Temperature</Label>
                      <div className="flex items-center gap-2">
                        <Input 
                          id="temperature" 
                          type="number" 
                          min="0" 
                          max="1" 
                          step="0.1" 
                          defaultValue="0.7" 
                          className="w-20"
                        />
                        <span className="text-xs text-muted-foreground">
                          Controls randomness: 0 = deterministic, 1 = creative
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-4 w-4 ml-1">
                                <HelpCircle className="h-3 w-3" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                              <div className="space-y-2">
                                <h4 className="font-medium">About Temperature</h4>
                                <p className="text-sm">
                                  Temperature controls randomness in the model's responses.
                                  Lower values (closer to 0) result in more deterministic, focused responses.
                                  Higher values (closer to 1) result in more creative, varied responses.
                                </p>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="max-tokens">Maximum Tokens</Label>
                      <div className="flex items-center gap-2">
                        <Input 
                          id="max-tokens" 
                          type="number" 
                          min="100" 
                          max="10000" 
                          step="100" 
                          defaultValue="2000" 
                          className="w-24"
                        />
                        <span className="text-xs text-muted-foreground">
                          Maximum response length
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={handleTestConnection}
                    disabled={isTestingConnection || !apiKey}
                  >
                    {isTestingConnection && <RotateCw className="mr-2 h-4 w-4 animate-spin" />}
                    Test Connection
                  </Button>
                  <Button onClick={handleSaveConfig}>Save Configuration</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="performance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Settings</CardTitle>
              <CardDescription>
                Configure thresholds and optimization settings for AI services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Response Time Thresholds</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="warning-threshold">Warning Threshold (ms)</Label>
                    <Input id="warning-threshold" type="number" defaultValue="2000" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="critical-threshold">Critical Threshold (ms)</Label>
                    <Input id="critical-threshold" type="number" defaultValue="5000" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Service Health Monitoring</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="health-check-interval">Health Check Interval (s)</Label>
                    <Input id="health-check-interval" type="number" defaultValue="60" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="error-threshold">Error Rate Threshold (%)</Label>
                    <Input id="error-threshold" type="number" defaultValue="5" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Caching Settings</h3>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enable-caching">Enable Response Caching</Label>
                    <p className="text-sm text-muted-foreground">Cache common AI responses to improve performance</p>
                  </div>
                  <Switch id="enable-caching" defaultChecked />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cache-ttl">Cache TTL (minutes)</Label>
                  <Input id="cache-ttl" type="number" defaultValue="30" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto">Save Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="fallbacks" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Fallback Configuration</CardTitle>
              <CardDescription>
                Configure backup services and fallback behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Fallback Strategy</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="fallback-strategy">Primary Fallback Strategy</Label>
                  <Select defaultValue="next-provider">
                    <SelectTrigger id="fallback-strategy">
                      <SelectValue placeholder="Select fallback strategy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="next-provider">Try Next Provider</SelectItem>
                      <SelectItem value="specific-provider">Use Specific Provider</SelectItem>
                      <SelectItem value="degraded-mode">Enter Degraded Mode</SelectItem>
                      <SelectItem value="human-handoff">Human Handoff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fallback-provider">Fallback Provider</Label>
                  <Select defaultValue="openai">
                    <SelectTrigger id="fallback-provider">
                      <SelectValue placeholder="Select fallback provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI GPT-4</SelectItem>
                      <SelectItem value="perplexity">Perplexity</SelectItem>
                      <SelectItem value="mistral">Mistral AI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Trigger Conditions</h3>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="timeout-fallback">Timeout Triggers Fallback</Label>
                    <p className="text-sm text-muted-foreground">Switch to fallback when primary service timeout occurs</p>
                  </div>
                  <Switch id="timeout-fallback" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="error-fallback">Error Triggers Fallback</Label>
                    <p className="text-sm text-muted-foreground">Switch to fallback when primary service returns an error</p>
                  </div>
                  <Switch id="error-fallback" defaultChecked />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timeout-threshold">Timeout Threshold (ms)</Label>
                  <Input id="timeout-threshold" type="number" defaultValue="10000" />
                </div>
              </div>
              
              <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">Important Note</h4>
                  <p className="text-sm text-yellow-700">
                    Fallback services may have different capabilities and response formats. 
                    Ensure all configured fallback providers have been tested with your expected workloads.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto">Save Configuration</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
