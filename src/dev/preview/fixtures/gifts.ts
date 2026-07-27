import type { PendingGift } from '@/api/gift';

/**
 * Pending gifts for PendingGiftCard — shown on Dashboard when user has
 * unclaimed gift subscriptions.
 */
export const mockPendingGifts: PendingGift[] = [
  {
    token: 'gift-token-001',
    tariff_name: 'ProxyKeys Standard',
    period_days: 30,
    gift_message: 'С наступлением! Пользуйся VPN с заботой о приватности.',
    sender_display: 'Алексей',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    token: 'gift-token-002',
    tariff_name: 'ProxyKeys Pro',
    period_days: 90,
    gift_message: null,
    sender_display: null,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
];

/**
 * Empty pending gifts — no card shown.
 */
export const mockNoPendingGifts: PendingGift[] = [];
