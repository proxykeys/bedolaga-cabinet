import type { ReferralInfo } from '@/types';

/**
 * Mock referral info for StatsGrid (Dashboard).
 */
export const mockReferralInfo: ReferralInfo = {
  referral_code: 'PKDEMO1001',
  referral_link: 'https://my.proxykeys.net/?ref=PKDEMO1001',
  bot_referral_link: 'https://t.me/proxykeysbot?start=PKDEMO1001',
  total_referrals: 24,
  active_referrals: 18,
  total_earnings_kopeks: 450000,
  total_earnings_rubles: 4500,
  commission_percent: 25,
  available_balance_kopeks: 120000,
  available_balance_rubles: 1200,
  withdrawn_kopeks: 50000,
};
