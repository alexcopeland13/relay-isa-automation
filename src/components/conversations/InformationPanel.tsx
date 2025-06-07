import { useState } from 'react';
import { 
  PropertyInterestsSection 
} from './PropertyInterestsSection';
import { 
  LocationPreferencesSection 
} from './LocationPreferencesSection';
import { 
  MotivationFactorsSection 
} from './MotivationFactorsSection';
import { 
  TransactionTypeSection 
} from './TransactionTypeSection';
import { 
  ExtractedInfo,
  emptyPropertyInterests,
  emptyLocationPreferences,
  emptyMotivationFactors,
  emptyTransactionType
} from '@/types/conversation';
import { Button } from '@/components/ui/button';
import { Edit, Save, X, AlertTriangle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface InformationPanelProps {
  extractedInfo?: ExtractedInfo;
}

export const InformationPanel = ({ extractedInfo }: InformationPanelProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localInfo, setLocalInfo] = useState(extractedInfo || {
    propertyInfo: {
      currentMortgage: '',
      currentTerm: '',
      estimatedValue: '',
      location: '',
      confidence: 0
    },
    refinanceGoals: {
      lowerRate: false,
      cashOut: false,
      shortenTerm: false,
      confidence: 0
    },
    timeline: {
      urgency: '',
      lookingToDecide: '',
      confidence: 0
    },
    financialInfo: {
      estimatedCredit: '',
      hasOtherDebts: false,
      confidence: 0
    },
    qualification: {
      status: '',
      confidenceScore: 0,
      reasoning: ''
    },
    propertyInterests: emptyPropertyInterests,
    locationPreferences: emptyLocationPreferences,
    transactionType: emptyTransactionType,
    motivationFactors: emptyMotivationFactors,
    matchingWeights: {
      propertyType: 0,
      location: 0,
      priceRange: 0,
      timeline: 0,
      financing: 0
    }
  });
  
  const handleEdit = (section: string, value: any) => {
    setLocalInfo(prev => ({
      ...prev,
      [section]: value
    }));
  };
  
  const handleSave = () => {
    // Here you would save the localInfo to the parent component or context
    console.log('Saving info:', localInfo);
    setIsEditing(false);
  };
  
  return (
    <div className="p-6 h-[600px] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold">Extracted Information</h2>
        {isEditing ? (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        ) : (
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Info
          </Button>
        )}
      </div>
      
      {!extractedInfo ? (
        <div className="flex items-center justify-center h-full">
          <AlertTriangle className="h-8 w-8 text-muted-foreground mr-2" />
          <p className="text-muted-foreground">No information extracted yet.</p>
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="space-y-6">
            <PropertyInterestsSection 
              propertyInterests={localInfo.propertyInterests}
              isEditing={isEditing}
              onEdit={(key, value) => handleEdit('propertyInterests', {
                ...localInfo.propertyInterests,
                [key]: value
              })}
            />
            
            <LocationPreferencesSection
              locationPreferences={localInfo.locationPreferences}
              isEditing={isEditing}
              onEdit={(key, value) => handleEdit('locationPreferences', {
                ...localInfo.locationPreferences,
                [key]: value
              })}
            />
            
            <MotivationFactorsSection
              motivationFactors={localInfo.motivationFactors}
              isEditing={isEditing}
              onEdit={(key, value) => handleEdit('motivationFactors', {
                ...localInfo.motivationFactors,
                [key]: value
              })}
            />
            
            <TransactionTypeSection
              transactionType={localInfo.transactionType}
              isEditing={isEditing}
              onEdit={(key, value) => handleEdit('transactionType', {
                ...localInfo.transactionType,
                [key]: value
              })}
            />
          </div>
        </ScrollArea>
      )}
    </div>
  );
};
