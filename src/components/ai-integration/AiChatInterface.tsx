
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AiChatbot } from './AiChatbot';
import { 
  Users, 
  UserCheck, 
  MessageSquare, 
  Brain,
  TrendingUp,
  HelpCircle
} from 'lucide-react';

export const AiChatInterface = () => {
  const [activeMode, setActiveMode] = useState<'prospect' | 'agent'>('prospect');

  const chatModes = [
    {
      id: 'prospect' as const,
      label: 'Prospect Chat',
      description: 'AI assistant for potential buyers and sellers',
      icon: Users,
      color: 'bg-blue-100 text-blue-800',
      features: [
        'Answer real estate questions',
        'Qualify potential leads',
        'Schedule appointments',
        'Provide market insights',
        'Connect with specialists'
      ]
    },
    {
      id: 'agent' as const,
      label: 'Agent Support',
      description: 'AI assistant for real estate professionals',
      icon: UserCheck,
      color: 'bg-green-100 text-green-800',
      features: [
        'Lead analysis and insights',
        'Follow-up suggestions',
        'Conversation summaries',
        'Market research assistance',
        'Strategy recommendations'
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">AI Chat Assistant</h2>
        <p className="text-gray-600">
          Interact with our AI assistant in different modes depending on your needs
        </p>
      </div>

      <Tabs value={activeMode} onValueChange={(value) => setActiveMode(value as 'prospect' | 'agent')}>
        <TabsList className="grid w-full grid-cols-2">
          {chatModes.map((mode) => (
            <TabsTrigger key={mode.id} value={mode.id} className="flex items-center gap-2">
              <mode.icon className="h-4 w-4" />
              {mode.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {chatModes.map((mode) => (
          <TabsContent key={mode.id} value={mode.id} className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <mode.icon className="h-6 w-6" />
                    <div>
                      <CardTitle>{mode.label}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{mode.description}</p>
                    </div>
                  </div>
                  <Badge className={mode.color}>
                    Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Capabilities:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {mode.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Brain className="h-3 w-3 text-blue-500" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
                
                <AiChatbot 
                  mode={mode.id}
                  leadId={mode.id === 'prospect' ? 'demo-lead-123' : undefined}
                />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Usage Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">For Prospects:</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Ask about buying or selling process</li>
                <li>• Get mortgage pre-qualification info</li>
                <li>• Request property recommendations</li>
                <li>• Schedule specialist consultations</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">For Agents:</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Analyze lead conversations</li>
                <li>• Get follow-up suggestions</li>
                <li>• Research market trends</li>
                <li>• Plan lead nurturing strategies</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
