
import { PageLayout } from '@/components/layout/PageLayout';
import { DiagnosticPanel } from '@/components/diagnostic/DiagnosticPanel';

function Diagnostics() {
  return (
    <PageLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">System Diagnostics</h1>
        <p className="text-muted-foreground mt-1">
          Troubleshoot data flow between VAPI, Supabase, and the frontend
        </p>
      </div>
      
      <DiagnosticPanel />
    </PageLayout>
  );
}

export default Diagnostics;
