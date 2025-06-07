import React, { useState } from 'react';
import { 
  MapPin, 
  Map, 
  Timer, 
  Building2, 
  Check,
  Plus,
  X
} from 'lucide-react';
import { CategoryItemDisplay } from './CategoryItem';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CategoryItem } from '@/types/conversation';

interface LocationPreferencesSectionProps {
  locationPreferences: {
    areasOfInterest: CategoryItem[];
    neighborhoodType: CategoryItem[];
    commuteConsiderations: {
      maxCommuteDuration: number;
      commuteToLocations: string[];
      confidence: number;
      source: 'AI' | 'User' | 'Agent';
      verified: boolean;
    };
    confidence: number;
  };
  isEditing: boolean;
  onEdit: (key: string, value: any) => void;
}

export const LocationPreferencesSection = ({ 
  locationPreferences, 
  isEditing, 
  onEdit 
}: LocationPreferencesSectionProps) => {
  const [newArea, setNewArea] = useState('');
  const [newNeighborhoodType, setNewNeighborhoodType] = useState('');
  const [newCommuteLocation, setNewCommuteLocation] = useState('');
  
  const handleAddArea = () => {
    if (newArea.trim()) {
      const newItem: CategoryItem = {
        value: newArea.trim(),
        confidence: 1.0,
        source: 'Agent',
        verified: true
      };
      
      onEdit('areasOfInterest', [...locationPreferences.areasOfInterest, newItem]);
      setNewArea('');
    }
  };
  
  const handleAddNeighborhoodType = () => {
    if (newNeighborhoodType.trim()) {
      const newItem: CategoryItem = {
        value: newNeighborhoodType.trim(),
        confidence: 1.0,
        source: 'Agent',
        verified: true
      };
      
      onEdit('neighborhoodType', [...locationPreferences.neighborhoodType, newItem]);
      setNewNeighborhoodType('');
    }
  };
  
  const handleAddCommuteLocation = () => {
    if (newCommuteLocation.trim()) {
      onEdit('commuteConsiderations', {
        ...locationPreferences.commuteConsiderations,
        commuteToLocations: [...locationPreferences.commuteConsiderations.commuteToLocations, newCommuteLocation.trim()]
      });
      setNewCommuteLocation('');
    }
  };
  
  const handleVerify = (category: string, index: number) => {
    if (category === 'areasOfInterest' || category === 'neighborhoodType') {
      const items = [...locationPreferences[category]];
      items[index] = { ...items[index], verified: true };
      onEdit(category, items);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-purple-600 font-medium">
        <MapPin className="h-4 w-4" />
        <h3>Location Preferences</h3>
        <span className="ml-auto text-xs text-muted-foreground">
          {Math.round(locationPreferences.confidence * 100)}% confidence
        </span>
      </div>
      
      <div className="space-y-3">
        <div>
          <div className="flex items-center mb-1">
            <Map className="h-4 w-4 text-muted-foreground mr-1" />
            <span className="text-xs text-muted-foreground">Areas of Interest</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-1">
            {locationPreferences.areasOfInterest.map((area, index) => (
              <CategoryItemDisplay 
                key={index} 
                item={area}
                onVerify={isEditing ? () => handleVerify('areasOfInterest', index) : undefined} 
                onEdit={isEditing ? () => {} : undefined}
              />
            ))}
            {isEditing && (
              <div className="flex gap-1 items-center">
                <Input 
                  value={newArea} 
                  onChange={(e) => setNewArea(e.target.value)}
                  placeholder="Add area"
                  className="h-8 w-32"
                />
                <Button size="sm" variant="ghost" onClick={handleAddArea}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <div className="flex items-center mb-1">
            <Building2 className="h-4 w-4 text-muted-foreground mr-1" />
            <span className="text-xs text-muted-foreground">Neighborhood Type</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-1">
            {locationPreferences.neighborhoodType.map((type, index) => (
              <CategoryItemDisplay 
                key={index} 
                item={type}
                onVerify={isEditing ? () => handleVerify('neighborhoodType', index) : undefined} 
                onEdit={isEditing ? () => {} : undefined}
              />
            ))}
            {isEditing && (
              <div className="flex gap-1 items-center">
                <Input 
                  value={newNeighborhoodType} 
                  onChange={(e) => setNewNeighborhoodType(e.target.value)}
                  placeholder="Add type"
                  className="h-8 w-32"
                />
                <Button size="sm" variant="ghost" onClick={handleAddNeighborhoodType}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <div className="flex items-center mb-1">
            <Timer className="h-4 w-4 text-muted-foreground mr-1" />
            <span className="text-xs text-muted-foreground">Commute Considerations</span>
          </div>
          {isEditing ? (
            <div className="space-y-2">
              <div>
                <label className="text-xs text-muted-foreground">Max Commute (minutes)</label>
                <Input 
                  type="number" 
                  value={locationPreferences.commuteConsiderations.maxCommuteDuration} 
                  onChange={(e) => onEdit('commuteConsiderations', {
                    ...locationPreferences.commuteConsiderations,
                    maxCommuteDuration: parseInt(e.target.value) || 0
                  })}
                  className="h-8"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Commute To Locations</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {locationPreferences.commuteConsiderations.commuteToLocations.map((location, index) => (
                    <div key={index} className="flex items-center bg-secondary text-secondary-foreground px-2 py-1 rounded text-sm">
                      {location}
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-4 w-4 p-0 ml-1"
                        onClick={() => onEdit('commuteConsiderations', {
                          ...locationPreferences.commuteConsiderations,
                          commuteToLocations: locationPreferences.commuteConsiderations.commuteToLocations.filter((_, i) => i !== index)
                        })}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-1 items-center">
                    <Input 
                      value={newCommuteLocation} 
                      onChange={(e) => setNewCommuteLocation(e.target.value)}
                      placeholder="Add location"
                      className="h-8 w-32"
                    />
                    <Button size="sm" variant="ghost" onClick={handleAddCommuteLocation}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full"
                onClick={() => onEdit('commuteConsiderations', {
                  ...locationPreferences.commuteConsiderations,
                  verified: true
                })}
              >
                <Check className="h-3 w-3 mr-1" />
                Verify
              </Button>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm">Max Commute Time:</span>
                <span className="font-medium">{locationPreferences.commuteConsiderations.maxCommuteDuration} minutes</span>
              </div>
              <div>
                <div className="text-sm">Commutes To:</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {locationPreferences.commuteConsiderations.commuteToLocations.map((location, index) => (
                    <span key={index} className="text-xs bg-secondary px-2 py-0.5 rounded">
                      {location}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
