
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

export const FollowUpRulesConfig = () => {
  const { toast } = useToast();
  const [enabledChannels, setEnabledChannels] = useState<string[]>(['email', 'call']);
  
  const handleSaveConfig = () => {
    toast({
      title: "Configuration saved",
      description: "Follow-up rules settings have been updated",
    });
  };
  
  const toggleChannel = (channel: string) => {
    if (enabledChannels.includes(channel)) {
      setEnabledChannels(enabledChannels.filter(c => c !== channel));
    } else {
      setEnabledChannels([...enabledChannels, channel]);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Follow-up Timing Rules</CardTitle>
          <CardDescription>
            Configure when the AI should suggest follow-ups
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Initial Follow-up Timing</h3>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="high-interest-delay">High Interest Leads</Label>
                <div className="flex items-center gap-2">
                  <Input id="high-interest-delay" type="number" defaultValue="1" className="w-16" />
                  <Select defaultValue="days">
                    <SelectTrigger className="w-28">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                      <SelectItem value="weeks">Weeks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="medium-interest-delay">Medium Interest Leads</Label>
                <div className="flex items-center gap-2">
                  <Input id="medium-interest-delay" type="number" defaultValue="2" className="w-16" />
                  <Select defaultValue="days">
                    <SelectTrigger className="w-28">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                      <SelectItem value="weeks">Weeks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="low-interest-delay">Low Interest Leads</Label>
                <div className="flex items-center gap-2">
                  <Input id="low-interest-delay" type="number" defaultValue="5" className="w-16" />
                  <Select defaultValue="days">
                    <SelectTrigger className="w-28">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                      <SelectItem value="weeks">Weeks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="urgent-request-delay">Urgent Requests</Label>
                <div className="flex items-center gap-2">
                  <Input id="urgent-request-delay" type="number" defaultValue="4" className="w-16" />
                  <Select defaultValue="hours">
                    <SelectTrigger className="w-28">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                      <SelectItem value="weeks">Weeks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 pt-2">
              <div className="flex justify-between">
                <Label htmlFor="interest-threshold">Interest Level Threshold</Label>
                <span className="text-sm">70%</span>
              </div>
              <Slider
                id="interest-threshold"
                defaultValue={[70]}
                max={100}
                step={5}
              />
              <p className="text-xs text-muted-foreground">
                Minimum interest level to generate follow-up suggestions
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Follow-up Sequence Rules</h3>
            
            <div className="space-y-2">
              <Label htmlFor="max-followups">Maximum Follow-ups Per Lead</Label>
              <Input id="max-followups" type="number" defaultValue="5" min="1" max="10" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="followup-frequency">Minimum Days Between Follow-ups</Label>
              <Input id="followup-frequency" type="number" defaultValue="3" min="1" max="30" />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-increment-priority">Auto-increment Priority</Label>
                <p className="text-sm text-muted-foreground">Automatically increase priority for aging leads</p>
              </div>
              <Switch id="auto-increment-priority" defaultChecked />
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Time-based Constraints</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="business-hours-only">Business Hours Only</Label>
                <p className="text-sm text-muted-foreground">Only schedule follow-ups during business hours</p>
              </div>
              <Switch id="business-hours-only" defaultChecked />
            </div>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="business-hours-start">Business Hours Start</Label>
                <Input id="business-hours-start" type="time" defaultValue="09:00" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="business-hours-end">Business Hours End</Label>
                <Input id="business-hours-end" type="time" defaultValue="17:00" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Business Days</Label>
              <div className="flex flex-wrap gap-2">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox id={`day-${index}`} defaultChecked={index < 5} />
                    <label
                      htmlFor={`day-${index}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {day}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSaveConfig}>Save Configuration</Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Channel Selection Rules</CardTitle>
          <CardDescription>
            Configure which channels to use for different follow-up scenarios
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Enabled Channels</h3>
            
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'email', label: 'Email' },
                { id: 'sms', label: 'SMS' },
                { id: 'call', label: 'Phone Call' },
                { id: 'voicemail', label: 'Voicemail' },
              ].map((channel) => (
                <Badge
                  key={channel.id}
                  variant={enabledChannels.includes(channel.id) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleChannel(channel.id)}
                >
                  {channel.label}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Channel Selection Logic</h3>
            
            <div className="space-y-2">
              <Label htmlFor="high-priority-channel">High Priority Leads</Label>
              <Select defaultValue="call">
                <SelectTrigger id="high-priority-channel">
                  <SelectValue placeholder="Select channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">Phone Call</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="voicemail">Voicemail</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="medium-priority-channel">Medium Priority Leads</Label>
              <Select defaultValue="email">
                <SelectTrigger id="medium-priority-channel">
                  <SelectValue placeholder="Select channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">Phone Call</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="voicemail">Voicemail</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="low-priority-channel">Low Priority Leads</Label>
              <Select defaultValue="email">
                <SelectTrigger id="low-priority-channel">
                  <SelectValue placeholder="Select channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">Phone Call</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="voicemail">Voicemail</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="respect-preferences">Respect Lead Preferences</Label>
                <p className="text-sm text-muted-foreground">Prioritize the lead's preferred contact method when available</p>
              </div>
              <Switch id="respect-preferences" defaultChecked />
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Channel Constraints</h3>
            
            <div className="space-y-2">
              <Label htmlFor="sms-time-constraint">SMS Time Constraints</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground w-10">From:</span>
                  <Input id="sms-time-start" type="time" defaultValue="09:00" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground w-10">To:</span>
                  <Input id="sms-time-end" type="time" defaultValue="20:00" />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="call-time-constraint">Phone Call Time Constraints</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground w-10">From:</span>
                  <Input id="call-time-start" type="time" defaultValue="10:00" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground w-10">To:</span>
                  <Input id="call-time-end" type="time" defaultValue="17:00" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSaveConfig}>Save Configuration</Button>
        </CardFooter>
      </Card>
    </div>
  );
};
