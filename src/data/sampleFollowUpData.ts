
// Follow-up types
export interface LeadInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  interestType: string;
  qualificationScore: number;
}

export interface FollowUp {
  id: string;
  leadInfo: LeadInfo;
  scheduledFor: string;
  channel: 'email' | 'phone' | 'sms';
  status: 'pending_approval' | 'approved' | 'completed' | 'declined';
  priority: 'high' | 'medium' | 'low';
  suggestedTemplate: string;
  suggestedContent: string;
  aiReasoning: string;
  assignedTo: string;
  conversationRef: string;
  previousTouchpoints: number;
}

export interface TemplateVariable {
  name: string;
  type: 'text' | 'boolean' | 'conditional' | 'date';
  description: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  channel: 'email' | 'phone' | 'sms';
  category: string;
  subcategory: string;
  content: string;
  variables: string[];
  performanceMetrics: {
    usageCount: number;
    responseRate: number;
    conversionRate: number;
    avgTimeToResponse: string;
  };
  createdAt: string;
  lastModified: string;
  status: 'active' | 'archived' | 'draft';
  tags: string[];
}

export interface SequenceStep {
  id: string;
  delay: string;
  channel: 'email' | 'phone' | 'sms';
  templateId: string;
  conditions: {
    type: string;
    value: string;
  }[];
}

export interface Sequence {
  id: string;
  name: string;
  description: string;
  leadType: string;
  status: 'active' | 'inactive' | 'draft';
  steps: SequenceStep[];
  performanceMetrics: {
    completionRate: number;
    conversionRate: number;
    avgLeadsInSequence: number;
  };
  createdAt: string;
  lastModified: string;
  tags: string[];
}

