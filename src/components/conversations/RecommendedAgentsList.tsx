
import { Agent } from '@/types/agent';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, MapPin, Calendar, Award } from 'lucide-react';

interface RecommendedAgentsListProps {
  agents: Agent[];
  leadInfo: any;
  onSelectAgent: (agent: Agent) => void;
}

export const RecommendedAgentsList = ({ 
  agents, 
  leadInfo, 
  onSelectAgent 
}: RecommendedAgentsListProps) => {
  // Calculate match score (this would be more sophisticated in a real implementation)
  const calculateMatchScore = (agent: Agent) => {
    // Simple implementation for demo purposes
    const scores = {
      'agent-1': 92,
      'agent-2': 87,
      'agent-3': 78,
      'agent-4': 71,
      'agent-5': 65,
    };
    return scores[agent.id as keyof typeof scores] || Math.floor(Math.random() * 30) + 70;
  };

  // Get matching specializations (simplified implementation)
  const getMatchingSpecializations = (agent: Agent) => {
    const propertyType = leadInfo.propertyType || '';
    const location = leadInfo.location || '';
    
    return agent.specializations.filter(spec => 
      spec.toLowerCase().includes(propertyType.toLowerCase()) ||
      agent.areas.some(area => area.toLowerCase().includes(location.toLowerCase()))
    ).slice(0, 3);
  };

  return (
    <div className="space-y-4">
      {agents.map((agent) => {
        const matchScore = calculateMatchScore(agent);
        const matchingSpecs = getMatchingSpecializations(agent);
        
        return (
          <div 
            key={agent.id} 
            className="border rounded-lg p-4 hover:border-primary/50 transition-colors"
          >
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
                  className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground text-xs font-semibold rounded-full w-8 h-8 flex items-center justify-center"
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
                    <span>{agent.areas[0]}</span>
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
              </div>
            </div>
            
            <div className="mt-3 border-t pt-3">
              <div className="flex justify-between items-center">
                <div className="space-x-1">
                  {matchingSpecs.map((spec, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {spec}
                    </Badge>
                  ))}
                  {matchingSpecs.length === 0 && (
                    <span className="text-xs text-muted-foreground">No matching specializations</span>
                  )}
                </div>
                <Button 
                  onClick={() => onSelectAgent(agent)}
                  size="sm"
                >
                  Select
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
