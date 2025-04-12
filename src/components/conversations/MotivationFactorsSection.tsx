
import React, { useState } from 'react';
import { 
  TrendingUp, 
  Clock, 
  Star, 
  AlertTriangle,
  Check,
  Plus
} from 'lucide-react';
import { CategoryItemDisplay } from './CategoryItem';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { CategoryItem } from '@/data/sampleConversation';

interface MotivationFactorsSectionProps {
  motivationFactors: {
    primaryMotivation: CategoryItem;
    urgencyLevel: {
      value: number; // 1-10 scale
      confidence: number;
      source: 'AI' | 'User' | 'Agent';
      verified: boolean;
    };
    decisionFactors: CategoryItem[];
    potentialObstacles: CategoryItem[];
    confidence: number;
  };
  isEditing: boolean;
  onEdit: (key: string, value: any) => void;
}

export const MotivationFactorsSection = ({ 
  motivationFactors, 
  isEditing, 
  onEdit 
}: MotivationFactorsSectionProps) => {
  const [newDecisionFactor, setNewDecisionFactor] = useState('');
  const [newObstacle, setNewObstacle] = useState('');
  
  const motivationOptions = [
    'Upgrading', 
    'Downsizing', 
    'Relocating', 
    'Investment', 
    'First Home', 
    'Retirement',
    'Lifestyle Change'
  ];
  
  const handleAddDecisionFactor = () => {
    if (newDecisionFactor.trim()) {
      const newItem: CategoryItem = {
        value: newDecisionFactor.trim(),
        confidence: 1.0,
        source: 'Agent',
        verified: true
      };
      
      onEdit('decisionFactors', [...motivationFactors.decisionFactors, newItem]);
      setNewDecisionFactor('');
    }
  };
  
  const handleAddObstacle = () => {
    if (newObstacle.trim()) {
      const newItem: CategoryItem = {
        value: newObstacle.trim(),
        confidence: 1.0,
        source: 'Agent',
        verified: true
      };
      
      onEdit('potentialObstacles', [...motivationFactors.potentialObstacles, newItem]);
      setNewObstacle('');
    }
  };
  
  const handleVerify = (category: string, index: number) => {
    if (category === 'decisionFactors' || category === 'potentialObstacles') {
      const items = [...motivationFactors[category]];
      items[index] = { ...items[index], verified: true };
      onEdit(category, items);
    }
  };
  
  const getUrgencyLabel = (value: number) => {
    if (value <= 3) return 'Just Browsing';
    if (value <= 6) return 'Considering Options';
    if (value <= 9) return 'Actively Looking';
    return 'Ready to Act';
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-green-600 font-medium">
        <TrendingUp className="h-4 w-4" />
        <h3>Motivation Factors</h3>
        <span className="ml-auto text-xs text-muted-foreground">
          {Math.round(motivationFactors.confidence * 100)}% confidence
        </span>
      </div>
      
      <div className="space-y-3">
        <div>
          <div className="flex items-center mb-1">
            <TrendingUp className="h-4 w-4 text-muted-foreground mr-1" />
            <span className="text-xs text-muted-foreground">Primary Motivation</span>
          </div>
          {isEditing ? (
            <div className="space-y-2">
              <Select 
                value={motivationFactors.primaryMotivation.value} 
                onValueChange={(value) => onEdit('primaryMotivation', {
                  ...motivationFactors.primaryMotivation,
                  value,
                  confidence: 1.0,
                  source: 'Agent',
                  verified: true
                })}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select motivation" />
                </SelectTrigger>
                <SelectContent>
                  {motivationOptions.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="mt-1">
              <CategoryItemDisplay item={motivationFactors.primaryMotivation} />
            </div>
          )}
        </div>
        
        <div>
          <div className="flex items-center mb-1">
            <Clock className="h-4 w-4 text-muted-foreground mr-1" />
            <span className="text-xs text-muted-foreground">Urgency Level</span>
          </div>
          {isEditing ? (
            <div className="space-y-2">
              <div className="px-2">
                <Slider
                  value={[motivationFactors.urgencyLevel.value]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={(value) => onEdit('urgencyLevel', {
                    ...motivationFactors.urgencyLevel,
                    value: value[0]
                  })}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground px-2">
                <span>Just Browsing</span>
                <span>Considering</span>
                <span>Looking</span>
                <span>Ready to Act</span>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full mt-2"
                onClick={() => onEdit('urgencyLevel', {
                  ...motivationFactors.urgencyLevel,
                  verified: true,
                  source: 'Agent',
                  confidence: 1.0
                })}
              >
                <Check className="h-3 w-3 mr-1" />
                Verify
              </Button>
            </div>
          ) : (
            <div className="relative pt-5 pb-1">
              <div className="absolute top-0 w-full text-center text-sm font-medium">
                {getUrgencyLabel(motivationFactors.urgencyLevel.value)}
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div 
                  className="h-full bg-green-500 rounded-full" 
                  style={{ width: `${motivationFactors.urgencyLevel.value * 10}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>1</span>
                <span>10</span>
              </div>
            </div>
          )}
        </div>
        
        <div>
          <div className="flex items-center mb-1">
            <Star className="h-4 w-4 text-muted-foreground mr-1" />
            <span className="text-xs text-muted-foreground">Decision Factors</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-1">
            {motivationFactors.decisionFactors.map((factor, index) => (
              <CategoryItemDisplay 
                key={index} 
                item={factor}
                onVerify={isEditing ? () => handleVerify('decisionFactors', index) : undefined} 
                onEdit={isEditing ? () => {} : undefined}
              />
            ))}
            {isEditing && (
              <div className="flex gap-1 items-center">
                <Input 
                  value={newDecisionFactor} 
                  onChange={(e) => setNewDecisionFactor(e.target.value)}
                  placeholder="Add factor"
                  className="h-8 w-32"
                />
                <Button size="sm" variant="ghost" onClick={handleAddDecisionFactor}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <div className="flex items-center mb-1">
            <AlertTriangle className="h-4 w-4 text-muted-foreground mr-1" />
            <span className="text-xs text-muted-foreground">Potential Obstacles</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-1">
            {motivationFactors.potentialObstacles.map((obstacle, index) => (
              <CategoryItemDisplay 
                key={index} 
                item={obstacle}
                className="bg-yellow-50 border-yellow-200 text-yellow-800"
                onVerify={isEditing ? () => handleVerify('potentialObstacles', index) : undefined} 
                onEdit={isEditing ? () => {} : undefined}
              />
            ))}
            {isEditing && (
              <div className="flex gap-1 items-center">
                <Input 
                  value={newObstacle} 
                  onChange={(e) => setNewObstacle(e.target.value)}
                  placeholder="Add obstacle"
                  className="h-8 w-32"
                />
                <Button size="sm" variant="ghost" onClick={handleAddObstacle}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
