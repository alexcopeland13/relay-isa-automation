
/**
 * Conversation State Management
 * 
 * This module manages conversation state, context, and session handling 
 * throughout the lifecycle of AI-powered conversations.
 */

import { ConversationMessage, ConversationContext } from './apiGateway';

export type ConversationState = {
  id: string;
  status: 'active' | 'paused' | 'completed' | 'handoff' | 'error';
  startTime: string;
  lastUpdateTime: string;
  leadInfo: {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
    interests?: string[];
    qualificationScore?: number;
  };
  extractedEntities: Record<string, any>;
  history: ConversationMessage[];
  metadata: {
    source: string;
    channel: 'voice' | 'chat' | 'email' | 'sms';
    agentId?: string;
    handoffReason?: string;
    errorDetails?: string;
  };
};

class ConversationStateManager {
  private activeConversations: Map<string, ConversationState> = new Map();
  private storageAdapter: StorageAdapter;
  
  constructor(storageAdapter: StorageAdapter) {
    this.storageAdapter = storageAdapter;
  }
  
  /**
   * Initialize a new conversation session
   */
  async createConversation(
    conversationId: string,
    initialData: {
      leadInfo?: Partial<ConversationState['leadInfo']>;
      source: string;
      channel: ConversationState['metadata']['channel'];
    }
  ): Promise<ConversationState> {
    const now = new Date().toISOString();
    
    const newConversation: ConversationState = {
      id: conversationId,
      status: 'active',
      startTime: now,
      lastUpdateTime: now,
      leadInfo: initialData.leadInfo || {},
      extractedEntities: {},
      history: [],
      metadata: {
        source: initialData.source,
        channel: initialData.channel
      }
    };
    
    this.activeConversations.set(conversationId, newConversation);
    await this.storageAdapter.persistConversation(newConversation);
    
    return newConversation;
  }
  
  /**
   * Get an active conversation by ID
   */
  async getConversation(conversationId: string): Promise<ConversationState | null> {
    // Check in-memory cache first
    let conversation = this.activeConversations.get(conversationId);
    
    // If not in memory, try to load from persistent storage
    if (!conversation) {
      conversation = await this.storageAdapter.loadConversation(conversationId);
      if (conversation) {
        this.activeConversations.set(conversationId, conversation);
      }
    }
    
    return conversation || null;
  }
  
  /**
   * Add a message to a conversation
   */
  async addMessage(
    conversationId: string,
    message: Omit<ConversationMessage, 'id' | 'timestamp'>
  ): Promise<ConversationMessage> {
    const conversation = await this.getConversation(conversationId);
    if (!conversation) {
      throw new Error(`Conversation not found: ${conversationId}`);
    }
    
    const now = new Date().toISOString();
    const newMessage: ConversationMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      ...message,
      timestamp: now
    };
    
    conversation.history.push(newMessage);
    conversation.lastUpdateTime = now;
    
    await this.storageAdapter.persistConversation(conversation);
    
