export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          phone_number: string | null;
          created_at: string;
          updated_at: string;
          last_login: string | null;
          subscription_type: string | null;
          subscription_start: string | null;
          subscription_end: string | null;
        };
        Insert: {
          id?: string;
          phone_number?: string | null;
          created_at?: string;
          updated_at?: string;
          last_login?: string | null;
          subscription_type?: string | null;
          subscription_start?: string | null;
          subscription_end?: string | null;
        };
        Update: {
          id?: string;
          phone_number?: string | null;
          created_at?: string;
          updated_at?: string;
          last_login?: string | null;
          subscription_type?: string | null;
          subscription_start?: string | null;
          subscription_end?: string | null;
        };
      };
      payments: {
        Row: {
          id: string;
          user_id: string | null;
          amount: number;
          currency: string;
          payment_method: string;
          payment_provider: string | null;
          payment_reference: string | null;
          status: string;
          subscription_type: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          amount: number;
          currency?: string;
          payment_method: string;
          payment_provider?: string | null;
          payment_reference?: string | null;
          status: string;
          subscription_type: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          amount?: number;
          currency?: string;
          payment_method?: string;
          payment_provider?: string | null;
          payment_reference?: string | null;
          status?: string;
          subscription_type?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      access_codes: {
        Row: {
          id: string;
          code: string;
          user_id: string | null;
          subscription_type: string;
          valid_from: string;
          valid_until: string;
          is_used: boolean;
          created_at: string;
          created_by: string | null;
          used_at: string | null;
        };
        Insert: {
          id?: string;
          code: string;
          user_id?: string | null;
          subscription_type: string;
          valid_from?: string;
          valid_until: string;
          is_used?: boolean;
          created_at?: string;
          created_by?: string | null;
          used_at?: string | null;
        };
        Update: {
          id?: string;
          code?: string;
          user_id?: string | null;
          subscription_type?: string;
          valid_from?: string;
          valid_until?: string;
          is_used?: boolean;
          created_at?: string;
          created_by?: string | null;
          used_at?: string | null;
        };
      };
      test_sessions: {
        Row: {
          id: string;
          user_id: string | null;
          start_time: string;
          end_time: string | null;
          score: number | null;
          total_questions: number | null;
          language: string;
          is_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          start_time?: string;
          end_time?: string | null;
          score?: number | null;
          total_questions?: number | null;
          language?: string;
          is_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          start_time?: string;
          end_time?: string | null;
          score?: number | null;
          total_questions?: number | null;
          language?: string;
          is_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      test_answers: {
        Row: {
          id: string;
          session_id: string;
          question_id: string;
          selected_option: number | null;
          is_correct: boolean | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          question_id: string;
          selected_option?: number | null;
          is_correct?: boolean | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          question_id?: string;
          selected_option?: number | null;
          is_correct?: boolean | null;
          created_at?: string;
        };
      };
      questions: {
        Row: {
          id: string;
          question_text: Json;
          options: Json;
          correct_option: number;
          category: string | null;
          difficulty: string;
          image_url: string | null;
          created_at: string;
          updated_at: string;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          question_text: Json;
          options: Json;
          correct_option: number;
          category?: string | null;
          difficulty?: string;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          question_text?: Json;
          options?: Json;
          correct_option?: number;
          category?: string | null;
          difficulty?: string;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
          is_active?: boolean;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      validate_access_code: {
        Args: {
          code_param: string;
        };
        Returns: {
          user_id: string;
          subscription_type: string;
          valid_until: string;
        }[];
      };
      create_or_update_user: {
        Args: {
          phone_number_param: string;
          subscription_type_param: string;
          subscription_days: number;
        };
        Returns: string;
      };
      generate_access_code: {
        Args: {
          subscription_type_param: string;
          valid_days: number;
          created_by_param?: string;
        };
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}