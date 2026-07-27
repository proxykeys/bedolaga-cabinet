import type { ClassicPurchaseOptions, TariffsPurchaseOptions, Tariff, PeriodOption } from '@/types';

/**
 * Classic purchase options for ClassicPurchaseWizard.
 *
 * Builds a realistic multi-step wizard payload:
 * - 4 periods (30/90/180/360 days) with discounts on longer ones
 * - traffic selectable on 30-day period (50/100/200 GB + unlimited)
 * - 3 servers (NL, DE, US) with one default-selected
 * - devices: min 2 (free), max 10, 50₽/extra
 */
const servers30 = [
  {
    uuid: 'srv-nl-01',
    name: '🇳🇱 Нидерланды',
    price_kopeks: 0,
    price_label: '0 ₽',
    is_available: true,
  },
  {
    uuid: 'srv-de-01',
    name: '🇩🇪 Германия',
    price_kopeks: 5000,
    price_label: '50 ₽',
    is_available: true,
  },
  {
    uuid: 'srv-us-01',
    name: '🇺🇸 США',
    price_kopeks: 8000,
    price_label: '80 ₽',
    is_available: true,
  },
];

const period30: PeriodOption = {
  id: 'p30',
  period_days: 30,
  months: 1,
  label: '30 дней',
  price_kopeks: 30000,
  price_label: '300 ₽',
  per_month_price_kopeks: 30000,
  per_month_price_label: '300 ₽/мес',
  is_available: true,
  traffic: {
    selectable: true,
    mode: 'select',
    default: 50,
    current: 50,
    options: [
      {
        value: 50,
        label: '50 ГБ',
        price_kopeks: 0,
        price_label: '0 ₽',
        is_available: true,
        is_default: true,
      },
      {
        value: 100,
        label: '100 ГБ',
        price_kopeks: 10000,
        price_label: '100 ₽',
        is_available: true,
      },
      {
        value: 200,
        label: '200 ГБ',
        price_kopeks: 25000,
        price_label: '250 ₽',
        is_available: true,
      },
      {
        value: 0,
        label: '∞ Безлимит',
        price_kopeks: 60000,
        price_label: '600 ₽',
        is_available: true,
      },
    ],
  },
  servers: {
    options: servers30,
    min: 1,
    max: 3,
    default: ['srv-nl-01'],
    selected: ['srv-nl-01'],
  },
  devices: {
    min: 2,
    max: 10,
    default: 2,
    current: 2,
    price_per_device_kopeks: 5000,
    price_per_device_label: '50 ₽',
  },
};

const period90: PeriodOption = {
  ...period30,
  id: 'p90',
  period_days: 90,
  months: 3,
  label: '90 дней',
  price_kopeks: 75000,
  price_label: '750 ₽',
  per_month_price_kopeks: 25000,
  per_month_price_label: '250 ₽/мес',
  discount_percent: 17,
  original_price_kopeks: 90000,
  original_price_label: '900 ₽',
  traffic: { ...period30.traffic, selectable: false, options: [] },
  servers: { ...period30.servers },
  devices: { ...period30.devices },
};

const period180: PeriodOption = {
  ...period30,
  id: 'p180',
  period_days: 180,
  months: 6,
  label: '180 дней',
  price_kopeks: 135000,
  price_label: '1 350 ₽',
  per_month_price_kopeks: 22500,
  per_month_price_label: '225 ₽/мес',
  discount_percent: 25,
  original_price_kopeks: 180000,
  original_price_label: '1 800 ₽',
  traffic: { ...period30.traffic, selectable: false, options: [] },
  servers: { ...period30.servers },
  devices: { ...period30.devices },
};

const period360: PeriodOption = {
  ...period30,
  id: 'p360',
  period_days: 360,
  months: 12,
  label: '360 дней',
  price_kopeks: 240000,
  price_label: '2 400 ₽',
  per_month_price_kopeks: 20000,
  per_month_price_label: '200 ₽/мес',
  discount_percent: 33,
  original_price_kopeks: 360000,
  original_price_label: '3 600 ₽',
  traffic: { ...period30.traffic, selectable: false, options: [] },
  servers: { ...period30.servers },
  devices: { ...period30.devices },
};

export const mockClassicPurchaseOptions: ClassicPurchaseOptions = {
  sales_mode: 'classic',
  currency: 'RUB',
  balance_kopeks: 150000,
  balance_label: '1 500 ₽',
  subscription_id: null,
  periods: [period30, period90, period180, period360],
  traffic: period30.traffic,
  servers: period30.servers,
  devices: period30.devices,
  selection: {
    period_id: 'p30',
    period_days: 30,
    traffic_value: 50,
    servers: ['srv-nl-01'],
    devices: 2,
  },
};

/**
 * Tariffs-mode purchase options for sheets that need PurchaseOptions.
 */
const mockTariffStandard: Tariff = {
  id: 1,
  name: 'ProxyKeys Standard',
  description: 'Базовый тариф для повседневного использования',
  tier_level: 1,
  traffic_limit_gb: 100,
  traffic_limit_label: '100 ГБ',
  is_unlimited_traffic: false,
  device_limit: 5,
  base_device_limit: 2,
  extra_devices_count: 3,
  servers_count: 3,
  servers: [
    { uuid: 'srv-nl-01', name: '🇳🇱 Нидерланды' },
    { uuid: 'srv-de-01', name: '🇩🇪 Германия' },
    { uuid: 'srv-us-01', name: '🇺🇸 США' },
  ],
  periods: [
    {
      days: 30,
      months: 1,
      label: '30 дней',
      price_kopeks: 30000,
      price_label: '300 ₽',
      price_per_month_kopeks: 30000,
      price_per_month_label: '300 ₽/мес',
    },
    {
      days: 90,
      months: 3,
      label: '90 дней',
      price_kopeks: 75000,
      price_label: '750 ₽',
      price_per_month_kopeks: 25000,
      price_per_month_label: '250 ₽/мес',
      discount_percent: 17,
    },
    {
      days: 180,
      months: 6,
      label: '180 дней',
      price_kopeks: 135000,
      price_label: '1 350 ₽',
      price_per_month_kopeks: 22500,
      price_per_month_label: '225 ₽/мес',
      discount_percent: 25,
    },
  ],
  is_current: true,
  is_available: true,
};

const mockTariffPro: Tariff = {
  ...mockTariffStandard,
  id: 2,
  name: 'ProxyKeys Pro',
  description: 'Расширенный тариф с большим лимитом трафика',
  tier_level: 2,
  traffic_limit_gb: 500,
  traffic_limit_label: '500 ГБ',
  device_limit: 10,
  base_device_limit: 5,
  extra_devices_count: 5,
  is_current: false,
};

const mockTariffUnlimited: Tariff = {
  ...mockTariffStandard,
  id: 3,
  name: 'ProxyKeys Unlimited',
  description: 'Безлимитный трафик, максимум устройств',
  tier_level: 3,
  traffic_limit_gb: 0,
  traffic_limit_label: '∞',
  is_unlimited_traffic: true,
  device_limit: 99,
  base_device_limit: 10,
  extra_devices_count: 89,
  is_current: false,
};

export const mockTariffs: Tariff[] = [mockTariffStandard, mockTariffPro, mockTariffUnlimited];

export const mockPurchaseOptions: TariffsPurchaseOptions = {
  sales_mode: 'tariffs',
  tariffs: mockTariffs,
  current_tariff_id: 1,
  balance_kopeks: 150000,
  balance_label: '1 500 ₽',
  has_subscription: true,
  subscription_status: 'active',
  subscription_is_expired: false,
  all_tariffs_purchased: false,
};
