
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  Calendar, 
  Settings, 
  BarChart3, 
  Home,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

type NavItemProps = {
  icon: React.ElementType;
  label: string;
  path: string;
  isCollapsed: boolean;
};

const NavItem = ({ icon: Icon, label, path, isCollapsed }: NavItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === path;

  return (
    <Link 
      to={path} 
      className={cn(
        "nav-link", 
        isActive && "active"
      )}
      title={isCollapsed ? label : undefined}
    >
      <Icon size={20} />
      {!isCollapsed && <span>{label}</span>}
    </Link>
  );
};

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Users, label: 'Leads', path: '/leads' },
    { icon: MessageSquare, label: 'Conversations', path: '/conversations' },
    { icon: Calendar, label: 'Follow-ups', path: '/follow-ups' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div 
      className={cn(
        "flex flex-col bg-sidebar h-screen bg-emmblue transition-all duration-300",
        isCollapsed ? "w-[70px]" : "w-[250px]"
      )}
    >
      <div className="flex items-center p-4 border-b border-sidebar-border">
        {!isCollapsed ? (
          <div className="flex items-center gap-2 text-white">
            <Home size={24} className="text-emmaccent" />
            <span className="font-bold text-lg">NexusISA</span>
          </div>
        ) : (
          <Home size={24} className="mx-auto text-emmaccent" />
        )}
      </div>
      
      <nav className="flex-1 py-6 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem 
            key={item.path}
            icon={item.icon}
            label={item.label}
            path={item.path}
            isCollapsed={isCollapsed}
          />
        ))}
      </nav>
      
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="p-2 mx-auto mb-4 rounded-full bg-sidebar-accent hover:bg-sidebar-accent/80 text-white transition-colors"
      >
        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>
    </div>
  );
};
