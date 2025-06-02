
import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { AiInsightsDashboard } from '@/components/ai-integration/AiInsightsDashboard';

export default function AiInsights() {
  return (
    <PageLayout>
      <div className="p-6">
        <AiInsightsDashboard />
      </div>
    </PageLayout>
  );
}
