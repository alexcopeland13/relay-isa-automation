
import { Routes, Route, Navigate } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import Leads from '@/pages/Leads';
import Agents from '@/pages/Agents';
import AgentDetail from '@/pages/AgentDetail';
import AgentCreate from '@/pages/AgentCreate';
import AgentEdit from '@/pages/AgentEdit';
import Analytics from '@/pages/Analytics';
import Conversations from '@/pages/Conversations';
import FollowUps from '@/pages/FollowUps';
import Settings from '@/pages/Settings';
import UpcomingCalls from '@/pages/UpcomingCalls';
import CompletedTasks from '@/pages/CompletedTasks';
import PendingFollowups from '@/pages/PendingFollowups';
import ConversionOutcomes from '@/pages/ConversionOutcomes';
import NotFound from '@/pages/NotFound';
import Index from '@/pages/Index';
import TeamLeadControls from '@/pages/TeamLeadControls';
import { Toaster } from '@/components/ui/toaster';
import './App.css';
import Diagnostics from '@/pages/Diagnostics';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/leads" element={<Leads />} />
        <Route path="/agents" element={<Agents />} />
        <Route path="/agents/create" element={<AgentCreate />} />
        <Route path="/agents/:id" element={<AgentDetail />} />
        <Route path="/agents/:id/edit" element={<AgentEdit />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/conversations" element={<Conversations />} />
        <Route path="/follow-ups" element={<FollowUps />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/upcoming-calls" element={<UpcomingCalls />} />
        <Route path="/completed-tasks" element={<CompletedTasks />} />
        <Route path="/pending-followups" element={<PendingFollowups />} />
        <Route path="/conversion-outcomes" element={<ConversionOutcomes />} />
        <Route path="/team-lead-controls" element={<TeamLeadControls />} />
        <Route path="/diagnostics" element={<Diagnostics />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
