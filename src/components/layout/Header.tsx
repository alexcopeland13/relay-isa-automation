
import { useState } from 'react';
import { 
  Search, 
  User,
  ChevronDown,
  MessageSquare,
  Calendar,
  LogOut
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { NotificationsPanel } from './NotificationsPanel';

export const Header = () => {
  return (
    <header className="bg-white border-b border-border h-16 flex items-center justify-between px-6">
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <Input 
            placeholder="Search leads, conversations, tasks..." 
            className="pl-10 bg-secondary/50 border-secondary-foreground/10"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <NotificationsPanel />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 hover:bg-secondary p-2 rounded-md transition-colors">
              <div className="w-8 h-8 rounded-full bg-emmblue text-white flex items-center justify-center">
                <User size={16} />
              </div>
              <span>John Smith</span>
              <ChevronDown size={16} className="text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2" size={16} />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <MessageSquare className="mr-2" size={16} />
              <span>Messages</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Calendar className="mr-2" size={16} />
              <span>Calendar</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="mr-2" size={16} />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
