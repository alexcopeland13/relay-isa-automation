
/**
 * Retell AI API Integration
 * Provides functionality for outbound calling, call management, and agent operations
 */

import { supabase } from '@/integrations/supabase/client';

export interface RetellCallRequest {
  agent_id: string;
  customer_number: string;
  customer_name?: string;
  metadata?: Record<string, any>;
  retell_llm_dynamic_variables?: Record<string, any>;
}

export interface RetellCall {
  call_id: string;
  agent_id: string;
  call_type: 'web_call' | 'phone_call';
  call_status: 'registered' | 'ongoing' | 'ended' | 'error';
  start_timestamp?: number;
  end_timestamp?: number;
  from_number?: string;
  to_number?: string;
  direction: 'inbound' | 'outbound';
  disconnection_reason?: string;
  call_analysis?: {
    call_summary?: string;
    user_sentiment?: string;
    agent_sentiment?: string;
    call_successful?: boolean;
  };
}

export interface RetellAgent {
  agent_id: string;
  agent_name: string;
  voice_id: string;
  language: string;
  response_engine: any;
  llm_websocket_url?: string;
  webhook_url?: string;
  phone_number?: string;
}

class RetellAPIService {
  private baseUrl = 'https://api.retellai.com';

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    try {
      const { data, error } = await supabase.functions.invoke('retell-api-proxy', {
        body: {
          endpoint,
          method: options.method || 'GET',
          body: options.body ? JSON.parse(options.body as string) : undefined
        }
      });

      if (error) {
        throw new Error(`Retell API Error: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Retell API request failed:', error);
      throw error;
    }
  }

  // Create an outbound call
  async createPhoneCall(request: RetellCallRequest): Promise<RetellCall> {
    console.log('🔄 Creating outbound call with Retell:', request);
    
    const response = await this.makeRequest('/create-phone-call', {
      method: 'POST',
      body: JSON.stringify(request)
    });

    console.log('✅ Outbound call created:', response);
    return response;
  }

  // Get call details
  async getCall(callId: string): Promise<RetellCall> {
    return await this.makeRequest(`/get-call/${callId}`);
  }

  // List all calls with optional filtering
  async listCalls(params?: {
    filter_criteria?: {
      agent_id?: string;
      call_type?: string;
      call_status?: string;
      start_timestamp_after?: number;
      start_timestamp_before?: number;
    };
    limit?: number;
    pagination_key?: string;
  }): Promise<{ calls: RetellCall[]; pagination_key?: string }> {
    const queryParams = params ? `?${new URLSearchParams(JSON.stringify(params))}` : '';
    return await this.makeRequest(`/list-calls${queryParams}`);
  }

  // Get agent information
  async getAgent(agentId: string): Promise<RetellAgent> {
    return await this.makeRequest(`/get-agent/${agentId}`);
  }

  // List all agents
  async listAgents(): Promise<{ agents: RetellAgent[] }> {
    return await this.makeRequest('/list-agents');
  }

  // End an ongoing call
  async endCall(callId: string): Promise<void> {
    await this.makeRequest(`/end-call/${callId}`, {
      method: 'POST'
    });
  }
}

export const retellAPI = new RetellAPIService();

// Helper function to format phone numbers for Retell (E.164 format)
export function formatPhoneForRetell(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Add +1 if it's a 10-digit US number
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  
  // Add + if it doesn't start with it
  if (!digits.startsWith('1') && digits.length === 11) {
    return `+${digits}`;
  }
  
  // Already formatted or international
  return digits.startsWith('+') ? digits : `+${digits}`;
}
