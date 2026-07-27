import type { TelegramWidgetConfig, BrandingInfo } from '@/api/branding';

/**
 * Mock Telegram widget config for OIDC login button preview.
 * Matches the .env.local settings of ProxyKeys cabinet.
 */
export const mockTelegramWidgetConfig: TelegramWidgetConfig = {
  bot_username: 'proxykeysbot',
  size: 'large',
  radius: 8,
  userpic: true,
  request_access: false,
  oidc_enabled: true,
  oidc_client_id: 'proxykeys-oidc-client-demo',
};

/**
 * Mock branding info — ProxyKeys brand identity.
 */
export const mockBrandingInfo: BrandingInfo = {
  name: 'ProxyKeys',
  logo_url: null,
  logo_letter: 'PK',
  has_custom_logo: false,
};
