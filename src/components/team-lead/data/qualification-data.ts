
import { QualificationLead } from '../types/qualification-types';

export const leadsData: QualificationLead[] = [
  { 
    id: 1, 
    name: 'Michael Brown', 
    email: 'michael.b@example.com',
    aiDecision: 'Qualified', 
    qualificationScore: 78,
    income: '$85,000',
    debt: '$1,200/mo',
    creditScore: '720',
    timestamp: '2023-07-18T15:30:00',
    overrideStatus: null
  },
  { 
    id: 2, 
    name: 'Sarah Martinez', 
    email: 'smartinez@example.com',
    aiDecision: 'Needs Review', 
    qualificationScore: 65,
    income: '$65,000',
    debt: '$1,800/mo',
    creditScore: '680',
    timestamp: '2023-07-18T14:15:00',
    overrideStatus: null
  },
  { 
    id: 3, 
    name: 'David Wilson', 
    email: 'dwilson@example.com',
    aiDecision: 'Not Qualified', 
    qualificationScore: 42,
    income: '$55,000',
    debt: '$2,200/mo',
    creditScore: '620',
    timestamp: '2023-07-18T11:45:00',
    overrideStatus: 'Approved'
  },
  { 
    id: 4, 
    name: 'Jennifer Adams', 
    email: 'jadams@example.com',
    aiDecision: 'Qualified', 
    qualificationScore: 88,
    income: '$110,000',
    debt: '$900/mo',
    creditScore: '750',
    timestamp: '2023-07-17T16:20:00',
    overrideStatus: 'Rejected'
  },
  { 
    id: 5, 
    name: 'Robert Chen', 
    email: 'rchen@example.com',
    aiDecision: 'Qualified', 
    qualificationScore: 72,
    income: '$78,000',
    debt: '$1,500/mo',
    creditScore: '700',
    timestamp: '2023-07-17T10:30:00',
    overrideStatus: null
  }
];
