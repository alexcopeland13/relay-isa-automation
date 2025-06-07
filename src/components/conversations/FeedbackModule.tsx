import { useState } from 'react';
import { AIPerformance } from '@/types/conversation';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { 
  Star, 
  Brain, 
  MessageSquare, 
  UserCheck, 
  Lightbulb, 
  SendHorizonal,
  CheckCircle
} from 'lucide-react';

interface FeedbackModuleProps {
  aiPerformance?: AIPerformance;
}

export const FeedbackModule = ({ aiPerformance }: FeedbackModuleProps) => {
  // Null guard
  if (!aiPerformance) {
    return (
      <div className="p-6 h-[600px] flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No AI performance data available</p>
        </div>
      </div>
    );
  }

  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [ratings, setRatings] = useState({
    overall: 0,
    informationGathering: Math.round(aiPerformance.informationGathering * 5),
    leadEngagement: Math.round(aiPerformance.leadEngagement * 5),
    qualificationAccuracy: Math.round(aiPerformance.qualificationAccuracy * 5),
    actionRecommendation: Math.round(aiPerformance.actionRecommendation * 5)
  });
  
  const handleRating = (category: keyof typeof ratings, value: number) => {
    setRatings(prev => ({ ...prev, [category]: value }));
  };
  
  const handleSubmit = () => {
    // Here would be the logic to submit feedback to backend
    console.log('Submitting feedback:', { ratings, feedback });
    setSubmitted(true);
  };
  
  const handleReset = () => {
    setSubmitted(false);
    setFeedback('');
    setRatings({
      overall: 0,
      informationGathering: Math.round(aiPerformance.informationGathering * 5),
      leadEngagement: Math.round(aiPerformance.leadEngagement * 5),
      qualificationAccuracy: Math.round(aiPerformance.qualificationAccuracy * 5),
      actionRecommendation: Math.round(aiPerformance.actionRecommendation * 5)
    });
  };
  
  return (
    <div className="p-6 h-[600px] overflow-y-auto">
      {submitted ? (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold mb-2">Feedback Submitted</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Thank you for providing feedback on the AI's performance. Your input helps us improve our system.
          </p>
          <Button onClick={handleReset}>
            Submit Another Feedback
          </Button>
        </div>
      ) : (
        <>
          <h2 className="font-semibold mb-6">AI Performance Feedback</h2>
          
          <div className="space-y-8">
            <div>
              <div className="flex items-center mb-2">
                <Star className="h-5 w-5 text-emmaccent mr-2" />
                <h3 className="font-medium">Overall AI Performance</h3>
              </div>
              <div className="flex items-center">
                <StarRating 
                  rating={ratings.overall} 
                  onRate={(value) => handleRating('overall', value)} 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center mb-2">
                  <Brain className="h-5 w-5 text-blue-500 mr-2" />
                  <h3 className="font-medium">Information Gathering</h3>
                </div>
                <div className="flex items-center">
                  <StarRating 
                    rating={ratings.informationGathering} 
                    onRate={(value) => handleRating('informationGathering', value)} 
                  />
                  <span className="ml-2 text-sm text-muted-foreground">
                    {Math.round(aiPerformance.informationGathering * 100)}%
                  </span>
                </div>
              </div>
              
              <div>
                <div className="flex items-center mb-2">
                  <MessageSquare className="h-5 w-5 text-purple-500 mr-2" />
                  <h3 className="font-medium">Lead Engagement</h3>
                </div>
                <div className="flex items-center">
                  <StarRating 
                    rating={ratings.leadEngagement} 
                    onRate={(value) => handleRating('leadEngagement', value)} 
                  />
                  <span className="ml-2 text-sm text-muted-foreground">
                    {Math.round(aiPerformance.leadEngagement * 100)}%
                  </span>
                </div>
              </div>
              
              <div>
                <div className="flex items-center mb-2">
                  <UserCheck className="h-5 w-5 text-green-500 mr-2" />
                  <h3 className="font-medium">Qualification Accuracy</h3>
                </div>
                <div className="flex items-center">
                  <StarRating 
                    rating={ratings.qualificationAccuracy} 
                    onRate={(value) => handleRating('qualificationAccuracy', value)} 
                  />
                  <span className="ml-2 text-sm text-muted-foreground">
                    {Math.round(aiPerformance.qualificationAccuracy * 100)}%
                  </span>
                </div>
              </div>
              
              <div>
                <div className="flex items-center mb-2">
                  <Lightbulb className="h-5 w-5 text-amber-500 mr-2" />
                  <h3 className="font-medium">Action Recommendations</h3>
                </div>
                <div className="flex items-center">
                  <StarRating 
                    rating={ratings.actionRecommendation} 
                    onRate={(value) => handleRating('actionRecommendation', value)} 
                  />
                  <span className="ml-2 text-sm text-muted-foreground">
                    {Math.round(aiPerformance.actionRecommendation * 100)}%
                  </span>
                </div>
              </div>
            </div>
            
            <div className="pt-4">
              <label htmlFor="feedback" className="font-medium block mb-2">
                Additional Feedback (Optional)
              </label>
              <Textarea
                id="feedback"
                placeholder="Please share any specific feedback about this AI conversation..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            
            <div className="flex justify-end">
              <Button onClick={handleSubmit}>
                <SendHorizonal className="mr-2 h-4 w-4" />
                Submit Feedback
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

interface StarRatingProps {
  rating: number;
  onRate: (rating: number) => void;
}

const StarRating = ({ rating, onRate }: StarRatingProps) => {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRate(star)}
          className="p-1 focus:outline-none"
        >
          <Star
            className={`h-5 w-5 ${
              star <= rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
};
