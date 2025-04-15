
import { Bell, Clock, AlertCircle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  title: string;
  due: string;
}

interface ConversationContextBarProps {
  activeTasks: Task[];
}

export function ConversationContextBar({ activeTasks }: ConversationContextBarProps) {
  return (
    <div className="bg-accent/20 border-b p-2 mb-4 flex items-center justify-between text-sm">
      <div className="flex items-center">
        <div className="flex items-center mr-6">
          <AlertCircle className="h-4 w-4 text-orange-500 mr-2" />
          <span>Active Workflows:</span>
          <span className="ml-2 font-medium">Lead Qualification (2), Agent Matching (1)</span>
        </div>
        
        <div className="flex items-center">
          <Clock className="h-4 w-4 text-blue-500 mr-2" />
          <span>Priority Tasks:</span>
          {activeTasks.length > 0 ? (
            <div className="flex items-center gap-4 ml-2">
              {activeTasks.map((task) => (
                <div key={task.id} className="flex items-center">
                  <span className="font-medium">{task.title}</span>
                  <span className="ml-1 text-xs px-1.5 py-0.5 bg-secondary rounded-full">
                    {task.due}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <span className="ml-2 text-muted-foreground">No priority tasks</span>
          )}
        </div>
      </div>
      
      <div className="flex items-center">
        <button className="flex items-center text-primary hover:underline mr-4">
          <span>View All Tasks</span>
          <ChevronRight className="h-4 w-4 ml-1" />
        </button>
        
        <div className="relative">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            3
          </span>
        </div>
      </div>
    </div>
  );
}
