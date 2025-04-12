
export interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  photoUrl?: string;
  agency: string;
  licenseNumber: string;
  yearsOfExperience: number;
  bio: string;
  status: "Active" | "Inactive";
  
  // Specializations
  specializations: string[];
  areas: string[];
  clientTypes: string[];
  languages: string[];
  certifications: string[];
  
  // Performance metrics
  successRate: number;
  showingCompletionRate: number;
  clientSatisfaction: number;
  avgResponseTime: number;
  conversionRate: number;
  activeListings: number;
  leadsAssigned: number;
  showingsThisMonth: number;
  
  // Availability
  availability?: {
    day: string;
    slots: string[];
  }[];
  timeOff?: {
    date: Date;
    reason: string;
  }[];
}
