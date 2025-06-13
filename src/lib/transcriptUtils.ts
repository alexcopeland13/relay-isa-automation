
import { parsePhoneNumber } from 'libphonenumber-js';
import { ConversationMessage, Message } from '@/types/conversation';

export function normalizePhone(phone: string): string {
  try {
    const parsed = parsePhoneNumber(phone, 'US');
    return parsed.number;
  } catch {
    return phone;
  }
}

export function splitTranscriptToMessages(raw: string, conversationId: string) {
  if (!raw) return [];
  
  return raw.split('\n')
    .map((line, i) => {
      // More deterministic parsing - look for specific patterns
      const agentMatch = line.match(/^(Agent|AI Agent):\s?(.+)$/);
      const userMatch = line.match(/^(Lead|Customer|User):\s?(.+)$/);
      
      let role = 'lead'; // default
      let content = line.trim();
      
      if (agentMatch) {
        role = 'agent';
        content = agentMatch[2].trim();
      } else if (userMatch) {
        role = 'lead';
        content = userMatch[2].trim();
      } else if (line.trim()) {
        // If no pattern matches but there's content, try to infer from context
        // This is a fallback for malformed transcripts
        content = line.trim();
      }
      
      return {
        conversation_id: conversationId,
        role,
        content,
        seq: i
      };
    })
    .filter(m => m.content.length > 0);
}

// Adapter to convert database rows to our Message interface
export function convertConversationMessagesToDisplayMessages(messages: ConversationMessage[]): Message[] {
  return messages.map((msg) => ({
    id: msg.id,
    content: msg.content,
    role: msg.role === 'agent' ? 'ai' : 'user',
    timestamp: new Date(msg.ts).toLocaleTimeString(),
    sentiment: undefined,
    highlights: undefined
  }));
}
