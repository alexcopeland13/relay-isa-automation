
import { parsePhoneNumber } from 'libphonenumber-js';

export function normalizePhone(phone: string): string {
  try {
    const parsed = parsePhoneNumber(phone, 'US');
    return parsed.number;
  } catch {
    return phone;
  }
}

export function splitTranscriptToMessages(raw: string) {
  if (!raw) return [];
  
  return raw.split('\n')
    .map((line, i) => {
      const isAgent = line.startsWith('Agent:') || line.startsWith('AI Agent:');
      const isLead = line.startsWith('Lead:') || line.startsWith('Customer:') || line.startsWith('User:');
      
      let role = 'lead'; // default
      let content = line.trim();
      
      if (isAgent) {
        role = 'agent';
        content = line.replace(/^(Agent|AI Agent):\s?/, '').trim();
      } else if (isLead) {
        role = 'lead';
        content = line.replace(/^(Lead|Customer|User):\s?/, '').trim();
      }
      
      return {
        role,
        content,
        seq: i
      };
    })
    .filter(m => m.content.length > 0);
}
