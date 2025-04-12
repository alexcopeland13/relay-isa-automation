
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar } from "@/components/ui/avatar";
import { Agent } from "@/types/agent";
import { ArrowRight, ExternalLink, Phone, Mail } from "lucide-react";
import { Link } from "react-router-dom";

interface AgentLeadsListProps {
  agent: Agent;
}

// Sample data - in a real app, this would come from an API
const sampleLeads = [
  {
    id: "lead-1",
    name: "Alex Johnson",
    status: "Hot",
    propertyType: "Single Family",
    budget: "$350k-450k",
    location: "Westside",
    assignedDate: "2023-06-01",
    lastContact: "2 days ago"
  },
  {
    id: "lead-2",
    name: "Maria Garcia",
    status: "Warm",
    propertyType: "Condo",
    budget: "$250k-320k",
    location: "Downtown",
    assignedDate: "2023-05-28",
    lastContact: "5 days ago"
  },
  {
    id: "lead-3",
    name: "Thomas Wright",
    status: "Cold",
    propertyType: "Multi-Family",
    budget: "$500k-650k",
    location: "Northern Suburbs",
    assignedDate: "2023-05-15",
    lastContact: "2 weeks ago"
  },
  {
    id: "lead-4",
    name: "Sarah Kim",
    status: "Hot",
    propertyType: "Luxury",
    budget: "$800k+",
    location: "Lakefront",
    assignedDate: "2023-06-03",
    lastContact: "1 day ago"
  }
];

export function AgentLeadsList({ agent }: AgentLeadsListProps) {
  const statusColor = (status: string) => {
    switch (status) {
      case "Hot":
        return "bg-red-100 text-red-800 border-red-200";
      case "Warm":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Cold":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Currently Assigned Leads</h3>
          <p className="text-sm text-muted-foreground">
            {sampleLeads.length} leads assigned to {agent.name}
          </p>
        </div>
        <Button size="sm">
          Assign New Lead
        </Button>
      </div>

      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lead</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Requirements</TableHead>
              <TableHead>Assigned</TableHead>
              <TableHead>Last Contact</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sampleLeads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar>
                      <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-medium">
                        {lead.name.substring(0, 2).toUpperCase()}
                      </div>
                    </Avatar>
                    <div>
                      <div className="font-medium">{lead.name}</div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Phone className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Mail className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={statusColor(lead.status)}
                  >
                    {lead.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{lead.propertyType}</div>
                    <div className="text-muted-foreground">
                      {lead.budget} • {lead.location}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {new Date(lead.assignedDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </TableCell>
                <TableCell>
                  {lead.lastContact}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/leads`}>
                        <ExternalLink className="mr-1 h-3 w-3" />
                        View
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm">
                      Reassign
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-center">
        <Button variant="outline" asChild>
          <Link to="/leads">
            View All Leads
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
