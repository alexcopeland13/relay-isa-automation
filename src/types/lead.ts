
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
}
