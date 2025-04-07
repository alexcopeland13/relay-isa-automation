
/**
 * Event Processing System
 * 
 * This module handles event-driven processing for AI interactions, including
 * webhooks for inbound events, message queuing, and event logging.
 */

import { ConversationMessage, ConversationResponse } from './apiGateway';
import { getConversationById, updateConversation } from './conversationStateManager';

// Event Types
export type EventType = 
  | 'conversation.started'
  | 'conversation.message.received'
  | 'conversation.message.sent'
  | 'conversation.handoff'
  | 'conversation.ended'
  | 'entity.extracted'
  | 'follow_up.suggested'
  | 'follow_up.scheduled'
  | 'follow_up.sent'
  | 'follow_up.completed'
  | 'error.service'
  | 'error.processing';

// Base Event Interface
export interface Event {
  id: string;
  type: EventType;
  timestamp: string;
  conversationId?: string;
  payload: Record<string, any>;
  metadata?: {
    source: string;
    traceId?: string;
    correlationId?: string;
  };
}

// Event Handler Type
export type EventHandler = (event: Event) => Promise<void>;

// Event Bus for publishing and subscribing to events
class EventBus {
  private handlers: Map<EventType, EventHandler[]> = new Map();
  
  // Subscribe to events of a specific type
  subscribe(eventType: EventType, handler: EventHandler): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    
    const handlers = this.handlers.get(eventType)!;
    handlers.push(handler);
    
