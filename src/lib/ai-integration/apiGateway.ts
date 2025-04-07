/**
 * AI Integration Framework - API Gateway
 * 
 * This module provides a centralized API interface for interacting with various AI
 * services through a consistent set of methods. It implements service adapters,
 * authentication management, and error handling for AI service integration.
 */

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

class AnthropicAdapter implements AIServiceAdapter {
  private config: ServiceConfig | null = null;

  async initialize(config: ServiceConfig): Promise<boolean> {
    this.config = config;
    // In a real implementation, would validate API key and connection
    return true;
  }

  async generateResponse(context: ConversationContext, prompt: string): Promise<ConversationResponse> {
    // Mock implementation - in production this would call the Anthropic API
    console.log('Generating response using Anthropic adapter', { context, prompt });
    
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
    // Mock implementation
    return {
      summary: 'Lead is interested in refinancing their current mortgage to lower monthly payments.',
      qualificationScore: 85,
      nextSteps: ['Collect information about current rate', 'Discuss available refinancing options']
    };
  }

  async extractEntities(text: string): Promise<Record<string, any>> {
    // Mock implementation
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
    // Mock implementation
    return {
      status: 'operational',
      latency: 850,
      quotaRemaining: 9500
    };
  }
}

class OpenAIAdapter implements AIServiceAdapter {
  private config: ServiceConfig | null = null;

  async initialize(config: ServiceConfig): Promise<boolean> {
    this.config = config;
    // In a real implementation, would validate API key and connection
    return true;
  }

  async generateResponse(context: ConversationContext, prompt: string): Promise<ConversationResponse> {
    // Mock implementation
    console.log('Generating response using OpenAI adapter', { context, prompt });
    
    return {
      message: {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: 'This is a simulated response from the OpenAI model.',
        timestamp: new Date().toISOString()
      },
      suggestedActions: [
        {
          type: 'collect_info',
          reason: 'Missing critical information about property',
          priority: 'high'
        }
      ],
      sentiment: 'neutral',
      confidenceScore: 0.92
    };
  }

  async analyzeConversation(conversationHistory: ConversationMessage[]): Promise<any> {
    // Mock implementation
    return {
      summary: 'Lead is looking to purchase their first home in the next 3 months.',
      qualificationScore: 72,
      nextSteps: ['Pre-approval process', 'Discuss down payment options']
    };
  }

  async extractEntities(text: string): Promise<Record<string, any>> {
    // Mock implementation
    return {
      entities: {
        address: { value: '123 Main St, Anytown, USA', confidence: 0.89 },
        propertyValue: { value: '450000', confidence: 0.76 },
        creditScore: { value: '720', confidence: 0.82 }
      }
    };
  }

  async getStatus(): Promise<{ status: 'operational' | 'degraded' | 'outage'; latency: number; quotaRemaining?: number }> {
    // Mock implementation
    return {
      status: 'operational',
      latency: 920,
      quotaRemaining: 8500
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
    this.registerAdapter('anthropic', new AnthropicAdapter());
    this.registerAdapter('openai', new OpenAIAdapter());
    // Other adapters would be registered here
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
      // In a real implementation, we would implement fallback to another provider
      // and retry logic here
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
      retryable: code !== 'authentication_failed' // Example logic
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
