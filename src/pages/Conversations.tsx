
import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { ConversationInterface } from '@/components/conversations/ConversationInterface';
import { ConversationList } from '@/components/conversations/ConversationList';
import { Button } from '@/components/ui/button';
import { MessageSquare, List, Filter } from 'lucide-react';
import { sampleConversation } from '@/data/sampleConversation';
import { cn } from '@/lib/utils';

const Conversations = () => {
  const [activeView, setActiveView] = useState<'list' | 'detail'>('list');
  const [selectedConversation, setSelectedConversation] = useState(sampleConversation);

  const handleSelectConversation = () => {
    setSelectedConversation(sampleConversation);
    setActiveView('detail');
  };

  const handleBackToList = () => {
    setActiveView('list');
  };

  return (
    <PageLayout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">AI Conversations</h1>
          <p className="text-muted-foreground mt-1">
            {activeView === 'list' 
              ? 'Review and analyze AI-handled conversations with leads.' 
              : 'Analyzing conversation with ' + selectedConversation.leadInfo.name}
          </p>
        </div>
        <div className="flex gap-2">
          {activeView === 'detail' && (
            <Button variant="outline" onClick={handleBackToList}>
              <List className="mr-2 h-4 w-4" />
              Back to List
            </Button>
          )}
          {activeView === 'list' && (
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          )}
        </div>
      </div>
      
      <div className={cn(
        "transition-all duration-300",
        activeView === 'list' ? 'opacity-100' : 'opacity-0 hidden'
      )}>
        <ConversationList onSelectConversation={handleSelectConversation} />
      </div>
      
      <div className={cn(
        "transition-all duration-300",
        activeView === 'detail' ? 'opacity-100' : 'opacity-0 hidden'
      )}>
        {selectedConversation && (
          <ConversationInterface conversation={selectedConversation} />
        )}
      </div>
    </PageLayout>
  );
};

export default Conversations;