// Sample follow-ups data
export const sampleFollowUps: FollowUp[] = [
  {
    id: "fu-12345",
    leadInfo: {
      id: "lead-789",
      name: "Michael Johnson",
      email: "michael@example.com",
      phone: "(555) 123-4567",
      interestType: "Mortgage Refinancing",
      qualificationScore: 85
    },
    scheduledFor: "2025-04-08T10:30:00Z",
    channel: "email",
    status: "pending_approval",
    priority: "high",
    suggestedTemplate: "refinance_options_email",
    suggestedContent: "Hello Michael,\n\nThank you for your interest in refinancing options with EMM Loans. Based on our conversation, I've put together some initial options that might help you lower your rate and shorten your term as you mentioned.\n\nI've attached a preliminary estimate showing potential savings with both 15-year and 20-year options.\n\nWould you have 15 minutes this week to discuss these options in more detail? You can book a time directly on my calendar here: [CALENDAR_LINK]\n\nLooking forward to helping you save on your mortgage!\n\nBest regards,\nEMM Loans Team",
    aiReasoning: "Lead expressed strong interest in refinancing to lower rate and shorten term. Has good credit score estimate and significant equity in home based on time in property and location.",
    assignedTo: "unassigned",
    conversationRef: "conv-12345",
    previousTouchpoints: 1
  },
  {
    id: "fu-12346",
    leadInfo: {
      id: "lead-790",
      name: "Sarah Williams",
      email: "sarah@example.com",
      phone: "(555) 987-6543",
      interestType: "Home Purchase",
      qualificationScore: 92
    },
    scheduledFor: "2025-04-08T14:00:00Z",
    channel: "phone",
    status: "pending_approval",
    priority: "medium",
    suggestedTemplate: "pre_approval_call",
    suggestedContent: "Call script: Discuss pre-approval options based on Sarah's excellent credit score and first-time homebuyer status. Explain documentation needed for formal pre-approval. Discuss current rates and how they affect her targeted price range ($350k-$450k). Offer to connect with partner real estate agents if she hasn't selected one yet.",
    aiReasoning: "Lead is beginning home search and needs pre-approval to make competitive offers. Has good financial profile and clear timeline (2-3 months).",
    assignedTo: "unassigned",
    conversationRef: "conv-12346",
    previousTouchpoints: 0
  },
  {
    id: "fu-12347",
    leadInfo: {
      id: "lead-791",
      name: "Robert Brown",
      email: "robert@example.com",
      phone: "(555) 456-7890",
      interestType: "Investment Property",
      qualificationScore: 78
    },
    scheduledFor: "2025-04-09T16:15:00Z",
    channel: "sms",
    status: "pending_approval",
    priority: "low",
    suggestedTemplate: "investment_property_info",
    suggestedContent: "Hi Robert, following up on your interest in investment property financing. I've put together info on our investor loan programs with current rates. Would you prefer I email these details or call to discuss? Either way, I'm here to help! - EMM Loans",
    aiReasoning: "Lead showed interest in investment properties but was in early research phase. SMS is good first follow-up to determine preferred communication channel and gauge continued interest.",
    assignedTo: "unassigned",
    conversationRef: "conv-12347",
    previousTouchpoints: 0
  },
  // More sample data
  {
    id: "fu-12348",
    leadInfo: {
      id: "lead-792",
      name: "Jennifer Adams",
      email: "jennifer@example.com",
      phone: "(555) 222-3333",
      interestType: "Home Equity Line",
      qualificationScore: 88
    },
    scheduledFor: "2025-04-09T11:00:00Z",
    channel: "email",
    status: "approved",
    priority: "high",
    suggestedTemplate: "heloc_options",
    suggestedContent: "Hello Jennifer,\n\nThank you for your interest in a Home Equity Line of Credit with NexusISA. Based on our conversation about your home renovation plans, I've prepared some information about our HELOC options that might suit your needs.\n\nWith current rates and your excellent credit profile, you may qualify for our premium HELOC with the following features:\n\n- Competitive variable rate starting at 6.25%\n- 10-year draw period\n- Flexible payment options\n- No application fee for preferred customers\n\nI'd be happy to discuss these options in more detail. Would Tuesday at 2 PM or Thursday at 10 AM work for a quick call?\n\nBest regards,\nNexusISA Team",
    aiReasoning: "Lead has strong credit and significant equity in home. Expressed specific purpose for funds (kitchen remodel) with clear timeline.",
    assignedTo: "jane.doe@nexusisa.com",
    conversationRef: "conv-12348",
    previousTouchpoints: 1
  },
  {
    id: "fu-12349",
    leadInfo: {
      id: "lead-793",
      name: "David Rodriguez",
      email: "david@example.com",
      phone: "(555) 444-5555",
      interestType: "First-Time Homebuyer",
      qualificationScore: 75
    },
    scheduledFor: "2025-04-10T09:15:00Z",
    channel: "phone",
    status: "completed",
    priority: "medium",
    suggestedTemplate: "first_time_buyer_consultation",
    suggestedContent: "Call script: Introduce first-time homebuyer program benefits, discuss down payment assistance options, review credit requirements and steps to improve score from 680 to 700+. Explain pre-approval process and documentation needed. Offer to connect with financial advisor for savings plan discussion.",
    aiReasoning: "Lead is planning first home purchase in approximately 6 months. Has some credit issues to address and questions about down payment requirements.",
    assignedTo: "john.smith@nexusisa.com",
    conversationRef: "conv-12349",
    previousTouchpoints: 2
  },
  {
    id: "fu-12350",
    leadInfo: {
      id: "lead-794",
      name: "Maria Garcia",
      email: "maria@example.com",
      phone: "(555) 666-7777",
      interestType: "Investment Property",
      qualificationScore: 94
    },
    scheduledFor: "2025-04-10T16:00:00Z",
    channel: "email",
    status: "declined",
    priority: "low",
    suggestedTemplate: "investment_consultation",
    suggestedContent: "Hello Maria,\n\nThank you for your interest in investment property financing through NexusISA. I understand you're looking to expand your portfolio with a multi-unit property.\n\nI've attached information about our investor loan programs specifically designed for experienced investors like yourself, including:\n\n- Portfolio loan options\n- Cash-flow based qualification\n- Reduced documentation requirements\n- Competitive rates for 5+ unit properties\n\nWould you be available for a 20-minute consultation this week to discuss your investment strategy and how we can support your goals?\n\nBest regards,\nNexusISA Team",
    aiReasoning: "Lead is an experienced investor with multiple properties already. Looking specifically for commercial multi-unit financing, which may be better served by our commercial division.",
    assignedTo: "commercial.team@nexusisa.com",
    conversationRef: "conv-12350",
    previousTouchpoints: 1
  }
];

