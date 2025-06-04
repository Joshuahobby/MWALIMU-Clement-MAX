import { createClient } from './client'
import { createServerClient } from './server'
import { createAdminClient } from './admin'
import type { User, Payment, AccessCode, TestSession } from '../types'
import { cookies } from 'next/headers'

/**
 * SupabaseStorage - A replacement for the localStorage-based StorageManager
 * Provides data access methods to interact with Supabase database
 */
export const SupabaseStorage = {
  // User Management
  async saveUser(user: User): Promise<void> {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          phone: user.phone,
          name: user.name || null,
          email: user.email || null,
          subscription_type: user.subscriptionType || null,
          subscription_expiry: user.subscriptionExpiry || null,
          access_codes: user.accessCodes || []
        })
      
      if (error) throw error
    } catch (error) {
      console.error('Failed to save user:', error)
      throw error
    }
  },

  async getUserByPhone(phone: string): Promise<User | null> {
    try {
      const supabase = createClient()
      const { data: userData, error } = await supabase
        .from('users')
        .select(`
          id, 
          phone, 
          name, 
          email, 
          created_at, 
          subscription_type, 
          subscription_expiry,
          access_codes
        `)
        .eq('phone', phone)
        .single()
      
      if (error || !userData) return null
      
      // Get payment history
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userData.id)
        
      // Get test history
      const { data: testData } = await supabase
        .from('test_sessions')
        .select('*')
        .eq('user_id', userData.id)
        
      // Map to our User type
      const user: User = {
        id: userData.id,
        phone: userData.phone,
        name: userData.name || undefined,
        email: userData.email || undefined,
        createdAt: userData.created_at,
        subscriptionType: userData.subscription_type || undefined,
        subscriptionExpiry: userData.subscription_expiry || undefined,
        accessCodes: userData.access_codes || [],
        paymentHistory: paymentsData || [],
        testHistory: testData || []
      }
      
      return user
    } catch (error) {
      console.error('Failed to get user by phone:', error)
      return null
    }
  },

  async getUserById(id: string): Promise<User | null> {
    try {
      const supabase = createClient()
      const { data: userData, error } = await supabase
        .from('users')
        .select(`
          id, 
          phone, 
          name, 
          email, 
          created_at, 
          subscription_type, 
          subscription_expiry,
          access_codes
        `)
        .eq('id', id)
        .single()
      
      if (error || !userData) return null
      
      // Get payment history
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userData.id)
        
      // Get test history
      const { data: testData } = await supabase
        .from('test_sessions')
        .select('*')
        .eq('user_id', userData.id)
        
      // Map to our User type
      const user: User = {
        id: userData.id,
        phone: userData.phone,
        name: userData.name || undefined,
        email: userData.email || undefined,
        createdAt: userData.created_at,
        subscriptionType: userData.subscription_type || undefined,
        subscriptionExpiry: userData.subscription_expiry || undefined,
        accessCodes: userData.access_codes || [],
        paymentHistory: paymentsData || [],
        testHistory: testData || []
      }
      
      return user
    } catch (error) {
      console.error('Failed to get user by id:', error)
      return null
    }
  },

  async setCurrentUser(user: User | null): Promise<void> {
    // This is now handled by Supabase Auth
    // We can add session management here if needed
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const supabase = createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (!authUser) return null
      
      return this.getUserById(authUser.id)
    } catch (error) {
      console.error('Failed to get current user:', error)
      return null
    }
  },

  // Payment Management
  async savePayment(payment: Payment): Promise<void> {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('payments')
        .upsert({
          id: payment.id,
          user_id: payment.userId,
          amount: payment.amount,
          currency: payment.currency,
          payment_method: payment.paymentMethod,
          phone: payment.phone,
          status: payment.status,
          subscription_type: payment.subscriptionType,
          created_at: payment.createdAt,
          completed_at: payment.completedAt || null,
          transaction_id: payment.transactionId || null,
          access_code: payment.accessCode || null
        })
      
      if (error) throw error
    } catch (error) {
      console.error('Failed to save payment:', error)
      throw error
    }
  },

  async getPaymentsByUserId(userId: string): Promise<Payment[]> {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userId)
      
      if (error) throw error
      
      return data as Payment[]
    } catch (error) {
      console.error('Failed to get payments by user id:', error)
      return []
    }
  },

  async getPaymentById(id: string): Promise<Payment | null> {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error || !data) return null
      
      return data as Payment
    } catch (error) {
      console.error('Failed to get payment by id:', error)
      return null
    }
  },

  // Access Code Management
  async saveAccessCode(accessCode: AccessCode): Promise<void> {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('access_codes')
        .upsert({
          code: accessCode.code,
          user_id: accessCode.userId,
          type: accessCode.type,
          created_at: accessCode.createdAt,
          expires_at: accessCode.expiresAt,
          is_used: accessCode.isUsed,
          used_at: accessCode.usedAt || null
        })
      
      if (error) throw error
    } catch (error) {
      console.error('Failed to save access code:', error)
      throw error
    }
  },

  async getAccessCodeByCode(code: string): Promise<AccessCode | null> {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('access_codes')
        .select('*')
        .eq('code', code)
        .single()
      
      if (error || !data) return null
      
      return {
        code: data.code,
        userId: data.user_id,
        type: data.type as 'single' | 'daily' | 'weekly' | 'monthly',
        createdAt: data.created_at,
        expiresAt: data.expires_at,
        isUsed: data.is_used,
        usedAt: data.used_at || undefined
      }
    } catch (error) {
      console.error('Failed to get access code:', error)
      return null
    }
  },

  async validateAccessCode(code: string): Promise<boolean> {
    try {
      const accessCode = await this.getAccessCodeByCode(code)
      if (!accessCode) return false
      
      const now = new Date()
      const expiresAt = new Date(accessCode.expiresAt)
      
      return !accessCode.isUsed && now < expiresAt
    } catch (error) {
      console.error('Failed to validate access code:', error)
      return false
    }
  },

  async useAccessCode(code: string): Promise<boolean> {
    try {
      const accessCode = await this.getAccessCodeByCode(code)
      if (!accessCode || !await this.validateAccessCode(code)) return false
      
      const supabase = createClient()
      const { error } = await supabase
        .from('access_codes')
        .update({
          is_used: true,
          used_at: new Date().toISOString()
        })
        .eq('code', code)
      
      if (error) throw error
      
      return true
    } catch (error) {
      console.error('Failed to use access code:', error)
      return false
    }
  },

  // Test Session Management
  async saveTestSession(session: TestSession): Promise<void> {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('test_sessions')
        .upsert({
          id: session.id,
          user_id: session.userId,
          started_at: session.startedAt,
          completed_at: session.completedAt || null,
          score: session.score || null,
          total_questions: session.totalQuestions || null,
          correct_answers: session.correctAnswers || null,
          language: session.language,
          test_type: session.testType
        })
      
      if (error) throw error
    } catch (error) {
      console.error('Failed to save test session:', error)
      throw error
    }
  },

  async getTestSessionsByUserId(userId: string): Promise<TestSession[]> {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('test_sessions')
        .select('*')
        .eq('user_id', userId)
      
      if (error) throw error
      
      // Map from DB format to our type format
      return data.map(session => ({
        id: session.id,
        userId: session.user_id,
        startedAt: session.started_at,
        completedAt: session.completed_at || undefined,
        score: session.score || undefined,
        totalQuestions: session.total_questions || undefined,
        correctAnswers: session.correct_answers || undefined,
        language: session.language as 'kinyarwanda' | 'english' | 'french',
        testType: session.test_type as 'practice' | 'mock'
      }))
    } catch (error) {
      console.error('Failed to get test sessions by user id:', error)
      return []
    }
  },

  // Utility Methods
  generateId(): string {
    // Use UUID v4
    return crypto.randomUUID()
  },

  generateAccessCode(): string {
    return Math.random().toString(36).substr(2, 8).toUpperCase()
  }
} 