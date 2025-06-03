
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Lead } from "@/types/lead";
import { 
  MoreHorizontal, 
  Phone, 
  Mail, 
  MessageSquare, 
  Calendar,
  Edit,
  Trash2,
  UserPlus
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { OutboundCallButton } from "./OutboundCallButton";

interface LeadTableRowProps {
  lead: Lead;
  onSelect: (lead: Lead) => void;
  onAssign: (lead: Lead) => void;
  onScheduleFollowUp: (lead: Lead) => void;
  onDelete?: (leadId: string) => void;
}

const getStatusBadgeVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case 'new':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'contacted':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'qualified':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'proposal':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'converted':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'lost':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getScoreBadgeColor = (score: number) => {
  if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
  if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  if (score >= 40) return 'bg-orange-100 text-orange-800 border-orange-200';
  return 'bg-red-100 text-red-800 border-red-200';
};

export function LeadTableRow({ 
  lead, 
  onSelect, 
  onAssign, 
  onScheduleFollowUp,
  onDelete 
}: LeadTableRowProps) {
  const initials = lead.name
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell>
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{lead.name}</div>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              {lead.email && (
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {lead.email}
                </span>
              )}
              {lead.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {lead.phone}
                </span>
              )}
            </div>
          </div>
        </div>
      </TableCell>

      <TableCell>
        <Badge 
          variant="outline" 
          className={getStatusBadgeVariant(lead.status)}
        >
          {lead.status}
        </Badge>
      </TableCell>

      <TableCell>
        <div className="text-sm">
          <div className="font-medium">{lead.type}</div>
          <div className="text-muted-foreground">{lead.interestType}</div>
        </div>
      </TableCell>

      <TableCell>
        <div className="text-sm">
          <div>{lead.source}</div>
          <div className="text-muted-foreground">{lead.location}</div>
        </div>
      </TableCell>

      <TableCell>
        <Badge 
          variant="outline" 
          className={getScoreBadgeColor(lead.score)}
        >
          {lead.score}%
        </Badge>
      </TableCell>

      <TableCell>
        <div className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
        </div>
      </TableCell>

      <TableCell>
        <div className="text-sm text-muted-foreground">
          {lead.lastContact ? 
            formatDistanceToNow(new Date(lead.lastContact), { addSuffix: true }) : 
            'Never'
          }
        </div>
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-2">
          <OutboundCallButton lead={lead} />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onSelect(lead)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Lead
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAssign(lead)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Assign Agent
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onScheduleFollowUp(lead)}>
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Follow-up
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <MessageSquare className="mr-2 h-4 w-4" />
                Send Message
              </DropdownMenuItem>
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onDelete(lead.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Lead
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
}
