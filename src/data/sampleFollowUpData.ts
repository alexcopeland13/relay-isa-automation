
// Define the MessageTemplate type
export interface MessageTemplate {
  id: string;
  title: string;
  description: string;
  channel: 'email' | 'sms' | 'phone';
  subject?: string;
  content: string;
  category: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  author: string;
  usage: number;
}

// Sample templates data
export const sampleTemplates = [
  {
    id: 'template-1',
    name: 'Initial Follow-up',
    description: 'For following up with a lead after first contact',
    channel: 'email',
    subject: 'Following up on our conversation',
    content: 'Hi {{leadName}},\n\nThank you for taking the time to discuss your mortgage needs with us. As promised, I wanted to follow up with some additional information.\n\nBased on our conversation, I believe we can help you with your {{interestType}}. Would you be available for a quick call this week to discuss next steps?\n\nBest regards,\n{{agentName}}\n{{companyName}}',
    category: 'follow-up',
    variables: ['leadName', 'interestType', 'agentName', 'companyName'],
  },
  {
    id: 'template-2',
    name: 'Rate Change Alert',
    description: 'Alert clients about rate changes that may benefit them',
    channel: 'email',
    subject: 'Interest Rate Update - Time Sensitive Opportunity',
    content: 'Hello {{leadName}},\n\nI wanted to reach out because there has been a significant change in mortgage rates that might benefit you. With rates now at {{interestRate}}, this could be an excellent opportunity to consider {{interestType}}.\n\nI've run some preliminary numbers, and you could potentially save {{monthlySavings}} per month with a new loan of {{loanAmount}}.\n\nWould you like to discuss this opportunity in more detail?\n\nBest regards,\n{{agentName}}\n{{companyName}}',
    category: 'offer',
    variables: ['leadName', 'interestRate', 'interestType', 'monthlySavings', 'loanAmount', 'agentName', 'companyName'],
  },
  {
    id: 'template-3',
    name: 'Quick SMS Check-in',
    description: 'Brief SMS to check in with leads',
    channel: 'sms',
    content: 'Hi {{leadName}}, this is {{agentName}} from NexusISA. Just checking in about your mortgage inquiry. Do you have any questions I can help with? Let me know!',
    category: 'follow-up',
    variables: ['leadName', 'agentName'],
  },
  {
    id: 'template-4',
    name: 'Pre-approval Completed',
    description: 'Notifying clients their pre-approval is complete',
    channel: 'email',
    subject: 'Your Mortgage Pre-Approval is Complete',
    content: 'Hello {{leadName}},\n\nGreat news! I'm pleased to inform you that your mortgage pre-approval has been completed. You are pre-approved for a loan amount of up to {{loanAmount}}.\n\nThis pre-approval is valid for 90 days, giving you time to find the perfect {{propertyType}}.\n\nI've attached the pre-approval letter to this email. Please let me know if you have any questions or if you'd like to discuss next steps.\n\nBest regards,\n{{agentName}}\n{{companyName}}',
    category: 'announcement',
    variables: ['leadName', 'loanAmount', 'propertyType', 'agentName', 'companyName'],
  },
  {
    id: 'template-5',
    name: 'Initial Call Script',
    description: 'Script for first call with a new lead',
    channel: 'phone',
    content: 'Introduction:\n- Hello, may I speak with {{leadName}}?\n- This is {{agentName}} calling from {{companyName}}. I'm following up on your recent inquiry about {{interestType}}.\n\nQualification Questions:\n- Is now a good time for a quick 5-minute conversation?\n- Could you tell me a bit more about what you're looking for in a mortgage?\n- Have you been pre-approved for a mortgage before?\n- What's your timeframe for {{interestType}}?\n\nClose:\n- Based on what you've shared, I think we can definitely help you with {{interestType}}.\n- The next step would be to schedule a more detailed consultation. Would you prefer a phone call, video call, or in-person meeting?\n- Great, I'll send you a calendar invite and an email with some information to review before our meeting.\n- Do you have any questions for me before we wrap up?',
    category: 'introduction',
    variables: ['leadName', 'agentName', 'companyName', 'interestType'],
  }
];

// Define other necessary types for follow-ups
export interface Template {
  id: string;
  name: string;
  description: string;
  channel: string;
  subject?: string;
  content: string;
  category: string;
  variables: string[];
}

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
