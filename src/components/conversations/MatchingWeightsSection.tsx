import React from 'react';
import { 
  Link,
  SlidersHorizontal
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { MatchingWeights } from './MatchingCriteria';

interface MatchingWeightsSectionProps {
  matchingWeights: MatchingWeights;
  isEditing: boolean;
  onEdit: (key: string, value: number) => void;
}

export const MatchingWeightsSection = ({ 
  matchingWeights, 
  isEditing, 
  onEdit 
}: MatchingWeightsSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-primary font-medium">
        <Link className="h-4 w-4" />
        <h3>Matching Weights</h3>
        <span className="ml-auto text-xs text-muted-foreground">
          Priorities for agent matching
        </span>
      </div>
      
      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Property Type</span>
            <span className="text-xs font-medium">{Math.round(matchingWeights.propertyType * 100)}%</span>
          </div>
          {isEditing ? (
            <Slider
              value={[matchingWeights.propertyType * 100]}
              min={0}
              max={100}
              step={5}
              onValueChange={(value) => onEdit('propertyType', value[0] / 100)}
            />
          ) : (
            <div className="h-2 bg-gray-200 rounded-full">
              <div 
                className="h-full bg-primary rounded-full" 
                style={{ width: `${matchingWeights.propertyType * 100}%` }}
              ></div>
            </div>
          )}
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Location</span>
            <span className="text-xs font-medium">{Math.round(matchingWeights.location * 100)}%</span>
          </div>
          {isEditing ? (
            <Slider
              value={[matchingWeights.location * 100]}
              min={0}
              max={100}
              step={5}
              onValueChange={(value) => onEdit('location', value[0] / 100)}
            />
          ) : (
            <div className="h-2 bg-gray-200 rounded-full">
              <div 
                className="h-full bg-primary rounded-full" 
                style={{ width: `${matchingWeights.location * 100}%` }}
              ></div>
            </div>
          )}
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Price Range</span>
            <span className="text-xs font-medium">{Math.round(matchingWeights.priceRange * 100)}%</span>
          </div>
          {isEditing ? (
            <Slider
              value={[matchingWeights.priceRange * 100]}
              min={0}
              max={100}
              step={5}
              onValueChange={(value) => onEdit('priceRange', value[0] / 100)}
            />
          ) : (
            <div className="h-2 bg-gray-200 rounded-full">
              <div 
                className="h-full bg-primary rounded-full" 
                style={{ width: `${matchingWeights.priceRange * 100}%` }}
              ></div>
            </div>
          )}
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Timeline</span>
            <span className="text-xs font-medium">{Math.round(matchingWeights.timeline * 100)}%</span>
          </div>
          {isEditing ? (
            <Slider
              value={[matchingWeights.timeline * 100]}
              min={0}
              max={100}
              step={5}
              onValueChange={(value) => onEdit('timeline', value[0] / 100)}
            />
          ) : (
            <div className="h-2 bg-gray-200 rounded-full">
              <div 
                className="h-full bg-primary rounded-full" 
                style={{ width: `${matchingWeights.timeline * 100}%` }}
              ></div>
            </div>
          )}
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Financing</span>
            <span className="text-xs font-medium">{Math.round(matchingWeights.financing * 100)}%</span>
          </div>
          {isEditing ? (
            <Slider
              value={[matchingWeights.financing * 100]}
              min={0}
              max={100}
              step={5}
              onValueChange={(value) => onEdit('financing', value[0] / 100)}
            />
          ) : (
            <div className="h-2 bg-gray-200 rounded-full">
              <div 
                className="h-full bg-primary rounded-full" 
                style={{ width: `${matchingWeights.financing * 100}%` }}
              ></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
