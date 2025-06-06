import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import LandingPage from '@/pages/LandingPage';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import Leads from '@/pages/Leads';
import Showings from '@/pages/Showings';
import Specialists from '@/pages/Specialists';
import AiChat from '@/pages/AiChat';
import AITestingPage from '@/pages/AITestingPage';
import Conversations from '@/pages/Conversations';
import FollowUps from '@/pages/FollowUps';
import Marketplace from '@/pages/Marketplace';
import Analytics from '@/pages/Analytics';
import Settings from '@/pages/Settings';
import Agents from '@/pages/Agents';
import InboundCallCenter from '@/pages/InboundCallCenter';
import Diagnostics from '@/pages/Diagnostics';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/showings" element={<Showings />} />
            <Route path="/specialists" element={<Specialists />} />
            <Route path="/ai-chat" element={<AiChat />} />
            <Route path="/ai-testing" element={<AITestingPage />} />
            <Route path="/conversations" element={<Conversations />} />
            <Route path="/follow-ups" element={<FollowUps />} />
            <Route path="/marketplace" element={<Navigate to="/showings" replace />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/agents" element={<Agents />} />
            <Route path="/inbound-call-center" element={<InboundCallCenter />} />
            <Route path="/diagnostics" element={<Diagnostics />} />
          </Routes>
        </div>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
