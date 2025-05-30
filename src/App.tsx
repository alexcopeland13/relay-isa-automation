
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Conversations from "./pages/Conversations";
import Leads from "./pages/Leads";
import Settings from "./pages/Settings";
import Analytics from "./pages/Analytics";
import FollowUps from "./pages/FollowUps";
import Agents from "./pages/Agents";
import AgentDetail from "./pages/AgentDetail";
import AgentCreate from "./pages/AgentCreate";
import AgentEdit from "./pages/AgentEdit";
import UpcomingCalls from "./pages/UpcomingCalls";
import PendingFollowups from "./pages/PendingFollowups";
import CompletedTasks from "./pages/CompletedTasks";
import ConversionOutcomes from "./pages/ConversionOutcomes";
import TeamLeadControls from "./pages/TeamLeadControls";
import LoDashboard from "./pages/LoDashboard";
import Marketplace from "./pages/Marketplace";
import Showings from "./pages/Showings";
import InboundCallCenter from "./pages/InboundCallCenter";
import Diagnostics from "./pages/Diagnostics";
import AiChat from "./pages/AiChat";
import Auth from "./pages/Auth";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/conversations" element={<Conversations />} />
              <Route path="/leads" element={<Leads />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/follow-ups" element={<FollowUps />} />
              <Route path="/agents" element={<Agents />} />
              <Route path="/agents/:id" element={<AgentDetail />} />
              <Route path="/agents/create" element={<AgentCreate />} />
              <Route path="/agents/:id/edit" element={<AgentEdit />} />
              <Route path="/upcoming-calls" element={<UpcomingCalls />} />
              <Route path="/pending-followups" element={<PendingFollowups />} />
              <Route path="/completed-tasks" element={<CompletedTasks />} />
              <Route path="/conversion-outcomes" element={<ConversionOutcomes />} />
              <Route path="/team-lead-controls" element={<TeamLeadControls />} />
              <Route path="/lo-dashboard" element={<LoDashboard />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/showings" element={<Showings />} />
              <Route path="/inbound-call-center" element={<InboundCallCenter />} />
              <Route path="/diagnostics" element={<Diagnostics />} />
              <Route path="/ai-chat" element={<AiChat />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
