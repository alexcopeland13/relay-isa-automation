
import { Link } from "react-router-dom";
import { 
  Card, 
  CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Building, 
  Phone, 
  Mail,
  Star,
  ExternalLink,
  Calendar
} from "lucide-react";
import { Agent } from "@/types/agent";

interface AgentCardProps {
  agent: Agent;
}

export function AgentCard({ agent }: AgentCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        <div className="h-36 bg-gradient-to-r from-blue-500 to-purple-500"></div>
        <div className="absolute -bottom-12 left-4 w-24 h-24 rounded-full border-4 border-card bg-background overflow-hidden">
          {agent.photoUrl ? (
            <img 
              src={agent.photoUrl} 
              alt={agent.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-medium text-2xl">
              {agent.name.substring(0, 2).toUpperCase()}
            </div>
          )}
        </div>
        <Badge 
          variant={agent.status === "Active" ? "default" : "secondary"}
          className={`absolute top-3 right-3 ${agent.status === "Active" ? "bg-green-500 hover:bg-green-600" : ""}`}
        >
          {agent.status}
        </Badge>
      </div>
      
      <CardContent className="pt-14 pb-4">
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-lg">{agent.name}</h3>
            <div className="flex items-center gap-1 text-muted-foreground text-sm">
              <Building className="h-3.5 w-3.5" />
              <span>{agent.agency}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{agent.areas.slice(0, 2).join(", ")}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Star className="h-3.5 w-3.5 text-yellow-500" />
              <span>{agent.successRate}% success rate</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>{agent.yearsOfExperience} years exp.</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>{agent.activeListings} listings</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1">
            {agent.specializations.slice(0, 3).map((spec, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {spec}
              </Badge>
            ))}
            {agent.specializations.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{agent.specializations.length - 3}
              </Badge>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <Link to={`/agents/${agent.id}`}>
                View Profile
              </Link>
            </Button>
            <Button variant="default" size="sm" className="flex-1">
              Contact
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
