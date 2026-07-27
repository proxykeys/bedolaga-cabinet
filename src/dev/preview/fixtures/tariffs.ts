import type { TrialInfo } from '@/types';

/**
 * Trial info for TrialOfferCard — shown when user has no subscription.
 */
export const mockTrialAvailable: TrialInfo = {
  is_available: true,
  duration_days: 3,
  traffic_limit_gb: 10,
  device_limit: 1,
  requires_payment: false,
  price_kopeks: 0,
  price_rubles: 0,
  reason_unavailable: null,
};

/**
 * Trial unavailable — already used.
 */
export const mockTrialUnavailable: TrialInfo = {
  is_available: false,
  duration_days: 3,
  traffic_limit_gb: 10,
  device_limit: 1,
  requires_payment: false,
  price_kopeks: 0,
  price_rubles: 0,
  reason_unavailable: 'Вы уже использовали пробный период',
};

/**
 * Trial with activation price.
 */
export const mockTrialPaid: TrialInfo = {
  is_available: true,
  duration_days: 3,
  traffic_limit_gb: 10,
  device_limit: 1,
  requires_payment: true,
  price_kopeks: 5000,
  price_rubles: 50,
  reason_unavailable: null,
};
