
// Define the MessageTemplate type
export interface MessageTemplate {
  id: string;
  title: string;
  name?: string; // For backward compatibility
  description: string;
  channel: 'email' | 'sms' | 'phone';
  subject?: string;
  content: string;
  category: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  author: string; // Added to match the mock data
  usage: number;
  variables?: string[];
  performanceMetrics?: {
    openRate: number;
    clickRate: number;
    responseRate: number;
    conversionRate?: number;
    usageCount?: number;
  };
}

// Define the Sequence type
export interface Sequence {
  id: string;
  name: string;
  description: string;
  steps: SequenceStep[];
  createdAt: string;
  updatedAt: string;
  lastModified: string;
  isActive: boolean;
  status: 'active' | 'inactive' | 'draft';
  targetAudience?: string;
  leadType: string;
  tags: string[];
  performance?: {
    opened: number;
    clicked: number;
    responded: number;
    converted: number;
  };
  performanceMetrics: {
    completionRate: number;
    conversionRate: number;
    avgLeadsInSequence: number;
  };
}

export interface SequenceStep {
  id: string;
  order: number;
  templateId: string;
  channel: 'email' | 'sms' | 'phone';
  delay: {
    value: number;
    unit: 'hours' | 'days' | 'weeks';
  };
  conditions: {
    type: 'if_no_response' | 'if_clicked' | 'if_opened' | 'always';
    value?: any;
  }[];
}

