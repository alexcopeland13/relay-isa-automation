
import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageSquare, Users, BarChart3, Settings, Search, BellRing, UserPlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from '@/lib/utils';

const MainNavigation = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  
  // Define main navigation sections
  const navigationItems = [
    {
      title: "Conversations",
      path: "/conversations",
      description: "View and manage AI-handled conversations with leads",
      icon: MessageSquare,
      active: location.pathname.includes('/conversations')
    },
    {
      title: "Leads",
      path: "/leads",
      description: "Manage potential clients and their information",
      icon: Users,
      active: location.pathname.includes('/leads')
    },
    {
      title: "Follow-ups",
      path: "/follow-ups",
      description: "Schedule and track follow-up activities",
      icon: MessageSquare,
      active: location.pathname.includes('/follow-ups')
    },
    {
      title: "Analytics",
      path: "/analytics",
      description: "View performance metrics and insights",
      icon: BarChart3,
      active: location.pathname.includes('/analytics')
    },
  ];
  
  return (
    <div className="flex items-center justify-between px-4 h-16 border-b">
      <div className="flex items-center gap-6">
        <NavigationMenu>
          <NavigationMenuList>
            {navigationItems.map((item) => (
              <NavigationMenuItem key={item.path}>
                <Link to={item.path}>
                  <NavigationMenuLink 
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "gap-1",
                      item.active ? "bg-accent text-accent-foreground" : ""
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.title}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            type="search"
            placeholder="Search leads, conversations..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Button variant="ghost" size="icon" className="relative">
          <BellRing className="h-5 w-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </Button>
        
        <Button variant="secondary" className="gap-1">
          <UserPlus className="h-4 w-4" />
          <span>New Lead</span>
        </Button>
      </div>
    </div>
  );
};

export default MainNavigation;
