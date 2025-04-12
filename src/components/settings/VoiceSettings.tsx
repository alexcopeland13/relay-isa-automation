
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { SaveIcon, Play, PhoneCall, CheckIcon, VoiceNetwork } from 'lucide-react';
import { toast } from 'sonner';

export const VoiceSettings = () => {
  const [voiceGender, setVoiceGender] = useState('female');
  const [voiceAccent, setVoiceAccent] = useState('american');
  const [speakingRate, setSpeakingRate] = useState(1.0);
  const [interruption, setInterruption] = useState(true);
  const [businessHoursOnly, setBusinessHoursOnly] = useState(true);
  const [maxCallDuration, setMaxCallDuration] = useState(15);
  const [apiKey, setApiKey] = useState('');
  
  const handleSaveSettings = () => {
    toast.success('Voice settings saved successfully');
  };
  
  const handleTestVoice = () => {
    toast.info('Testing voice...', {
      description: 'Playing voice sample to test your selected configuration.'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Voice Settings</h2>
          <p className="text-sm text-muted-foreground">
            Configure how the AI sounds and behaves during voice conversations.
          </p>
        </div>
        <Button onClick={handleSaveSettings}>
          <SaveIcon className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>
      
      <Tabs defaultValue="voice">
        <TabsList>
          <TabsTrigger value="voice">Voice Selection</TabsTrigger>
          <TabsTrigger value="behavior">Call Behavior</TabsTrigger>
          <TabsTrigger value="integration">Retell Integration</TabsTrigger>
        </TabsList>
        
        <TabsContent value="voice" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Voice Selection</CardTitle>
              <CardDescription>
                Choose the voice characteristics for AI calls with leads.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="voice-gender">Voice Gender</Label>
                  <Select value={voiceGender} onValueChange={setVoiceGender}>
                    <SelectTrigger id="voice-gender">
                      <SelectValue placeholder="Select voice gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="neutral">Gender Neutral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="voice-accent">Accent</Label>
                  <Select value={voiceAccent} onValueChange={setVoiceAccent}>
                    <SelectTrigger id="voice-accent">
                      <SelectValue placeholder="Select accent" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="american">American</SelectItem>
                      <SelectItem value="british">British</SelectItem>
                      <SelectItem value="australian">Australian</SelectItem>
                      <SelectItem value="indian">Indian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="speaking-rate">Speaking Rate</Label>
                  <span className="text-sm text-muted-foreground">{speakingRate.toFixed(1)}x</span>
                </div>
                <Slider
                  id="speaking-rate"
                  min={0.5}
                  max={2}
                  step={0.1}
                  value={[speakingRate]}
                  onValueChange={(value) => setSpeakingRate(value[0])}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Slower</span>
                  <span>Default</span>
                  <span>Faster</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={handleTestVoice}>
                <Play className="mr-2 h-4 w-4" />
                Test Voice
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Voice Samples</CardTitle>
              <CardDescription>Listen to available voice options to choose the best fit for your leads.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-md p-4 hover:border-primary/50 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h4 className="font-medium">Sarah</h4>
                      <p className="text-sm text-muted-foreground">Female, American</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground italic">
                    "Hi, I'm Sarah. I'd be happy to discuss your mortgage refinancing options today."
                  </p>
                </div>
                
                <div className="border rounded-md p-4 hover:border-primary/50 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h4 className="font-medium">Michael</h4>
                      <p className="text-sm text-muted-foreground">Male, American</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground italic">
                    "Hello, this is Michael. I'm calling about your interest in our real estate services."
                  </p>
                </div>
                
                <div className="border rounded-md p-4 hover:border-primary/50 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h4 className="font-medium">Emily</h4>
                      <p className="text-sm text-muted-foreground">Female, British</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground italic">
                    "Hello there, this is Emily. I understand you're looking into property options in our area."
                  </p>
                </div>
                
                <div className="border rounded-md p-4 hover:border-primary/50 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h4 className="font-medium">James</h4>
                      <p className="text-sm text-muted-foreground">Male, Australian</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground italic">
                    "G'day, James here. I'm calling about your recent inquiry about our property listings."
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="behavior" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Conversation Behavior</CardTitle>
              <CardDescription>
                Configure how the AI handles the flow of voice conversations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="interruption">Allow Interruptions</Label>
                  <p className="text-sm text-muted-foreground">
                    Let the AI pause when the lead starts speaking
                  </p>
                </div>
                <Switch
                  id="interruption"
                  checked={interruption}
                  onCheckedChange={setInterruption}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="greeting">AI Greeting</Label>
                <Input 
                  id="greeting"
                  placeholder="Hello, this is Relay AI calling about your recent inquiry..."
                />
                <p className="text-xs text-muted-foreground">
                  The AI will start each call with this greeting.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="closing">AI Closing</Label>
                <Input 
                  id="closing"
                  placeholder="Thank you for your time. An agent will follow up shortly..."
                />
                <p className="text-xs text-muted-foreground">
                  The AI will end each call with this closing statement.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Call Handling Rules</CardTitle>
              <CardDescription>
                Set limitations and rules for AI-powered calls.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="business-hours">Business Hours Only</Label>
                  <p className="text-sm text-muted-foreground">
                    Only make outbound calls during business hours (9AM-5PM)
                  </p>
                </div>
                <Switch
                  id="business-hours"
                  checked={businessHoursOnly}
                  onCheckedChange={setBusinessHoursOnly}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="max-duration">Maximum Call Duration</Label>
                  <span className="text-sm text-muted-foreground">{maxCallDuration} minutes</span>
                </div>
                <Slider
                  id="max-duration"
                  min={5}
                  max={30}
                  step={1}
                  value={[maxCallDuration]}
                  onValueChange={(value) => setMaxCallDuration(value[0])}
                />
                <p className="text-xs text-muted-foreground">
                  AI will automatically end the call after this duration.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="handoff-trigger">Agent Handoff Triggers</Label>
                <Select defaultValue="request">
                  <SelectTrigger id="handoff-trigger">
                    <SelectValue placeholder="Select when to handoff" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="request">When lead requests a human</SelectItem>
                    <SelectItem value="qualified">When lead is highly qualified</SelectItem>
                    <SelectItem value="confused">When lead is confused</SelectItem>
                    <SelectItem value="angry">When lead is upset or angry</SelectItem>
                    <SelectItem value="all">All of the above</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="integration" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Retell API Integration</CardTitle>
              <CardDescription>
                Connect your Retell account to enable voice conversations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">Retell API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="Enter your Retell API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Your API key is stored securely and never shared.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Connection Status</Label>
                <div className="bg-green-50 text-green-700 p-3 rounded-md flex items-center">
                  <CheckIcon className="h-5 w-5 mr-2" />
                  <span>Connected to Retell API</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <Label>Voice Call Testing</Label>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <VoiceNetwork className="mr-2 h-4 w-4" />
                    Test Voice Connection
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <PhoneCall className="mr-2 h-4 w-4" />
                    Make Test Call
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Call Analytics & Storage</CardTitle>
              <CardDescription>Configure how call data is processed and stored.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Record All Calls</Label>
                  <p className="text-sm text-muted-foreground">
                    Save recordings of all voice conversations
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Transcribe Calls</Label>
                  <p className="text-sm text-muted-foreground">
                    Create text transcripts of all calls
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Real-time Analysis</Label>
                  <p className="text-sm text-muted-foreground">
                    Analyze calls in real-time for sentiment and key information
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="space-y-2">
                <Label>Data Retention Period</Label>
                <Select defaultValue="90">
                  <SelectTrigger>
                    <SelectValue placeholder="Select retention period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="60">60 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="180">180 days</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
