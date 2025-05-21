
// This file should contain the 'Database' type definition from your main project's Supabase types.
// For example, copy the relevant parts from 'src/integrations/supabase/types.ts'.
// Make sure this is kept in sync with your actual database schema.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      actions: {
        Row: {
          action_type: string
          completed_at: string | null
          conversation_id: string | null
          created_at: string | null
          description: string | null
          id: string
          lead_id: string | null
          scheduled_for: string | null
          status: string
        }
        Insert: {
          action_type: string
          completed_at?: string | null
          conversation_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          lead_id?: string | null
          scheduled_for?: string | null
          status?: string
        }
        Update: {
          action_type?: string
          completed_at?: string | null
          conversation_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          lead_id?: string | null
          scheduled_for?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "actions_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "actions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_type: string | null
          cal_booking_id: string | null // Added this field
          created_at: string | null
          duration: number | null
          google_calendar_event_id: string | null
          id: string
          lead_id: string | null
          notes: string | null
          scheduled_at: string
          specialist_id: string | null
          status: string | null
        }
        Insert: {
          appointment_type?: string | null
          cal_booking_id?: string | null // Added this field
          created_at?: string | null
          duration?: number | null
          google_calendar_event_id?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          scheduled_at: string
          specialist_id?: string | null
          status?: string | null
        }
        Update: {
          appointment_type?: string | null
          cal_booking_id?: string | null // Added this field
          created_at?: string | null
          duration?: number | null
          google_calendar_event_id?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          scheduled_at?: string
          specialist_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_specialist_id_fkey"
            columns: ["specialist_id"]
            isOneToOne: false
            referencedRelation: "specialists"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          agent_id: string | null
          call_sid: string | null
          created_at: string | null
          direction: string | null
          duration: number | null
          id: string
          lead_id: string | null
          recording_url: string | null
          sentiment_score: number | null
          transcript: string | null
        }
        Insert: {
          agent_id?: string | null
          call_sid?: string | null
          created_at?: string | null
          direction?: string | null
          duration?: number | null
          id?: string
          lead_id?: string | null
          recording_url?: string | null
          sentiment_score?: number | null
          transcript?: string | null
        }
        Update: {
          agent_id?: string | null
          call_sid?: string | null
          created_at?: string | null
          direction?: string | null
          duration?: number | null
          id?: string
          lead_id?: string | null
          recording_url?: string | null
          sentiment_score?: number | null
          transcript?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_to: string | null
          cinc_lead_id: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          last_contacted: string | null
          last_name: string | null
          next_follow_up: string | null
          notes: string | null
          phone: string | null
          phone_e164: string | null
          phone_raw: string | null
          source: string | null
          status: string | null
        }
        Insert: {
          assigned_to?: string | null
          cinc_lead_id?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_contacted?: string | null
          last_name?: string | null
          next_follow_up?: string | null
          notes?: string | null
          phone?: string | null
          phone_e164?: string | null
          phone_raw?: string | null
          source?: string | null
          status?: string | null
        }
        Update: {
          assigned_to?: string | null
          cinc_lead_id?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_contacted?: string | null
          last_name?: string | null
          next_follow_up?: string | null
          notes?: string | null
          phone?: string | null
          phone_e164?: string | null
          phone_raw?: string | null
          source?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "specialists"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
        }
        Relationships: []
      }
      qualification_data: {
        Row: {
          annual_income: number | null
          conversation_id: string | null
          created_at: string | null
          debt_to_income_ratio: number | null
          down_payment_percentage: number | null
          estimated_credit_score: string | null
          has_co_borrower: boolean | null
          id: string
          is_self_employed: boolean | null
          lead_id: string | null
          loan_amount: number | null
          loan_type: string | null
          property_type: string | null
          property_use: string | null
          qualifying_notes: string | null
          time_frame: string | null
        }
        Insert: {
          annual_income?: number | null
          conversation_id?: string | null
          created_at?: string | null
          debt_to_income_ratio?: number | null
          down_payment_percentage?: number | null
          estimated_credit_score?: string | null
          has_co_borrower?: boolean | null
          id?: string
          is_self_employed?: boolean | null
          lead_id?: string | null
          loan_amount?: number | null
          loan_type?: string | null
          property_type?: string | null
          property_use?: string | null
          qualifying_notes?: string | null
          time_frame?: string | null
        }
        Update: {
          annual_income?: number | null
          conversation_id?: string | null
          created_at?: string | null
          debt_to_income_ratio?: number | null
          down_payment_percentage?: number | null
          estimated_credit_score?: string | null
          has_co_borrower?: boolean | null
          id?: string
          is_self_employed?: boolean | null
          lead_id?: string | null
          loan_amount?: number | null
          loan_type?: string | null
          property_type?: string | null
          property_use?: string | null
          qualifying_notes?: string | null
          time_frame?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qualification_data_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qualification_data_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      specialists: {
        Row: {
          availability_hours: Json | null
          created_at: string | null
          current_lead_count: number | null
          email: string
          first_name: string
          id: string
          last_name: string
          max_leads_per_day: number | null
          phone: string | null
          specialty: string | null
        }
        Insert: {
          availability_hours?: Json | null
          created_at?: string | null
          current_lead_count?: number | null
          email: string
          first_name: string
          id?: string
          last_name: string
          max_leads_per_day?: number | null
          phone?: string | null
          specialty?: string | null
        }
        Update: {
          availability_hours?: Json | null
          created_at?: string | null
          current_lead_count?: number | null
          email?: string
          first_name: string
          id?: string
          last_name: string
          max_leads_per_day?: number | null
          phone?: string | null
          specialty?: string | null
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          event_id: string | null
          id: string
          payload: Json | null
          provider: string | null
          received_at: string | null
        }
        Insert: {
          event_id?: string | null
          id?: string
          payload?: Json | null
          provider?: string | null
          received_at?: string | null
        }
        Update: {
          event_id?: string | null
          id?: string
          payload?: Json | null
          provider?: string | null
          received_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_available_specialists: {
        Args: { appointment_time: string; duration_minutes: number }
        Returns: {
          availability_hours: Json | null
          created_at: string | null
          current_lead_count: number | null
          email: string
          first_name: string
          id: string
          last_name: string
          max_leads_per_day: number | null
          phone: string | null
          specialty: string | null
        }[]
      }
      get_lead_conversation_history: {
        Args: { lead_uuid: string }
        Returns: {
          agent_id: string | null
          call_sid: string | null
          created_at: string | null
          direction: string | null
          duration: number | null
          id: string
          lead_id: string | null
          recording_url: string | null
          sentiment_score: number | null
          transcript: string | null
        }[]
      }
      get_leads_needing_followup: {
        Args: { follow_up_date: string }
        Returns: {
          assigned_to: string | null
          cinc_lead_id: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          last_contacted: string | null
          last_name: string | null
          next_follow_up: string | null
          notes: string | null
          phone: string | null
          phone_e164: string | null
          phone_raw: string | null
          source: string | null
          status: string | null
        }[]
      }
      update_lead_status: {
        Args: { lead_uuid: string; new_status: string }
        Returns: {
          assigned_to: string | null
          cinc_lead_id: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          last_contacted: string | null
          last_name: string | null
          next_follow_up: string | null
          notes: string | null
          phone: string | null
          phone_e164: string | null
          phone_raw: string | null
          source: string | null
          status: string | null
        }
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
