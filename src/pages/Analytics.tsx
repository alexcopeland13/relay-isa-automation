
import { PageLayout } from '@/components/layout/PageLayout';

const Analytics = () => {
  return (
    <PageLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-1">Track performance metrics and AI insights.</p>
      </div>
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex justify-center items-center h-64 text-muted-foreground">
          <p>Analytics dashboard will be implemented in the next phase.</p>
        </div>
      </div>
    </PageLayout>
  );
};

export default Analytics;
