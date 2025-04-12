
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  X, 
  MessageSquare, 
  UserCheck, 
  CalendarCheck, 
  BrainCircuit,
  Settings,
  Skip
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  image?: string;
}

export const OnboardingFlow = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const steps: OnboardingStep[] = [
    {
      title: 'Welcome to Relay',
      description: 'Your AI-powered Inside Sales Assistant platform designed to streamline lead management and follow-ups.',
      icon: <BrainCircuit size={40} className="text-emmblue" />
    },
    {
      title: 'Lead Management',
      description: 'Capture, organize, and track leads through your sales pipeline. Easily visualize progress and identify opportunities.',
      icon: <UserCheck size={40} className="text-emmblue" />
    },
    {
      title: 'AI Conversations',
      description: 'Review and analyze AI-driven conversations with potential clients. Gain insights from interaction patterns.',
      icon: <MessageSquare size={40} className="text-emmblue" />
    },
    {
      title: 'Smart Follow-ups',
      description: 'Never miss an opportunity with AI-suggested follow-ups. Schedule and manage all your touchpoints in one place.',
      icon: <CalendarCheck size={40} className="text-emmblue" />
    },
    {
      title: 'Configure Your AI',
      description: 'Customize how your AI assistant communicates with leads. Set preferences and rules to match your sales style.',
      icon: <Settings size={40} className="text-emmblue" />
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = () => {
    // Save that onboarding is complete
    localStorage.setItem('onboardingComplete', 'true');
    setShowOnboarding(false);
    
    toast({
      title: "Onboarding Complete",
      description: "You're all set to start using Relay!",
    });
    
    navigate('/');
  };

  const handleSkip = () => {
    toast({
      title: "Onboarding Skipped",
      description: "You can always revisit the guide from Settings.",
    });
    completeOnboarding();
  };

  if (!showOnboarding) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-4 top-4 z-10"
              onClick={handleSkip}
            >
              <X size={18} />
            </Button>
            
            <CardContent className="p-0">
              <div className="bg-emmblue p-6 text-white">
                <div className="flex items-center gap-4 mb-4">
                  {steps[currentStep].icon}
                  <h2 className="text-xl font-bold">{steps[currentStep].title}</h2>
                </div>
                <p className="text-white/90">{steps[currentStep].description}</p>
              </div>
              
              {steps[currentStep].image && (
                <div className="p-6 border-b">
                  <img 
                    src={steps[currentStep].image} 
                    alt={steps[currentStep].title} 
                    className="w-full rounded-md shadow-md" 
                  />
                </div>
              )}
              
              <div className="p-6 flex justify-between items-center">
                <div className="flex gap-1">
                  {steps.map((_, index) => (
                    <span 
                      key={index} 
                      className={`block w-2 h-2 rounded-full ${
                        index === currentStep 
                          ? 'bg-emmblue' 
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                
                <div className="flex gap-2">
                  {currentStep > 0 && (
                    <Button variant="outline" onClick={handlePrevious}>
                      Back
                    </Button>
                  )}
                  
                  <Button onClick={handleNext} className="gap-1 bg-emmblue hover:bg-emmblue/90">
                    {currentStep < steps.length - 1 ? (
                      <>
                        Next
                        <ArrowRight size={16} />
                      </>
                    ) : (
                      'Get Started'
                    )}
                  </Button>
                  
                  {currentStep < steps.length - 1 && (
                    <Button variant="ghost" onClick={handleSkip} className="gap-1">
                      Skip
                      <Skip size={16} />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </motion.div>
        </AnimatePresence>
      </Card>
    </div>
  );
};
