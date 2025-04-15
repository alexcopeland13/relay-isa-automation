
export interface EntityValue {
  value: string;
  confidence: number;
  source: 'conversation' | 'user-input' | 'system';
  timestamp: string;
}

export interface EntityMap {
  [key: string]: EntityValue;
}

export interface ConversationData {
  conversationId: string;
  leadInfo: {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
    source?: string;
    interests?: string[];
    budget?: string;
    timeline?: string;
    locationPreferences?: string[];
  };
  extractedEntities: EntityMap;
  lastUpdate: string;
}

export interface ConversationMessage {
  content: string;
  role: 'ai' | 'user' | 'system';
  timestamp: string;
}
