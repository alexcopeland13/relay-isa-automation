import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  BarChart3, 
  Settings,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type NavItem = {
  icon: React.ElementType;
  label: string;
  path: string;
  badgeCount?: number;
};

type NavItemProps = NavItem & {
  isCollapsed: boolean;
};

type NavSectionProps = {
  title: string;
  items: NavItem[];
  isCollapsed: boolean;
};

const NavItem = ({ icon: Icon, label, path, isCollapsed, badgeCount }: NavItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === path || 
                  (path !== '/' && location.pathname.startsWith(path));

  return (
    <Link 
      to={path} 
      className={cn(
        "nav-link relative", 
        isActive && "active"
      )}
      title={isCollapsed ? label : undefined}
      role="menuitem"
      aria-current={isActive ? "page" : undefined}
    >
      <Icon size={20} aria-hidden="true" />
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

const NavSection = ({ title, items, isCollapsed }: NavSectionProps) => {
  return (
    <div className="mb-6">
      {!isCollapsed && (
        <div className="text-xs uppercase text-white/50 font-medium px-3 pt-2 pb-1" role="presentation">
          {title}
        </div>
      )}
      {items.map((item) => (
        <NavItem 
          key={item.path}
          {...item}
          isCollapsed={isCollapsed}
        />
      ))}
    </div>
  );
};

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const engageItems: NavItem[] = [
    { icon: MessageSquare, label: 'Conversations', path: '/conversations', badgeCount: 5 },
    { icon: Users, label: 'Leads', path: '/leads', badgeCount: 2 },
  ];
  
  const manageItems: NavItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: MessageSquare, label: 'Follow-ups', path: '/follow-ups', badgeCount: 3 },
    { icon: Users, label: 'Team', path: '/agents', badgeCount: 1 },
  ];
  
  const reviewItems: NavItem[] = [
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const handleHelpClick = () => {
    setShowOnboarding(true);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Logout Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate('/auth');
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    }
  };

  return (
    <>
      {showOnboarding && <OnboardingFlow />}
      <div 
        className={cn(
          "flex flex-col bg-sidebar h-screen bg-emmblue transition-all duration-300",
          isCollapsed ? "w-[70px]" : "w-[250px]"
        )}
        role="navigation"
        aria-label="Main Navigation"
      >
        <div className="flex items-center p-4 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2 text-white" aria-label="Home">
            {!isCollapsed ? (
              <>
                <MessageSquare size={24} className="text-emmaccent" aria-hidden="true" />
                <span className="font-bold text-lg">Relay</span>
              </>
            ) : (
              <MessageSquare size={24} className="mx-auto text-emmaccent" aria-hidden="true" />
            )}
          </Link>
        </div>
        
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto" role="menubar">
          <NavSection 
            title="Engage" 
            items={engageItems} 
            isCollapsed={isCollapsed} 
          />
          
          <NavSection 
            title="Manage" 
            items={manageItems} 
            isCollapsed={isCollapsed} 
          />
          
          <NavSection 
            title="Review" 
            items={reviewItems} 
            isCollapsed={isCollapsed} 
          />
        </nav>
        
        <div className="p-2 border-t border-sidebar-border mt-auto">
          <Button 
            variant="ghost" 
            className={cn(
              "w-full text-white/70 hover:text-white hover:bg-sidebar-accent/30 justify-start mb-1",
              isCollapsed && "px-0 justify-center"
            )}
            onClick={handleHelpClick}
            aria-label="Help and Guide"
          >
            <HelpCircle size={20} aria-hidden="true" />
            {!isCollapsed && <span className="ml-2">Help & Guide</span>}
          </Button>
          
          <Button 
            variant="ghost" 
            className={cn(
              "w-full text-white/70 hover:text-white hover:bg-sidebar-accent/30 justify-start",
              isCollapsed && "px-0 justify-center"
            )}
            onClick={handleLogout}
            aria-label="Log Out"
          >
            <LogOut size={20} aria-hidden="true" />
            {!isCollapsed && <span className="ml-2">Log Out</span>}
          </Button>
        </div>
        
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 mx-auto my-2 rounded-full bg-sidebar-accent hover:bg-sidebar-accent/80 text-white transition-colors"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight size={20} aria-hidden="true" /> : <ChevronLeft size={20} aria-hidden="true" />}
        </button>
      </div>
    </>
  );
};
