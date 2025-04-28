
export type LeadOverrideStatus = 'Approved' | 'Rejected' | null;

export type QualificationDecision = 'Qualified' | 'Not Qualified' | 'Needs Review';

export interface QualificationLead {
  id: number;
  name: string;
  email: string;
  aiDecision: QualificationDecision;
  qualificationScore: number;
  income: string;
  debt: string;
  creditScore: string;
  timestamp: string;
  overrideStatus: LeadOverrideStatus;
}
