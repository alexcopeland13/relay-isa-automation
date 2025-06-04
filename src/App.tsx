
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import Navigation from '@/components/navigation/Navigation';
import Dashboard from '@/pages/Dashboard';
import Leads from '@/pages/Leads';
import Showings from '@/pages/Showings';
import Specialists from '@/pages/Specialists';
import AiChat from '@/pages/AiChat';
import AITestingPage from '@/pages/AITestingPage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/showings" element={<Showings />} />
            <Route path="/specialists" element={<Specialists />} />
            <Route path="/ai-chat" element={<AiChat />} />
            <Route path="/ai-testing" element={<AITestingPage />} />
          </Routes>
        </div>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
