/**
 * Supabase database type definitions
 * These types ensure type safety when interacting with Supabase
 */
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          phone: string
          name: string | null
          email: string | null
          created_at: string
          subscription_type: 'single' | 'daily' | 'weekly' | 'monthly' | null
          subscription_expiry: string | null
          access_codes: string[]
        }
        Insert: {
          id?: string
          phone: string
          name?: string | null
          email?: string | null
          created_at?: string
          subscription_type?: 'single' | 'daily' | 'weekly' | 'monthly' | null
          subscription_expiry?: string | null
          access_codes?: string[]
        }
        Update: {
          id?: string
          phone?: string
          name?: string | null
          email?: string | null
          created_at?: string
          subscription_type?: 'single' | 'daily' | 'weekly' | 'monthly' | null
          subscription_expiry?: string | null
          access_codes?: string[]
        }
      }
      payments: {
        Row: {
          id: string
          user_id: string
          amount: number
          currency: string
          payment_method: string
          phone: string
          status: string
          subscription_type: 'single' | 'daily' | 'weekly' | 'monthly'
          created_at: string
          completed_at: string | null
          transaction_id: string | null
          access_code: string | null
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          currency: string
          payment_method: string
          phone: string
          status: string
          subscription_type: 'single' | 'daily' | 'weekly' | 'monthly'
          created_at?: string
          completed_at?: string | null
          transaction_id?: string | null
          access_code?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          currency?: string
          payment_method?: string
          phone?: string
          status?: string
          subscription_type?: 'single' | 'daily' | 'weekly' | 'monthly'
          created_at?: string
          completed_at?: string | null
          transaction_id?: string | null
          access_code?: string | null
        }
      }
      access_codes: {
        Row: {
          code: string
          user_id: string
          type: 'single' | 'daily' | 'weekly' | 'monthly'
          created_at: string
          expires_at: string
          is_used: boolean
          used_at: string | null
        }
        Insert: {
          code: string
          user_id: string
          type: 'single' | 'daily' | 'weekly' | 'monthly'
          created_at?: string
          expires_at: string
          is_used?: boolean
          used_at?: string | null
        }
        Update: {
          code?: string
          user_id?: string
          type?: 'single' | 'daily' | 'weekly' | 'monthly'
          created_at?: string
          expires_at?: string
          is_used?: boolean
          used_at?: string | null
        }
      }
      test_sessions: {
        Row: {
          id: string
          user_id: string
          started_at: string
          completed_at: string | null
          score: number | null
          total_questions: number | null
          correct_answers: number | null
          language: 'kinyarwanda' | 'english' | 'french'
          test_type: 'practice' | 'mock'
        }
        Insert: {
          id?: string
          user_id: string
          started_at?: string
          completed_at?: string | null
          score?: number | null
          total_questions?: number | null
          correct_answers?: number | null
          language: 'kinyarwanda' | 'english' | 'french'
          test_type: 'practice' | 'mock'
        }
        Update: {
          id?: string
          user_id?: string
          started_at?: string
          completed_at?: string | null
          score?: number | null
          total_questions?: number | null
          correct_answers?: number | null
          language?: 'kinyarwanda' | 'english' | 'french'
          test_type?: 'practice' | 'mock'
        }
      }
      questions: {
        Row: {
          id: string
          question_text: {
            kn: string
            en: string
            fr: string
          }
          options: {
            kn: string[]
            en: string[]
            fr: string[]
          }
          correct_answer: number
          category: string
          created_at: string
        }
        Insert: {
          id?: string
          question_text: {
            kn: string
            en: string
            fr: string
          }
          options: {
            kn: string[]
            en: string[]
            fr: string[]
          }
          correct_answer: number
          category: string
          created_at?: string
        }
        Update: {
          id?: string
          question_text?: {
            kn: string
            en: string
            fr: string
          }
          options?: {
            kn: string[]
            en: string[]
            fr: string[]
          }
          correct_answer?: number
          category?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 