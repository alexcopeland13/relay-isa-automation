
import { Routes, Route, Navigate } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';
import { useState, useEffect } from 'react';
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
import LandingPage from '@/pages/LandingPage';
import Auth from '@/pages/Auth';
import { Toaster } from '@/components/ui/toaster';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import './App.css';
import Diagnostics from '@/pages/Diagnostics';

// Protected route wrapper component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true); // Set initial loading to true

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Show loading state while checking authentication
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // If user is not authenticated, redirect to auth page
  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  // If authenticated, render the protected content
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/diagnostics" element={<Diagnostics />} />
        
        {/* Protected routes - now require authentication */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/leads" element={<ProtectedRoute><Leads /></ProtectedRoute>} />
        <Route path="/agents" element={<ProtectedRoute><Agents /></ProtectedRoute>} />
        <Route path="/agents/create" element={<ProtectedRoute><AgentCreate /></ProtectedRoute>} />
        <Route path="/agents/:id" element={<ProtectedRoute><AgentDetail /></ProtectedRoute>} />
        <Route path="/agents/:id/edit" element={<ProtectedRoute><AgentEdit /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/conversations" element={<ProtectedRoute><Conversations /></ProtectedRoute>} />
        <Route path="/follow-ups" element={<ProtectedRoute><FollowUps /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/upcoming-calls" element={<ProtectedRoute><UpcomingCalls /></ProtectedRoute>} />
        <Route path="/completed-tasks" element={<ProtectedRoute><CompletedTasks /></ProtectedRoute>} />
        <Route path="/pending-followups" element={<ProtectedRoute><PendingFollowups /></ProtectedRoute>} />
        <Route path="/conversion-outcomes" element={<ProtectedRoute><ConversionOutcomes /></ProtectedRoute>} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
