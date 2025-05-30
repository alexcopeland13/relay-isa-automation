
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  MessageSquare, 
  CheckCircle, 
  AlertCircle, 
  Star,
  Target,
  TrendingUp
} from 'lucide-react';

interface ValidationResult {
  entityExtraction: {
    score: number;
    extractedEntities: any;
    expectedEntities: string[];
    matched: string[];
    missed: string[];
  };
  sentimentAnalysis: {
    detected: string;
    expected: string;
    accurate: boolean;
  };
  followUpSuggestions: {
    count: number;
    relevant: boolean;
    suggestions: any[];
  };
}

export const ConversationQualityValidator = () => {
  const [testConversation, setTestConversation] = useState(
    "Hi, I'm Sarah Johnson and I'm looking to buy my first home. My budget is around $350,000 and I'm pre-approved with Chase Bank. I'm interested in a 3-bedroom house in the downtown area, preferably near good schools. My timeline is pretty flexible - I'd like to move within the next 3-4 months. My phone number is 555-123-4567 and my email is sarah.j@email.com. I'm currently renting but looking to buy."
  );
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const runValidation = async () => {
    setIsValidating(true);
    try {
      console.log('Starting conversation quality validation...');

      // Test entity extraction
      const { data: extractionData, error: extractionError } = await supabase.functions.invoke('ai-conversation-processor', {
        body: {
          action: 'extract_entities',
          data: { text: testConversation }
        }
      });

      if (extractionError) {
        throw new Error(`Entity extraction failed: ${extractionError.message}`);
      }

      // Test conversation analysis
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('ai-conversation-processor', {
        body: {
          action: 'analyze_conversation',
          data: { 
            conversationHistory: [
              {
                id: 'test-1',
                role: 'user',
                content: testConversation,
                timestamp: new Date().toISOString()
              }
            ]
          }
        }
      });

      if (analysisError) {
        throw new Error(`Analysis failed: ${analysisError.message}`);
      }

      // Expected entities for validation
      const expectedEntities = ['name', 'budget_range', 'phone', 'email', 'property_type', 'location_preference', 'timeline'];
      const extractedEntities = extractionData?.entities || {};
      const extractedKeys = Object.keys(extractedEntities);
      
      const matched = expectedEntities.filter(entity => extractedKeys.includes(entity));
      const missed = expectedEntities.filter(entity => !extractedKeys.includes(entity));
      const score = (matched.length / expectedEntities.length) * 100;

      const result: ValidationResult = {
        entityExtraction: {
          score,
          extractedEntities,
          expectedEntities,
          matched,
          missed
        },
        sentimentAnalysis: {
          detected: analysisData?.sentiment || 'neutral',
          expected: 'positive',
          accurate: (analysisData?.sentiment || 'neutral') === 'positive'
        },
        followUpSuggestions: {
          count: analysisData?.nextSteps?.length || 0,
          relevant: (analysisData?.nextSteps?.length || 0) > 0,
          suggestions: analysisData?.nextSteps || []
        }
      };

      setValidationResult(result);

      toast({
        title: 'Validation Complete',
        description: `Entity extraction score: ${score.toFixed(1)}%`,
      });

    } catch (error) {
      console.error('Validation error:', error);
      toast({
        title: 'Validation Failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsValidating(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { variant: 'default' as const, label: 'Excellent', color: 'bg-green-100 text-green-800' };
    if (score >= 60) return { variant: 'secondary' as const, label: 'Good', color: 'bg-yellow-100 text-yellow-800' };
    return { variant: 'destructive' as const, label: 'Needs Improvement', color: 'bg-red-100 text-red-800' };
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Conversation Quality Validator</h3>
        <p className="text-sm text-gray-600">Test AI accuracy with sample conversations</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Test Conversation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={testConversation}
            onChange={(e) => setTestConversation(e.target.value)}
            placeholder="Enter a test conversation to validate AI performance..."
            rows={6}
          />
          <Button onClick={runValidation} disabled={isValidating || !testConversation.trim()}>
            {isValidating ? (
              <>
                <Target className="h-4 w-4 mr-2 animate-spin" />
                Validating...
              </>
            ) : (
              <>
                <Target className="h-4 w-4 mr-2" />
                Validate Quality
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {validationResult && (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Entity Extraction Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Extraction Score</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-bold ${getScoreColor(validationResult.entityExtraction.score)}`}>
                      {validationResult.entityExtraction.score.toFixed(1)}%
                    </span>
                    <Badge className={getScoreBadge(validationResult.entityExtraction.score).color}>
                      {getScoreBadge(validationResult.entityExtraction.score).label}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-green-600 mb-2">Successfully Extracted</h4>
                    <div className="space-y-1">
                      {validationResult.entityExtraction.matched.map((entity) => (
                        <Badge key={entity} className="bg-green-100 text-green-800 mr-1">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {entity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-red-600 mb-2">Missed Entities</h4>
                    <div className="space-y-1">
                      {validationResult.entityExtraction.missed.map((entity) => (
                        <Badge key={entity} className="bg-red-100 text-red-800 mr-1">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {entity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Sentiment Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Detected:</span>
                    <Badge variant="outline">{validationResult.sentimentAnalysis.detected}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Expected:</span>
                    <Badge variant="outline">{validationResult.sentimentAnalysis.expected}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Accuracy:</span>
                    {validationResult.sentimentAnalysis.accurate ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Accurate
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Inaccurate
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Follow-up Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Suggestions Generated:</span>
                    <Badge variant="outline">{validationResult.followUpSuggestions.count}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Relevance:</span>
                    {validationResult.followUpSuggestions.relevant ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Relevant
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Limited
                      </Badge>
                    )}
                  </div>
                  {validationResult.followUpSuggestions.suggestions.length > 0 && (
                    <div className="mt-3">
                      <h5 className="text-sm font-medium mb-2">Generated Suggestions:</h5>
                      <ul className="text-xs space-y-1">
                        {validationResult.followUpSuggestions.suggestions.map((suggestion, index) => (
                          <li key={index} className="text-gray-600">• {suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
