
import { useState } from 'react';
import { Lead } from './LeadsList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, MapPin, Calendar, Plus, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface LeadsBoardProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
}

export const LeadsBoard = ({ leads, onSelectLead }: LeadsBoardProps) => {
  // Define board columns based on status
  const statuses: Lead['status'][] = ['New', 'Contacted', 'Qualified', 'Proposal', 'Converted', 'Lost'];
  
  // Get badge color based on status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Contacted':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Qualified':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Proposal':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Converted':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Lost':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  // Get badge for lead type
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Mortgage':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Realtor':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  // Get score indicator color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-green-500';
    if (score >= 40) return 'bg-yellow-500';
    if (score >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };
  
  return (
    <div className="grid grid-cols-6 gap-4 h-[calc(100vh-380px)] min-h-[400px]">
      {statuses.map((status) => {
        // Filter leads by status
        const statusLeads = leads.filter(lead => lead.status === status);
        
        return (
          <div 
            key={status} 
            className="flex flex-col rounded-md border border-border bg-card"
          >
            <div className="sticky top-0 z-10 p-3 border-b bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn("font-normal", getStatusColor(status))}>
                    {status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {statusLeads.length}
                  </span>
                </div>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <ScrollArea className="flex-1 p-2">
              {statusLeads.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 text-center p-4 text-muted-foreground text-sm border border-dashed rounded-md m-2">
                  <p>No leads in this stage</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {statusLeads.map(lead => (
                    <Card 
                      key={lead.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => onSelectLead(lead)}
                    >
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-medium">{lead.name}</div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[160px]">
                              <DropdownMenuItem>View Profile</DropdownMenuItem>
                              <DropdownMenuItem>Edit Lead</DropdownMenuItem>
                              <DropdownMenuItem>Schedule Follow-up</DropdownMenuItem>
                              <DropdownMenuItem>Assign Lead</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                Delete Lead
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        <div className="flex gap-2 text-xs mb-2">
                          <Badge 
                            variant="outline" 
                            className={cn("font-normal text-xs", getTypeColor(lead.type))}
                          >
                            {lead.type}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${getScoreColor(lead.score)}`} />
                            <span className="text-muted-foreground">{lead.score}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span className="truncate max-w-[150px]">{lead.email}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span>{lead.phone}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{lead.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(lead.lastContact).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        );
      })}
    </div>
  );
};
