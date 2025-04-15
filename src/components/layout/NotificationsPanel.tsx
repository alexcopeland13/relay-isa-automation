
import { useState } from 'react';
import { format } from 'date-fns';
import { Check, Bell, Clock, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

// Mock notifications data - in a real implementation, this would come from an API
const initialNotifications = [
  {
    id: '1',
    title: 'New lead assigned',
    message: 'Michael Brown has been assigned to you',
    time: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    read: false,
    link: '/leads'
  },
  {
    id: '2',
    title: 'Upcoming call reminder',
    message: 'Call with Jennifer Martinez in 15 minutes',
    time: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    read: false,
    link: '/upcoming-calls'
  },
  {
    id: '3',
    title: 'Follow-up due',
    message: 'Follow-up with Robert Davis is due today',
    time: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    read: false,
    link: '/pending-followups'
  },
  {
    id: '4',
    title: 'Lead status update',
    message: 'Amanda Johnson has moved to "Interested" stage',
    time: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
    link: '/leads'
  },
  {
    id: '5',
    title: 'Conversation summary',
    message: 'AI has generated a summary for your conversation with Thomas Wilson',
    time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    read: true,
    link: '/conversations'
  }
];

interface NotificationItemProps {
  notification: {
    id: string;
    title: string;
    message: string;
    time: Date;
    read: boolean;
    link: string;
  };
  onMarkAsRead: (id: string) => void;
}

const NotificationItem = ({ notification, onMarkAsRead }: NotificationItemProps) => {
  return (
    <div className={cn(
      "flex flex-col gap-1 p-3 transition-colors hover:bg-muted/50 rounded-md",
      !notification.read && "bg-primary/5"
    )}>
      <div className="flex items-start justify-between">
        <div className="font-medium">{notification.title}</div>
        <div className="flex gap-2">
          <div className="text-xs text-muted-foreground flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            {format(notification.time, 'h:mm a')}
          </div>
          {!notification.read && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0"
              onClick={() => onMarkAsRead(notification.id)}
            >
              <Check className="h-3 w-3" />
              <span className="sr-only">Mark as read</span>
            </Button>
          )}
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{notification.message}</p>
      <div className="mt-1">
        <a 
          href={notification.link} 
          className="text-xs text-primary hover:underline"
        >
          View details
        </a>
      </div>
    </div>
  );
};

export const NotificationsPanel = () => {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [open, setOpen] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
    toast.success('Notification marked as read');
  };
  
  const handleMarkAllAsRead = () => {
    if (unreadCount === 0) return;
    
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    toast.success('All notifications marked as read');
  };
  
  const handleClearAll = () => {
    setNotifications([]);
    toast.success('All notifications cleared');
    setOpen(false);
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="p-2 rounded-full hover:bg-secondary transition-colors relative" aria-label="Notifications">
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 bg-emmaccent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-4 pb-2">
          <h3 className="font-medium">Notifications</h3>
          <div className="flex gap-1">
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-xs"
                onClick={handleMarkAllAsRead}
              >
                Mark all as read
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-xs"
              onClick={handleClearAll}
            >
              Clear all
            </Button>
          </div>
        </div>
        <Separator />
        {notifications.length > 0 ? (
          <ScrollArea className="h-[300px]">
            <div className="space-y-1 p-2">
              {notifications.map(notification => (
                <NotificationItem 
                  key={notification.id} 
                  notification={notification} 
                  onMarkAsRead={handleMarkAsRead}
                />
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="rounded-full bg-muted p-3 mb-3">
              <Bell className="h-6 w-6 text-muted-foreground" />
            </div>
            <h4 className="font-medium mb-1">No notifications</h4>
            <p className="text-sm text-muted-foreground">
              When you have notifications, they'll appear here.
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
