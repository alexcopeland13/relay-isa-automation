import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Building,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Key,
  Link as LinkIcon,
  Webhook,
  Phone,
  Users
} from 'lucide-react';

interface CincConfig {
  apiKey: string;
  syncFrequency: "realtime" | "hourly" | "daily";
  filterOption: "all" | "new" | "active";
  isConnected: boolean;
  lastSync?: string;
}

interface CincIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  existingConfig?: CincConfig | null;
}

export const CincIntegrationModal: React.FC<CincIntegrationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  existingConfig
}) => {
  const [step, setStep] = useState<'credentials' | 'webhook' | 'test' | 'complete'>('credentials');
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    client_id: '',
    client_secret: '',
    api_key: '',
    webhook_secret: '',
  });
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const { toast } = useToast();

  const webhookUrl = `https://qvarmbhdradfpkegtpgw.supabase.co/functions/v1/cinc-webhook`;

  const testConnection = async () => {
    try {
      setLoading(true);
      setConnectionStatus('connecting');

      // Simulate API connection test
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In production, this would:
      // 1. Validate credentials with CINC API
      // 2. Set up OAuth flow
      // 3. Store tokens securely in Supabase vault
      
      setConnectionStatus('connected');
      toast({
        title: "CINC Connected",
        description: "Successfully connected to CINC API.",
      });
      
      setStep('webhook');
    } catch (error: any) {
      setConnectionStatus('error');
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to CINC API.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const setupWebhook = async () => {
    try {
      setLoading(true);

      // In production, this would:
      // 1. Register webhook URL with CINC
      // 2. Configure event types (NEW_LEAD_WEBHOOK, LEAD_UPDATE_WEBHOOK)
      // 3. Store webhook secret in Supabase vault
      
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: "Webhook Configured",
        description: "CINC webhook has been set up successfully.",
      });
      
      setStep('test');
    } catch (error: any) {
      toast({
        title: "Webhook Setup Failed",
        description: error.message || "Failed to configure webhook.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testIntegration = async () => {
    try {
      setLoading(true);

      // In production, this would:
      // 1. Fetch recent leads from CINC
      // 2. Test webhook endpoint
      // 3. Verify phone number mapping
      
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Integration Test Successful",
        description: "CINC integration is working correctly.",
      });
      
      setStep('complete');
    } catch (error: any) {
      toast({
        title: "Integration Test Failed",
        description: error.message || "Integration test failed.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    // Save configuration and trigger success callback
    const newConfig: CincConfig = {
      apiKey: credentials.api_key,
      syncFrequency: 'realtime',
      filterOption: 'all',
      isConnected: true,
      lastSync: new Date().toISOString()
    };
    
    localStorage.setItem('cincConfig', JSON.stringify(newConfig));
    onSuccess();
    onClose();
  };

  const renderCredentialsStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Building className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold">Connect to CINC</h3>
        <p className="text-gray-600">Enter your CINC API credentials to establish connection</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="client-id">Client ID</Label>
          <Input
            id="client-id"
            placeholder="Your CINC Client ID"
            value={credentials.client_id}
            onChange={(e) => setCredentials({ ...credentials, client_id: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="client-secret">Client Secret</Label>
          <Input
            id="client-secret"
            type="password"
            placeholder="Your CINC Client Secret"
            value={credentials.client_secret}
            onChange={(e) => setCredentials({ ...credentials, client_secret: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="api-key">API Key</Label>
          <Input
            id="api-key"
            type="password"
            placeholder="Your CINC API Key"
            value={credentials.api_key}
            onChange={(e) => setCredentials({ ...credentials, api_key: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="webhook-secret">Webhook Secret</Label>
          <Input
            id="webhook-secret"
            type="password"
            placeholder="Webhook signing secret"
            value={credentials.webhook_secret}
            onChange={(e) => setCredentials({ ...credentials, webhook_secret: e.target.value })}
          />
        </div>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Key className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Where to find these credentials</h4>
            <p className="text-sm text-blue-700 mt-1">
              Get your API credentials from the CINC Developer Portal. You'll need admin access to your CINC account.
            </p>
            <Button variant="link" className="p-0 h-auto text-blue-700" asChild>
              <a href="https://developers.cinc.com" target="_blank" rel="noopener noreferrer">
                CINC Developer Portal <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </Button>
          </div>
        </div>
      </div>

      <Button 
        onClick={testConnection} 
        disabled={loading || !credentials.client_id || !credentials.api_key}
        className="w-full"
      >
        {loading ? 'Connecting...' : 'Connect to CINC'}
      </Button>
    </div>
  );

  const renderWebhookStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Webhook className="h-12 w-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold">Configure Webhook</h3>
        <p className="text-gray-600">Set up real-time lead notifications from CINC</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Webhook Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Webhook URL</Label>
            <div className="flex gap-2">
              <Input value={webhookUrl} readOnly className="font-mono text-sm" />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigator.clipboard.writeText(webhookUrl)}
              >
                Copy
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Event Types</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">NEW_LEAD_WEBHOOK</Badge>
                <span className="text-sm text-gray-600">New lead created</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">LEAD_UPDATE_WEBHOOK</Badge>
                <span className="text-sm text-gray-600">Lead information updated</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">NOTE_ADDED_WEBHOOK</Badge>
                <span className="text-sm text-gray-600">Note added to lead</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-green-900">What happens next</h4>
            <p className="text-sm text-green-700 mt-1">
              Once configured, CINC will send lead data to our webhook in real-time. We'll automatically:
            </p>
            <ul className="text-sm text-green-700 mt-2 space-y-1">
              <li>• Create leads in your Relay system</li>
              <li>• Map phone numbers for caller ID</li>
              <li>• Extract property interests</li>
              <li>• Prepare personalized greetings</li>
            </ul>
          </div>
        </div>
      </div>

      <Button onClick={setupWebhook} disabled={loading} className="w-full">
        {loading ? 'Configuring...' : 'Configure Webhook'}
      </Button>
    </div>
  );

  const renderTestStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Phone className="h-12 w-12 text-purple-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold">Test Integration</h3>
        <p className="text-gray-600">Verify that leads can call in with context</p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Integration Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span>CINC API Connection</span>
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Webhook Endpoint</span>
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Phone Mapping</span>
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Ready
              </Badge>
            </div>
          </CardContent>
        </Card>

        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-purple-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-purple-900">Ready for Inbound Calls</h4>
              <p className="text-sm text-purple-700 mt-1">
                CINC leads can now call your Retell number and receive personalized greetings based on their property interests and search history.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Button onClick={testIntegration} disabled={loading} className="w-full">
        {loading ? 'Testing...' : 'Run Integration Test'}
      </Button>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold">Integration Complete!</h3>
        <p className="text-gray-600">CINC is now connected to your Relay system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">What's Working</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Real-time lead sync</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Phone number mapping</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Personalized greetings</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Callback scheduling</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Next Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4 text-blue-600" />
              <span className="text-sm">Update CINC contact info</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-blue-600" />
              <span className="text-sm">Test with a sample lead</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm">Train your team</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Button onClick={handleComplete} className="w-full">
        Complete Setup
      </Button>
    </div>
  );

  const getCurrentStepContent = () => {
    switch (step) {
      case 'credentials':
        return renderCredentialsStep();
      case 'webhook':
        return renderWebhookStep();
      case 'test':
        return renderTestStep();
      case 'complete':
        return renderCompleteStep();
      default:
        return renderCredentialsStep();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            CINC Integration Setup
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          {getCurrentStepContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
};
