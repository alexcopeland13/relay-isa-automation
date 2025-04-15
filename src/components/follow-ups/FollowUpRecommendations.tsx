
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Mail, MessageSquare, Phone, Video, CalendarDays, Check, XCircle, FileText, CalendarPlus } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { FollowUpRecommendation } from '@/hooks/use-followup-recommendations';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface FollowUpRecommendationsProps {
  recommendations: FollowUpRecommendation[];
  isLoading: boolean;
  onCreateFollowUp: (recommendation: FollowUpRecommendation, templateId?: string) => Promise<{ success: boolean }>;
  onDismiss: (recommendationId: string) => Promise<boolean>;
}

export function FollowUpRecommendations({
  recommendations,
  isLoading,
  onCreateFollowUp,
  onDismiss
}: FollowUpRecommendationsProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedRecommendation, setSelectedRecommendation] = useState<FollowUpRecommendation | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>();
  const { toast } = useToast();

  const handleCreateFollowUp = async (recommendation: FollowUpRecommendation, templateId?: string) => {
    setIsProcessing(true);
    
    try {
      const result = await onCreateFollowUp(recommendation, templateId);
      if (result.success) {
        toast({
          title: 'Follow-up created',
          description: 'The follow-up has been scheduled successfully.',
        });
        onDismiss(recommendation.id);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to create follow-up. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
      setSelectedRecommendation(null);
    }
  };

  const handleDismiss = async (recommendationId: string) => {
    const success = await onDismiss(recommendationId);
    if (success) {
      toast({
        title: 'Recommendation dismissed',
        description: 'The follow-up recommendation has been removed.',
      });
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <Mail className="h-4 w-4 text-blue-500" />;
      case 'sms':
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      case 'phone':
        return <Phone className="h-4 w-4 text-green-500" />;
      case 'meeting':
        return <Video className="h-4 w-4 text-orange-500" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High Priority</Badge>;
      case 'medium':
        return <Badge variant="default">Medium Priority</Badge>;
      case 'low':
        return <Badge variant="outline">Low Priority</Badge>;
      default:
        return null;
    }
  };

  const filteredRecommendations = recommendations.filter(rec => {
    if (activeTab === 'all') return true;
    return rec.priority === activeTab;
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Follow-up Recommendations</CardTitle>
          <CardDescription>Loading recommendations...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="p-4">
                  <div className="h-5 bg-muted rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="h-4 bg-muted rounded w-full mb-3"></div>
                  <div className="h-4 bg-muted rounded w-4/5"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <CalendarPlus className="h-5 w-5 text-primary" />
          Follow-up Recommendations
        </CardTitle>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="high">High Priority</TabsTrigger>
            <TabsTrigger value="medium">Medium Priority</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {filteredRecommendations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
            <h3 className="font-medium text-foreground mb-1">No recommendations</h3>
            <p className="text-sm">
              {activeTab === 'all'
                ? 'There are no follow-up recommendations at this time.'
                : `There are no ${activeTab} priority recommendations.`}
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[450px] pr-4">
            <div className="space-y-4">
              {filteredRecommendations.map((recommendation) => (
                <Card key={recommendation.id} className="border-l-4 border-l-primary">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-base flex items-center gap-2">
                          {getChannelIcon(recommendation.channel)}
                          <span className="capitalize">{recommendation.channel} Follow-up</span>
                        </CardTitle>
                        <CardDescription>
                          {recommendation.suggestedTiming.description}
                        </CardDescription>
                      </div>
                      {getPriorityBadge(recommendation.priority)}
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <p className="text-sm mb-3">{recommendation.reason}</p>
                    
                    {recommendation.context && (
                      <div className="bg-muted p-3 rounded-md text-sm">
                        <div className="grid grid-cols-2 gap-2">
                          {recommendation.context.lastInteraction && (
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span className="text-muted-foreground">Last interaction:</span>
                              <span className="ml-1 font-medium">
                                {recommendation.context.lastInteraction}
                              </span>
                            </div>
                          )}
                          {recommendation.context.lastInteractionDate && (
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span className="text-muted-foreground">When:</span>
                              <span className="ml-1 font-medium">
                                {differenceInDays(new Date(), new Date(recommendation.context.lastInteractionDate)) === 0
                                  ? 'Today'
                                  : `${differenceInDays(new Date(), new Date(recommendation.context.lastInteractionDate))} days ago`}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDismiss(recommendation.id)}
                      disabled={isProcessing}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Dismiss
                    </Button>
                    <div className="space-x-2">
                      {recommendation.recommendedTemplates.length > 0 ? (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedRecommendation(recommendation)}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              View Templates
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Recommended Templates</DialogTitle>
                              <DialogDescription>
                                Choose a template for your follow-up
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 my-4">
                              {recommendation.recommendedTemplates.map((template) => (
                                <Card key={template.id} className="overflow-hidden">
                                  <CardHeader className="pb-2">
                                    <CardTitle className="text-base">{template.title}</CardTitle>
                                    <CardDescription>{template.description}</CardDescription>
                                  </CardHeader>
                                  <CardContent className="pb-2">
                                    <div className="bg-muted p-3 rounded-md text-sm max-h-32 overflow-y-auto">
                                      {template.content}
                                    </div>
                                  </CardContent>
                                  <CardFooter className="flex justify-between">
                                    <div className="flex gap-1">
                                      {template.tags?.map((tag) => (
                                        <Badge key={tag} variant="outline" className="text-xs">
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                    <Button
                                      size="sm"
                                      onClick={() => handleCreateFollowUp(recommendation, template.id)}
                                    >
                                      <Check className="h-4 w-4 mr-2" />
                                      Use Template
                                    </Button>
                                  </CardFooter>
                                </Card>
                              ))}
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setSelectedRecommendation(null)}>
                                Cancel
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      ) : null}
                      <Button
                        size="sm"
                        onClick={() => handleCreateFollowUp(recommendation)}
                      >
                        <CalendarPlus className="h-4 w-4 mr-2" />
                        Schedule
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
