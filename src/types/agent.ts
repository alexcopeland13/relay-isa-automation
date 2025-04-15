
export interface Agent {
  id: string;
  name: string;
  email: string;
  phone?: string;
  specializations: string[];
  availability: 'High' | 'Medium' | 'Low';
  photoUrl?: string;
  title?: string;
  matchScore?: number;
  activeLeads?: number;
  location?: string;
  status?: 'Active' | 'Inactive';
  agency?: string;
  areas?: string[];
  successRate?: number;
  yearsOfExperience?: number;
  activeListings?: number;
  clientTypes?: string[];
  languages?: string[];
  certifications?: string[];
  showingCompletionRate?: number;
  clientSatisfaction?: number;
  avgResponseTime?: number;
  conversionRate?: number;
  leadsAssigned?: number;
  showingsThisMonth?: number;
  licenseNumber?: string;
  bio?: string;
}
