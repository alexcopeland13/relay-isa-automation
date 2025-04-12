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
  ArrowRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { CincIntegrationModal } from "@/components/integrations/CincIntegrationModal";

export const IntegrationSettings = () => {
  const { toast } = useToast();
  const [showCincModal, setShowCincModal] = useState(false);

  const handleConnect = (service: string) => {
    if (service === 'CINC') {
      setShowCincModal(true);
      return;
    }
    
    toast({
      title: `${service} integration`,
      description: `${service} integration has been initiated. Complete setup in the popup window.`,
    });
  };

  const handleDisconnect = (service: string) => {
    toast({
      title: `${service} disconnected`,
      description: `${service} integration has been disconnected.`,
    });
  };

  const handleSave = () => {
    toast({
      title: "API settings saved",
      description: "Your API configuration has been updated.",
    });
  };

  return (
    <>
      {showCincModal && (
        <CincIntegrationModal
          onClose={() => setShowCincModal(false)}
          onSuccess={() => {
            setShowCincModal(false);
            toast({
              title: "CINC integration successful",
              description: "Your CINC account is now connected to Relay.",
            });
          }}
        />
      )}
      
      <div className="space-y-6">
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
                  <Badge variant="outline" className="text-red-500 border-red-200 bg-red-50">Disconnected</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">Sync leads and property information from CINC's real estate lead generation platform.</p>
                <Button 
                  className="w-full" 
                  onClick={() => handleConnect('CINC')}
                >
                  Connect
                </Button>
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
                <Input id="api-key" value="••••••••••••••••••••••••••••••" readOnly />
                <Button variant="outline">Regenerate</Button>
              </div>
              <p className="text-sm text-muted-foreground">Use this key to authenticate API requests.</p>
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-2">
              <Label htmlFor="webhook-url">Webhook URL</Label>
              <Input id="webhook-url" placeholder="https://your-service.com/webhook" />
              <p className="text-sm text-muted-foreground">URL to receive event notifications.</p>
            </div>
            
            <div className="space-y-2 mt-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Enable Webhooks</Label>
                  <p className="text-sm text-muted-foreground">Send event notifications to external services.</p>
                </div>
                <Switch defaultChecked={true} />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSave}>Save API Settings</Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};