// Sample templates data
export const sampleTemplates: Template[] = [
  {
    id: "template-001",
    name: "Refinance Options Email",
    description: "Initial follow-up for refinance inquiries with good qualification",
    channel: "email",
    category: "Mortgage",
    subcategory: "Refinance",
    content: "Hello {{lead.firstName}},\n\nThank you for your interest in refinancing options with EMM Loans. Based on our conversation, I've put together some initial options that might help you {{if refinanceGoals.lowerRate}}lower your rate{{/if}}{{if refinanceGoals.shortenTerm}} and shorten your term{{/if}}{{if refinanceGoals.cashOut}} and access your home equity{{/if}}.\n\n{{if estimatedCredit == 'Good' || estimatedCredit == 'Excellent'}}I've attached a preliminary estimate showing potential savings with various term options.{{else}}I'd like to discuss some additional information that could help us find the best options for your situation.{{/if}}\n\nWould you have 15 minutes this week to discuss these options in more detail? You can book a time directly on my calendar here: {{calendarLink}}\n\nLooking forward to helping you save on your mortgage!\n\nBest regards,\nEMM Loans Team",
    variables: ["lead.firstName", "refinanceGoals.lowerRate", "refinanceGoals.shortenTerm", "refinanceGoals.cashOut", "estimatedCredit", "calendarLink"],
    performanceMetrics: {
      usageCount: 342,
      responseRate: 68,
      conversionRate: 42,
      avgTimeToResponse: "6 hours"
    },
    createdAt: "2025-01-15T10:00:00Z",
    lastModified: "2025-03-20T14:30:00Z",
    status: "active",
    tags: ["refinance", "email", "high-performer"]
  },
  {
    id: "template-002",
    name: "First-Time Homebuyer - Initial Contact",
    description: "Welcome email for first-time homebuyers with educational resources",
    channel: "email",
    category: "Mortgage",
    subcategory: "Purchase",
    content: "Hello {{lead.firstName}},\n\nThank you for reaching out about buying your first home! It's an exciting journey, and I'm here to help you navigate the process.\n\nI've attached our First-Time Homebuyer Guide which covers:\n- Understanding mortgage pre-approval\n- Down payment options and assistance programs\n- The homebuying timeline\n- Common pitfalls to avoid\n\nI'd love to schedule a brief call to learn more about your homebuying goals and answer any questions. Would {{suggestedDate1}} or {{suggestedDate2}} work for you?\n\nIn the meantime, you might find our mortgage calculator helpful: {{calculatorLink}}\n\nLooking forward to helping you find your first home!\n\nBest regards,\nNexusISA Team",
    variables: ["lead.firstName", "suggestedDate1", "suggestedDate2", "calculatorLink"],
    performanceMetrics: {
      usageCount: 287,
      responseRate: 72,
      conversionRate: 38,
      avgTimeToResponse: "4 hours"
    },
    createdAt: "2025-01-20T14:45:00Z",
    lastModified: "2025-03-18T09:15:00Z",
    status: "active",
    tags: ["purchase", "first-time-buyer", "educational"]
  },
  {
    id: "template-003",
    name: "Investment Property Call Script",
    description: "Phone script for following up with investment property inquiries",
    channel: "phone",
    category: "Mortgage",
    subcategory: "Investment",
    content: "Call Introduction:\n- Greet lead by name\n- Reference their inquiry about investment property financing\n- Confirm it's a good time to talk (if not, schedule callback)\n\nKey Discussion Points:\n1. Type of investment property they're interested in (single-family, multi-unit, commercial)\n2. Their experience level with investment properties\n3. Timeline for purchase\n4. Expected down payment availability (note: typically 25%+ for investment properties)\n5. Discuss current rates for investment properties\n\nNext Steps:\n- If qualified, offer to send pre-approval application\n- If experienced investor, mention portfolio loan programs\n- Schedule follow-up call or meeting\n- Send follow-up email with relevant programs\n\nClosing:\n- Thank them for their time\n- Provide direct contact information\n- Set clear expectations for next communication",
    variables: ["lead.firstName", "lead.investmentType", "lead.experienceLevel"],
    performanceMetrics: {
      usageCount: 142,
      responseRate: 65,
      conversionRate: 31,
      avgTimeToResponse: "immediate"
    },
    createdAt: "2025-02-05T11:30:00Z",
    lastModified: "2025-03-10T16:20:00Z",
    status: "active",
    tags: ["investment", "phone-script", "experienced-investors"]
  },
  {
    id: "template-004",
    name: "Rate Alert SMS",
    description: "SMS notification for rate drops relevant to interested clients",
    channel: "sms",
    category: "Notifications",
    subcategory: "Rate Alerts",
    content: "NexusISA Alert: Rates have dropped to {{currentRate}}% for {{loanType}}! Based on your previous inquiry, this could save you approximately {{estimatedSavings}}/month. Interested in discussing? Reply YES for a call back or visit {{shortenedLink}} for details.",
    variables: ["currentRate", "loanType", "estimatedSavings", "shortenedLink"],
    performanceMetrics: {
      usageCount: 523,
      responseRate: 42,
      conversionRate: 28,
      avgTimeToResponse: "45 minutes"
    },
    createdAt: "2025-01-10T09:00:00Z",
    lastModified: "2025-03-22T10:10:00Z",
    status: "active",
    tags: ["rates", "sms", "quick-response"]
  },
  {
    id: "template-005",
    name: "Document Request Email",
    description: "Formal request for documentation needed for loan application",
    channel: "email",
    category: "Process",
    subcategory: "Documentation",
    content: "Hello {{lead.firstName}},\n\nThank you for beginning your {{loanType}} application with NexusISA. To proceed with your application, we'll need the following documentation:\n\n{{if employed}}• Last 2 pay stubs\n• Last 2 years W-2s\n• Last 2 years tax returns{{/if}}\n{{if selfEmployed}}• Last 2 years personal tax returns\n• Last 2 years business tax returns\n• Year-to-date profit and loss statement{{/if}}\n• Last 2 months bank statements for all accounts\n• Copy of government-issued ID\n{{if refinance}}• Current mortgage statement\n• Homeowners insurance declaration{{/if}}\n\nYou can securely upload these documents through our portal at: {{portalLink}}\n\nIf you have any questions about these requirements, please don't hesitate to contact me directly at {{agentPhone}}.\n\nBest regards,\n{{agentName}}\nNexusISA Team",
    variables: ["lead.firstName", "loanType", "employed", "selfEmployed", "refinance", "portalLink", "agentPhone", "agentName"],
    performanceMetrics: {
      usageCount: 876,
      responseRate: 91,
      conversionRate: 84,
      avgTimeToResponse: "18 hours"
    },
    createdAt: "2025-01-05T13:15:00Z",
    lastModified: "2025-02-28T09:45:00Z",
    status: "active",
    tags: ["documentation", "process", "high-importance"]
  }
];

