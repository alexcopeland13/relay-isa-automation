
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { FormToastProvider } from "@/components/ui/form-toast";

// Pages
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Conversations from "./pages/Conversations";
import FollowUps from "./pages/FollowUps";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Agents from "./pages/Agents";
import AgentDetail from "./pages/AgentDetail";
import AgentCreate from "./pages/AgentCreate";
import AgentEdit from "./pages/AgentEdit";
import UpcomingCalls from "./pages/UpcomingCalls";
import PendingFollowups from "./pages/PendingFollowups";
import CompletedTasks from "./pages/CompletedTasks";
import ConversionOutcomes from "./pages/ConversionOutcomes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  useEffect(() => {
    // Check if onboarding has been completed
    const onboardingComplete = localStorage.getItem('onboardingComplete');
    if (!onboardingComplete) {
      // Show onboarding after a short delay to allow the app to render first
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <FormToastProvider>
          <BrowserRouter>
            {showOnboarding && <OnboardingFlow />}
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/leads" element={<Leads />} />
              <Route path="/agents" element={<Agents />} />
              <Route path="/agents/create" element={<AgentCreate />} />
              <Route path="/agents/edit/:id" element={<AgentEdit />} />
              <Route path="/agents/:id" element={<AgentDetail />} />
              <Route path="/conversations" element={<Conversations />} />
              <Route path="/follow-ups" element={<FollowUps />} />
              <Route path="/upcoming-calls" element={<UpcomingCalls />} />
              <Route path="/pending-followups" element={<PendingFollowups />} />
              <Route path="/completed-tasks" element={<CompletedTasks />} />
              <Route path="/conversion-outcomes" element={<ConversionOutcomes />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
              
              {/* Catch old or incorrect routes and redirect them */}
              <Route path="/agent/:id" element={<Navigate to="/agents/:id" replace />} />
              <Route path="/pending-follow-ups" element={<Navigate to="/pending-followups" replace />} />
              <Route path="/upcoming-call" element={<Navigate to="/upcoming-calls" replace />} />
              <Route path="/completed-task" element={<Navigate to="/completed-tasks" replace />} />
              <Route path="/conversion-outcome" element={<Navigate to="/conversion-outcomes" replace />} />
              
              {/* Catch-all for 404s */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </FormToastProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
