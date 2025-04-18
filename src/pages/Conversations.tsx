
import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { ConversationInterface } from '@/components/conversations/ConversationInterface';
import { ConversationList } from '@/components/conversations/ConversationList';
import { Button } from '@/components/ui/button';
import { MessageSquare, List, Filter, Phone, BellRing, Clock } from 'lucide-react';
import { sampleConversation } from '@/data/sampleConversation';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { CallSchedulerModal } from '@/components/conversations/CallSchedulerModal';
import { HandoffProtocol } from '@/components/conversations/HandoffProtocol';
import { ConversationContextBar } from '@/components/conversations/ConversationContextBar';
import { ActiveCallInterface } from '@/components/conversations/ActiveCallInterface';

const Conversations = () => {
  const [activeView, setActiveView] = useState<'list' | 'detail'>('list');
  const [selectedConversation, setSelectedConversation] = useState(sampleConversation);
  const [activeTasks] = useState([
    { id: '1', title: 'Follow up with Michael Brown', due: '2h' },
    { id: '2', title: 'Review qualification data for Sarah Martinez', due: '4h' }
  ]);
  const [isHandoffDialogOpen, setIsHandoffDialogOpen] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);

  const handleSelectConversation = () => {
    setSelectedConversation(sampleConversation);
    setActiveView('detail');
  };

  const handleBackToList = () => {
    setActiveView('list');
  };
  
  const handleStartCall = () => {
    setIsCallActive(true);
  };
  
  const handleEndCall = () => {
    setIsCallActive(false);
  };

  return (
    <PageLayout>
      {/* Persistent Context Bar */}
      <ConversationContextBar activeTasks={activeTasks} />
      
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
            <>
              <Button variant="outline" onClick={handleBackToList}>
                <List className="mr-2 h-4 w-4" />
                Back to List
              </Button>
              <Dialog open={isHandoffDialogOpen} onOpenChange={setIsHandoffDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Phone className="mr-2 h-4 w-4" />
                    Agent Handoff
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl h-[80vh] p-0 overflow-hidden">
                  <HandoffProtocol conversation={selectedConversation} />
                </DialogContent>
              </Dialog>
            </>
          )}
          {activeView === 'list' && (
            <>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Phone className="mr-2 h-4 w-4" />
                    Schedule Call
                  </Button>
                </DialogTrigger>
                <CallSchedulerModal />
              </Dialog>
              
              <Button onClick={handleStartCall}>
                <Phone className="mr-2 h-4 w-4" />
                Start Live Call
              </Button>
            </>
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
      
      {isCallActive && (
        <ActiveCallInterface 
          leadInfo={selectedConversation.leadInfo} 
          onClose={handleEndCall} 
        />
      )}
    </PageLayout>
  );
};

export default Conversations;
