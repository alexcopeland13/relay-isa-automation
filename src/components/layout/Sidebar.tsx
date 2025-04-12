
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
  ChevronRight,
  HelpCircle,
  UserSearch
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';

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
  const [showOnboarding, setShowOnboarding] = useState(false);

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Users, label: 'Leads', path: '/leads' },
    { icon: UserSearch, label: 'Agents', path: '/agents' },
    { icon: MessageSquare, label: 'Conversations', path: '/conversations' },
    { icon: Calendar, label: 'Follow-ups', path: '/follow-ups' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const handleHelpClick = () => {
    setShowOnboarding(true);
  };

  return (
    <>
      {showOnboarding && <OnboardingFlow />}
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
              <span className="font-bold text-lg">Relay</span>
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
        
        <div className="p-2 mb-2">
          <Button 
            variant="ghost" 
            className={cn(
              "w-full text-white/70 hover:text-white hover:bg-sidebar-accent/30 justify-start",
              isCollapsed && "px-0 justify-center"
            )}
            onClick={handleHelpClick}
          >
            <HelpCircle size={20} />
            {!isCollapsed && <span className="ml-2">Help & Guide</span>}
          </Button>
        </div>
        
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 mx-auto mb-4 rounded-full bg-sidebar-accent hover:bg-sidebar-accent/80 text-white transition-colors"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
    </>
  );
};
