
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

function Index() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="container mx-auto flex-1 flex flex-col items-center justify-center py-10">
        <div className="text-center space-y-6 max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight">Relay CRM</h1>
          <p className="text-muted-foreground text-lg">
            An AI-powered real estate CRM for managing leads and agents
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <Button asChild size="lg">
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/diagnostics">System Diagnostics</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Index;
