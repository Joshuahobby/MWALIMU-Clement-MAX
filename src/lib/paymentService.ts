import type { Payment, PaymentPlan, User } from './types';
import { SupabaseStorage } from './supabase/storage';

export const PAYMENT_PLANS: PaymentPlan[] = [
  { type: 'single', price: 100, description: 'kukizamini kimwe', duration: 1 },
  { type: 'daily', price: 1000, description: 'imara umunsi wose', duration: 24 },
  { type: 'weekly', price: 4000, description: 'imara icyumweru cyose', duration: 168 },
  { type: 'monthly', price: 10000, description: 'imara ukwezi kwose', duration: 720 },
];

export const PaymentService = {
  async initiatePayment(
    phone: string,
    planType: 'single' | 'daily' | 'weekly' | 'monthly',
    paymentMethod: 'MTN' | 'AIRTEL'
  ): Promise<Payment> {
    const plan = PAYMENT_PLANS.find(p => p.type === planType);
    if (!plan) {
      throw new Error('Invalid payment plan');
    }

    // Validate phone number
    if (!this.validatePhoneNumber(phone)) {
      throw new Error('Invalid phone number format');
    }

    // Create or get user
    const user = await this.createOrGetUser(phone);

    // Create payment record
    const payment: Payment = {
      id: SupabaseStorage.generateId(),
      userId: user.id,
      amount: plan.price,
      currency: 'RWF',
      paymentMethod,
      phone,
      status: 'pending',
      subscriptionType: planType,
      createdAt: new Date().toISOString(),
    };

    await SupabaseStorage.savePayment(payment);

    // Simulate payment processing
    this.simulatePaymentProcessing(payment.id);

    return payment;
  },

  async verifyPayment(paymentId: string): Promise<Payment | null> {
    return SupabaseStorage.getPaymentById(paymentId);
  },

  async processPaymentSuccess(paymentId: string): Promise<void> {
    const payment = await SupabaseStorage.getPaymentById(paymentId);
    if (!payment) throw new Error('Payment not found');

    const user = await SupabaseStorage.getUserById(payment.userId);
    if (!user) throw new Error('User not found');

    // Update payment status
    payment.status = 'completed';
    payment.completedAt = new Date().toISOString();
    payment.transactionId = this.generateTransactionId();

    // Generate access code
    const accessCode = SupabaseStorage.generateAccessCode();
    payment.accessCode = accessCode;

    // Update user subscription
    const plan = PAYMENT_PLANS.find(p => p.type === payment.subscriptionType);
    if (plan) {
      user.subscriptionType = payment.subscriptionType;
      user.subscriptionExpiry = new Date(
        Date.now() + plan.duration * 60 * 60 * 1000
      ).toISOString();
      user.accessCodes.push(accessCode);
      user.paymentHistory.push(payment);
    }

    // Save access code
    const codeExpiry = new Date(Date.now() + (plan?.duration || 1) * 60 * 60 * 1000);
    await SupabaseStorage.saveAccessCode({
      code: accessCode,
      userId: user.id,
      type: payment.subscriptionType,
      createdAt: new Date().toISOString(),
      expiresAt: codeExpiry.toISOString(),
      isUsed: false,
    });

    await SupabaseStorage.savePayment(payment);
    await SupabaseStorage.saveUser(user);
  },

  async processPaymentFailure(paymentId: string): Promise<void> {
    const payment = await SupabaseStorage.getPaymentById(paymentId);
    if (!payment) throw new Error('Payment not found');

    payment.status = 'failed';
    payment.completedAt = new Date().toISOString();

    await SupabaseStorage.savePayment(payment);
  },

  async createOrGetUser(phone: string): Promise<User> {
    let user = await SupabaseStorage.getUserByPhone(phone);

    if (!user) {
      user = {
        id: SupabaseStorage.generateId(),
        phone,
        createdAt: new Date().toISOString(),
        accessCodes: [],
        paymentHistory: [],
        testHistory: [],
      };
      await SupabaseStorage.saveUser(user);
    }

    return user;
  },

  simulatePaymentProcessing(paymentId: string): void {
    // Simulate payment processing time (5-10 seconds)
    const processingTime = Math.random() * 5000 + 5000;

    setTimeout(async () => {
      // 90% success rate for simulation
      const isSuccess = Math.random() > 0.1;

      if (isSuccess) {
        await this.processPaymentSuccess(paymentId);
      } else {
        await this.processPaymentFailure(paymentId);
      }
    }, processingTime);
  },

  validatePhoneNumber(phone: string): boolean {
    // Rwanda phone number validation
    const rwandaPhoneRegex = /^(\+?250|0)?[7-9]\d{8}$/;
    return rwandaPhoneRegex.test(phone.replace(/\s/g, ''));
  },

  generateTransactionId(): string {
    return `TXN_${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  },

  async loginWithCode(code: string): Promise<User | null> {
    const accessCode = await SupabaseStorage.getAccessCodeByCode(code);
    if (!accessCode || !await SupabaseStorage.validateAccessCode(code)) {
      return null;
    }

    const user = await SupabaseStorage.getUserById(accessCode.userId);
    if (user) {
      await SupabaseStorage.setCurrentUser(user);
      return user;
    }

    return null;
  },

  logout(): void {
    SupabaseStorage.setCurrentUser(null);
  },

  getCurrentUser(): Promise<User | null> {
    return SupabaseStorage.getCurrentUser();
  },

  checkUserAccess(user: User): boolean {
    if (!user.subscriptionExpiry) return false;

    const now = new Date();
    const expiry = new Date(user.subscriptionExpiry);

    return now < expiry;
  }
};
