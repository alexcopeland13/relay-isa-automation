
import { 
  TransactionType, 
  LocationPreferences, 
  PropertyInterests, 
  MotivationFactors 
} from '@/types/conversation';
import { TransactionTypeSection } from './TransactionTypeSection';
import { LocationPreferencesSection } from './LocationPreferencesSection';
import { PropertyInterestsSection } from './PropertyInterestsSection';
import { MotivationFactorsSection } from './MotivationFactorsSection';
import { MatchingWeightsSection } from './MatchingWeightsSection';

interface MatchingCriteriaProps {
  transactionType: TransactionType;
  locationPreferences: LocationPreferences;
  propertyInterests: PropertyInterests;
  motivationFactors: MotivationFactors;
  matchingWeights: Record<string, number>;
  isEditingWeights: boolean;
  onEditWeight: (key: string, value: number) => void;
}

export function MatchingCriteria({
  transactionType,
  locationPreferences,
  propertyInterests,
  motivationFactors,
  matchingWeights,
  isEditingWeights,
  onEditWeight
}: MatchingCriteriaProps) {
  return (
    <div className="space-y-4">
      <TransactionTypeSection 
        transactionType={transactionType}
        isEditing={false}
        onEdit={() => {}}
      />
      <LocationPreferencesSection 
        locationPreferences={locationPreferences}
        isEditing={false}
        onEdit={() => {}}
      />
      <PropertyInterestsSection 
        propertyInterests={propertyInterests}
        isEditing={false}
        onEdit={() => {}}
      />
      <MotivationFactorsSection 
        motivationFactors={motivationFactors}
        isEditing={false}
        onEdit={() => {}}
      />
      <MatchingWeightsSection 
        matchingWeights={matchingWeights}
        isEditing={isEditingWeights}
        onEdit={onEditWeight}
      />
    </div>
  );
}
