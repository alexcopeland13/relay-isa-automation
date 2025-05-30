
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ActiveCallsProvider } from "@/contexts/ActiveCallsContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Conversations from "./pages/Conversations";
import Leads from "./pages/Leads";
import Agents from "./pages/Agents";
import FollowUps from "./pages/FollowUps";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Diagnostics from "./pages/Diagnostics";
import Marketplace from "./pages/Marketplace";
import InboundCallCenter from "./pages/InboundCallCenter";
import TeamLeadControls from "./pages/TeamLeadControls";
import UpcomingCalls from "./pages/UpcomingCalls";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ActiveCallsProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/conversations" element={<Conversations />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/agents" element={<Agents />} />
            <Route path="/follow-ups" element={<FollowUps />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/diagnostics" element={<Diagnostics />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/inbound-call-center" element={<InboundCallCenter />} />
            <Route path="/team-lead-controls" element={<TeamLeadControls />} />
            <Route path="/upcoming-calls" element={<UpcomingCalls />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ActiveCallsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
