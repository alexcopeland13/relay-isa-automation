
export interface Agent {
  id: string;
  name: string;
  email: string;
  specializations?: string[];
  availability: 'High' | 'Medium' | 'Low';
  photoUrl?: string;
  title?: string;
  matchScore?: number;
  activeLeads?: number;
  location?: string;
}
