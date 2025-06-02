
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ActiveCallsProvider } from "./contexts/ActiveCallsContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Conversations from "./pages/Conversations";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import AiChat from "./pages/AiChat";
import AiInsights from "./pages/AiInsights";
import Agents from "./pages/Agents";
import AgentDetail from "./pages/AgentDetail";
import AgentCreate from "./pages/AgentCreate";
import AgentEdit from "./pages/AgentEdit";
import Marketplace from "./pages/Marketplace";
import Showings from "./pages/Showings";
import FollowUps from "./pages/FollowUps";
import PendingFollowups from "./pages/PendingFollowups";
import CompletedTasks from "./pages/CompletedTasks";
import UpcomingCalls from "./pages/UpcomingCalls";
import InboundCallCenter from "./pages/InboundCallCenter";
import ConversionOutcomes from "./pages/ConversionOutcomes";
import TeamLeadControls from "./pages/TeamLeadControls";
import LoDashboard from "./pages/LoDashboard";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Diagnostics from "./pages/Diagnostics";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ActiveCallsProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/leads" element={<Leads />} />
              <Route path="/conversations" element={<Conversations />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/ai-chat" element={<AiChat />} />
              <Route path="/ai-insights" element={<AiInsights />} />
              <Route path="/agents" element={<Agents />} />
              <Route path="/agents/:id" element={<AgentDetail />} />
              <Route path="/agents/create" element={<AgentCreate />} />
              <Route path="/agents/:id/edit" element={<AgentEdit />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/showings" element={<Showings />} />
              <Route path="/follow-ups" element={<FollowUps />} />
              <Route path="/pending-followups" element={<PendingFollowups />} />
              <Route path="/completed-tasks" element={<CompletedTasks />} />
              <Route path="/upcoming-calls" element={<UpcomingCalls />} />
              <Route path="/inbound-call-center" element={<InboundCallCenter />} />
              <Route path="/conversion-outcomes" element={<ConversionOutcomes />} />
              <Route path="/team-lead-controls" element={<TeamLeadControls />} />
              <Route path="/lo-dashboard" element={<LoDashboard />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/diagnostics" element={<Diagnostics />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ActiveCallsProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
