
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
  UserSearch,
  PhoneCall,
  CheckSquare,
  Clock,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { Badge } from '@/components/ui/badge';

type NavItem = {
  icon: React.ElementType;
  label: string;
  path: string;
  badgeCount?: number;
};

type NavItemProps = NavItem & {
  isCollapsed: boolean;
};

const NavItem = ({ icon: Icon, label, path, isCollapsed, badgeCount }: NavItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === path;

  return (
    <Link 
      to={path} 
      className={cn(
        "nav-link relative", 
        isActive && "active"
      )}
      title={isCollapsed ? label : undefined}
    >
      <Icon size={20} />
      {!isCollapsed && <span>{label}</span>}
      
      {badgeCount !== undefined && badgeCount > 0 && (
        <Badge 
          className={cn(
            "absolute bg-emmaccent text-white",
            isCollapsed ? "top-0 right-0" : "top-0 right-2"
          )}
          variant="default"
        >
          {badgeCount}
        </Badge>
      )}
    </Link>
  );
};

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const engageItems: NavItem[] = [
    { icon: MessageSquare, label: 'Conversations', path: '/conversations', badgeCount: 5 },
    { icon: Users, label: 'New Leads', path: '/leads', badgeCount: 2 },
    { icon: PhoneCall, label: 'Priority Follow-ups', path: '/follow-ups', badgeCount: 3 },
  ];
  
  const planItems: NavItem[] = [
    { icon: Calendar, label: 'Upcoming Calls', path: '/upcoming-calls' },
    { icon: Clock, label: 'Pending Follow-ups', path: '/pending-followups' },
    { icon: UserSearch, label: 'Agent Availability', path: '/agents', badgeCount: 1 },
  ];
  
  const reviewItems: NavItem[] = [
    { icon: CheckSquare, label: 'Completed Tasks', path: '/completed-tasks' },
    { icon: FileText, label: 'Conversion Outcomes', path: '/conversion-outcomes' },
    { icon: BarChart3, label: 'Performance Metrics', path: '/analytics' },
  ];
  
  const manageItems: NavItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
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
        
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {!isCollapsed && (
            <div className="text-xs uppercase text-white/50 font-medium px-3 pt-2 pb-1">
              Engage
            </div>
          )}
          {engageItems.map((item) => (
            <NavItem 
              key={item.path}
              {...item}
              isCollapsed={isCollapsed}
            />
          ))}
          
          {!isCollapsed && (
            <div className="text-xs uppercase text-white/50 font-medium px-3 pt-4 pb-1 mt-3">
              Plan
            </div>
          )}
          {planItems.map((item) => (
            <NavItem 
              key={item.path}
              {...item}
              isCollapsed={isCollapsed}
            />
          ))}
          
          {!isCollapsed && (
            <div className="text-xs uppercase text-white/50 font-medium px-3 pt-4 pb-1 mt-3">
              Review
            </div>
          )}
          {reviewItems.map((item) => (
            <NavItem 
              key={item.path}
              {...item}
              isCollapsed={isCollapsed}
            />
          ))}
          
          {!isCollapsed && (
            <div className="text-xs uppercase text-white/50 font-medium px-3 pt-4 pb-1 mt-3">
              Manage
            </div>
          )}
          {manageItems.map((item) => (
            <NavItem 
              key={item.path}
              {...item}
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
