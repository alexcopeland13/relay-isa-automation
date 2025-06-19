export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
      app_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          appointment_type: string | null
          cal_booking_id: string | null
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
          cal_booking_id?: string | null
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
          cal_booking_id?: string | null
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
      conversation_extractions: {
        Row: {
          annual_income: number | null
          best_time_to_call: string | null
          buying_timeline: string | null
          call_outcome: string | null
          conversation_id: string | null
          conversation_summary: string | null
          created_at: string | null
          credit_concerns: boolean | null
          credit_score_range: string | null
          current_lender: string | null
          debt_concerns: boolean | null
          down_payment_amount: number | null
          down_payment_concerns: boolean | null
          down_payment_percentage: number | null
          employment_length: string | null
          employment_status: string | null
          extraction_timestamp: string | null
          extraction_version: string | null
          first_time_buyer: boolean | null
          follow_up_date: string | null
          has_co_borrower: boolean | null
          has_realtor: boolean | null
          id: string
          interest_rate_concerns: boolean | null
          interested_properties: Json | null
          is_self_employed: boolean | null
          job_change_concerns: boolean | null
          knows_overlays: boolean | null
          lead_id: string | null
          lead_qualification_status: string | null
          lead_score: number | null
          lead_temperature: string | null
          loan_amount: number | null
          loan_type: string | null
          monthly_debt_payments: number | null
          multiple_properties_interested: boolean | null
          next_steps: Json | null
          objection_details: Json | null
          overlay_education_completed: boolean | null
          pre_approval_status: string | null
          preferred_contact_method: string | null
          primary_concerns: Json | null
          property_address: string | null
          property_mls_number: string | null
          property_price: number | null
          property_type: string | null
          property_use: string | null
          raw_extraction_data: Json | null
          ready_to_buy_timeline: string | null
          realtor_name: string | null
          requested_actions: Json | null
          va_eligible: boolean | null
          wants_credit_review: boolean | null
          wants_down_payment_assistance: boolean | null
        }
        Insert: {
          annual_income?: number | null
          best_time_to_call?: string | null
          buying_timeline?: string | null
          call_outcome?: string | null
          conversation_id?: string | null
          conversation_summary?: string | null
          created_at?: string | null
          credit_concerns?: boolean | null
          credit_score_range?: string | null
          current_lender?: string | null
          debt_concerns?: boolean | null
          down_payment_amount?: number | null
          down_payment_concerns?: boolean | null
          down_payment_percentage?: number | null
          employment_length?: string | null
          employment_status?: string | null
          extraction_timestamp?: string | null
          extraction_version?: string | null
          first_time_buyer?: boolean | null
          follow_up_date?: string | null
          has_co_borrower?: boolean | null
          has_realtor?: boolean | null
          id?: string
          interest_rate_concerns?: boolean | null
          interested_properties?: Json | null
          is_self_employed?: boolean | null
          job_change_concerns?: boolean | null
          knows_overlays?: boolean | null
          lead_id?: string | null
          lead_qualification_status?: string | null
          lead_score?: number | null
          lead_temperature?: string | null
          loan_amount?: number | null
          loan_type?: string | null
          monthly_debt_payments?: number | null
          multiple_properties_interested?: boolean | null
          next_steps?: Json | null
          objection_details?: Json | null
          overlay_education_completed?: boolean | null
          pre_approval_status?: string | null
          preferred_contact_method?: string | null
          primary_concerns?: Json | null
          property_address?: string | null
          property_mls_number?: string | null
          property_price?: number | null
          property_type?: string | null
          property_use?: string | null
          raw_extraction_data?: Json | null
          ready_to_buy_timeline?: string | null
          realtor_name?: string | null
          requested_actions?: Json | null
          va_eligible?: boolean | null
          wants_credit_review?: boolean | null
          wants_down_payment_assistance?: boolean | null
        }
        Update: {
          annual_income?: number | null
          best_time_to_call?: string | null
          buying_timeline?: string | null
          call_outcome?: string | null
          conversation_id?: string | null
          conversation_summary?: string | null
          created_at?: string | null
          credit_concerns?: boolean | null
          credit_score_range?: string | null
          current_lender?: string | null
          debt_concerns?: boolean | null
          down_payment_amount?: number | null
          down_payment_concerns?: boolean | null
          down_payment_percentage?: number | null
          employment_length?: string | null
          employment_status?: string | null
          extraction_timestamp?: string | null
          extraction_version?: string | null
          first_time_buyer?: boolean | null
          follow_up_date?: string | null
          has_co_borrower?: boolean | null
          has_realtor?: boolean | null
          id?: string
          interest_rate_concerns?: boolean | null
          interested_properties?: Json | null
          is_self_employed?: boolean | null
          job_change_concerns?: boolean | null
          knows_overlays?: boolean | null
          lead_id?: string | null
          lead_qualification_status?: string | null
          lead_score?: number | null
          lead_temperature?: string | null
          loan_amount?: number | null
          loan_type?: string | null
          monthly_debt_payments?: number | null
          multiple_properties_interested?: boolean | null
          next_steps?: Json | null
          objection_details?: Json | null
          overlay_education_completed?: boolean | null
          pre_approval_status?: string | null
          preferred_contact_method?: string | null
          primary_concerns?: Json | null
          property_address?: string | null
          property_mls_number?: string | null
          property_price?: number | null
          property_type?: string | null
          property_use?: string | null
          raw_extraction_data?: Json | null
          ready_to_buy_timeline?: string | null
          realtor_name?: string | null
          requested_actions?: Json | null
          va_eligible?: boolean | null
          wants_credit_review?: boolean | null
          wants_down_payment_assistance?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_extractions_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_extractions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_messages: {
        Row: {
          content: string
          conversation_id: string | null
          created_at: string
          id: string
          role: string
          seq: number
          ts: string
        }
        Insert: {
          content: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          role: string
          seq?: number
          ts?: string
        }
        Update: {
          content?: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          role?: string
          seq?: number
          ts?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          agent_id: string | null
          call_sid: string | null
          call_status: string | null
          created_at: string | null
          direction: string | null
          duration: number | null
          ended_at: string | null
          extraction_status: string | null
          id: string
          lead_id: string | null
          recording_url: string | null
          retell_call_analysis: Json | null
          retell_call_data: Json | null
          sentiment_score: number | null
          started_at: string | null
          transcript: string | null
        }
        Insert: {
          agent_id?: string | null
          call_sid?: string | null
          call_status?: string | null
          created_at?: string | null
          direction?: string | null
          duration?: number | null
          ended_at?: string | null
          extraction_status?: string | null
          id?: string
          lead_id?: string | null
          recording_url?: string | null
          retell_call_analysis?: Json | null
          retell_call_data?: Json | null
          sentiment_score?: number | null
          started_at?: string | null
          transcript?: string | null
        }
        Update: {
          agent_id?: string | null
          call_sid?: string | null
          call_status?: string | null
          created_at?: string | null
          direction?: string | null
          duration?: number | null
          ended_at?: string | null
          extraction_status?: string | null
          id?: string
          lead_id?: string | null
          recording_url?: string | null
          retell_call_analysis?: Json | null
          retell_call_data?: Json | null
          sentiment_score?: number | null
          started_at?: string | null
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
      payouts: {
        Row: {
          agent_id: string | null
          amount: number
          created_at: string | null
          id: string
          showing_id: string | null
          status: string | null
          stripe_payment_id: string | null
        }
        Insert: {
          agent_id?: string | null
          amount: number
          created_at?: string | null
          id?: string
          showing_id?: string | null
          status?: string | null
          stripe_payment_id?: string | null
        }
        Update: {
          agent_id?: string | null
          amount?: number
          created_at?: string | null
          id?: string
          showing_id?: string | null
          status?: string | null
          stripe_payment_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payouts_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payouts_showing_id_fkey"
            columns: ["showing_id"]
            isOneToOne: false
            referencedRelation: "showings"
            referencedColumns: ["id"]
          },
        ]
      }
      phone_lead_mapping: {
        Row: {
          cinc_data: Json | null
          last_updated: string | null
          lead_id: string | null
          lead_name: string | null
          phone_e164: string
          phone_raw: string | null
          property_interests: Json | null
        }
        Insert: {
          cinc_data?: Json | null
          last_updated?: string | null
          lead_id?: string | null
          lead_name?: string | null
          phone_e164: string
          phone_raw?: string | null
          property_interests?: Json | null
        }
        Update: {
          cinc_data?: Json | null
          last_updated?: string | null
          lead_id?: string | null
          lead_name?: string | null
          phone_e164?: string
          phone_raw?: string | null
          property_interests?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "phone_lead_mapping_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
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
          role: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          role?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: string
        }
        Relationships: []
      }
      qualification_data: {
        Row: {
          annual_income: number | null
          best_time_to_call: string | null
          conversation_id: string | null
          created_at: string | null
          credit_concerns: boolean | null
          current_lender: string | null
          debt_concerns: boolean | null
          debt_to_income_ratio: number | null
          down_payment_concerns: boolean | null
          down_payment_percentage: number | null
          estimated_credit_score: string | null
          first_time_buyer: boolean | null
          has_co_borrower: boolean | null
          has_specific_property: boolean | null
          id: string
          interest_rate_concerns: boolean | null
          is_self_employed: boolean | null
          job_change_concerns: boolean | null
          knows_about_overlays: boolean | null
          lead_id: string | null
          lead_temperature: string | null
          loan_amount: number | null
          loan_type: string | null
          multiple_properties_interested: boolean | null
          objection_details: Json | null
          overlay_education_completed: boolean | null
          pre_approval_status: string | null
          preferred_contact_method: string | null
          property_address: string | null
          property_mls_number: string | null
          property_price: number | null
          property_type: string | null
          property_use: string | null
          qualifying_notes: string | null
          ready_to_buy_timeline: string | null
          time_frame: string | null
          va_eligible: boolean | null
          wants_credit_review: boolean | null
          wants_down_payment_assistance: boolean | null
        }
        Insert: {
          annual_income?: number | null
          best_time_to_call?: string | null
          conversation_id?: string | null
          created_at?: string | null
          credit_concerns?: boolean | null
          current_lender?: string | null
          debt_concerns?: boolean | null
          debt_to_income_ratio?: number | null
          down_payment_concerns?: boolean | null
          down_payment_percentage?: number | null
          estimated_credit_score?: string | null
          first_time_buyer?: boolean | null
          has_co_borrower?: boolean | null
          has_specific_property?: boolean | null
          id?: string
          interest_rate_concerns?: boolean | null
          is_self_employed?: boolean | null
          job_change_concerns?: boolean | null
          knows_about_overlays?: boolean | null
          lead_id?: string | null
          lead_temperature?: string | null
          loan_amount?: number | null
          loan_type?: string | null
          multiple_properties_interested?: boolean | null
          objection_details?: Json | null
          overlay_education_completed?: boolean | null
          pre_approval_status?: string | null
          preferred_contact_method?: string | null
          property_address?: string | null
          property_mls_number?: string | null
          property_price?: number | null
          property_type?: string | null
          property_use?: string | null
          qualifying_notes?: string | null
          ready_to_buy_timeline?: string | null
          time_frame?: string | null
          va_eligible?: boolean | null
          wants_credit_review?: boolean | null
          wants_down_payment_assistance?: boolean | null
        }
        Update: {
          annual_income?: number | null
          best_time_to_call?: string | null
          conversation_id?: string | null
          created_at?: string | null
          credit_concerns?: boolean | null
          current_lender?: string | null
          debt_concerns?: boolean | null
          debt_to_income_ratio?: number | null
          down_payment_concerns?: boolean | null
          down_payment_percentage?: number | null
          estimated_credit_score?: string | null
          first_time_buyer?: boolean | null
          has_co_borrower?: boolean | null
          has_specific_property?: boolean | null
          id?: string
          interest_rate_concerns?: boolean | null
          is_self_employed?: boolean | null
          job_change_concerns?: boolean | null
          knows_about_overlays?: boolean | null
          lead_id?: string | null
          lead_temperature?: string | null
          loan_amount?: number | null
          loan_type?: string | null
          multiple_properties_interested?: boolean | null
          objection_details?: Json | null
          overlay_education_completed?: boolean | null
          pre_approval_status?: string | null
          preferred_contact_method?: string | null
          property_address?: string | null
          property_mls_number?: string | null
          property_price?: number | null
          property_type?: string | null
          property_use?: string | null
          qualifying_notes?: string | null
          ready_to_buy_timeline?: string | null
          time_frame?: string | null
          va_eligible?: boolean | null
          wants_credit_review?: boolean | null
          wants_down_payment_assistance?: boolean | null
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
      scheduled_callbacks: {
        Row: {
          assigned_to: string | null
          attempt_count: number | null
          callback_datetime: string | null
          callback_notes: string | null
          callback_reason: string | null
          callback_type: string | null
          created_at: string | null
          created_by: string | null
          id: string
          last_attempt_at: string | null
          lead_id: string | null
          phone_number: string | null
          status: string | null
        }
        Insert: {
          assigned_to?: string | null
          attempt_count?: number | null
          callback_datetime?: string | null
          callback_notes?: string | null
          callback_reason?: string | null
          callback_type?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          last_attempt_at?: string | null
          lead_id?: string | null
          phone_number?: string | null
          status?: string | null
        }
        Update: {
          assigned_to?: string | null
          attempt_count?: number | null
          callback_datetime?: string | null
          callback_notes?: string | null
          callback_reason?: string | null
          callback_type?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          last_attempt_at?: string | null
          lead_id?: string | null
          phone_number?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_callbacks_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      showing_ratings: {
        Row: {
          comment: string | null
          created_at: string | null
          created_by: string | null
          id: string
          rating: number | null
          showing_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          rating?: number | null
          showing_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          rating?: number | null
          showing_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "showing_ratings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "showing_ratings_showing_id_fkey"
            columns: ["showing_id"]
            isOneToOne: false
            referencedRelation: "showings"
            referencedColumns: ["id"]
          },
        ]
      }
      showings: {
        Row: {
          client_name: string
          client_phone: string
          client_type: string | null
          created_at: string | null
          duration: number | null
          id: string
          location_lat: number | null
          location_lng: number | null
          mls_number: string | null
          payout_amount: number
          preferred_agent_email: string | null
          property_address: string
          requesting_agent_id: string | null
          showing_agent_id: string | null
          showing_date: string
          showing_time: string
          special_instructions: string | null
          status: string | null
          updated_at: string | null
          urgency_level: string | null
        }
        Insert: {
          client_name: string
          client_phone: string
          client_type?: string | null
          created_at?: string | null
          duration?: number | null
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          mls_number?: string | null
          payout_amount: number
          preferred_agent_email?: string | null
          property_address: string
          requesting_agent_id?: string | null
          showing_agent_id?: string | null
          showing_date: string
          showing_time: string
          special_instructions?: string | null
          status?: string | null
          updated_at?: string | null
          urgency_level?: string | null
        }
        Update: {
          client_name?: string
          client_phone?: string
          client_type?: string | null
          created_at?: string | null
          duration?: number | null
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          mls_number?: string | null
          payout_amount?: number
          preferred_agent_email?: string | null
          property_address?: string
          requesting_agent_id?: string | null
          showing_agent_id?: string | null
          showing_date?: string
          showing_time?: string
          special_instructions?: string | null
          status?: string | null
          updated_at?: string | null
          urgency_level?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "showings_requesting_agent_id_fkey"
            columns: ["requesting_agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "showings_showing_agent_id_fkey"
            columns: ["showing_agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          first_name?: string
          id?: string
          last_name?: string
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
          call_status: string | null
          created_at: string | null
          direction: string | null
          duration: number | null
          ended_at: string | null
          extraction_status: string | null
          id: string
          lead_id: string | null
          recording_url: string | null
          retell_call_analysis: Json | null
          retell_call_data: Json | null
          sentiment_score: number | null
          started_at: string | null
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
