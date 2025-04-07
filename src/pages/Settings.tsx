
import { PageLayout } from '@/components/layout/PageLayout';

const Settings = () => {
  return (
    <PageLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure the AI system and application preferences.</p>
      </div>
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex justify-center items-center h-64 text-muted-foreground">
          <p>Settings configuration interface will be implemented in the next phase.</p>
        </div>
      </div>
    </PageLayout>
  );
};

export default Settings;
