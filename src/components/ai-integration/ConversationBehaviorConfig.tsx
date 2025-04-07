
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export const ConversationBehaviorConfig = () => {
  const { toast } = useToast();
  const [greetingMessage, setGreetingMessage] = useState(
    "Hello, I'm your EMM Loans assistant. How can I help you with your mortgage needs today?"
  );
  const [conversationStyle, setConversationStyle] = useState('balanced');
  const [personalityTraits, setPersonalityTraits] = useState<string[]>(['friendly', 'professional', 'helpful']);
  const [handoffEnabled, setHandoffEnabled] = useState(true);

  const availablePersonalityTraits = [
    { value: 'friendly', label: 'Friendly' },
    { value: 'professional', label: 'Professional' },
    { value: 'helpful', label: 'Helpful' },
    { value: 'empathetic', label: 'Empathetic' },
    { value: 'knowledgeable', label: 'Knowledgeable' },
    { value: 'direct', label: 'Direct' },
    { value: 'detailed', label: 'Detailed' },
    { value: 'concise', label: 'Concise' },
  ];

  const handleSaveConfig = () => {
    toast({
      title: "Configuration saved",
      description: "Conversation behavior settings have been updated",
    });
  };

  const togglePersonalityTrait = (trait: string) => {
    if (personalityTraits.includes(trait)) {
      setPersonalityTraits(personalityTraits.filter(t => t !== trait));
    } else {
      setPersonalityTraits([...personalityTraits, trait]);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Conversation Style & Personality</CardTitle>
          <CardDescription>
            Configure how the AI assistant communicates with leads
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Greeting Configuration */}
          <div className="space-y-3">
            <Label htmlFor="greeting-message">Initial Greeting Message</Label>
            <Textarea 
              id="greeting-message"
              placeholder="Enter the greeting message the AI will use"
              value={greetingMessage}
              onChange={(e) => setGreetingMessage(e.target.value)}
              rows={3}
            />
            <div className="text-xs text-muted-foreground">
              This is the first message the AI will send when starting a new conversation.
            </div>
          </div>
          
          {/* Conversation Style Slider */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label htmlFor="conversation-style">Conversation Style</Label>
              <span className="text-sm font-medium capitalize">{conversationStyle}</span>
            </div>
            <div className="pt-2">
              <Slider
                id="conversation-style"
                defaultValue={[50]}
                max={100}
                step={25}
                onValueChange={(value) => {
                  const val = value[0];
                  if (val === 0) setConversationStyle('formal');
                  else if (val === 25) setConversationStyle('professional');
                  else if (val === 50) setConversationStyle('balanced');
                  else if (val === 75) setConversationStyle('conversational');
                  else setConversationStyle('casual');
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Formal</span>
              <span>Professional</span>
              <span>Balanced</span>
              <span>Conversational</span>
              <span>Casual</span>
            </div>
          </div>
          
          {/* Personality Traits */}
          <div className="space-y-3">
            <Label>Personality Traits</Label>
            <div className="flex flex-wrap gap-2">
              {availablePersonalityTraits.map((trait) => (
                <Badge
                  key={trait.value}
                  variant={personalityTraits.includes(trait.value) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => togglePersonalityTrait(trait.value)}
                >
                  {trait.label}
                </Badge>
              ))}
            </div>
            <div className="text-xs text-muted-foreground">
              Select up to 5 personality traits that define how the AI will interact with users.
            </div>
          </div>
          
          {/* Information Gathering */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Information Gathering Strategy</h3>
            
            <div className="space-y-2">
              <Label htmlFor="questioning-style">Questioning Style</Label>
              <Select defaultValue="balanced">
                <SelectTrigger id="questioning-style">
                  <SelectValue placeholder="Select questioning style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="direct">Direct (straight to the point)</SelectItem>
                  <SelectItem value="balanced">Balanced (mix of direct and conversational)</SelectItem>
                  <SelectItem value="conversational">Conversational (more natural flow)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="follow-up-questions">Follow-up Questions</Label>
                <p className="text-sm text-muted-foreground">Ask follow-up questions to gather missing information</p>
              </div>
              <Switch id="follow-up-questions" defaultChecked />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="max-follow-ups">Maximum Follow-up Questions</Label>
              <Input id="max-follow-ups" type="number" defaultValue="3" min="1" max="5" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSaveConfig}>Save Configuration</Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Handoff & Escalation</CardTitle>
          <CardDescription>
            Configure when the AI should escalate to a human agent
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enable-handoff">Enable Human Handoff</Label>
              <p className="text-sm text-muted-foreground">Allow the AI to transfer conversations to human agents</p>
            </div>
            <Switch 
              id="enable-handoff" 
              checked={handoffEnabled}
              onCheckedChange={setHandoffEnabled}
            />
          </div>
          
          <div className={!handoffEnabled ? "opacity-50 pointer-events-none" : ""}>
            <h3 className="text-sm font-medium mb-4">Handoff Triggers</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="explicit-request">Explicit Request</Label>
                  <p className="text-sm text-muted-foreground">Handoff when user explicitly asks for a human</p>
                </div>
                <Switch id="explicit-request" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="negative-sentiment">Negative Sentiment</Label>
                  <p className="text-sm text-muted-foreground">Handoff when user expresses frustration or dissatisfaction</p>
                </div>
                <Switch id="negative-sentiment" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="high-value">High-Value Lead</Label>
                  <p className="text-sm text-muted-foreground">Handoff for leads that meet high-value criteria</p>
                </div>
                <Switch id="high-value" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="complex-questions">Complex Questions</Label>
                  <p className="text-sm text-muted-foreground">Handoff when questions exceed AI knowledge boundaries</p>
                </div>
                <Switch id="complex-questions" defaultChecked />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confidence-threshold">Confidence Threshold</Label>
                <div className="flex items-center gap-3">
                  <Slider
                    id="confidence-threshold"
                    defaultValue={[70]}
                    max={100}
                    step={1}
                  />
                  <span className="text-sm w-12 text-right">70%</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Handoff when AI confidence falls below this threshold
                </p>
              </div>
            </div>
            
            <div className="mt-6 space-y-3">
              <h3 className="text-sm font-medium">Handoff Message</h3>
              <Textarea 
                placeholder="Enter message to send when handing off to a human agent"
                defaultValue="I'll connect you with a mortgage specialist who can help you with this specific question. They'll be with you shortly."
                rows={3}
              />
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
