
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  UserRound,
  MessageSquare,
  BarChart3,
  CalendarCheck,
  Settings,
  Users,
  FolderCheck,
  Phone,
  Shield,
  Bot,
  Users as UserCheck,
  Building,
  Calendar,
  Activity
} from 'lucide-react';

export function MainNavigation({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, current: false },
    { name: 'Leads', href: '/leads', icon: Users, current: false },
    { name: 'Conversations', href: '/conversations', icon: MessageSquare, current: false },
    { name: 'AI Chat', href: '/ai-chat', icon: Bot, current: false },
    { name: 'Follow-ups', href: '/follow-ups', icon: Calendar, current: false },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, current: false },
    { name: 'Agents', href: '/agents', icon: UserCheck, current: false },
    { name: 'Showings', href: '/showings', icon: Building, current: false },
    { name: 'Call Center', href: '/inbound-call-center', icon: Phone, current: false },
    { name: 'Settings', href: '/settings', icon: Settings, current: false },
    { name: 'Diagnostics', href: '/diagnostics', icon: Activity, current: false },
  ];

  return (
    <nav
      className={cn("flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1", className)}
      {...props}
    >
      {navigation.map((item) => {
        const IconComponent = item.icon;
        return (
          <NavLink 
            key={item.href} 
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground",
                isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
              )
            }
          >
            <IconComponent className="mr-2 h-4 w-4" />
            <span>{item.name}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
