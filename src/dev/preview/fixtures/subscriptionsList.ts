import type { SubscriptionListItem } from '@/types';
import { activeGreen, activeWarning, expiredPaid, expiredTrial } from './subscriptions';

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

/**
 * Multi-tariff list items for SubscriptionListCard.
 *
 * The card reads from SubscriptionListItem (lighter than full Subscription):
 * - status: 'active' | 'disabled' | 'expired' | 'limited'
 * - is_trial → badge
 * - is_daily / is_daily_paused → daily indicators
 * - autopay_enabled → indicator
 */
export const mockSubscriptionListItems: SubscriptionListItem[] = [
  {
    id: activeGreen.id,
    status: 'active',
    tariff_id: 1,
    tariff_name: 'ProxyKeys Standard',
    traffic_limit_gb: 100,
    traffic_used_gb: 18,
    device_limit: 5,
    end_date: daysFromNow(20),
    subscription_url: 'https://sub.proxykeys.net/abc12345',
    subscription_crypto_link: null,
    is_trial: false,
    is_daily: false,
    is_daily_paused: false,
    autopay_enabled: false,
    connected_squads: ['squad-1'],
  },
  {
    id: activeWarning.id,
    status: 'limited',
    tariff_id: 2,
    tariff_name: 'ProxyKeys Pro',
    traffic_limit_gb: 100,
    traffic_used_gb: 82,
    device_limit: 5,
    end_date: daysFromNow(12),
    subscription_url: 'https://sub.proxykeys.net/def67890',
    subscription_crypto_link: null,
    is_trial: false,
    is_daily: false,
    is_daily_paused: false,
    autopay_enabled: true,
    connected_squads: ['squad-1', 'squad-2'],
  },
  {
    id: expiredPaid.id,
    status: 'expired',
    tariff_id: 1,
    tariff_name: 'ProxyKeys Standard',
    traffic_limit_gb: 100,
    traffic_used_gb: 87,
    device_limit: 5,
    end_date: daysFromNow(-2),
    subscription_url: 'https://sub.proxykeys.net/ghi11223',
    subscription_crypto_link: null,
    is_trial: false,
    is_daily: false,
    is_daily_paused: false,
    autopay_enabled: false,
    connected_squads: null,
  },
  {
    id: expiredTrial.id,
    status: 'expired',
    tariff_id: 0,
    tariff_name: 'Trial',
    traffic_limit_gb: 10,
    traffic_used_gb: 10,
    device_limit: 1,
    end_date: daysFromNow(-1),
    subscription_url: null,
    subscription_crypto_link: null,
    is_trial: true,
    is_daily: false,
    is_daily_paused: false,
    autopay_enabled: false,
    connected_squads: null,
  },
];