// Sample sequences data
export const sampleSequences: Sequence[] = [
  {
    id: "sequence-001",
    name: "Refinance Nurture - 30 Day",
    description: "Multi-touch sequence for refinance leads over 30 days",
    leadType: "Refinance",
    status: "active",
    steps: [
      {
        id: "step-1",
        delay: "0 days",
        channel: "email",
        templateId: "template-001",
        conditions: []
      },
      {
        id: "step-2",
        delay: "3 days",
        channel: "phone",
        templateId: "template-005",
        conditions: [
          {
            type: "no_response",
            value: "step-1"
          }
        ]
      },
      {
        id: "step-3",
        delay: "7 days",
        channel: "email",
        templateId: "template-008",
        conditions: [
          {
            type: "no_response",
            value: "step-2"
          }
        ]
      },
      {
        id: "step-4",
        delay: "14 days",
        channel: "sms",
        templateId: "template-004",
        conditions: [
          {
            type: "no_response",
            value: "step-3"
          }
        ]
      },
      {
        id: "step-5",
        delay: "21 days",
        channel: "email",
        templateId: "template-010",
        conditions: [
          {
            type: "no_response",
            value: "step-4"
          }
        ]
      },
      {
        id: "step-6",
        delay: "28 days",
        channel: "phone",
        templateId: "template-011",
        conditions: [
          {
            type: "no_response",
            value: "step-5"
          }
        ]
      }
    ],
    performanceMetrics: {
      completionRate: 72,
      conversionRate: 38,
      avgLeadsInSequence: 45
    },
    createdAt: "2025-02-01T10:00:00Z",
    lastModified: "2025-03-15T11:20:00Z",
    tags: ["refinance", "high-performer", "multi-channel"]
  },
  {
    id: "sequence-002",
    name: "First-Time Homebuyer Education",
    description: "Educational sequence for first-time homebuyers",
    leadType: "Purchase - First Time",
    status: "active",
    steps: [
      {
        id: "step-1",
        delay: "0 days",
        channel: "email",
        templateId: "template-002",
        conditions: []
      },
      {
        id: "step-2",
        delay: "5 days",
        channel: "email",
        templateId: "template-015",
        conditions: []
      },
      {
        id: "step-3",
        delay: "10 days",
        channel: "email",
        templateId: "template-016",
        conditions: []
      },
      {
        id: "step-4",
        delay: "15 days",
        channel: "phone",
        templateId: "template-017",
        conditions: []
      },
      {
        id: "step-5",
        delay: "22 days",
        channel: "email",
        templateId: "template-018",
        conditions: []
      },
      {
        id: "step-6",
        delay: "30 days",
        channel: "email",
        templateId: "template-019",
        conditions: [
          {
            type: "no_application",
            value: "all"
          }
        ]
      }
    ],
    performanceMetrics: {
      completionRate: 84,
      conversionRate: 45,
      avgLeadsInSequence: 63
    },
    createdAt: "2025-01-15T09:30:00Z",
    lastModified: "2025-03-10T14:15:00Z",
    tags: ["first-time-buyer", "educational", "high-engagement"]
  },
  {
    id: "sequence-003",
    name: "Investment Property Fast-Track",
    description: "Accelerated sequence for qualified investment property leads",
    leadType: "Investment",
    status: "active",
    steps: [
      {
        id: "step-1",
        delay: "0 days",
        channel: "phone",
        templateId: "template-003",
        conditions: []
      },
      {
        id: "step-2",
        delay: "1 day",
        channel: "email",
        templateId: "template-020",
        conditions: [
          {
            type: "contacted",
            value: "step-1"
          }
        ]
      },
      {
        id: "step-3",
        delay: "1 day",
        channel: "email",
        templateId: "template-021",
        conditions: [
          {
            type: "not_contacted",
            value: "step-1"
          }
        ]
      },
      {
        id: "step-4",
        delay: "3 days",
        channel: "phone",
        templateId: "template-022",
        conditions: [
          {
            type: "no_response",
            value: "step-2"
          }
        ]
      },
      {
        id: "step-5",
        delay: "7 days",
        channel: "email",
        templateId: "template-023",
        conditions: [
          {
            type: "no_application",
            value: "all"
          }
        ]
      }
    ],
    performanceMetrics: {
      completionRate: 68,
      conversionRate: 52,
      avgLeadsInSequence: 28
    },
    createdAt: "2025-02-10T11:45:00Z",
    lastModified: "2025-03-18T16:30:00Z",
    tags: ["investment", "fast-track", "high-conversion"]
  }
];
