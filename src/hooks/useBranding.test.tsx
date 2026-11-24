// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createInstance } from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { Link, MemoryRouter } from 'react-router';
import { afterEach, expect, it, vi } from 'vitest';
import en from '@/locales/en.json';
import ru from '@/locales/ru.json';
import { useBranding } from './useBranding';

vi.mock('@/store/auth', () => ({
  useAuthStore: (selector: (state: object) => unknown) => selector({ isAuthenticated: false }),
}));
vi.mock('@/hooks/useTelegramSDK', () => ({
  useTelegramSDK: () => ({ isTelegramWebApp: false, isMobile: false }),
  setCachedFullscreenEnabled: vi.fn(),
}));
vi.mock('@/api/branding', () => ({
  brandingApi: { getFullscreenEnabled: async () => ({ enabled: false }), getLogoUrl: () => null },
  getCachedBranding: () => ({ name: '', logo_letter: 'P', has_custom_logo: false }),
  setCachedBranding: vi.fn(),
  preloadLogo: vi.fn(),
  isLogoPreloaded: vi.fn(),
}));
vi.mock('@/utils/favicon', () => ({
  setFavicon: vi.fn(),
  letterFaviconDataUri: vi.fn(),
  roundedFaviconDataUri: vi.fn(),
}));

afterEach(cleanup);

it('updates the browser title on navigation and language changes, and falls back on unknown routes', async () => {
  const i18n = createInstance();
  await i18n.init({ lng: 'ru', resources: { ru: { translation: ru }, en: { translation: en } } });
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  function Page() {
    useBranding();
    return (
      <>
        <Link to="/support">Support</Link>
        <Link to="/info">Info</Link>
        <Link to="/unknown">Unknown</Link>
      </>
    );
  }
  render(
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <Page />
        </MemoryRouter>
      </QueryClientProvider>
    </I18nextProvider>,
  );
  const name = import.meta.env.VITE_APP_NAME || 'Cabinet';
  expect(document.title).toBe(`${name} - Главная`);
  fireEvent.click(screen.getByText('Support'));
  expect(document.title).toBe(`${name} - Поддержка`);
  fireEvent.click(screen.getByText('Info'));
  expect(document.title).toBe(`${name} - Информация`);
  await act(() => i18n.changeLanguage('en'));
  expect(document.title).toBe(`${name} - Info`);
  fireEvent.click(screen.getByText('Unknown'));
  expect(document.title).toBe(name);
});
