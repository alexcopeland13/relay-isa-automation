
export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Converted' | 'Lost';
  source: string;
  createdAt: string;
  lastContact: string;
  assignedTo: string;
  type: 'Mortgage' | 'Realtor';
  interestType: string;
  location: string;
  score: number;
  notes?: string;
  qualification_data?: QualificationData[];
  conversations?: Conversation[];
}

export interface QualificationData {
  id: string;
  created_at: string;
  lead_id: string;
  conversation_id?: string;
  loan_type?: string;
  property_type?: string;
  property_use?: string;
  estimated_credit_score?: string;
  annual_income?: number;
  is_self_employed?: boolean;
  has_co_borrower?: boolean;
  down_payment_percentage?: number;
  loan_amount?: number;
  debt_to_income_ratio?: number;
  time_frame?: string;
  qualifying_notes?: string;
}

export interface Conversation {
  id: string;
  created_at: string;
  lead_id: string;
  agent_id?: string;
  call_sid?: string;
  direction?: string;
  duration?: number;
  recording_url?: string;
  transcript?: string;
  sentiment_score?: number;
}