    // Return an unsubscribe function
    return () => {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    };
  }
  
  // Publish an event to all subscribed handlers
  async publish(event: Event): Promise<void> {
    // Log every event
    this.logEvent(event);
    
    const handlers = this.handlers.get(event.type) || [];
    const promises = handlers.map(handler => this.safeExecute(handler, event));
    
    try {
      await Promise.all(promises);
    } catch (error) {
      console.error(`Error processing event ${event.id} of type ${event.type}:`, error);
      
      // Create and publish an error event
      const errorEvent: Event = {
        id: `error-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        type: 'error.processing',
        timestamp: new Date().toISOString(),
        conversationId: event.conversationId,
        payload: {
          originalEvent: event,
          error: {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
          }
        }
      };
      
      this.logEvent(errorEvent);
    }
  }
  
  // Safely execute an event handler with error handling
  private async safeExecute(handler: EventHandler, event: Event): Promise<void> {
    try {
      await handler(event);
    } catch (error) {
      console.error(`Error in event handler for ${event.type}:`, error);
      throw error; // Re-throw to be caught by the publish method
    }
  }
  
  // Log events for monitoring and debugging
  private logEvent(event: Event): void {
    // In a production system, this would write to a persistent store
    console.log(`[EVENT] ${event.timestamp} - ${event.type}`, {
      eventId: event.id,
      conversationId: event.conversationId,
      metadata: event.metadata
    });
  }
}

// Message Queue for handling asynchronous processing
class MessageQueue {
  private queue: Array<{
    id: string;
    event: Event;
    retryCount: number;
    nextAttempt: number;
  }> = [];
  private processing = false;
  private maxRetries = 3;
  private retryDelay = 5000; // 5 seconds
  private eventBus: EventBus;
  
  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    
    // Start processing loop
    this.startProcessing();
  }
  
  // Add an event to the queue
  enqueue(event: Event): void {
    this.queue.push({
      id: `queue-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      event,
      retryCount: 0,
      nextAttempt: Date.now()
    });
  }
  
  // Start processing the queue
  private startProcessing(): void {
    if (this.processing) return;
    
    this.processing = true;
    this.processQueue();
  }
  
  // Process items in the queue
  private async processQueue(): Promise<void> {
    while (this.processing) {
      // Find items that are ready to be processed
      const now = Date.now();
      const itemToProcess = this.queue.find(item => item.nextAttempt <= now);
      
      if (itemToProcess) {
        const index = this.queue.indexOf(itemToProcess);
        this.queue.splice(index, 1);
        
        try {
          await this.eventBus.publish(itemToProcess.event);
        } catch (error) {
          if (itemToProcess.retryCount < this.maxRetries) {
            // Re-enqueue with increased retry count
            this.queue.push({
              ...itemToProcess,
              retryCount: itemToProcess.retryCount + 1,
              nextAttempt: Date.now() + this.retryDelay * Math.pow(2, itemToProcess.retryCount)
            });
          } else {
            console.error(`Failed to process event after ${this.maxRetries} retries:`, itemToProcess.event);
          }
        }
      } else {
        // No items ready for processing, wait a bit
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }
  
  // Stop processing the queue
  stop(): void {
    this.processing = false;
  }
}

// Webhook Handler for managing inbound webhooks
class WebhookHandler {
  private eventBus: EventBus;
  private registeredWebhooks: Map<string, { endpoint: string, secret: string }> = new Map();
  
  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }
  
  // Register a new webhook
  registerWebhook(
    name: string, 
    endpoint: string, 
    secret: string
  ): void {
    this.registeredWebhooks.set(name, { endpoint, secret });
  }
  
  // Handle an inbound webhook request
  async handleWebhookRequest(
    webhookName: string,
    payload: Record<string, any>,
    signature: string
  ): Promise<void> {
    const webhook = this.registeredWebhooks.get(webhookName);
    if (!webhook) {
      throw new Error(`Webhook not registered: ${webhookName}`);
    }
    
    // Verify signature (in production this would be a proper crypto verification)
    if (!this.verifySignature(payload, signature, webhook.secret)) {
      throw new Error('Invalid webhook signature');
    }
    
    // Convert webhook payload to an event
    const event = this.convertPayloadToEvent(webhookName, payload);
    
    // Publish the event
    await this.eventBus.publish(event);
  }
  
  // Send an outbound webhook to a registered endpoint
  async sendWebhook(
    webhookName: string,
    payload: Record<string, any>
  ): Promise<void> {
    const webhook = this.registeredWebhooks.get(webhookName);
    if (!webhook) {
      throw new Error(`Webhook not registered: ${webhookName}`);
    }
    
    try {
      // In a real implementation, this would make an HTTP request
      console.log(`Sending webhook to ${webhook.endpoint}`, payload);
      
      // Simulate a successful webhook call
      return Promise.resolve();
    } catch (error) {
      console.error(`Error sending webhook to ${webhook.endpoint}:`, error);
      throw error;
    }
  }
  
  // Verify the signature of an inbound webhook
  private verifySignature(
    payload: Record<string, any>,
    signature: string,
    secret: string
  ): boolean {
    // In a real implementation, this would be a crypto verification
    // For now, just return true for development
    return true;
  }
  
  // Convert webhook payload to a typed event
  private convertPayloadToEvent(
    webhookName: string,
    payload: Record<string, any>
  ): Event {
    // This would need to be customized based on the webhook source
    const eventType = this.mapWebhookToEventType(webhookName, payload);
    
    return {
      id: `webhook-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type: eventType,
      timestamp: new Date().toISOString(),
      conversationId: payload.conversationId,
      payload,
      metadata: {
        source: `webhook:${webhookName}`,
        traceId: payload.traceId
      }
    };
  }
  
  // Map webhook name and payload to an event type
  private mapWebhookToEventType(
    webhookName: string,
    payload: Record<string, any>
  ): EventType {
    // This mapping would be customized based on webhook sources
    switch (webhookName) {
      case 'voice_platform':
        if (payload.eventType === 'call.started') return 'conversation.started';
        if (payload.eventType === 'call.ended') return 'conversation.ended';
        if (payload.eventType === 'transcription.available') return 'conversation.message.received';
        break;
      case 'workflow_automation':
        if (payload.eventType === 'follow_up.sent') return 'follow_up.sent';
        if (payload.eventType === 'follow_up.completed') return 'follow_up.completed';
        break;
    }
    
    // Default case
    return 'conversation.message.received';
  }
}

// Create and export singleton instances
export const eventBus = new EventBus();
export const messageQueue = new MessageQueue(eventBus);
export const webhookHandler = new WebhookHandler(eventBus);

// Event Publishing Helper Functions
export const publishEvent = (event: Event): Promise<void> => {
  return eventBus.publish(event);
};

export const enqueueEvent = (event: Event): void => {
  messageQueue.enqueue(event);
};

// Register standard event handlers
eventBus.subscribe('conversation.message.received', async (event) => {
  if (!event.conversationId) return;
  
  // Update the conversation with the new message
  const conversation = await getConversationById(event.conversationId);
  if (!conversation) {
    console.error(`Conversation not found: ${event.conversationId}`);
    return;
  }
  
  // Example of updating conversation state based on message content
  if (event.payload.entities) {
    await updateConversation(event.conversationId, {
      extractedEntities: event.payload.entities
    });
  }
});

eventBus.subscribe('follow_up.suggested', async (event) => {
  if (!event.conversationId) return;
  
  // Process follow-up suggestion and potentially schedule it
  console.log(`Follow-up suggested for conversation ${event.conversationId}`, event.payload);
  
  // In a real implementation, this would create a follow-up in the system
  // and potentially schedule it for review
});

// Initialize necessary webhooks
webhookHandler.registerWebhook('voice_platform', 'https://api.example.com/webhooks/voice', 'webhook-secret-1');
webhookHandler.registerWebhook('workflow_automation', 'https://api.example.com/webhooks/workflow', 'webhook-secret-2');