// Sample templates data
export const sampleTemplates: MessageTemplate[] = [
  {
    id: 'template-1',
    title: 'Initial Follow-up',
    name: 'Initial Follow-up', // For compatibility
    description: 'For following up with a lead after first contact',
    channel: 'email',
    subject: 'Following up on our conversation',
    content: 'Hi {{leadName}},\n\nThank you for taking the time to discuss your mortgage needs with us. As promised, I wanted to follow up with some additional information.\n\nBased on our conversation, I believe we can help you with your {{interestType}}. Would you be available for a quick call this week to discuss next steps?\n\nBest regards,\n{{agentName}}\n{{companyName}}',
    category: 'follow-up',
    variables: ['leadName', 'interestType', 'agentName', 'companyName'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    author: 'System',
    usage: 0,
    tags: ['initial', 'follow-up'],
    performanceMetrics: {
      openRate: 68,
      clickRate: 42,
      responseRate: 27,
      conversionRate: 15,
      usageCount: 42
    }
  },
  {
    id: 'template-2',
    title: 'Rate Change Alert',
    name: 'Rate Change Alert', // For compatibility
    description: 'Alert clients about rate changes that may benefit them',
    channel: 'email',
    subject: 'Interest Rate Update - Time Sensitive Opportunity',
    content: 'Hello {{leadName}},\n\nI wanted to reach out because there has been a significant change in mortgage rates that might benefit you. With rates now at {{interestRate}}, this could be an excellent opportunity to consider {{interestType}}.\n\nI have run some preliminary numbers, and you could potentially save {{monthlySavings}} per month with a new loan of {{loanAmount}}.\n\nWould you like to discuss this opportunity in more detail?\n\nBest regards,\n{{agentName}}\n{{companyName}}',
    category: 'offer',
    variables: ['leadName', 'interestRate', 'interestType', 'monthlySavings', 'loanAmount', 'agentName', 'companyName'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    author: 'System',
    usage: 0,
    tags: ['rate', 'offer'],
    performanceMetrics: {
      openRate: 72,
      clickRate: 45,
      responseRate: 31,
      conversionRate: 18,
      usageCount: 36
    }
  },
  {
    id: 'template-3',
    title: 'Quick SMS Check-in',
    name: 'Quick SMS Check-in', // For compatibility
    description: 'Brief SMS to check in with leads',
    channel: 'sms',
    content: 'Hi {{leadName}}, this is {{agentName}} from NexusISA. Just checking in about your mortgage inquiry. Do you have any questions I can help with? Let me know!',
    category: 'follow-up',
    variables: ['leadName', 'agentName'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    author: 'System',
    usage: 0,
    tags: ['sms', 'check-in'],
    performanceMetrics: {
      openRate: 95,
      clickRate: 0,
      responseRate: 42,
      conversionRate: 22,
      usageCount: 58
    }
  },
  {
    id: 'template-4',
    title: 'Pre-approval Completed',
    name: 'Pre-approval Completed', // For compatibility
    description: 'Notifying clients their pre-approval is complete',
    channel: 'email',
    subject: 'Your Mortgage Pre-Approval is Complete',
    content: 'Hello {{leadName}},\n\nGreat news! I am pleased to inform you that your mortgage pre-approval has been completed. You are pre-approved for a loan amount of up to {{loanAmount}}.\n\nThis pre-approval is valid for 90 days, giving you time to find the perfect {{propertyType}}.\n\nI have attached the pre-approval letter to this email. Please let me know if you have any questions or if you would like to discuss next steps.\n\nBest regards,\n{{agentName}}\n{{companyName}}',
    category: 'announcement',
    variables: ['leadName', 'loanAmount', 'propertyType', 'agentName', 'companyName'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    author: 'System',
    usage: 0,
    tags: ['pre-approval', 'announcement'],
    performanceMetrics: {
      openRate: 88,
      clickRate: 62,
      responseRate: 53,
      conversionRate: 32,
      usageCount: 45
    }
  },
  {
    id: 'template-5',
    title: 'Initial Call Script',
    name: 'Initial Call Script', // For compatibility
    description: 'Script for first call with a new lead',
    channel: 'phone',
    content: 'Introduction:\n- Hello, may I speak with {{leadName}}?\n- This is {{agentName}} calling from {{companyName}}. I am following up on your recent inquiry about {{interestType}}.\n\nQualification Questions:\n- Is now a good time for a quick 5-minute conversation?\n- Could you tell me a bit more about what you are looking for in a mortgage?\n- Have you been pre-approved for a mortgage before?\n- What is your timeframe for {{interestType}}?\n\nClose:\n- Based on what you have shared, I think we can definitely help you with {{interestType}}.\n- The next step would be to schedule a more detailed consultation. Would you prefer a phone call, video call, or in-person meeting?\n- Great, I will send you a calendar invite and an email with some information to review before our meeting.\n- Do you have any questions for me before we wrap up?',
    category: 'introduction',
    variables: ['leadName', 'agentName', 'companyName', 'interestType'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    author: 'System',
    usage: 0,
    tags: ['phone', 'introduction'],
    performanceMetrics: {
      openRate: 100,
      clickRate: 0,
      responseRate: 75,
      conversionRate: 45,
      usageCount: 32
    }
  }
];

// Sample sequences data
export const sampleSequences: Sequence[] = [
  {
    id: 'sequence-1',
    name: 'First-time Homebuyer Sequence',
    description: 'Engagement series for first-time homebuyers to educate and convert',
    steps: [
      {
        id: 'step-001',
        order: 1,
        templateId: 'template-1',
        channel: 'email',
        delay: {
          value: 0,
          unit: 'hours'
        },
        conditions: []
      },
      {
        id: 'step-002',
        order: 2,
        templateId: 'template-3',
        channel: 'sms',
        delay: {
          value: 2,
          unit: 'days'
        },
        conditions: [
          {
            type: 'if_no_response',
            value: 'step-001'
          }
        ]
      },
      {
        id: 'step-003',
        order: 3,
        templateId: 'template-5',
        channel: 'phone',
        delay: {
          value: 1,
          unit: 'weeks'
        },
        conditions: [
          {
            type: 'if_no_response',
            value: 'step-002'
          }
        ]
      }
    ],
    createdAt: '2023-04-15T10:00:00Z',
    updatedAt: '2023-05-20T14:30:00Z',
    lastModified: '2023-05-20T14:30:00Z',
    isActive: true,
    status: 'active',
    leadType: 'First-Time Buyer',
    tags: ['first-time', 'education', 'conversion'],
    performanceMetrics: {
      completionRate: 68,
      conversionRate: 32,
      avgLeadsInSequence: 45
    }
  },
  {
    id: 'sequence-2',
    name: 'Refinance Opportunity',
    description: 'Sequence for leads interested in refinancing their current mortgage',
    steps: [
      {
        id: 'step-004',
        order: 1,
        templateId: 'template-2',
        channel: 'email',
        delay: {
          value: 0,
          unit: 'hours'
        },
        conditions: []
      },
      {
        id: 'step-005',
        order: 2,
        templateId: 'template-3',
        channel: 'sms',
        delay: {
          value: 3,
          unit: 'days'
        },
        conditions: [
          {
            type: 'if_opened',
            value: 'step-004'
          }
        ]
      }
    ],
    createdAt: '2023-06-10T09:15:00Z',
    updatedAt: '2023-06-25T11:45:00Z',
    lastModified: '2023-06-25T11:45:00Z',
    isActive: true,
    status: 'active',
    leadType: 'Refinance',
    tags: ['refinance', 'rate-change', 'savings'],
    performanceMetrics: {
      completionRate: 75,
      conversionRate: 38,
      avgLeadsInSequence: 32
    }
  },
  {
    id: 'sequence-3',
    name: 'Investment Property Buyers',
    description: 'Sequence for real estate investors seeking mortgage options',
    steps: [
      {
        id: 'step-006',
        order: 1,
        templateId: 'template-1',
        channel: 'email',
        delay: {
          value: 0,
          unit: 'hours'
        },
        conditions: []
      }
    ],
    createdAt: '2023-07-05T13:20:00Z',
    updatedAt: '2023-07-05T13:20:00Z',
    lastModified: '2023-07-05T13:20:00Z',
    isActive: false,
    status: 'draft',
    leadType: 'Investor',
    tags: ['investment', 'multi-property', 'commercial'],
    performanceMetrics: {
      completionRate: 0,
      conversionRate: 0,
      avgLeadsInSequence: 0
    }
  }
];

// Define Template interface
export interface Template {
  id: string;
  name: string;
  description: string;
  channel: string;
  subject?: string;
  content: string;
  category: string;
  variables: string[];
  performanceMetrics?: {
    openRate: number;
    clickRate: number;
    responseRate: number;
    conversionRate?: number;
    usageCount?: number;
  };
}

// Define FollowUp interface
export interface FollowUp {
  id: string;
  leadId: string;
  leadInfo: {
    name: string;
    email: string;
    phone: string;
    interestType: string;
    qualificationScore: string;
  };
  channel: 'email' | 'phone' | 'sms';
  status: 'pending' | 'approved' | 'declined' | 'completed' | 'scheduled';
  priority: 'high' | 'medium' | 'low';
  scheduledFor: string;
  suggestedContent: string;
  suggestedTemplate: string;
  assignedTo: string;
  aiReasoning: string;
  createdAt: string;
  lastUpdated: string;
}

// Sample follow-ups data
export const sampleFollowUps: FollowUp[] = [
  {
    id: "followup-1",
    leadId: "lead-001",
    leadInfo: {
      name: "John Smith",
      email: "john.smith@example.com",
      phone: "(555) 123-4567",
      interestType: "First-time home buyer",
      qualificationScore: "High"
    },
    channel: "email",
    status: "pending",
    priority: "high",
    scheduledFor: "2023-05-15T10:00:00Z",
    suggestedContent: "Hi John, I wanted to follow up on our conversation about first-time home buying options. Do you have time this week to discuss the pre-approval process?",
    suggestedTemplate: "template-1",
    assignedTo: "agent-1",
    aiReasoning: "Lead showed high interest in pre-approval process during initial call",
    createdAt: "2023-05-12T14:30:00Z",
    lastUpdated: "2023-05-12T14:30:00Z"
  },
  {
    id: "followup-2",
    leadId: "lead-002",
    leadInfo: {
      name: "Sarah Johnson",
      email: "sarah.j@example.com",
      phone: "(555) 234-5678",
      interestType: "Refinance",
      qualificationScore: "Medium"
    },
    channel: "phone",
    status: "approved",
    priority: "medium",
    scheduledFor: "2023-05-16T15:30:00Z",
    suggestedContent: "Call Sarah to discuss the current refinance rates and how they compare to her existing mortgage.",
    suggestedTemplate: "template-5",
    assignedTo: "agent-2",
    aiReasoning: "Lead inquired about refinance rates but hasn't responded to email",
    createdAt: "2023-05-13T09:45:00Z",
    lastUpdated: "2023-05-14T11:20:00Z"
  },
  {
    id: "followup-3",
    leadId: "lead-003",
    leadInfo: {
      name: "Michael Chen",
      email: "m.chen@example.com",
      phone: "(555) 345-6789",
      interestType: "Investment property",
      qualificationScore: "High"
    },
    channel: "sms",
    status: "completed",
    priority: "high",
    scheduledFor: "2023-05-14T13:00:00Z",
    suggestedContent: "Hi Michael, just checking in about the investment property options we discussed. Let me know if you have any questions!",
    suggestedTemplate: "template-3",
    assignedTo: "agent-3",
    aiReasoning: "Lead has been actively engaged but prefers quick communications",
    createdAt: "2023-05-12T16:20:00Z",
    lastUpdated: "2023-05-14T13:05:00Z"
  }
];
