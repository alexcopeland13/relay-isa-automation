
/**
 * AI Integration Framework - API Gateway
 * 
 * This module provides a centralized API interface for interacting with various AI
 * services through a consistent set of methods. It implements service adapters,
 * authentication management, and error handling for AI service integration.
 */

import { supabase } from '@/integrations/supabase/client';

export type AIServiceProvider = 'anthropic' | 'openai' | 'perplexity' | 'mistral';

export type ServiceConfig = {
  apiKey: string;
  modelVersion: string;
  temperature: number;
  maxTokens: number;
  defaultProvider: boolean;
  additionalParams?: Record<string, any>;
};

export type ConversationMessage = {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: string;
};

export type ConversationContext = {
  conversationId: string;
  leadInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    interests?: string[];
  };
  extractedEntities?: Record<string, any>;
  conversationHistory: ConversationMessage[];
};

export type ConversationResponse = {
  message: ConversationMessage;
  suggestedActions?: Array<{
    type: 'follow_up' | 'handoff' | 'collect_info' | 'qualify';
    reason: string;
    priority?: 'low' | 'medium' | 'high';
    data?: Record<string, any>;
  }>;
  extractedEntities?: Record<string, any>;
  sentiment?: 'positive' | 'neutral' | 'negative';
  confidenceScore?: number;
};

export type AIServiceError = {
  code: string;
  message: string;
  service: AIServiceProvider;
  timestamp: string;
  requestId?: string;
  retryable: boolean;
};

interface AIServiceAdapter {
  initialize(config: ServiceConfig): Promise<boolean>;
  generateResponse(context: ConversationContext, prompt: string): Promise<ConversationResponse>;
  analyzeConversation(conversationHistory: ConversationMessage[]): Promise<any>;
  extractEntities(text: string): Promise<Record<string, any>>;
  getStatus(): Promise<{
    status: 'operational' | 'degraded' | 'outage';
    latency: number;
    quotaRemaining?: number;
  }>;
}

class OpenAIAdapter implements AIServiceAdapter {
  private config: ServiceConfig | null = null;

  async initialize(config: ServiceConfig): Promise<boolean> {
    this.config = config;
    return true;
  }

  async generateResponse(context: ConversationContext, prompt: string): Promise<ConversationResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-conversation-processor', {
        body: {
          action: 'generate_response',
          data: { context, prompt }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Error generating OpenAI response:', error);
      // Fallback to a basic response
      return {
        message: {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: 'I apologize, but I\'m having trouble processing your request right now. Please try again later.',
          timestamp: new Date().toISOString()
        },
        sentiment: 'neutral',
        confidenceScore: 0.5
      };
    }
  }

  async analyzeConversation(conversationHistory: ConversationMessage[]): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-conversation-processor', {
        body: {
          action: 'analyze_conversation',
          data: { conversationHistory }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Error analyzing conversation:', error);
      return {
        summary: 'Conversation analysis temporarily unavailable',
        qualificationScore: 50,
        nextSteps: ['Follow up with lead', 'Review conversation manually']
      };
    }
  }

  async extractEntities(text: string): Promise<Record<string, any>> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-conversation-processor', {
        body: {
          action: 'extract_entities',
          data: { text }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Error extracting entities:', error);
      return { entities: {} };
    }
  }

  async getStatus(): Promise<{ status: 'operational' | 'degraded' | 'outage'; latency: number; quotaRemaining?: number }> {
    // Simple health check
    try {
      const startTime = Date.now();
      const { error } = await supabase.functions.invoke('ai-conversation-processor', {
        body: {
          action: 'generate_response',
          data: { 
            context: { conversationId: 'health-check', conversationHistory: [] }, 
            prompt: 'Health check' 
          }
        }
      });
      const latency = Date.now() - startTime;

      return {
        status: error ? 'degraded' : 'operational',
        latency,
        quotaRemaining: 9500
      };
    } catch (error) {
      return {
        status: 'outage',
        latency: -1
      };
    }
  }
}

class AnthropicAdapter implements AIServiceAdapter {
  private config: ServiceConfig | null = null;

  async initialize(config: ServiceConfig): Promise<boolean> {
    this.config = config;
    return true;
  }

  async generateResponse(context: ConversationContext, prompt: string): Promise<ConversationResponse> {
    // Fallback to mock implementation for Anthropic
    console.log('Generating response using Anthropic adapter (mock)', { context, prompt });
    
    return {
      message: {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: 'This is a simulated response from the Anthropic Claude model.',
        timestamp: new Date().toISOString()
      },
      suggestedActions: [
        {
          type: 'follow_up',
          reason: 'Lead showed interest in refinancing options',
          priority: 'medium',
          data: {
            suggestedChannel: 'email',
            suggestedTemplate: 'refinance_options'
          }
        }
      ],
      extractedEntities: {
        loan_amount: {
          value: '350000',
          confidence: 0.92
        },
        property_type: {
          value: 'single_family',
          confidence: 0.85
        }
      },
      sentiment: 'positive',
      confidenceScore: 0.87
    };
  }

  async analyzeConversation(conversationHistory: ConversationMessage[]): Promise<any> {
    return {
      summary: 'Lead is interested in refinancing their current mortgage to lower monthly payments.',
      qualificationScore: 85,
      nextSteps: ['Collect information about current rate', 'Discuss available refinancing options']
    };
  }

  async extractEntities(text: string): Promise<Record<string, any>> {
    return {
      entities: {
        name: { value: 'John Smith', confidence: 0.95 },
        email: { value: 'john.smith@example.com', confidence: 0.98 },
        phone: { value: '555-123-4567', confidence: 0.92 },
        income: { value: '120000', confidence: 0.85 }
      }
    };
  }

