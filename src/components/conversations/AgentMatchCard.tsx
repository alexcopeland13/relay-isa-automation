
import { Agent } from '@/types/agent';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, MapPin, Calendar, Award, Star } from 'lucide-react';

interface AgentMatchCardProps {
  agent: Agent;
  matchScore: number;
  matchingSpecializations: string[];
  onSelect: (agent: Agent) => void;
}

export const AgentMatchCard = ({ 
  agent, 
  matchScore, 
  matchingSpecializations,
  onSelect 
}: AgentMatchCardProps) => {
  // Determine score color based on match percentage
  const getScoreColorClass = () => {
    if (matchScore >= 90) return "bg-green-500 text-primary-foreground";
    if (matchScore >= 75) return "bg-blue-500 text-primary-foreground";
    return "bg-primary text-primary-foreground";
  };

  return (
    <div className="border rounded-lg p-4 hover:border-primary/50 transition-colors">
      <div className="flex gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full overflow-hidden">
            {agent.photoUrl ? (
              <img 
                src={agent.photoUrl} 
                alt={agent.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-medium text-lg">
                {agent.name.substring(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div 
            className={`absolute -bottom-2 -right-2 text-xs font-semibold rounded-full w-8 h-8 flex items-center justify-center ${getScoreColorClass()}`}
          >
            {matchScore}%
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between">
            <h3 className="font-medium">{agent.name}</h3>
            <Badge 
              variant={agent.status === "Active" ? "default" : "secondary"}
              className={`${agent.status === "Active" ? "bg-green-500 hover:bg-green-600" : ""}`}
            >
              {agent.status}
            </Badge>
          </div>
          
          <div className="text-sm text-muted-foreground mt-1">{agent.agency}</div>
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
            <div className="flex items-center text-xs text-muted-foreground">
              <Award className="h-3 w-3 mr-1" />
              <span>{agent.yearsOfExperience} years exp.</span>
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 mr-1" />
              <span>{agent.areas?.[0] || 'N/A'}</span>
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <CheckCircle className="h-3 w-3 mr-1" />
              <span>{agent.successRate}% success rate</span>
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 mr-1" />
              <span>{agent.activeListings} listings</span>
            </div>
          </div>
          
          {agent.rating && (
            <div className="flex items-center mt-1 text-xs">
              <Star className="h-3 w-3 text-yellow-500 mr-1" />
              <span>{agent.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-3 border-t pt-3">
        <div className="flex justify-between items-center">
          <div className="space-x-1">
            {matchingSpecializations.map((spec, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {spec}
              </Badge>
            ))}
            {matchingSpecializations.length === 0 && (
              <span className="text-xs text-muted-foreground">No matching specializations</span>
            )}
          </div>
          <Button 
            onClick={() => onSelect(agent)}
            size="sm"
          >
            Select
          </Button>
        </div>
      </div>
    </div>
  );
};
