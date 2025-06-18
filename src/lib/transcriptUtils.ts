
import { ConversationMessage, Message } from '@/types/conversation';

// Convert conversation messages from database to display format
export function convertConversationMessagesToDisplayMessages(
  conversationMessages: ConversationMessage[]
): Message[] {
  return conversationMessages.map(msg => ({
    id: msg.id,
    content: msg.content,
    role: msg.role === 'agent' ? 'ai' : 'user',
    timestamp: msg.ts || msg.created_at || new Date().toISOString(),
    sentiment: undefined,
    highlights: []
  }));
}

// Parse legacy transcript text to conversation messages (fallback)
export function parseTranscriptToMessages(transcript: string, conversationId: string): ConversationMessage[] {
  if (!transcript) return [];
  
  return transcript.split('\n')
    .map((line, i) => {
      const agentMatch = line.match(/^(Agent|AI Agent):\s?(.+)$/);
      const userMatch = line.match(/^(Lead|Customer|User):\s?(.+)$/);
      
      let role: 'agent' | 'lead' = 'lead';
      let content = line.trim();
      
      if (agentMatch) {
        role = 'agent';
        content = agentMatch[2].trim();
      } else if (userMatch) {
        role = 'lead';
        content = userMatch[2].trim();
      } else if (line.trim()) {
        content = line.trim();
      }
      
      return {
        id: `${conversationId}-${i}`,
        conversation_id: conversationId,
        role,
        content,
        seq: i,
        ts: new Date().toISOString(),
        created_at: new Date().toISOString()
      };
    })
    .filter(m => m.content.length > 0);
}
