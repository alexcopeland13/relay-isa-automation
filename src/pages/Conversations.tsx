
import { PageLayout } from '@/components/layout/PageLayout';

const Conversations = () => {
  return (
    <PageLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">AI Conversations</h1>
        <p className="text-muted-foreground mt-1">View and analyze AI-handled conversations with leads.</p>
      </div>
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex justify-center items-center h-64 text-muted-foreground">
          <p>Conversation viewer interface will be implemented in the next phase.</p>
        </div>
      </div>
    </PageLayout>
  );
};

export default Conversations;
