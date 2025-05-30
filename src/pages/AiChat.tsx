
import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { AiChatInterface } from '@/components/ai-integration/AiChatInterface';

export default function AiChat() {
  return (
    <PageLayout>
      <div className="p-6">
        <AiChatInterface />
      </div>
    </PageLayout>
  );
}
