import type { Subscription } from '@/types';

/**
 * Date helpers — generate ISO dates relative to "now" so fixtures always
 * look realistic regardless of when the preview is opened.
 */
function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function daysAgo(days: number): string {
  return daysFromNow(-days);
}

/**
 * Active subscription states for SubscriptionCardActive.
 *
 * The card branches on:
 * - traffic_used_percent → traffic zone (normal <50 / warning 50-75 / danger 75-90 / critical ≥90)
 * - traffic_limit_gb === 0 → unlimited (∞)
 * - is_trial → trial badge
 * - device_limit === 0 → unlimited devices
 * - connectedDevices >= device_limit → button disabled
 */

// 1. Active, green zone — 18% used, plenty of room
export const activeGreen: Subscription = {
  id: 201,
  status: 'active',
  is_trial: false,
  start_date: daysAgo(10),
  end_date: daysFromNow(20),
  days_left: 20,
  hours_left: 480,
  minutes_left: 28800,
  time_left_display: '20 дней',
  traffic_limit_gb: 100,
  traffic_used_gb: 18,
  traffic_used_percent: 18,
  device_limit: 5,
  connected_squads: ['squad-1'],
  servers: [{ uuid: 'srv-1', name: 'NL-Amsterdam-01', country_code: 'NL' }],
  autopay_enabled: false,
  autopay_days_before: 3,
  subscription_url: 'https://sub.proxykeys.net/abc12345',
  hide_subscription_link: false,
  is_active: true,
  is_expired: false,
  is_limited: false,
  tariff_id: 1,
  tariff_name: 'ProxyKeys Standard',
  traffic_reset_mode: 'MONTH',
};

// 2. Active, warning zone — 62% used (amber)
export const activeWarning: Subscription = {
  ...activeGreen,
  id: 202,
  traffic_used_gb: 62,
  traffic_used_percent: 62,
  tariff_name: 'ProxyKeys Pro',
};

// 3. Active, danger zone — 82% used (orange-red)
export const activeDanger: Subscription = {
  ...activeGreen,
  id: 203,
  traffic_used_gb: 82,
  traffic_used_percent: 82,
  days_left: 12,
  end_date: daysFromNow(12),
};

// 4. Active, critical zone — 95% used (red, almost out)
export const activeCritical: Subscription = {
  ...activeGreen,
  id: 204,
  traffic_used_gb: 95,
  traffic_used_percent: 95,
  days_left: 3,
  end_date: daysFromNow(3),
};

// 5. Active, unlimited traffic (∞)
export const activeUnlimited: Subscription = {
  ...activeGreen,
  id: 205,
  traffic_limit_gb: 0,
  traffic_used_gb: 340,
  traffic_used_percent: 0,
  tariff_name: 'ProxyKeys Unlimited',
};

// 6. Active trial — is_trial=true, trial badge visible
export const activeTrial: Subscription = {
  ...activeGreen,
  id: 206,
  is_trial: true,
  traffic_limit_gb: 10,
  traffic_used_gb: 4.2,
  traffic_used_percent: 42,
  device_limit: 1,
  days_left: 2,
  hours_left: 48,
  end_date: daysFromNow(2),
  time_left_display: '2 дня',
  tariff_name: 'Trial',
};

// 7. Active, unlimited devices (device_limit=0 → ∞)
export const activeUnlimitedDevices: Subscription = {
  ...activeGreen,
  id: 207,
  device_limit: 0,
  tariff_name: 'ProxyKeys Ultimate',
};

// 8. Active, many devices (device_limit=15 → progress bar instead of dots)
export const activeManyDevices: Subscription = {
  ...activeGreen,
  id: 208,
  device_limit: 15,
  tariff_name: 'ProxyKeys Team',
};

/**
 * Expired subscription states for SubscriptionCardExpired.
 *
 * The card branches on:
 * - is_limited → amber, "Купить трафик" button
 * - is_trial → only "Тарифы" full-width button
 * - is_daily + status==='disabled' → "Возобновить" (suspended daily)
 * - balance covers renew → "Быстро продлить"
 * - balance zero → "Пополнить"
 */

// 1. Expired limited — traffic exhausted (amber)
export const expiredLimited: Subscription = {
  ...activeGreen,
  id: 301,
  status: 'active',
  is_limited: true,
  is_active: false,
  is_expired: false,
  traffic_used_gb: 100,
  traffic_used_percent: 100,
  days_left: 15,
  end_date: daysFromNow(15),
  tariff_name: 'ProxyKeys Standard',
};

// 2. Expired paid — has balance, "Быстро продлить"
export const expiredPaid: Subscription = {
  ...activeGreen,
  id: 302,
  status: 'expired',
  is_active: false,
  is_expired: true,
  traffic_used_gb: 87,
  traffic_used_percent: 87,
  days_left: 0,
  end_date: daysAgo(2),
  tariff_name: 'ProxyKeys Pro',
};

// 3. Expired paid, no balance — "Пополнить"
export const expiredPaidNoBalance: Subscription = {
  ...expiredPaid,
  id: 303,
  traffic_used_gb: 100,
  traffic_used_percent: 100,
};

// 4. Expired trial — only "Тарифы" full-width button
export const expiredTrial: Subscription = {
  ...expiredPaid,
  id: 304,
  is_trial: true,
  traffic_limit_gb: 10,
  traffic_used_gb: 10,
  traffic_used_percent: 100,
  device_limit: 1,
  tariff_name: 'Trial',
};

// 5. Suspended daily — status=disabled, is_daily=true, "Возобновить"
export const expiredSuspendedDaily: Subscription = {
  ...expiredPaid,
  id: 305,
  status: 'disabled',
  is_daily: true,
  is_daily_paused: true,
  daily_price_kopeks: 1500,
  tariff_name: 'ProxyKeys Daily',
  end_date: daysAgo(1),
};

// 6. Expired daily — NOT on pause (status=expired, is_daily=true)
// Triggers purchaseTariff(1) instead of togglePause
export const expiredDailyActive: Subscription = {
  ...expiredPaid,
  id: 306,
  status: 'expired',
  is_daily: true,
  is_daily_paused: false,
  daily_price_kopeks: 1500,
  tariff_name: 'ProxyKeys Daily',
  end_date: daysAgo(1),
};

/**
 * All active subscription fixtures, ordered by traffic zone progression.
 */
export const activeSubscriptions: Subscription[] = [
  activeGreen,
  activeWarning,
  activeDanger,
  activeCritical,
  activeUnlimited,
  activeTrial,
  activeUnlimitedDevices,
  activeManyDevices,
];

/**
 * All expired subscription fixtures, covering every button-state branch.
 */
export const expiredSubscriptions: Subscription[] = [
  expiredLimited,
  expiredPaid,
  expiredPaidNoBalance,
  expiredTrial,
  expiredSuspendedDaily,
  expiredDailyActive,
];