    return newMessage;
  }
  
  /**
   * Update conversation state with new entities or lead info
   */
  async updateConversationState(
    conversationId: string,
    updates: {
      status?: ConversationState['status'];
      leadInfo?: Partial<ConversationState['leadInfo']>;
      extractedEntities?: Record<string, any>;
      metadata?: Partial<ConversationState['metadata']>;
    }
  ): Promise<ConversationState> {
    const conversation = await this.getConversation(conversationId);
    if (!conversation) {
      throw new Error(`Conversation not found: ${conversationId}`);
    }
    
    // Update the conversation
    if (updates.status) {
      conversation.status = updates.status;
    }
    
    if (updates.leadInfo) {
      conversation.leadInfo = {
        ...conversation.leadInfo,
        ...updates.leadInfo
      };
    }
    
    if (updates.extractedEntities) {
      conversation.extractedEntities = {
        ...conversation.extractedEntities,
        ...updates.extractedEntities
      };
    }
    
    if (updates.metadata) {
      conversation.metadata = {
        ...conversation.metadata,
        ...updates.metadata
      };
    }
    
    conversation.lastUpdateTime = new Date().toISOString();
    
    await this.storageAdapter.persistConversation(conversation);
    
    return conversation;
  }
  
  /**
   * End a conversation
   */
  async endConversation(
    conversationId: string,
    reason: 'completed' | 'handoff' | 'error',
    details?: string
  ): Promise<ConversationState> {
    const conversation = await this.getConversation(conversationId);
    if (!conversation) {
      throw new Error(`Conversation not found: ${conversationId}`);
    }
    
    conversation.status = reason;
    conversation.lastUpdateTime = new Date().toISOString();
    
    if (reason === 'handoff' && details) {
      conversation.metadata.handoffReason = details;
    } else if (reason === 'error' && details) {
      conversation.metadata.errorDetails = details;
    }
    
    await this.storageAdapter.persistConversation(conversation);
    
    // Remove from active conversations
    this.activeConversations.delete(conversationId);
    
    return conversation;
  }
  
  /**
   * Get conversation context for AI service
   */
  async getConversationContext(conversationId: string): Promise<ConversationContext> {
    const conversation = await this.getConversation(conversationId);
    if (!conversation) {
      throw new Error(`Conversation not found: ${conversationId}`);
    }
    
    return {
      conversationId: conversation.id,
      leadInfo: {
        name: conversation.leadInfo.name,
        email: conversation.leadInfo.email,
        phone: conversation.leadInfo.phone,
        interests: conversation.leadInfo.interests
      },
      extractedEntities: conversation.extractedEntities,
      conversationHistory: conversation.history
    };
  }
}

/**
 * Interface for storage adapters
 */
interface StorageAdapter {
  persistConversation(conversation: ConversationState): Promise<void>;
  loadConversation(conversationId: string): Promise<ConversationState | null>;
}

/**
 * In-memory storage adapter (for development/testing)
 */
class MemoryStorageAdapter implements StorageAdapter {
  private conversations: Record<string, ConversationState> = {};
  
  async persistConversation(conversation: ConversationState): Promise<void> {
    this.conversations[conversation.id] = JSON.parse(JSON.stringify(conversation));
  }
  
  async loadConversation(conversationId: string): Promise<ConversationState | null> {
    return this.conversations[conversationId] || null;
  }
}

// Create and export a singleton instance with in-memory storage
// In production, this would be replaced with a persistent storage adapter
export const conversationStateManager = new ConversationStateManager(new MemoryStorageAdapter());

// Convenience functions for working with the state manager
export const createNewConversation = (
  conversationId: string,
  initialData: {
    leadInfo?: Partial<ConversationState['leadInfo']>;
    source: string;
    channel: ConversationState['metadata']['channel'];
  }
): Promise<ConversationState> => {
  return conversationStateManager.createConversation(conversationId, initialData);
};

export const getConversationById = (
  conversationId: string
): Promise<ConversationState | null> => {
  return conversationStateManager.getConversation(conversationId);
};

export const addMessageToConversation = (
  conversationId: string,
  message: Omit<ConversationMessage, 'id' | 'timestamp'>
): Promise<ConversationMessage> => {
  return conversationStateManager.addMessage(conversationId, message);
};

export const updateConversation = (
  conversationId: string,
  updates: {
    status?: ConversationState['status'];
    leadInfo?: Partial<ConversationState['leadInfo']>;
    extractedEntities?: Record<string, any>;
    metadata?: Partial<ConversationState['metadata']>;
  }
): Promise<ConversationState> => {
  return conversationStateManager.updateConversationState(conversationId, updates);
};

export const endConversation = (
  conversationId: string,
  reason: 'completed' | 'handoff' | 'error',
  details?: string
): Promise<ConversationState> => {
  return conversationStateManager.endConversation(conversationId, reason, details);
};
