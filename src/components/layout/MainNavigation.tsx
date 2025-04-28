
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
  Shield
} from 'lucide-react';

export function MainNavigation({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const navItems = [
    {
      href: "/dashboard",
      title: "Dashboard",
      icon: <LayoutDashboard className="mr-2 h-4 w-4" />
    },
    {
      href: "/leads",
      title: "Leads",
      icon: <UserRound className="mr-2 h-4 w-4" />
    },
    {
      href: "/conversations",
      title: "Conversations",
      icon: <MessageSquare className="mr-2 h-4 w-4" />
    },
    {
      href: "/agents",
      title: "Agents",
      icon: <Users className="mr-2 h-4 w-4" />
    },
    {
      href: "/follow-ups",
      title: "Follow-Ups",
      icon: <CalendarCheck className="mr-2 h-4 w-4" />
    },
    {
      href: "/analytics",
      title: "Analytics",
      icon: <BarChart3 className="mr-2 h-4 w-4" />
    },
    {
      href: "/team-lead-controls",
      title: "Team Lead Controls",
      icon: <Shield className="mr-2 h-4 w-4" />
    },
    {
      href: "/upcoming-calls",
      title: "Upcoming Calls",
      icon: <Phone className="mr-2 h-4 w-4" />
    },
    {
      href: "/completed-tasks",
      title: "Completed Tasks",
      icon: <FolderCheck className="mr-2 h-4 w-4" />
    },
    {
      href: "/settings",
      title: "Settings",
      icon: <Settings className="mr-2 h-4 w-4" />
    }
  ];

  return (
    <nav
      className={cn("flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1", className)}
      {...props}
    >
      {navItems.map((item) => (
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
          {item.icon} <span>{item.title}</span>
        </NavLink>
      ))}
    </nav>
  );
}
