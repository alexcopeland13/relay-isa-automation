
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

// Enhanced interfaces based on Retell API documentation
export interface TranscriptUtterance {
  role: 'agent' | 'user';
  content: string;
  timestamp: number;
}

export interface CallAnalysis {
  call_summary?: string;
  user_sentiment?: string;
  agent_sentiment?: string;
  call_successful?: boolean;
  custom_analysis_data?: Record<string, any>;
}

export interface CallLatency {
  llm?: number;
  tts?: number;
  stt?: number;
  e2e?: number;
}

export interface CallCost {
  llm?: number;
  tts?: number;
  stt?: number;
  total?: number;
}

export interface RetellCall {
  call_id: string;
  agent_id: string;
  call_type: 'web_call' | 'phone_call';
  call_status: 'registered' | 'ongoing' | 'ended' | 'error';
  start_timestamp?: number;
  end_timestamp?: number;
  duration_ms?: number;
  from_number?: string;
  to_number?: string;
  direction: 'inbound' | 'outbound';
  disconnection_reason?: string;
  
  // Enhanced transcript data
  transcript?: string;
  transcript_object?: TranscriptUtterance[];
  transcript_with_tool_calls?: any[];
  
  // Call analysis and insights
  call_analysis?: CallAnalysis;
  
  // Additional metadata
  metadata?: Record<string, any>;
  retell_llm_dynamic_variables?: Record<string, any>;
  collected_dynamic_variables?: Record<string, any>;
  
  // Recording and logs
  recording_url?: string;
  public_log_url?: string;
  knowledge_base_retrieved_contents_url?: string;
  
  // Performance metrics
  latency?: CallLatency;
  call_cost?: CallCost;
  
  // Privacy settings
  opt_out_sensitive_data_storage?: boolean;
  opt_in_signed_url?: boolean;
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

  // Get comprehensive call details - NEW ENHANCED METHOD
  async getCall(callId: string): Promise<RetellCall> {
    console.log('🔍 Fetching complete call data for:', callId);
    
    const callData = await this.makeRequest(`/get-call/${callId}`);
    
    console.log('✅ Complete call data retrieved:', {
      call_id: callData.call_id,
      has_transcript_object: !!callData.transcript_object,
      has_call_analysis: !!callData.call_analysis,
      transcript_utterances: callData.transcript_object?.length || 0
    });
    
    return callData;
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

// Helper function to convert Retell transcript_object to our conversation messages format
export function convertRetellTranscriptToMessages(transcriptObject: TranscriptUtterance[]) {
  return transcriptObject.map((utterance, index) => ({
    conversation_id: '', // Will be set when saving
    role: utterance.role === 'agent' ? 'agent' : 'lead',
    content: utterance.content,
    seq: index,
    ts: new Date(utterance.timestamp).toISOString()
  }));
}
