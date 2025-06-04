
import React, { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Brain, TestTube, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TestResult {
  test: string;
  status: 'success' | 'error' | 'loading';
  data?: any;
  error?: string;
}

export default function AITestingPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [sampleTranscript, setSampleTranscript] = useState(`Agent: Hi, this is Sarah with eXp Realty. May I ask who I'm speaking with?
User: Hi, Sarah. This is John Smith.
Agent: Hi John, nice to meet you! So I saw you were browsing some properties online. Can you tell me about your home search?
User: Yeah, I'm looking for a 3-bedroom house in Tampa, Florida. My budget is around $400,000. I'm a first-time homebuyer and I work as a software engineer making about $85,000 per year. I have about $40,000 saved for a down payment.
Agent: That's great! Have you been pre-approved for a mortgage yet?
User: No, not yet. I'm actually a bit worried about my credit score. I think it's around 680. I also have some student loan debt, about $500 per month in payments.
Agent: I understand those concerns. We work with lenders who specialize in helping first-time buyers. When are you hoping to buy?
User: Ideally within the next 3 months. I found a property I really like on MLS #TB123456 for $395,000.`);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const { toast } = useToast();

  const updateTestResult = (testName: string, result: Partial<TestResult>) => {
    setTestResults(prev => {
      const existing = prev.find(r => r.test === testName);
      if (existing) {
        return prev.map(r => r.test === testName ? { ...r, ...result } : r);
      } else {
        return [...prev, { test: testName, status: 'loading', ...result }];
      }
    });
  };

  const runEntityExtractionTest = async () => {
    updateTestResult('Entity Extraction', { status: 'loading' });
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-conversation-processor', {
        body: {
          action: 'extract_entities',
          data: {
            conversation_id: 'test-conversation-123',
            transcript: sampleTranscript
          }
        }
      });

      if (error) throw error;

      updateTestResult('Entity Extraction', { 
        status: 'success', 
        data: {
          sentiment_score: data.sentiment_score,
          lead_temperature: data.lead_temperature,
          qualification_score: data.qualification_score,
          pre_approval_status: data.pre_approval_status,
          buying_timeline: data.buying_timeline,
          extracted_entities: data.extracted_entities,
          summary: data.summary
        }
      });

      toast({
        title: "Entity Extraction Test Passed",
        description: "AI successfully extracted entities from the conversation."
      });

    } catch (error) {
      updateTestResult('Entity Extraction', { 
        status: 'error', 
        error: error.message 
      });
      console.error('Entity extraction test failed:', error);
    }
  };

  const runLeadAnalysisTest = async () => {
    updateTestResult('Lead Analysis', { status: 'loading' });
    
    try {
      const mockLeadContext = {
        lead_info: {
          name: 'John Smith',
          email: 'john.smith@email.com',
          phone: '+1234567890',
          status: 'new',
          source: 'website',
          created_at: new Date().toISOString()
        },
        qualification_data: {
          annual_income: 85000,
          property_price: 395000,
          down_payment_amount: 40000,
          credit_score_range: '660-699',
          first_time_buyer: true
        },
        conversations: [
          {
            transcript: sampleTranscript,
            sentiment_score: 0.7,
            created_at: new Date().toISOString()
          }
        ]
      };

      const { data, error } = await supabase.functions.invoke('ai-conversation-processor', {
        body: {
          action: 'analyze_lead',
          data: {
            lead_context: mockLeadContext,
            analysis_type: 'comprehensive_scoring'
          }
        }
      });

      if (error) throw error;

      updateTestResult('Lead Analysis', { 
        status: 'success', 
        data: {
          insights: data.analysis.insights,
          recommendations: data.analysis.recommendations,
          next_best_action: data.analysis.next_best_action,
          confidence: data.analysis.confidence,
          temperature_score: data.analysis.temperature_score,
          urgency_score: data.analysis.urgency_score
        }
      });

      toast({
        title: "Lead Analysis Test Passed",
        description: "AI successfully analyzed the lead profile."
      });

    } catch (error) {
      updateTestResult('Lead Analysis', { 
        status: 'error', 
        error: error.message 
      });
      console.error('Lead analysis test failed:', error);
    }
  };

  const runConversationAnalysisTest = async () => {
    updateTestResult('Conversation Analysis', { status: 'loading' });
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-conversation-processor', {
        body: {
          action: 'analyze_conversation',
          data: {
            conversationHistory: [
              {
                role: 'agent',
                content: 'Hi, this is Sarah with eXp Realty. May I ask who I\'m speaking with?',
                timestamp: new Date().toISOString()
              },
              {
                role: 'user',
                content: 'Hi, Sarah. This is John Smith. I\'m looking for a house in Tampa.',
                timestamp: new Date().toISOString()
              }
            ]
          }
        }
      });

      if (error) throw error;

      updateTestResult('Conversation Analysis', { 
        status: 'success', 
        data: {
          summary: data.summary,
          qualificationScore: data.qualificationScore,
          sentiment: data.sentiment,
          nextSteps: data.nextSteps,
          leadTemperature: data.leadTemperature,
          concerns: data.concerns,
          interests: data.interests,
          conversion_probability: data.conversion_probability
        }
      });

      toast({
        title: "Conversation Analysis Test Passed",
        description: "AI successfully analyzed the conversation."
      });

    } catch (error) {
      updateTestResult('Conversation Analysis', { 
        status: 'error', 
        error: error.message 
      });
      console.error('Conversation analysis test failed:', error);
    }
  };

  const runAllTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);

    try {
      await runEntityExtractionTest();
      await new Promise(resolve => setTimeout(resolve, 1000)); // Brief delay between tests
      
      await runLeadAnalysisTest();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await runConversationAnalysisTest();

      toast({
        title: "All Tests Complete",
        description: "AI automation testing finished. Check results below."
      });

    } catch (error) {
      console.error('Test suite failed:', error);
    } finally {
      setIsRunningTests(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'loading': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <PageLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <TestTube className="h-8 w-8 text-blue-500" />
          <div>
            <h1 className="text-3xl font-bold">AI Automation Testing</h1>
            <p className="text-muted-foreground">Test the AI backend automation features</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Sample Conversation Transcript
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={sampleTranscript}
              onChange={(e) => setSampleTranscript(e.target.value)}
              rows={8}
              placeholder="Enter a conversation transcript to test..."
              className="mb-4"
            />
            <div className="flex gap-3">
              <Button 
                onClick={runAllTests}
                disabled={isRunningTests}
                className="flex items-center gap-2"
              >
                {isRunningTests ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Brain className="h-4 w-4" />
                )}
                Run All AI Tests
              </Button>
              <Button variant="outline" onClick={runEntityExtractionTest}>
                Test Entity Extraction
              </Button>
              <Button variant="outline" onClick={runLeadAnalysisTest}>
                Test Lead Analysis
              </Button>
              <Button variant="outline" onClick={runConversationAnalysisTest}>
                Test Conversation Analysis
              </Button>
            </div>
          </CardContent>
        </Card>

        {testResults.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Test Results</h2>
            {testResults.map((result, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{result.test}</span>
                    <Badge className={getStatusColor(result.status)}>
                      {result.status === 'loading' && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
                      {result.status.toUpperCase()}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {result.status === 'success' && result.data && (
                    <div className="space-y-2">
                      <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </div>
                  )}
                  {result.status === 'error' && (
                    <div className="text-red-600 font-medium">
                      Error: {result.error}
                    </div>
                  )}
                  {result.status === 'loading' && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Running test...
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
