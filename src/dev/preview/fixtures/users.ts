import type { User } from '@/types';

/**
 * Mock user for preview. Used to seed useAuthStore so components that read
 * user data (Dashboard header, Profile, etc.) render with realistic content.
 */
export const mockUser: User = {
  id: 1001,
  telegram_id: 987654321,
  username: 'proxykeys_demo',
  first_name: 'Demo',
  last_name: 'User',
  email: 'demo@proxykeys.net',
  email_verified: true,
  balance_kopeks: 150000,
  balance_rubles: 1500,
  referral_code: 'PKDEMO1001',
  language: 'ru',
  created_at: '2026-01-15T10:30:00Z',
  auth_type: 'telegram',
};

/**
 * User with zero balance — for expired/no-balance subscription card states.
 */
export const mockUserNoBalance: User = {
  ...mockUser,
  balance_kopeks: 0,
  balance_rubles: 0,
};
