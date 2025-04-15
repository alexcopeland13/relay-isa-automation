
export interface Agent {
  id: string;
  name: string;
  email: string;
  phone?: string;
  specializations: string[];
  areas?: string[];
  yearsOfExperience?: number;
  successRate?: number;
  activeListings?: number;
  status?: 'Active' | 'Inactive';
  agency?: string;
  availability?: 'High' | 'Medium' | 'Low';
  photoUrl?: string;
  title?: string;
  matchScore?: number;
  activeLeads?: number;
  location?: string;
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
  rating?: number;
}
