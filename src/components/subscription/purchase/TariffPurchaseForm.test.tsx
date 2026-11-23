// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createInstance } from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { subscriptionApi } from '../../../api/subscription';
import { activeGreen } from '../../../dev/preview/fixtures/subscriptions';
import ru from '../../../locales/ru.json';
import { PlatformProvider } from '../../../platform';
import type { Tariff } from '../../../types';
import { TariffPurchaseForm } from './TariffPurchaseForm';

const i18n = createInstance();
await i18n.init({ lng: 'ru', resources: { ru: { translation: ru } } });

const tariff: Tariff = {
  id: 1,
  name: 'Тестовый тариф',
  description: null,
  tier_level: 1,
  traffic_limit_gb: 0,
  traffic_limit_label: 'Безлимит',
  is_unlimited_traffic: true,
  device_limit: 1,
  extra_devices_count: 0,
  servers_count: 0,
  servers: [],
  is_current: false,
  is_available: true,
  periods: [
    {
      days: 30,
      months: 1,
      label: '30 дней',
      price_kopeks: 10000,
      price_label: '100 ₽',
      price_per_month_kopeks: 10000,
      price_per_month_label: '100 ₽',
    },
  ],
};

function renderPurchase(overrides: Partial<Tariff> = {}, success = true) {
  // No reads or writes reach the real API from this fixture.
  const client = new QueryClient({ defaultOptions: { queries: { enabled: false } } });
  const purchase = vi.spyOn(subscriptionApi, 'purchaseTariff').mockResolvedValue({
    success,
    message: 'OK',
    subscription: { ...activeGreen, id: 42 },
    tariff_id: 1,
    tariff_name: tariff.name,
    balance_kopeks: 10000,
    balance_label: '100 ₽',
  });
  const updateAutopay = vi.spyOn(subscriptionApi, 'updateAutopay').mockResolvedValue({
    autopay_enabled: true,
    autopay_days_before: 1,
    message: 'OK',
  });

  render(
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <PlatformProvider>
            <Routes>
              <Route
                path="/"
                element={
                  <TariffPurchaseForm
                    tariff={{ ...tariff, ...overrides }}
                    subscriptionId={undefined}
                    balanceKopeks={20000}
                    onBack={() => {}}
                  />
                }
              />
              <Route path="/subscriptions" element={<h1>Подписки</h1>} />
            </Routes>
          </PlatformProvider>
        </MemoryRouter>
      </QueryClientProvider>
    </I18nextProvider>,
  );

  return { purchase, updateAutopay };
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('автопродление при оформлении', () => {
  it('предвыбирает автопродление, но не позволяет оплатить без явного согласия', async () => {
    const { purchase, updateAutopay } = renderPurchase();
    const pay = screen.getByRole<HTMLButtonElement>('button', { name: 'Оформить' });
    const consent = screen.getByRole<HTMLInputElement>('checkbox');

    expect(screen.getByRole('switch', { name: 'Автопродление' }).getAttribute('aria-checked')).toBe(
      'true',
    );
    expect(screen.getByRole('link', { name: 'рекуррентных платежей' }).getAttribute('href')).toBe(
      '/recurrent-payments',
    );
    expect(consent.checked).toBe(false);
    expect(pay.disabled).toBe(true);
    fireEvent.click(pay);
    expect(purchase).not.toHaveBeenCalled();
    expect(updateAutopay).not.toHaveBeenCalled();

    fireEvent.click(consent);
    fireEvent.click(pay);
    await waitFor(() => expect(updateAutopay).toHaveBeenCalledWith(true, 1, 42));
    expect(purchase).toHaveBeenCalledBefore(updateAutopay);
  });

  it('после отказа от автопродления заново запрашивает согласие, только с офертой', async () => {
    const { updateAutopay } = renderPurchase();
    const consent = screen.getByRole<HTMLInputElement>('checkbox');
    const pay = screen.getByRole<HTMLButtonElement>('button', { name: 'Оформить' });
    fireEvent.click(consent);
    fireEvent.click(screen.getByRole('switch', { name: 'Автопродление' }));

    expect(consent.checked).toBe(false);
    expect(pay.disabled).toBe(true);
    expect(screen.queryByRole('link', { name: 'рекуррентных платежей' })).toBeNull();
    expect(screen.getByRole('link', { name: 'публичной оферты' }).getAttribute('href')).toBe(
      '/offer',
    );

    fireEvent.click(consent);
    fireEvent.click(pay);
    await waitFor(() => expect(updateAutopay).toHaveBeenCalledWith(false, undefined, 42));
  });

  it('не включает скрытое автопродление для суточного тарифа', async () => {
    const { updateAutopay } = renderPurchase({ is_daily: true, daily_price_kopeks: 100 });

    expect(screen.queryByRole('switch', { name: 'Автопродление' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'рекуррентных платежей' })).toBeNull();
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: /активировать/i }));
    await waitFor(() => expect(updateAutopay).toHaveBeenCalledWith(false, undefined, 42));
  });

  it('не применяет автопродление, если покупка не удалась', async () => {
    const { purchase, updateAutopay } = renderPurchase({}, false);

    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Оформить' }));
    await screen.findByRole('heading', { name: 'Подписки' });
    expect(purchase).toHaveBeenCalledOnce();
    expect(updateAutopay).not.toHaveBeenCalled();
  });
});
