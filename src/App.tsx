
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Leads from "./pages/Leads";
import Agents from "./pages/Agents";
import Settings from "./pages/Settings";
import Analytics from "./pages/Analytics";
import Conversations from "./pages/Conversations";
import FollowUps from "./pages/FollowUps";
import Marketplace from "./pages/Marketplace";
import InboundCallCenter from "./pages/InboundCallCenter";
import Diagnostics from "./pages/Diagnostics";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="flex h-screen bg-gray-50">
          <Sidebar />
          <main className="flex-1 overflow-hidden">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/leads" element={<Leads />} />
              <Route path="/agents" element={<Agents />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/conversations" element={<Conversations />} />
              <Route path="/follow-ups" element={<FollowUps />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/inbound-call-center" element={<InboundCallCenter />} />
              <Route path="/diagnostics" element={<Diagnostics />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