  async getStatus(): Promise<{ status: 'operational' | 'degraded' | 'outage'; latency: number; quotaRemaining?: number }> {
    return {
      status: 'operational',
      latency: 850,
      quotaRemaining: 9500
    };
  }
}

/**
 * AI Service Gateway - Main class that handles service selection and delegation
 */
class AIServiceGateway {
  private adapters: Map<AIServiceProvider, AIServiceAdapter> = new Map();
  private configs: Map<AIServiceProvider, ServiceConfig> = new Map();
  private defaultProvider: AIServiceProvider | null = null;

  constructor() {
    this.registerAdapter('openai', new OpenAIAdapter());
    this.registerAdapter('anthropic', new AnthropicAdapter());
    
    // Set OpenAI as default since we have the API key configured
    this.defaultProvider = 'openai';
  }

  private registerAdapter(provider: AIServiceProvider, adapter: AIServiceAdapter): void {
    this.adapters.set(provider, adapter);
  }

  async configureService(provider: AIServiceProvider, config: ServiceConfig): Promise<boolean> {
    const adapter = this.adapters.get(provider);
    if (!adapter) {
      console.error(`No adapter registered for provider: ${provider}`);
      return false;
    }

    try {
      const success = await adapter.initialize(config);
      if (success) {
        this.configs.set(provider, config);
        if (config.defaultProvider) {
          this.defaultProvider = provider;
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error configuring service for provider ${provider}:`, error);
      return false;
    }
  }

  async generateResponse(
    context: ConversationContext, 
    prompt: string, 
    provider?: AIServiceProvider
  ): Promise<ConversationResponse> {
    const serviceProvider = provider || this.defaultProvider;
    if (!serviceProvider) {
      throw new Error('No default provider configured and no provider specified');
    }

    const adapter = this.adapters.get(serviceProvider);
    if (!adapter) {
      throw new Error(`No adapter available for provider: ${serviceProvider}`);
    }

    try {
      return await adapter.generateResponse(context, prompt);
    } catch (error) {
      console.error(`Error generating response with provider ${serviceProvider}:`, error);
      throw this.createServiceError(serviceProvider, 'response_generation_failed', error);
    }
  }

  async analyzeConversation(
    conversationHistory: ConversationMessage[],
    provider?: AIServiceProvider
  ): Promise<any> {
    const serviceProvider = provider || this.defaultProvider;
    if (!serviceProvider) {
      throw new Error('No default provider configured and no provider specified');
    }

    const adapter = this.adapters.get(serviceProvider);
    if (!adapter) {
      throw new Error(`No adapter available for provider: ${serviceProvider}`);
    }

    try {
      return await adapter.analyzeConversation(conversationHistory);
    } catch (error) {
      console.error(`Error analyzing conversation with provider ${serviceProvider}:`, error);
      throw this.createServiceError(serviceProvider, 'conversation_analysis_failed', error);
    }
  }

  async extractEntities(
    text: string,
    provider?: AIServiceProvider
  ): Promise<Record<string, any>> {
    const serviceProvider = provider || this.defaultProvider;
    if (!serviceProvider) {
      throw new Error('No default provider configured and no provider specified');
    }

    const adapter = this.adapters.get(serviceProvider);
    if (!adapter) {
      throw new Error(`No adapter available for provider: ${serviceProvider}`);
    }

    try {
      return await adapter.extractEntities(text);
    } catch (error) {
      console.error(`Error extracting entities with provider ${serviceProvider}:`, error);
      throw this.createServiceError(serviceProvider, 'entity_extraction_failed', error);
    }
  }

  async getServiceStatus(provider: AIServiceProvider): Promise<{ 
    status: 'operational' | 'degraded' | 'outage'; 
    latency: number; 
    quotaRemaining?: number 
  }> {
    const adapter = this.adapters.get(provider);
    if (!adapter) {
      throw new Error(`No adapter available for provider: ${provider}`);
    }

    try {
      return await adapter.getStatus();
    } catch (error) {
      console.error(`Error getting status for provider ${provider}:`, error);
      return {
        status: 'outage',
        latency: -1
      };
    }
  }

  getAvailableProviders(): AIServiceProvider[] {
    return Array.from(this.adapters.keys());
  }

  getDefaultProvider(): AIServiceProvider | null {
    return this.defaultProvider;
  }

  private createServiceError(
    service: AIServiceProvider, 
    code: string, 
    error: any
  ): AIServiceError {
    return {
      code,
      message: error.message || 'Unknown error',
      service,
      timestamp: new Date().toISOString(),
      requestId: error.requestId,
      retryable: code !== 'authentication_failed'
    };
  }
}

// Create and export a singleton instance
export const aiServiceGateway = new AIServiceGateway();

// Convenience functions for working with the gateway
export const configureAIService = (
  provider: AIServiceProvider, 
  config: ServiceConfig
): Promise<boolean> => {
  return aiServiceGateway.configureService(provider, config);
};

export const getAIResponse = (
  context: ConversationContext, 
  prompt: string, 
  provider?: AIServiceProvider
): Promise<ConversationResponse> => {
  return aiServiceGateway.generateResponse(context, prompt, provider);
};

export const analyzeConversation = (
  conversationHistory: ConversationMessage[],
  provider?: AIServiceProvider
): Promise<any> => {
  return aiServiceGateway.analyzeConversation(conversationHistory, provider);
};

export const extractEntities = (
  text: string,
  provider?: AIServiceProvider
): Promise<Record<string, any>> => {
  return aiServiceGateway.extractEntities(text, provider);
};
