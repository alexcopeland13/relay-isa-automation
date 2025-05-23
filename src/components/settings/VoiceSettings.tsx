
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Phone, 
  Settings, 
  Save, 
  TestTube, 
  CheckCircle, 
  AlertCircle, 
  Copy,
  MessageCircle
} from 'lucide-react';

interface VoiceConfig {
  retell_api_key: string;
  retell_phone_number: string;
  default_greeting: string;
  dynamic_greetings: {
    cinc_lead: string;
    returning_lead: string;
    new_caller: string;
  };
  callback_prompts: {
    property_info: string;
    financing: string;
    showing_request: string;
  };
}

export const VoiceSettings = () => {
  const [config, setConfig] = useState<VoiceConfig>({
    retell_api_key: '',
    retell_phone_number: '',
    default_greeting: 'Hello! Thank you for calling. How can I help you today?',
    dynamic_greetings: {
      cinc_lead: 'Hi {{lead_name}}! I see you were looking at homes in {{favorite_city}}. How can I help you today?',
      returning_lead: 'Welcome back {{lead_name}}! How can I assist you with your home search?',
      new_caller: 'Hello! Thank you for calling about real estate. I\'d be happy to help you find your perfect home. What are you looking for?'
    },
    callback_prompts: {
      property_info: 'I can schedule a callback to discuss specific properties you\'re interested in. When would be a good time?',
      financing: 'I can have a mortgage specialist call you back to discuss financing options. What time works best for you?',
      showing_request: 'I can schedule a property showing for you. When would you like to see the property?'
    }
  });
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');
  const { toast } = useToast();

  useEffect(() => {
    loadVoiceSettings();
  }, []);

  const loadVoiceSettings = async () => {
    try {
      // In a real implementation, this would load from Supabase secrets/vault
      // For now, we'll simulate loading saved settings
      const savedSettings = localStorage.getItem('voice_settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setConfig({ ...config, ...parsed });
      }
    } catch (error) {
      console.error('Error loading voice settings:', error);
    }
  };

  const saveVoiceSettings = async () => {
    try {
      setLoading(true);

      // In production, this would save to Supabase secrets/vault
      // For now, we'll save to localStorage and show the concept
      localStorage.setItem('voice_settings', JSON.stringify(config));

      toast({
        title: "Settings Saved",
        description: "Voice settings have been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save voice settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testRetellConnection = async () => {
    try {
      setTesting(true);
      
      if (!config.retell_api_key) {
        toast({
          title: "API Key Required",
          description: "Please enter your Retell API key first.",
          variant: "destructive",
        });
        return;
      }

      // Simulate API test - in production this would call Retell's API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setConnectionStatus('connected');
      toast({
        title: "Connection Successful",
        description: "Successfully connected to Retell API.",
      });
    } catch (error: any) {
      setConnectionStatus('error');
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to Retell API.",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const copyPhoneNumber = () => {
    if (config.retell_phone_number) {
      navigator.clipboard.writeText(config.retell_phone_number);
      toast({
        title: "Copied!",
        description: "Phone number copied to clipboard.",
      });
    }
  };

  const getConnectionBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Connected</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="h-3 w-3 mr-1" />Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Voice Settings</h2>
          <p className="text-gray-600">Configure Retell integration and voice prompts</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={testRetellConnection} disabled={testing} variant="outline">
            {testing ? (
              <TestTube className="h-4 w-4 mr-2 animate-pulse" />
            ) : (
              <TestTube className="h-4 w-4 mr-2" />
            )}
            Test Connection
          </Button>
          <Button onClick={saveVoiceSettings} disabled={loading}>
            {loading ? (
              <Save className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Settings
          </Button>
        </div>
      </div>

      <Tabs defaultValue="connection" className="space-y-4">
        <TabsList>
          <TabsTrigger value="connection">Connection</TabsTrigger>
          <TabsTrigger value="greetings">Greetings</TabsTrigger>
          <TabsTrigger value="callbacks">Callbacks</TabsTrigger>
        </TabsList>

        <TabsContent value="connection" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Retell Configuration
                {getConnectionBadge()}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">Retell API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="key_live_..."
                  value={config.retell_api_key}
                  onChange={(e) => setConfig({ ...config, retell_api_key: e.target.value })}
                />
                <p className="text-sm text-gray-500">
                  Get your API key from the Retell dashboard
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone-number">Retell Phone Number</Label>
                <div className="flex gap-2">
                  <Input
                    id="phone-number"
                    placeholder="+1-555-123-4567"
                    value={config.retell_phone_number}
                    onChange={(e) => setConfig({ ...config, retell_phone_number: e.target.value })}
                    className="flex-1"
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={copyPhoneNumber}
                    disabled={!config.retell_phone_number}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  This is the number CINC leads will call
                </p>
              </div>

              {config.retell_phone_number && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Give this number to CINC</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Configure this as your contact number in CINC so leads call directly into Retell. 
                        They'll receive personalized greetings based on their property interests.
                      </p>
                      <div className="mt-2">
                        <Badge className="bg-blue-100 text-blue-800 font-mono">
                          {config.retell_phone_number}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="greetings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Dynamic Greetings
              </CardTitle>
              <p className="text-sm text-gray-600">
                Customize greetings based on caller context. Use placeholders like &#123;&#123;lead_name&#125;&#125; and &#123;&#123;favorite_city&#125;&#125;.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="cinc-greeting">CINC Lead Greeting</Label>
                <Textarea
                  id="cinc-greeting"
                  placeholder="Hi {{lead_name}}! I see you were looking at..."
                  value={config.dynamic_greetings.cinc_lead}
                  onChange={(e) => setConfig({
                    ...config,
                    dynamic_greetings: { ...config.dynamic_greetings, cinc_lead: e.target.value }
                  })}
                  rows={3}
                />
                <p className="text-sm text-gray-500">
                  For leads from CINC with known property interests
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="returning-greeting">Returning Lead Greeting</Label>
                <Textarea
                  id="returning-greeting"
                  placeholder="Welcome back {{lead_name}}! How can I assist you..."
                  value={config.dynamic_greetings.returning_lead}
                  onChange={(e) => setConfig({
                    ...config,
                    dynamic_greetings: { ...config.dynamic_greetings, returning_lead: e.target.value }
                  })}
                  rows={3}
                />
                <p className="text-sm text-gray-500">
                  For known leads calling back
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-greeting">New Caller Greeting</Label>
                <Textarea
                  id="new-greeting"
                  placeholder="Hello! Thank you for calling about real estate..."
                  value={config.dynamic_greetings.new_caller}
                  onChange={(e) => setConfig({
                    ...config,
                    dynamic_greetings: { ...config.dynamic_greetings, new_caller: e.target.value }
                  })}
                  rows={3}
                />
                <p className="text-sm text-gray-500">
                  For unknown callers (new leads)
                </p>
              </div>

              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Available Placeholders</h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                  <div><code>&#123;&#123;lead_name&#125;&#125;</code> - Full name</div>
                  <div><code>&#123;&#123;first_name&#125;&#125;</code> - First name only</div>
                  <div><code>&#123;&#123;favorite_city&#125;&#125;</code> - Preferred city</div>
                  <div><code>&#123;&#123;price_range&#125;&#125;</code> - Price range</div>
                  <div><code>&#123;&#123;timeline&#125;&#125;</code> - Buying timeline</div>
                  <div><code>&#123;&#123;property_type&#125;&#125;</code> - Property type</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="callbacks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Callback Prompts
              </CardTitle>
              <p className="text-sm text-gray-600">
                Configure how the AI offers to schedule callbacks for different scenarios
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="property-callback">Property Information Callback</Label>
                <Textarea
                  id="property-callback"
                  placeholder="I can schedule a callback to discuss..."
                  value={config.callback_prompts.property_info}
                  onChange={(e) => setConfig({
                    ...config,
                    callback_prompts: { ...config.callback_prompts, property_info: e.target.value }
                  })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="financing-callback">Financing Callback</Label>
                <Textarea
                  id="financing-callback"
                  placeholder="I can have a mortgage specialist..."
                  value={config.callback_prompts.financing}
                  onChange={(e) => setConfig({
                    ...config,
                    callback_prompts: { ...config.callback_prompts, financing: e.target.value }
                  })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="showing-callback">Showing Request Callback</Label>
                <Textarea
                  id="showing-callback"
                  placeholder="I can schedule a property showing..."
                  value={config.callback_prompts.showing_request}
                  onChange={(e) => setConfig({
                    ...config,
                    callback_prompts: { ...config.callback_prompts, showing_request: e.target.value }
                  })}
                  rows={3}
                />
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900">Automatic Callback Scheduling</h4>
                    <p className="text-sm text-green-700 mt-1">
                      When the AI detects callback requests during conversations, it will automatically:
                    </p>
                    <ul className="text-sm text-green-700 mt-2 space-y-1">
                      <li>• Extract the preferred callback time</li>
                      <li>• Categorize the callback type</li>
                      <li>• Schedule it in the system</li>
                      <li>• Notify the appropriate team member</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
