
export interface Highlight {
  type: string;
  text: string;
  confidence: number;
}

export interface Message {
  speaker: 'AI' | 'Lead';
  text: string;
  timestamp: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  highlights?: Highlight[];
}

export interface ExtractedInfo {
  propertyInfo: {
    currentMortgage: string;
    currentTerm: string;
    estimatedValue: string;
    location: string;
    confidence: number;
  };
  refinanceGoals: {
    lowerRate: boolean;
    cashOut: boolean;
    shortenTerm: boolean;
    confidence: number;
  };
  timeline: {
    urgency: string;
    lookingToDecide: string;
    confidence: number;
  };
  financialInfo: {
    estimatedCredit: string;
    hasOtherDebts: boolean;
    confidence: number;
  };
  qualification: {
    status: string;
    confidenceScore: number;
    reasoning: string;
  };
}

export interface SuggestedAction {
  type: string;
  channel?: string;
  scheduledFor?: string;
  template?: string;
  content: string;
  reasoning: string;
  status: string;
  assignedTo?: string;
  priority?: string;
}

export interface AIPerformance {
  informationGathering: number;
  leadEngagement: number;
  qualificationAccuracy: number;
  actionRecommendation: number;
}

export interface Conversation {
  id: string;
  leadInfo: {
    name: string;
    email: string;
    phone: string;
    source: string;
  };
  timestamp: string;
  duration: string;
  type: string;
  messages: Message[];
  extractedInfo: ExtractedInfo;
  suggestedActions: SuggestedAction[];
  aiPerformance: AIPerformance;
}

