import type { User, Payment, AccessCode, TestSession } from './types';

const STORAGE_KEYS = {
  USERS: 'mwalimu_users',
  PAYMENTS: 'mwalimu_payments',
  ACCESS_CODES: 'mwalimu_access_codes',
  TEST_SESSIONS: 'mwalimu_test_sessions',
  CURRENT_USER: 'mwalimu_current_user',
};

// Check if we're on the client side
const isClient = typeof window !== 'undefined';

export const StorageManager = {
  // User Management
  saveUser(user: User): void {
    if (!isClient) return;
    const users = this.getUsers();
    const existingIndex = users.findIndex(u => u.id === user.id);

    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }

    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  getUsers(): User[] {
    if (!isClient) return [];
    const users = localStorage.getItem(STORAGE_KEYS.USERS);
    return users ? JSON.parse(users) : [];
  },

  getUserByPhone(phone: string): User | null {
    const users = this.getUsers();
    return users.find(u => u.phone === phone) || null;
  },

  getUserById(id: string): User | null {
    const users = this.getUsers();
    return users.find(u => u.id === id) || null;
  },

  setCurrentUser(user: User | null): void {
    if (!isClient) return;
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  getCurrentUser(): User | null {
    if (!isClient) return null;
    const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return user ? JSON.parse(user) : null;
  },

  // Payment Management
  savePayment(payment: Payment): void {
    if (!isClient) return;
    const payments = this.getPayments();
    const existingIndex = payments.findIndex(p => p.id === payment.id);

    if (existingIndex >= 0) {
      payments[existingIndex] = payment;
    } else {
      payments.push(payment);
    }

    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  },

  getPayments(): Payment[] {
    if (!isClient) return [];
    const payments = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    return payments ? JSON.parse(payments) : [];
  },

  getPaymentsByUserId(userId: string): Payment[] {
    const payments = this.getPayments();
    return payments.filter(p => p.userId === userId);
  },

  getPaymentById(id: string): Payment | null {
    const payments = this.getPayments();
    return payments.find(p => p.id === id) || null;
  },

  // Access Code Management
  saveAccessCode(accessCode: AccessCode): void {
    if (!isClient) return;
    const codes = this.getAccessCodes();
    const existingIndex = codes.findIndex(c => c.code === accessCode.code);

    if (existingIndex >= 0) {
      codes[existingIndex] = accessCode;
    } else {
      codes.push(accessCode);
    }

    localStorage.setItem(STORAGE_KEYS.ACCESS_CODES, JSON.stringify(codes));
  },

  getAccessCodes(): AccessCode[] {
    if (!isClient) return [];
    const codes = localStorage.getItem(STORAGE_KEYS.ACCESS_CODES);
    return codes ? JSON.parse(codes) : [];
  },

  getAccessCodeByCode(code: string): AccessCode | null {
    const codes = this.getAccessCodes();
    return codes.find(c => c.code === code) || null;
  },

  validateAccessCode(code: string): boolean {
    const accessCode = this.getAccessCodeByCode(code);
    if (!accessCode) return false;

    const now = new Date();
    const expiresAt = new Date(accessCode.expiresAt);

    return !accessCode.isUsed && now < expiresAt;
  },

  useAccessCode(code: string): boolean {
    const accessCode = this.getAccessCodeByCode(code);
    if (!accessCode || !this.validateAccessCode(code)) return false;

    accessCode.isUsed = true;
    accessCode.usedAt = new Date().toISOString();
    this.saveAccessCode(accessCode);

    return true;
  },

  // Test Session Management
  saveTestSession(session: TestSession): void {
    if (!isClient) return;
    const sessions = this.getTestSessions();
    const existingIndex = sessions.findIndex(s => s.id === session.id);

    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.push(session);
    }

    localStorage.setItem(STORAGE_KEYS.TEST_SESSIONS, JSON.stringify(sessions));
  },

  getTestSessions(): TestSession[] {
    if (!isClient) return [];
    const sessions = localStorage.getItem(STORAGE_KEYS.TEST_SESSIONS);
    return sessions ? JSON.parse(sessions) : [];
  },

  getTestSessionsByUserId(userId: string): TestSession[] {
    const sessions = this.getTestSessions();
    return sessions.filter(s => s.userId === userId);
  },

  // Utility Methods
  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  },

  generateAccessCode(): string {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
  },

  clearAllData(): void {
    if (!isClient) return;
    for (const key of Object.values(STORAGE_KEYS)) {
      localStorage.removeItem(key);
    }
  }
};
