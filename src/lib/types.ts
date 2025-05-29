export interface User {
  id: string;
  phone: string;
  name?: string;
  email?: string;
  createdAt: string;
  subscriptionType?: 'single' | 'daily' | 'weekly' | 'monthly';
  subscriptionExpiry?: string;
  accessCodes: string[];
  paymentHistory: Payment[];
  testHistory: TestSession[];
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: 'RWF';
  paymentMethod: 'MTN' | 'AIRTEL';
  phone: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  subscriptionType: 'single' | 'daily' | 'weekly' | 'monthly';
  createdAt: string;
  completedAt?: string;
  transactionId?: string;
  accessCode?: string;
}

export interface AccessCode {
  code: string;
  userId: string;
  type: 'single' | 'daily' | 'weekly' | 'monthly';
  createdAt: string;
  expiresAt: string;
  isUsed: boolean;
  usedAt?: string;
}

export interface TestSession {
  id: string;
  userId: string;
  startedAt: string;
  completedAt?: string;
  score?: number;
  totalQuestions?: number;
  correctAnswers?: number;
  language: 'kinyarwanda' | 'english' | 'french';
  testType: 'practice' | 'mock';
}

export interface PaymentPlan {
  type: 'single' | 'daily' | 'weekly' | 'monthly';
  price: number;
  description: string;
  duration: number; // in hours
}