export const sampleConversation: Conversation = {
  id: "conv-12345",
  leadInfo: {
    name: "Michael Johnson",
    email: "michael@example.com",
    phone: "(555) 123-4567",
    source: "Website Form"
  },
  timestamp: "2025-04-06T14:30:00Z",
  duration: "8m 42s",
  type: "Inbound Call",
  messages: [
    {
      speaker: "AI",
      text: "Thank you for contacting EMM Loans. This is Sarah with EMM. How can I help you today?",
      timestamp: "14:30:05",
      sentiment: "neutral"
    },
    {
      speaker: "Lead",
      text: "Hi, I'm looking to refinance my home. I saw your rates online and wanted to get more information.",
      timestamp: "14:30:15",
      sentiment: "positive",
      highlights: [
        { type: "interest", text: "refinance my home", confidence: 0.98 }
      ]
    },
    {
      speaker: "AI",
      text: "I'd be happy to help you with refinancing. To better understand your needs, may I ask a few questions about your current mortgage?",
      timestamp: "14:30:32",
      sentiment: "positive"
    },
    {
      speaker: "Lead",
      text: "Sure, that's fine.",
      timestamp: "14:30:38",
      sentiment: "neutral"
    },
    {
      speaker: "AI",
      text: "Great. First, how long have you had your current mortgage?",
      timestamp: "14:30:45",
      sentiment: "neutral"
    },
    {
      speaker: "Lead",
      text: "We've had it for about 6 years now. It's a 30-year fixed at 4.5%.",
      timestamp: "14:30:58",
      sentiment: "neutral",
      highlights: [
        { type: "mortgage_info", text: "6 years", confidence: 0.95 },
        { type: "mortgage_info", text: "30-year fixed at 4.5%", confidence: 0.97 }
      ]
    },
    {
      speaker: "AI",
      text: "Thank you for sharing that information. Do you happen to know the approximate current value of your home?",
      timestamp: "14:31:15",
      sentiment: "neutral"
    },
    {
      speaker: "Lead",
      text: "Based on similar homes in our neighborhood, I'd estimate around $425,000. We bought it for $380,000.",
      timestamp: "14:31:30",
      sentiment: "positive",
      highlights: [
        { type: "property_value", text: "$425,000", confidence: 0.96 },
        { type: "purchase_info", text: "$380,000", confidence: 0.95 }
      ]
    },
    {
      speaker: "AI",
      text: "That's helpful to know. What are your primary goals for refinancing? Are you looking to lower your interest rate, change your term, or perhaps take cash out?",
      timestamp: "14:31:48",
      sentiment: "positive"
    },
    {
      speaker: "Lead",
      text: "I'm mainly interested in lowering my rate and possibly shortening the term to a 15 or 20-year. I'm not looking to take cash out at this time.",
      timestamp: "14:32:10",
      sentiment: "positive",
      highlights: [
        { type: "refinance_goal", text: "lowering my rate", confidence: 0.94 },
        { type: "refinance_goal", text: "shortening the term to a 15 or 20-year", confidence: 0.96 },
        { type: "refinance_goal", text: "not looking to take cash out", confidence: 0.93 }
      ]
    },
    {
      speaker: "AI",
      text: "Perfect. Those are excellent goals, and with today's rates, we might be able to help you achieve both. May I ask about the general location of your property?",
      timestamp: "14:32:35",
      sentiment: "positive"
    },
    {
      speaker: "Lead",
      text: "We're in Denver, Colorado. Southeast part of the city.",
      timestamp: "14:32:45",
      sentiment: "neutral",
      highlights: [
        { type: "location", text: "Denver, Colorado", confidence: 0.98 }
      ]
    },
    {
      speaker: "AI",
      text: "Great, thank you. Do you have a specific timeline in mind for when you'd like to complete this refinance?",
      timestamp: "14:33:00",
      sentiment: "neutral"
    },
    {
      speaker: "Lead",
      text: "I'm not in a huge rush, but I'd like to move forward in the next month or two if the rates make sense for us.",
      timestamp: "14:33:15",
      sentiment: "neutral",
      highlights: [
        { type: "timeline", text: "next month or two", confidence: 0.91 }
      ]
    },
    {
      speaker: "AI",
      text: "That's a reasonable timeline. To help us find the best options for you, could you share some information about your credit score range? Are you generally in the excellent, good, or fair range?",
      timestamp: "14:33:35",
      sentiment: "neutral"
    },
    {
      speaker: "Lead",
      text: "Last I checked, it was around 735, so I think that's in the good range.",
      timestamp: "14:33:48",
      sentiment: "positive",
      highlights: [
        { type: "credit_score", text: "around 735", confidence: 0.97 }
      ]
    },
    {
      speaker: "AI",
      text: "That's definitely in the good range, which opens up many favorable options for you. One last question: besides your mortgage, do you have other significant debts like auto loans or student loans?",
      timestamp: "14:34:10",
      sentiment: "positive"
    },
    {
      speaker: "Lead",
      text: "Yes, we have one car loan with about $15,000 left and I still have some student loans, probably around $20,000 total.",
      timestamp: "14:34:28",
      sentiment: "neutral",
      highlights: [
        { type: "debt", text: "car loan with about $15,000", confidence: 0.95 },
        { type: "debt", text: "student loans, probably around $20,000", confidence: 0.94 }
      ]
    },
    {
      speaker: "AI",
      text: "Thank you for sharing that information. Based on what you've told me, it sounds like you're in a good position to refinance. With your credit score, equity position, and clear goals, we can definitely explore options that would lower your rate and provide shorter term options.",
      timestamp: "14:34:55",
      sentiment: "positive"
    },
    {
      speaker: "Lead",
      text: "That sounds promising. What would be the next steps?",
      timestamp: "14:35:10",
      sentiment: "positive"
    },
    {
      speaker: "AI",
      text: "The next step would be to have one of our experienced loan officers prepare some specific refinance scenarios for you. They can show you options for both 15-year and 20-year terms, along with the current rates and estimated monthly payments. Would you like me to arrange for someone to contact you tomorrow with these options?",
      timestamp: "14:35:40",
      sentiment: "positive"
    },
    {
      speaker: "Lead",
      text: "Yes, that would be great. Email would work best for me initially so I can review the numbers.",
      timestamp: "14:35:53",
      sentiment: "positive",
      highlights: [
        { type: "contact_preference", text: "Email would work best", confidence: 0.96 }
      ]
    },
    {
      speaker: "AI",
      text: "Perfect. I'll make sure our refinance specialist sends you an email tomorrow with detailed options. Is there a particular time of day that would be best to follow up with a call after you've had a chance to review the information?",
      timestamp: "14:36:15",
      sentiment: "positive"
    },
    {
      speaker: "Lead",
      text: "Afternoons are generally better for me, maybe around 3 or 4pm.",
      timestamp: "14:36:25",
      sentiment: "neutral",
      highlights: [
        { type: "availability", text: "Afternoons are generally better", confidence: 0.90 },
        { type: "availability", text: "around 3 or 4pm", confidence: 0.94 }
      ]
    },
    {
      speaker: "AI",
      text: "Wonderful. I'll note that afternoons around 3-4pm are best for calls. Do you have any other questions I can help with today?",
      timestamp: "14:36:42",
      sentiment: "positive"
    },
    {
      speaker: "Lead",
      text: "Not right now. I'm looking forward to seeing the options.",
      timestamp: "14:36:50",
      sentiment: "positive"
    },
    {
      speaker: "AI",
      text: "Great! Thank you for contacting EMM Loans today, Mr. Johnson. To summarize, we'll be sending you refinance options for 15 and 20-year terms based on your good credit and property value. You'll receive those by email tomorrow, and a loan officer will follow up with a call in the afternoon. Please don't hesitate to reach out if you have any questions in the meantime.",
      timestamp: "14:37:20",
      sentiment: "positive"
    },
    {
      speaker: "Lead",
      text: "Thank you for your help. Have a good day.",
      timestamp: "14:37:30",
      sentiment: "positive"
    },
    {
      speaker: "AI",
      text: "You're very welcome. Have a wonderful day as well.",
      timestamp: "14:37:38",
      sentiment: "positive"
    }
  ],
  extractedInfo: {
    propertyInfo: {
      currentMortgage: "30-year fixed at 4.5%",
      currentTerm: "6 years into term",
      estimatedValue: "$425,000",
      location: "Denver, Colorado",
      confidence: 0.92
    },
    refinanceGoals: {
      lowerRate: true,
      cashOut: false,
      shortenTerm: true,
      confidence: 0.88
    },
    timeline: {
      urgency: "Medium",
      lookingToDecide: "Within 2 months",
      confidence: 0.85
    },
    financialInfo: {
      estimatedCredit: "Good (720+)",
      hasOtherDebts: true,
      confidence: 0.82
    },
    qualification: {
      status: "Qualified",
      confidenceScore: 0.89,
      reasoning: "Good credit, significant equity, clear refinance goals"
    }
  },
  suggestedActions: [
    {
      type: "follow_up",
      channel: "Email",
      scheduledFor: "2025-04-07T10:00:00Z",
      template: "refinance_options",
      content: "Send pre-approval refinance options based on estimated credit and property value",
      reasoning: "Lead expressed interest in specific refinancing goals and has good qualification factors",
      status: "Pending Approval"
    },
    {
      type: "task",
      assignedTo: "Loan Officer",
      priority: "High",
      content: "Prepare custom refinance scenarios for 15-year and 20-year terms",
      reasoning: "Lead specifically mentioned interest in shortening term",
      status: "Pending Approval"
    }
  ],
  aiPerformance: {
    informationGathering: 0.92,
    leadEngagement: 0.85,
    qualificationAccuracy: 0.88,
    actionRecommendation: 0.90
  }
};
