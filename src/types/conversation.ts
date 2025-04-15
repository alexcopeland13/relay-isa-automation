
import { CategoryItem } from '@/data/sampleConversation';

export interface LocationPreferences {
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
}

export interface PropertyInterests {
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
}

export interface MotivationFactors {
  primaryMotivation: CategoryItem;
  urgencyLevel: {
    value: number;
    confidence: number;
    source: 'AI' | 'User' | 'Agent';
    verified: boolean;
  };
  decisionFactors: CategoryItem[];
  potentialObstacles: CategoryItem[];
  confidence: number;
}

export interface TransactionType {
  role: CategoryItem;
  transactionTimeline: CategoryItem;
  financingStatus: CategoryItem;
  firstTimeBuyer: CategoryItem;
  confidence: number;
}

// Empty objects for fallbacks
export const emptyLocationPreferences: LocationPreferences = {
  areasOfInterest: [],
  neighborhoodType: [],
  commuteConsiderations: {
    maxCommuteDuration: 0,
    commuteToLocations: [],
    confidence: 0,
    source: 'AI',
    verified: false
  },
  confidence: 0
};

export const emptyPropertyInterests: PropertyInterests = {
  propertyType: [],
  priceRange: {
    min: 0,
    max: 0,
    confidence: 0,
    source: 'AI',
    verified: false
  },
  sizeRequirements: {
    bedrooms: 0,
    bathrooms: 0,
    squareFootage: {
      min: 0,
      max: 0
    },
    confidence: 0,
    source: 'AI',
    verified: false
  },
  mustHaveFeatures: [],
  dealBreakers: [],
  confidence: 0
};

export const emptyMotivationFactors: MotivationFactors = {
  primaryMotivation: { 
    value: "", 
    confidence: 0, 
    source: 'AI', 
    verified: false 
  },
  urgencyLevel: {
    value: 0,
    confidence: 0,
    source: 'AI',
    verified: false
  },
  decisionFactors: [],
  potentialObstacles: [],
  confidence: 0
};

export const emptyTransactionType: TransactionType = {
  role: { value: "Unknown", confidence: 0.5, source: 'AI', verified: false },
  transactionTimeline: { value: "Unknown", confidence: 0.5, source: 'AI', verified: false },
  financingStatus: { value: "Unknown", confidence: 0.5, source: 'AI', verified: false },
  firstTimeBuyer: { value: "Unknown", confidence: 0.5, source: 'AI', verified: false },
  confidence: 0
};
