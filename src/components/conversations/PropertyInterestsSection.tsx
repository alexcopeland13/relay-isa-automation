
import React, { useState } from 'react';
import { 
  Home, 
  DollarSign, 
  Rulers, 
  Check, 
  X, 
  Edit, 
  Save, 
  Pool, 
  Building, 
  SquareMeter 
} from 'lucide-react';
import { CategoryItemDisplay } from './CategoryItem';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CategoryItem } from '@/data/sampleConversation';

interface PropertyInterestsSectionProps {
  propertyInterests: {
    propertyType: CategoryItem[];
    priceRange: {
      min: number;
      max: number;
      confidence: number;
      source: 'AI' | 'User' | 'Agent';
      verified: boolean;
    };
    sizeRequirements: {
      bedrooms: number;
      bathrooms: number;
      squareFootage: {
        min: number;
        max: number;
      };
      confidence: number;
      source: 'AI' | 'User' | 'Agent';
      verified: boolean;
    };
    mustHaveFeatures: CategoryItem[];
    dealBreakers: CategoryItem[];
    confidence: number;
  };
  isEditing: boolean;
  onEdit: (key: string, value: any) => void;
}

export const PropertyInterestsSection = ({ 
  propertyInterests, 
  isEditing, 
  onEdit 
}: PropertyInterestsSectionProps) => {
  const [newFeature, setNewFeature] = useState('');
  const [newDealBreaker, setNewDealBreaker] = useState('');
  
  const handleAddFeature = () => {
    if (newFeature.trim()) {
      const newItem: CategoryItem = {
        value: newFeature.trim(),
        confidence: 1.0,
        source: 'Agent',
        verified: true
      };
      
      onEdit('mustHaveFeatures', [...propertyInterests.mustHaveFeatures, newItem]);
      setNewFeature('');
    }
  };
  
  const handleAddDealBreaker = () => {
    if (newDealBreaker.trim()) {
      const newItem: CategoryItem = {
        value: newDealBreaker.trim(),
        confidence: 1.0,
        source: 'Agent',
        verified: true
      };
      
      onEdit('dealBreakers', [...propertyInterests.dealBreakers, newItem]);
      setNewDealBreaker('');
    }
  };
  
  const handleVerify = (category: string, index: number) => {
    const items = [...propertyInterests[category as keyof typeof propertyInterests]] as CategoryItem[];
    items[index] = { ...items[index], verified: true };
    onEdit(category, items);
  };
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-blue-600 font-medium">
        <Home className="h-4 w-4" />
        <h3>Property Interests</h3>
        <span className="ml-auto text-xs text-muted-foreground">
          {Math.round(propertyInterests.confidence * 100)}% confidence
        </span>
      </div>
      
      <div className="space-y-3">
        <div>
          <div className="flex items-center mb-1">
            <Building className="h-4 w-4 text-muted-foreground mr-1" />
            <span className="text-xs text-muted-foreground">Property Type</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-1">
            {propertyInterests.propertyType.map((type, index) => (
              <CategoryItemDisplay 
                key={index} 
                item={type}
                onVerify={isEditing ? () => handleVerify('propertyType', index) : undefined} 
                onEdit={isEditing ? () => {} : undefined}
              />
            ))}
          </div>
        </div>
        
        <div>
          <div className="flex items-center mb-1">
            <DollarSign className="h-4 w-4 text-muted-foreground mr-1" />
            <span className="text-xs text-muted-foreground">Price Range</span>
          </div>
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">Min</label>
                  <Input 
                    type="number" 
                    value={propertyInterests.priceRange.min} 
                    onChange={(e) => onEdit('priceRange', {
                      ...propertyInterests.priceRange,
                      min: parseInt(e.target.value) || 0
                    })}
                    className="h-8"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Max</label>
                  <Input 
                    type="number" 
                    value={propertyInterests.priceRange.max} 
                    onChange={(e) => onEdit('priceRange', {
                      ...propertyInterests.priceRange,
                      max: parseInt(e.target.value) || 0
                    })}
                    className="h-8"
                  />
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full"
                onClick={() => onEdit('priceRange', {
                  ...propertyInterests.priceRange,
                  verified: true
                })}
              >
                <Check className="h-3 w-3 mr-1" />
                Verify
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="font-medium">{formatPrice(propertyInterests.priceRange.min)}</span>
              <div className="h-1 flex-1 mx-2 bg-gray-200 rounded">
                <div 
                  className="h-full bg-primary rounded" 
                  style={{ width: '100%' }}
                ></div>
              </div>
              <span className="font-medium">{formatPrice(propertyInterests.priceRange.max)}</span>
            </div>
          )}
        </div>
        
        <div>
          <div className="flex items-center mb-1">
            <SquareMeter className="h-4 w-4 text-muted-foreground mr-1" />
            <span className="text-xs text-muted-foreground">Size Requirements</span>
          </div>
          {isEditing ? (
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">Beds</label>
                  <Input 
                    type="number" 
                    value={propertyInterests.sizeRequirements.bedrooms} 
                    onChange={(e) => onEdit('sizeRequirements', {
                      ...propertyInterests.sizeRequirements,
                      bedrooms: parseInt(e.target.value) || 0
                    })}
                    className="h-8"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Baths</label>
                  <Input 
                    type="number" 
                    value={propertyInterests.sizeRequirements.bathrooms} 
                    onChange={(e) => onEdit('sizeRequirements', {
                      ...propertyInterests.sizeRequirements,
                      bathrooms: parseInt(e.target.value) || 0
                    })}
                    className="h-8"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Sq Ft Range</label>
                  <div className="flex items-center gap-1">
                    <Input 
                      type="number" 
                      value={propertyInterests.sizeRequirements.squareFootage.min} 
                      onChange={(e) => onEdit('sizeRequirements', {
                        ...propertyInterests.sizeRequirements,
                        squareFootage: {
                          ...propertyInterests.sizeRequirements.squareFootage,
                          min: parseInt(e.target.value) || 0
                        }
                      })}
                      className="h-8"
                    />
                    <span>-</span>
                    <Input 
                      type="number" 
                      value={propertyInterests.sizeRequirements.squareFootage.max} 
                      onChange={(e) => onEdit('sizeRequirements', {
                        ...propertyInterests.sizeRequirements,
                        squareFootage: {
                          ...propertyInterests.sizeRequirements.squareFootage,
                          max: parseInt(e.target.value) || 0
                        }
                      })}
                      className="h-8"
                    />
                  </div>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full"
                onClick={() => onEdit('sizeRequirements', {
                  ...propertyInterests.sizeRequirements,
                  verified: true
                })}
              >
                <Check className="h-3 w-3 mr-1" />
                Verify
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-lg font-semibold">{propertyInterests.sizeRequirements.bedrooms}</div>
                <div className="text-xs text-muted-foreground">Bedrooms</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">{propertyInterests.sizeRequirements.bathrooms}</div>
                <div className="text-xs text-muted-foreground">Bathrooms</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold">
                  {propertyInterests.sizeRequirements.squareFootage.min}-{propertyInterests.sizeRequirements.squareFootage.max}
                </div>
                <div className="text-xs text-muted-foreground">Square Feet</div>
              </div>
            </div>
          )}
        </div>
        
        <div>
          <div className="flex items-center mb-1">
            <Pool className="h-4 w-4 text-muted-foreground mr-1" />
            <span className="text-xs text-muted-foreground">Must-Have Features</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-1">
            {propertyInterests.mustHaveFeatures.map((feature, index) => (
              <CategoryItemDisplay 
                key={index} 
                item={feature}
                onVerify={isEditing ? () => handleVerify('mustHaveFeatures', index) : undefined} 
                onEdit={isEditing ? () => {} : undefined}
              />
            ))}
            {isEditing && (
              <div className="flex gap-1 items-center">
                <Input 
                  value={newFeature} 
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Add feature"
                  className="h-8 w-32"
                />
                <Button size="sm" variant="ghost" onClick={handleAddFeature}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <div className="flex items-center mb-1">
            <X className="h-4 w-4 text-muted-foreground mr-1" />
            <span className="text-xs text-muted-foreground">Deal Breakers</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-1">
            {propertyInterests.dealBreakers.map((dealBreaker, index) => (
              <CategoryItemDisplay 
                key={index} 
                item={dealBreaker}
                className="bg-red-50 border-red-200 text-red-700"
                onVerify={isEditing ? () => handleVerify('dealBreakers', index) : undefined} 
                onEdit={isEditing ? () => {} : undefined}
              />
            ))}
            {isEditing && (
              <div className="flex gap-1 items-center">
                <Input 
                  value={newDealBreaker} 
                  onChange={(e) => setNewDealBreaker(e.target.value)}
                  placeholder="Add deal breaker"
                  className="h-8 w-32"
                />
                <Button size="sm" variant="ghost" onClick={handleAddDealBreaker}>
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

// Add missing Plus icon import
import { Plus } from 'lucide-react';
