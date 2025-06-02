
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAILeadScoring } from '@/hooks/use-ai-lead-scoring';
import { useAIRecommendations } from '@/hooks/use-ai-recommendations';
import { useLeadsData } from '@/hooks/use-leads-data';
import { 
  Brain, 
  TrendingUp, 
  Clock, 
  Target, 
  AlertTriangle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Zap
} from 'lucide-react';

export const AiInsightsDashboard = () => {
  const { leads } = useLeadsData();
  const { insights, isProcessing, generateLeadInsights, batchAnalyzeLeads } = useAILeadScoring();
  const { 
    recommendations, 
    getHighPriorityRecommendations, 
    getUpcomingActions,
    markRecommendationCompleted 
  } = useAIRecommendations();

  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);

  const highPriorityRecommendations = getHighPriorityRecommendations();
  const upcomingActions = getUpcomingActions();

  const handleAnalyzeAllLeads = async () => {
    if (leads.length > 0) {
      await batchAnalyzeLeads(leads.slice(0, 10)); // Limit to first 10 for demo
    }
  };

  const getTemperatureColor = (temperature: string) => {
    switch (temperature) {
      case 'hot': return 'bg-red-500';
      case 'warm': return 'bg-orange-500';
      case 'cool': return 'bg-blue-500';
      case 'cold': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-orange-600 bg-orange-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            AI Insights Dashboard
          </h2>
          <p className="text-muted-foreground">
            Intelligent analysis and recommendations for your leads
          </p>
        </div>
        <Button 
          onClick={handleAnalyzeAllLeads}
          disabled={isProcessing}
          className="gap-2"
        >
          {isProcessing ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Analyzing...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4" />
              Analyze All Leads
            </>
          )}
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Leads Analyzed</p>
                <p className="text-2xl font-bold">{Object.keys(insights).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">High Priority</p>
                <p className="text-2xl font-bold">{highPriorityRecommendations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Upcoming Actions</p>
                <p className="text-2xl font-bold">{upcomingActions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Confidence</p>
                <p className="text-2xl font-bold">
                  {Object.values(insights).length > 0 
                    ? Math.round(Object.values(insights).reduce((sum, insight) => sum + insight.confidence, 0) / Object.values(insights).length * 100)
                    : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Lead Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.values(insights).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No AI insights generated yet</p>
                <p className="text-sm">Click "Analyze All Leads" to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.values(insights).slice(0, 5).map((insight) => (
                  <div 
                    key={insight.leadId}
                    className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => setSelectedInsight(insight.leadId)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`text-xs ${getTemperatureColor(insight.temperature)} text-white`}>
                            {insight.temperature.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className={getPriorityColor(insight.priority)}>
                            {insight.priority}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Score: {insight.score}
                          </span>
                        </div>
                        <p className="text-sm font-medium mb-1">
                          Lead ID: {insight.leadId.slice(0, 8)}...
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {insight.nextBestAction}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Progress value={insight.confidence * 100} className="w-12 h-2" />
                        <span className="text-xs text-muted-foreground">
                          {Math.round(insight.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Priority Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {highPriorityRecommendations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No high priority recommendations</p>
                <p className="text-sm">AI will generate recommendations as leads are analyzed</p>
              </div>
            ) : (
              <div className="space-y-3">
                {highPriorityRecommendations.map((rec) => (
                  <div key={rec.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{rec.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {rec.description}
                        </p>
                      </div>
                      <Badge className={getPriorityColor(rec.priority)}>
                        {rec.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {rec.timing.replace('_', ' ')}
                        <span>•</span>
                        <span>{rec.channel}</span>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => markRecommendationCompleted(rec.id)}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Complete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Insight View */}
      {selectedInsight && insights[selectedInsight] && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Detailed AI Analysis</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedInsight(null)}
              >
                Close
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const insight = insights[selectedInsight];
              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{insight.score}</p>
                      <p className="text-sm text-muted-foreground">Lead Score</p>
                    </div>
                    <div className="text-center">
                      <Badge className={`${getTemperatureColor(insight.temperature)} text-white`}>
                        {insight.temperature.toUpperCase()}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">Temperature</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{Math.round(insight.confidence * 100)}%</p>
                      <p className="text-sm text-muted-foreground">Confidence</p>
                    </div>
                    <div className="text-center">
                      <Badge className={getPriorityColor(insight.priority)}>
                        {insight.priority}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">Priority</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">AI Insights</h4>
                      <ul className="space-y-1">
                        {insight.insights.map((item, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-blue-600">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Recommendations</h4>
                      <ul className="space-y-1">
                        {insight.recommendations.map((item, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-green-600">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-1">Next Best Action</h4>
                    <p className="text-sm text-blue-800">{insight.nextBestAction}</p>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
