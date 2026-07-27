import type { QueryClient } from '@tanstack/react-query';
import { DEFAULT_THEME_COLORS } from '@/types/theme';
import type { Balance, SubscriptionsListResponse } from '@/types';
import type { ExchangeRates } from '@/api/currency';
import type { TelegramWidgetConfig } from '@/api/branding';
import type { PendingGift } from '@/api/gift';
import type { WheelConfig } from '@/api/wheel';
import type { PromoGroupDiscounts } from '@/api/promo';
import { mockTelegramWidgetConfig, mockBrandingInfo } from './mocks/branding';
import { mockPendingGifts } from './fixtures/gifts';
import { mockSubscriptionListItems } from './fixtures/subscriptionsList';
import { mockReferralInfo } from './fixtures/referrals';
import { activeGreen } from './fixtures/subscriptions';
import { mockTrialAvailable } from './fixtures/tariffs';

/**
 * Default exchange rates (same as useCurrency DEFAULT_RATES).
 */
const DEFAULT_RATES: ExchangeRates = {
  USD: 100,
  CNY: 14,
  IRR: 0.0024,
};

const mockBalance: Balance = {
  balance_kopeks: 150000,
  balance_rubles: 1500,
};

const mockSubscriptionsList: SubscriptionsListResponse = {
  subscriptions: mockSubscriptionListItems,
  multi_tariff_enabled: true,
};

const mockDevicesResponse = {
  devices: [
    {
      hwid: 'hwid-001',
      platform: 'ios',
      device_model: 'iPhone 15 Pro',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      local_name: null,
    },
    {
      hwid: 'hwid-002',
      platform: 'android',
      device_model: 'Pixel 8',
      created_at: new Date(Date.now() - 172800000).toISOString(),
      local_name: 'Рабочий',
    },
  ],
  total: 2,
  device_limit: 5,
};

const mockWheelConfig: WheelConfig = {
  is_enabled: true,
  name: 'Колесо фортуны',
  spin_cost_stars: 15,
  spin_cost_days: 1,
  spin_cost_stars_enabled: true,
  spin_cost_days_enabled: true,
  prizes: [
    {
      id: 1,
      display_name: '+5 дней',
      emoji: '🎁',
      color: '#3b82f6',
      prize_type: 'subscription_days',
    },
    { id: 2, display_name: '+50 ₽', emoji: '💰', color: '#22c55e', prize_type: 'balance_bonus' },
    { id: 3, display_name: 'Промокод', emoji: '🎟️', color: '#f59e0b', prize_type: 'promocode' },
  ],
  daily_limit: 3,
  user_spins_today: 1,
  can_spin: true,
  can_spin_reason: null,
  can_pay_stars: true,
  can_pay_days: true,
  user_balance_kopeks: 150000,
  required_balance_kopeks: 0,
  has_subscription: true,
  eligible_subscriptions: [{ id: 201, tariff_name: 'ProxyKeys Standard', days_left: 20 }],
};

const mockPromoGroupDiscounts: PromoGroupDiscounts = {
  group_name: 'Premium Club',
  server_discount_percent: 10,
  traffic_discount_percent: 15,
  device_discount_percent: 20,
  period_discounts: { 60: 10, 90: 20, 180: 40, 360: 70 },
};

/**
 * Seed data for the preview. Each entry is [queryKey, data, onlyIfMissing].
 *
 * theme-colors: seeded with DEFAULT_THEME_COLORS + onlyIfMissing=true.
 * If the user already has real cached colors (from a real session), those
 * are preserved. The ThemeColorsProvider will still refetch if the cache
 * is stale (staleTime is NOT Infinity for this key — see special case below).
 */
const PREVIEW_SEED_DATA: Array<[readonly unknown[], unknown, boolean]> = [
  // [queryKey, data, onlyIfMissing]
  // onlyIfMissing=true: don't override if real data already exists
  [['theme-colors'], DEFAULT_THEME_COLORS, true],
  [['exchange-rates'], DEFAULT_RATES, false],
  [['branding'], mockBrandingInfo, false],
  [['telegram-widget-config'], mockTelegramWidgetConfig as TelegramWidgetConfig, false],
  [['balance'], mockBalance, false],
  [['subscriptions-list'], mockSubscriptionsList, false],
  [['subscription'], { has_subscription: true, subscription: activeGreen }, false],
  [['subscription', activeGreen.id], { has_subscription: true, subscription: activeGreen }, false],
  [['trial-info'], mockTrialAvailable, false],
  [['devices'], mockDevicesResponse, false],
  [['referral-info'], mockReferralInfo, false],
  [['wheel-config'], mockWheelConfig, false],
  [['pending-gifts'], mockPendingGifts as PendingGift[], false],
  [['promo-group-discounts'], mockPromoGroupDiscounts, false],
  [['email-auth-enabled'], { enabled: true, verification_enabled: true }, false],
  [['enabled-themes'], { dark: true, light: true }, false],
];

/**
 * Seeds the app's TOP-LEVEL QueryClient with mock data for every query key
 * that preview components might read. This approach (instead of a nested
 * QueryClientProvider) ensures that outer providers like ThemeColorsProvider
 * also see the seeded data — preventing theme-color flicker and backend
 * fetches.
 *
 * Sets query defaults (staleTime: Infinity, retry: false) for each key to
 * prevent React Query from refetching.
 *
 * Returns a restore function that removes the seeded queries on unmount.
 */
export function seedPreviewQueries(queryClient: QueryClient): () => void {
  const restoredKeys: Array<readonly unknown[]> = [];

  for (const [key, data, onlyIfMissing] of PREVIEW_SEED_DATA) {
    // Skip if data already exists and we should preserve it
    if (onlyIfMissing && queryClient.getQueryData(key) !== undefined) {
      continue;
    }

    // Cancel any in-flight fetch for this key to prevent it from
    // overriding our seeded data
    queryClient.cancelQueries({ queryKey: key });

    // Set query defaults to prevent refetching.
    // staleTime:Infinity is CRITICAL for theme-colors — without it, the
    // ThemeColorsProvider refetches, and if the backend rejects our fake JWT
    // (SSH tunnel active), themeColorsApi.getColors() catches the error and
    // returns DEFAULT_THEME_COLORS as a SUCCESS result, overwriting the user's
    // real cached colors with defaults.
    queryClient.setQueryDefaults(key, {
      staleTime: Infinity,
      retry: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    });

    // Seed the data
    queryClient.setQueryData(key, data);
    restoredKeys.push(key);
  }

  return () => {
    // Remove seeded queries so the real app can refetch fresh data
    for (const key of restoredKeys) {
      queryClient.removeQueries({ queryKey: key });
    }
  };
}
