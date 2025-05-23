
export interface ShowingRequest {
  id: string;
  property_address: string;
  mls_number?: string;
  showing_date: string;
  showing_time: string;
  duration: number;
  payout_amount: number;
  client_name: string;
  client_phone: string;
  client_type: 'individual' | 'couple' | 'family';
  special_instructions?: string;
  status: 'available' | 'claimed' | 'completed' | 'cancelled';
  requesting_agent_id: string;
  showing_agent_id?: string;
  preferred_agent_email?: string;
  urgency_level: 'normal' | 'urgent' | 'emergency';
  location_lat?: number;
  location_lng?: number;
  created_at: string;
  updated_at: string;
}

export interface FilterOptions {
  dateRange?: {
    start: string;
    end: string;
  };
  payoutRange?: {
    min: number;
    max: number;
  };
  distance?: number;
  urgencyLevel?: string[];
  hideClaimed?: boolean;
}

export interface SortOption {
  field: 'payout_amount' | 'showing_date' | 'created_at' | 'distance';
  direction: 'asc' | 'desc';
}

export interface Payout {
  id: string;
  showing_id: string;
  agent_id: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  stripe_payment_id?: string;
  created_at: string;
}

export interface ShowingRating {
  id: string;
  showing_id: string;
  rating: number;
  comment?: string;
  created_by: string;
  created_at: string;
}
