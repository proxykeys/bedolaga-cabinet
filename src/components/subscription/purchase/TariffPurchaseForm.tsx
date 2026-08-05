import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { subscriptionApi } from '../../../api/subscription';
import { getErrorMessage, getInsufficientBalanceError } from '../../../utils/subscriptionHelpers';
import { useCurrency } from '../../../hooks/useCurrency';
import { usePromoDiscount } from '../../../hooks/usePromoDiscount';
import { usePlatform } from '../../../platform';
import { openPaymentUrl } from '../../../utils/openPaymentUrl';
import { formatShortDate } from '../../../utils/format';
import InsufficientBalancePrompt from '../../InsufficientBalancePrompt';
import type { Tariff, TariffPeriod } from '../../../types';

// ──────────────────────────────────────────────────────────────────
// TariffPurchaseForm
//
// The full per-tariff purchase form: period picker (or daily-tariff
// activate), custom-days toggle + slider, custom-traffic toggle +
// slider, summary, and the confirm CTA. Self-owns:
//   - the purchaseTariff mutation
//   - the auto-scroll-into-view ref + effect on mount
//   - selectedTariffPeriod / customDays / customTrafficGb /
//     useCustomDays / useCustomTraffic (form-internal state, reset
//     by re-mount when the parent passes a new `tariff` via key=)
//
// The parent (SubscriptionPurchase) supplies the chosen tariff,
// the current balance (for inline insufficient-balance prompts),
// the subscription id (for the renew-this-subscription flow), and
// onBack to clear its own selection state.
// ──────────────────────────────────────────────────────────────────

export interface TariffPurchaseFormProps {
  tariff: Tariff;
  subscriptionId: number | undefined;
  balanceKopeks: number | undefined;
  /** СБП-оформление (Platega recurrent) доступно — показать вторую CTA. */
  sbpPurchaseEnabled?: boolean;
  onBack: () => void;
}

export function TariffPurchaseForm({
  tariff,
  subscriptionId,
  balanceKopeks,
  sbpPurchaseEnabled = false,
  onBack,
}: TariffPurchaseFormProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { formatAmount, currencySymbol } = useCurrency();
  const { applyPromoDiscount } = usePromoDiscount();
  const { openLink, platform } = usePlatform();
  const ref = useRef<HTMLDivElement>(null);

  const formatPrice = (kopeks: number) =>
    kopeks === 0
      ? t('subscription.free', 'Бесплатно')
      : `${formatAmount(kopeks / 100)} ${currencySymbol}`;

  // Form-internal state — seeded from the tariff prop. Resets via
  // `key={tariff.id}` on the parent's render.
  const [selectedTariffPeriod, setSelectedTariffPeriod] = useState<TariffPeriod | null>(
    tariff.periods[0] || null,
  );
  const [customDays, setCustomDays] = useState<number>(30);
  const [customTrafficGb, setCustomTrafficGb] = useState<number>(50);
  const [useCustomDays, setUseCustomDays] = useState(false);
  const [useCustomTraffic, setUseCustomTraffic] = useState(false);

  // ProxyKeys custom: выбор количества устройств.
  // - isFreshPurchase: true когда тариф НЕ текущий (genuinely новая покупка).
  //   В этом режиме показываем selector ± для выбора количества.
  //   Когда tariff.is_current = true (пользователь продлевает существующую
  //   подписку) — selector скрыт, продление работает с текущим количеством.
  //   Используем tariff.is_current вместо subscriptionId из URL, т.к. URL
  //   может не содержать ?subscriptionId=N даже при наличии подписки
  //   (например, заход через меню «Купить подписку»). tariff.is_current
  //   выставляется бэкендом надёжно для текущего тарифа пользователя.
  //   Причина скрытия selector при продлении (Вариант 3): модель данных
  //   bedolaga не поддерживает per-device expiry. Изменение device_limit при
  //   продлении либо эксплуатирует лазейку (увеличение дарит новым устройствам
  //   остаток срока старых), либо деструктивно (уменьшение мгновенно отключает
  //   устройства в RemnaWave без компенсации).
  // - baseDeviceLimit: базовое количество тарифа (1 для ProxyKeys).
  // - initialDeviceCount: текущий device_limit пользователя (включая докупленные).
  //   При fresh покупке = baseDeviceLimit. Используется как deviceCount по умолчанию.
  // - maxDevices: null = безлимит, число = жёсткий потолок тарифа.
  const isFreshPurchase = !tariff.is_current;
  const baseDeviceLimit = tariff.base_device_limit ?? tariff.device_limit ?? 1;
  const initialDeviceCount = tariff.device_limit ?? baseDeviceLimit;
  const maxDevices =
    tariff.max_device_limit && tariff.max_device_limit > 0 ? tariff.max_device_limit : null;
  const [deviceCount, setDeviceCount] = useState<number>(initialDeviceCount);

  // ProxyKeys custom: получение текущей подписки для отображения периода
  // действия продления («с ... по ...»). Только при продлении (is_current).
  // При fresh покупке подписки ещё нет — даты не показываем.
  const { data: subscriptionData } = useQuery({
    queryKey: ['subscription', subscriptionId],
    queryFn: () => subscriptionApi.getSubscription(subscriptionId),
    enabled: !isFreshPurchase && subscriptionId !== undefined,
    staleTime: 30_000,
  });

  const purchaseMutation = useMutation({
    mutationFn: () => {
      const isDailyTariff =
        tariff.is_daily || (tariff.daily_price_kopeks && tariff.daily_price_kopeks > 0);
      const days = isDailyTariff
        ? 1
        : useCustomDays
          ? customDays
          : selectedTariffPeriod?.days || 30;
      const trafficGb =
        useCustomTraffic && tariff.custom_traffic_enabled ? customTrafficGb : undefined;
      // Forward the subscription_id when the user landed here via the
      // "Renew this subscription" flow (?subscriptionId=N). The backend
      // uses it to resolve the exact target row by ID, avoiding the
      // race with concurrent panel webhooks that would otherwise hit
      // the partial UNIQUE on uq_subscriptions_user_tariff_active.
      return subscriptionApi.purchaseTariff(
        tariff.id,
        days,
        trafficGb,
        subscriptionId ?? undefined,
        // ProxyKeys custom: пробросить выбранное количество устройств.
        // Бэкенд начисляет device_price_kopeks × (deviceCount - base) × months.
        deviceCount,
      );
    },
    onSuccess: async (data) => {
      // ProxyKeys custom: применяем выбранный toggle автопродления к НОВОЙ подписке.
      // data.subscription.id — ID только что созданной подписки (fresh purchase).
      // Для renewal (existing subscription) autopay уже настроен на странице подписки.
      if (isFreshPurchase && data.subscription?.id) {
        try {
          await subscriptionApi.updateAutopay(
            autopayEnabled,
            autopayEnabled ? 1 : undefined,
            data.subscription.id,
          );
        } catch {
          // Non-fatal: подписка создана, автопродление можно включить позже
        }
      }
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-options'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions-list'] });
      navigate('/subscriptions', { replace: true });
    },
  });

  // СБП-оформление: первое списание = подтверждение привязки в банке; период
  // на форме не участвует — списания идут по каденс-правилу тарифа.
  const sbpPurchaseMutation = useMutation({
    mutationFn: () => subscriptionApi.purchaseWithSbpRecurring(tariff.id),
    onSuccess: (data) => {
      if (data.redirect_url) {
        openPaymentUrl(data.redirect_url, platform, openLink);
      }
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-options'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions-list'] });
      queryClient.invalidateQueries({ queryKey: ['sbp-recurring', data.subscription_id] });
      navigate('/subscriptions', { replace: true });
    },
  });

  const sbpPurchaseButton = sbpPurchaseEnabled && (
    <>
      <button
        onClick={() => sbpPurchaseMutation.mutate()}
        disabled={sbpPurchaseMutation.isPending || purchaseMutation.isPending}
        className="mt-2 w-full rounded-xl border border-accent-500/40 bg-accent-500/10 py-3 text-sm font-medium text-accent-400 transition-colors hover:bg-accent-500/20 disabled:opacity-50"
      >
        {sbpPurchaseMutation.isPending ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            {t('common.loading')}
          </span>
        ) : (
          t('subscription.sbpRecurring.purchaseButton')
        )}
      </button>
      <div className="mt-1.5 text-center text-[11px] text-dark-500">
        {t('subscription.sbpRecurring.purchaseHint')}
      </div>
      {sbpPurchaseMutation.isError && (
        <div className="mt-2 text-center text-sm text-error-400">
          {getErrorMessage(sbpPurchaseMutation.error)}
        </div>
      )}
    </>
  );

  // Smooth scroll the form into view when first mounted.
  useEffect(() => {
    if (ref.current) {
      const timer = setTimeout(() => {
        ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  // ProxyKeys custom: autopay toggle state для fresh purchase.
  // По умолчанию ON — т.к. без ручного продления это безопаснее (предотвращает
  // случайное истечение). Юзер может выключить. После успешной покупки
  // вызываем updateAutopay с выбранным значением.
  const [autopayEnabled, setAutopayEnabled] = useState(true);

  // ProxyKeys custom: defense-in-depth — если форма открыта для renewal
  // активной подписки (через устаревшую ссылку или кэш), показываем блок
  // вместо формы. Основной guard — бэкенд (409), это UI-подстраховка.
  const isRenewalOfActive =
    !isFreshPurchase &&
    subscriptionData?.subscription &&
    subscriptionData.subscription.is_active &&
    !subscriptionData.subscription.is_trial;

  return (
    <div ref={ref} className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <h3 className="min-w-0 truncate text-lg font-medium text-dark-100">{tariff.name}</h3>
        <button onClick={onBack} className="shrink-0 text-dark-300 hover:text-dark-200">
          ← {t('common.back')}
        </button>
      </div>

      {/* ProxyKeys custom: блок для renewal активной подписки (defense-in-depth) */}
      {isRenewalOfActive ? (
        <div className="rounded-xl border border-warning-500/40 bg-warning-500/5 p-6 text-center">
          <p className="mb-2 text-base font-semibold text-dark-50">
            {t('subscription.activeCannotRenew.title', 'Подписка ещё активна')}
          </p>
          <p className="mb-4 text-sm text-dark-300">
            {t(
              'subscription.activeCannotRenew.description',
              'Ручное продление недоступно. Включите автопродление — и подписка продлится автоматически за 1 день до окончания.',
            )}
          </p>
          <button onClick={onBack} className="btn-cta-md">
            {t('subscription.activeCannotRenew.backToSub', 'Вернуться к подписке')}
          </button>
        </div>
      ) : (
        <>
          {/* /ProxyKeys custom guard */}

          {/* Tariff Info */}
          <div className="rounded-xl bg-gray-250 p-4 dark:bg-gray-850">
            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <span className="text-dark-300">{t('subscription.traffic')}:</span>
                <span className="ml-2 text-dark-200">{tariff.traffic_limit_label}</span>
              </div>
              {/* ProxyKeys custom: «Устройства» в upper-блоке.
              - При активном selector (fresh purchase + device_price) — НЕ показываем:
                значение статичное (tariff.device_limit), а selector ниже меняется.
                Дублирование вводит в заблуждение. Selector = единственный источник
                правды о количестве в этом режиме.
              - При продлении (selector скрыт) — показываем текущее количество read-only.
              - Для тарифов без device_price — оригинальная логика (фиксированное кол-во). */}
              {isFreshPurchase &&
              tariff.device_price_kopeks &&
              tariff.device_price_kopeks > 0 ? null : (
                <div>
                  <span className="text-dark-300">{t('subscription.devices')}:</span>
                  <span className="ml-2 text-dark-200">
                    {tariff.device_limit === 0 ? '∞' : tariff.device_limit}
                  </span>
                </div>
              )}
              {/* ProxyKeys custom: цена за устройство при per-device pricing. */}
              {tariff.device_price_kopeks && tariff.device_price_kopeks > 0 && (
                <div>
                  <span className="text-dark-300">{t('subscription.pricePerDevice')}:</span>
                  <span className="ml-2 text-dark-200">
                    {formatPrice(tariff.device_price_kopeks)}
                  </span>
                </div>
              )}
              {/* ProxyKeys custom: период.
              - При продлении (!isFreshPurchase) с данными подписки: показываем
                «N дней (до DD.MM.YYYY)» — сразу виден срок, избыточный label
                «1 месяц» убран.
              - При fresh покупке: показываем «N дней» (фактическое количество
                дней периода, т.к. строго говоря 30 дней — это не календарный
                месяц, бэкенд прибавляет period.days). */}
              {tariff.periods.length === 1 && (
                <div>
                  <span className="text-dark-300">
                    {t('subscription.tariffInfo.period', 'Период')}:
                  </span>
                  <span className="ml-2 text-dark-200">
                    {!isFreshPurchase && subscriptionData?.subscription?.end_date
                      ? (() => {
                          const currentEnd = new Date(subscriptionData.subscription.end_date);
                          const periodDays = useCustomDays
                            ? customDays
                            : (selectedTariffPeriod?.days ?? 30);
                          const newEnd = new Date(
                            currentEnd.getTime() + periodDays * 24 * 60 * 60 * 1000,
                          );
                          return t('subscription.periodWithExpiry', {
                            periodDays,
                            toDate: formatShortDate(newEnd.toISOString()),
                          });
                        })()
                      : t('subscription.days', { count: tariff.periods[0].days })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Daily Tariff Purchase */}
          {tariff.is_daily || (tariff.daily_price_kopeks && tariff.daily_price_kopeks > 0) ? (
            <div className="rounded-xl border border-gray-200/40 bg-gray-250 p-5 dark:border-gray-800/40 dark:bg-gray-850">
              <div className="mb-4 text-center">
                <div className="mb-2 text-sm text-dark-300">
                  {t('subscription.dailyPurchase.costPerDay')}
                </div>
                <div className="text-3xl font-bold text-accent-500">
                  {formatPrice(tariff.daily_price_kopeks || 0)}
                </div>
              </div>
              <div className="space-y-2 text-sm text-dark-300">
                <div className="flex items-start gap-2">
                  <span className="text-accent-500">•</span>
                  <span>{t('subscription.dailyPurchase.chargedDaily')}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-accent-500">•</span>
                  <span>{t('subscription.dailyPurchase.canPause')}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-accent-500">•</span>
                  <span>{t('subscription.dailyPurchase.pausedOnLowBalance')}</span>
                </div>
              </div>

              {(() => {
                const dailyPrice = tariff.daily_price_kopeks || 0;
                const hasEnoughBalance = balanceKopeks !== undefined && dailyPrice <= balanceKopeks;

                return (
                  <div className="mt-6">
                    {balanceKopeks !== undefined && !hasEnoughBalance && (
                      <InsufficientBalancePrompt
                        missingAmountKopeks={dailyPrice - balanceKopeks}
                        compact
                        className="mb-4"
                      />
                    )}

                    <button
                      onClick={() => purchaseMutation.mutate()}
                      disabled={purchaseMutation.isPending}
                      className="btn-primary w-full py-3"
                    >
                      {purchaseMutation.isPending ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          {t('common.loading')}
                        </span>
                      ) : (
                        t('subscription.dailyPurchase.activate', {
                          price: formatPrice(dailyPrice),
                        })
                      )}
                    </button>

                    {sbpPurchaseButton}

                    {purchaseMutation.isError &&
                      !getInsufficientBalanceError(purchaseMutation.error) && (
                        <div className="mt-3 text-center text-sm text-error-500">
                          {getErrorMessage(purchaseMutation.error)}
                        </div>
                      )}
                    {purchaseMutation.isError &&
                      getInsufficientBalanceError(purchaseMutation.error) && (
                        <div className="mt-3">
                          <InsufficientBalancePrompt
                            missingAmountKopeks={
                              getInsufficientBalanceError(purchaseMutation.error)?.missingAmount ||
                              dailyPrice - (balanceKopeks || 0)
                            }
                            compact
                          />
                        </div>
                      )}
                  </div>
                );
              })()}
            </div>
          ) : (
            <>
              {/* Period Selection for non-daily tariffs.
              ProxyKeys custom: при единственном периоде grid выбора скрыт —
              период уже показан в верхнем info-блоке (вместе с трафиком
              и устройствами). Остаются только fallback-блоки (no periods,
              custom days) и сам toggle произвольных дней, если включён. */}
              <div>
                {tariff.periods.length > 1 && (
                  <div className="mb-3 text-sm text-dark-300">{t('subscription.selectPeriod')}</div>
                )}

                {tariff.periods.length > 1 && !useCustomDays && (
                  <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {tariff.periods.map((period) => {
                      const promoPeriod = applyPromoDiscount(
                        period.price_kopeks,
                        period.original_price_kopeks,
                      );
                      const displayDiscount = promoPeriod.percent;
                      const displayOriginal = promoPeriod.original;
                      const displayPrice = promoPeriod.price;
                      const displayPerMonth =
                        displayPrice !== period.price_kopeks
                          ? Math.round(displayPrice / Math.max(1, period.days / 30))
                          : period.price_per_month_kopeks;

                      return (
                        <button
                          key={period.days}
                          onClick={() => {
                            setSelectedTariffPeriod(period);
                            setUseCustomDays(false);
                          }}
                          className={`relative rounded-xl border p-4 text-left transition-all ${
                            selectedTariffPeriod?.days === period.days && !useCustomDays
                              ? 'border-dark-50 bg-gray-300 dark:bg-gray-700'
                              : 'border-gray-200/50 bg-gray-250 hover:border-gray-300 dark:border-gray-800/50 dark:bg-gray-850 dark:hover:border-gray-700'
                          }`}
                        >
                          {displayDiscount && displayDiscount > 0 && (
                            <div
                              className={`absolute -right-2 -top-2 rounded-full px-2 py-0.5 text-xs font-medium ${
                                promoPeriod.isPromoGroup
                                  ? 'bg-success-500 text-black'
                                  : 'bg-warning-500 text-black'
                              }`}
                            >
                              -{displayDiscount}%
                            </div>
                          )}
                          <div className="text-lg font-semibold text-dark-100">{period.label}</div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-accent-500">
                              {formatPrice(displayPrice)}
                            </span>
                            {displayOriginal && displayOriginal > displayPrice && (
                              <span className="text-sm text-dark-300 line-through">
                                {formatPrice(displayOriginal)}
                              </span>
                            )}
                          </div>
                          <div className="mt-1 text-xs text-dark-300">
                            {formatPrice(displayPerMonth)}/{t('subscription.month')}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* No periods available fallback */}
                {tariff.periods.length === 0 &&
                  !useCustomDays &&
                  !(tariff.custom_days_enabled && (tariff.price_per_day_kopeks ?? 0) > 0) && (
                    <div className="rounded-xl border border-gray-200/40 bg-gray-250 p-4 text-center dark:border-gray-800/40 dark:bg-gray-850">
                      <div className="mb-2 text-sm font-medium text-warning-500">
                        {t('subscription.noPeriodsAvailable')}
                      </div>
                      <div className="text-xs text-dark-300">
                        {t('subscription.noPeriodsAvailableHint')}
                      </div>
                      <button onClick={onBack} className="btn-secondary mt-3 px-4 py-2 text-sm">
                        {t('subscription.chooseDifferentTariff')}
                      </button>
                    </div>
                  )}

                {/* Custom days option */}
                {tariff.custom_days_enabled && (tariff.price_per_day_kopeks ?? 0) > 0 && (
                  <div className="rounded-xl border border-gray-200/50 bg-gray-250 p-4 dark:border-gray-800/50 dark:bg-gray-850">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="font-medium text-dark-200">
                        {t('subscription.customDays.title')}
                      </span>
                      <button
                        type="button"
                        onClick={() => setUseCustomDays(!useCustomDays)}
                        role="switch"
                        aria-checked={useCustomDays}
                        aria-label={t('subscription.customDays.title')}
                        className={`relative h-6 w-10 rounded-full transition-colors ${
                          useCustomDays ? 'bg-accent-500' : 'bg-gray-350 dark:bg-gray-650'
                        }`}
                      >
                        <span
                          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                            useCustomDays ? 'left-5' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>
                    {useCustomDays && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-4">
                          <input
                            type="range"
                            min={tariff.min_days ?? 1}
                            max={tariff.max_days ?? 365}
                            value={customDays}
                            onChange={(e) => setCustomDays(parseInt(e.target.value))}
                            className="flex-1 accent-accent-500"
                          />
                          <input
                            type="number"
                            value={customDays}
                            min={tariff.min_days ?? 1}
                            max={tariff.max_days ?? 365}
                            onChange={(e) =>
                              setCustomDays(
                                Math.max(
                                  tariff.min_days ?? 1,
                                  Math.min(
                                    tariff.max_days ?? 365,
                                    parseInt(e.target.value) || (tariff.min_days ?? 1),
                                  ),
                                ),
                              )
                            }
                            className="w-20 rounded-lg border border-gray-300 bg-gray-300 px-3 py-2 text-center text-dark-100 dark:border-gray-700 dark:bg-gray-700"
                          />
                        </div>
                        {(() => {
                          const basePrice = customDays * (tariff.price_per_day_kopeks ?? 0);
                          const existingOriginal =
                            tariff.original_price_per_day_kopeks &&
                            tariff.original_price_per_day_kopeks >
                              (tariff.price_per_day_kopeks ?? 0)
                              ? customDays * tariff.original_price_per_day_kopeks
                              : undefined;
                          const promoCustom = applyPromoDiscount(basePrice, existingOriginal);
                          return (
                            <div className="flex justify-between text-sm">
                              <span className="text-dark-300">
                                {t('subscription.days', { count: customDays })} ×{' '}
                                {formatPrice(tariff.price_per_day_kopeks ?? 0)}/
                                {t('subscription.customDays.perDay')}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-accent-500">
                                  {formatPrice(promoCustom.price)}
                                </span>
                                {promoCustom.original &&
                                  promoCustom.original > promoCustom.price && (
                                    <>
                                      <span className="text-xs text-dark-300 line-through">
                                        {formatPrice(promoCustom.original)}
                                      </span>
                                      <span
                                        className={`rounded px-1.5 py-0.5 text-xs ${
                                          promoCustom.isPromoGroup
                                            ? 'bg-success-500 text-black'
                                            : 'bg-warning-500 text-black'
                                        }`}
                                      >
                                        -{promoCustom.percent}%
                                      </span>
                                    </>
                                  )}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Custom traffic option */}
              {tariff.custom_traffic_enabled && (tariff.traffic_price_per_gb_kopeks ?? 0) > 0 && (
                <div>
                  <div className="mb-3 text-sm text-dark-300">
                    {t('subscription.customTraffic.label')}
                  </div>
                  <div className="rounded-xl border border-gray-200/50 bg-gray-250 p-4 dark:border-gray-800/50 dark:bg-gray-850">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="font-medium text-dark-200">
                        {t('subscription.customTraffic.selectVolume')}
                      </span>
                      <button
                        type="button"
                        onClick={() => setUseCustomTraffic(!useCustomTraffic)}
                        role="switch"
                        aria-checked={useCustomTraffic}
                        aria-label={t('subscription.customTraffic.selectVolume')}
                        className={`relative h-6 w-10 rounded-full transition-colors ${
                          useCustomTraffic ? 'bg-accent-500' : 'bg-gray-350 dark:bg-gray-650'
                        }`}
                      >
                        <span
                          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                            useCustomTraffic ? 'left-5' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>
                    {!useCustomTraffic && (
                      <div className="text-sm text-dark-300">
                        {t('subscription.customTraffic.default', {
                          label: tariff.traffic_limit_label,
                        })}
                      </div>
                    )}
                    {useCustomTraffic && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-4">
                          <input
                            type="range"
                            min={tariff.min_traffic_gb ?? 1}
                            max={tariff.max_traffic_gb ?? 1000}
                            value={customTrafficGb}
                            onChange={(e) => setCustomTrafficGb(parseInt(e.target.value))}
                            className="flex-1 accent-accent-500"
                          />
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={customTrafficGb}
                              min={tariff.min_traffic_gb ?? 1}
                              max={tariff.max_traffic_gb ?? 1000}
                              onChange={(e) =>
                                setCustomTrafficGb(
                                  Math.max(
                                    tariff.min_traffic_gb ?? 1,
                                    Math.min(
                                      tariff.max_traffic_gb ?? 1000,
                                      parseInt(e.target.value) || (tariff.min_traffic_gb ?? 1),
                                    ),
                                  ),
                                )
                              }
                              className="w-20 rounded-lg border border-gray-300 bg-gray-300 px-3 py-2 text-center text-dark-100 dark:border-gray-700 dark:bg-gray-700"
                            />
                            <span className="text-dark-300">{t('common.units.gb')}</span>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-dark-300">
                            {customTrafficGb} {t('common.units.gb')} ×{' '}
                            {formatPrice(tariff.traffic_price_per_gb_kopeks ?? 0)}/
                            {t('common.units.gb')}
                          </span>
                          <span className="font-medium text-accent-500">
                            +
                            {formatPrice(
                              customTrafficGb * (tariff.traffic_price_per_gb_kopeks ?? 0),
                            )}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ProxyKeys custom: выбор количества устройств.
              Selector активен ТОЛЬКО при fresh покупке (subscriptionId не передан).
              При продлении selector скрыт — продление работает с текущим количеством
              устройств. Докупка/уменьшение устройств выполняются отдельно через
              DeviceTopupSheet / DeviceReductionSheet на странице подписки.
              Условие: device_price_kopeks > 0 (тарiff поддерживает выбор). */}
              {isFreshPurchase &&
                !!tariff.device_price_kopeks &&
                tariff.device_price_kopeks > 0 && (
                  <div className="rounded-xl border border-gray-200/50 bg-gray-250 p-4 dark:border-gray-800/50 dark:bg-gray-850">
                    <div className="mb-3 text-center font-medium text-dark-200">
                      {t('subscription.deviceSelector.title', 'Количество устройств')}
                    </div>
                    <div className="flex items-center justify-center gap-6">
                      <button
                        onClick={() => setDeviceCount((n) => Math.max(baseDeviceLimit, n - 1))}
                        disabled={deviceCount <= baseDeviceLimit}
                        className="btn-secondary flex h-12 w-12 items-center justify-center !p-0 text-2xl"
                        aria-label={t(
                          'subscription.additionalOptions.decrementDevices',
                          'Уменьшить',
                        )}
                      >
                        −
                      </button>
                      <div className="text-4xl font-bold text-dark-100">{deviceCount}</div>
                      <button
                        onClick={() =>
                          setDeviceCount((n) =>
                            maxDevices !== null ? Math.min(maxDevices, n + 1) : n + 1,
                          )
                        }
                        disabled={maxDevices !== null && deviceCount >= maxDevices}
                        className="btn-secondary flex h-12 w-12 items-center justify-center !p-0 text-2xl"
                        aria-label={t(
                          'subscription.additionalOptions.incrementDevices',
                          'Увеличить',
                        )}
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

              {/* ProxyKeys custom: autopay toggle для fresh purchase.
              Ручное продление запрещено → autopay = единственный способ продления.
              Toggle ON по умолчанию (безопаснее: предотвращает случайное истечение).
              После успешной покупки updateAutopay вызывается в onSuccess.
              Скрыт для daily-тарифов (у них свой механизм продления). */}
              {isFreshPurchase &&
                !(
                  tariff.is_daily ||
                  (tariff.daily_price_kopeks && tariff.daily_price_kopeks > 0)
                ) && (
                  <div className="flex items-center justify-between gap-3 rounded-[14px] border border-gray-200 bg-transparent p-3.5 dark:border-gray-800">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-dark-50">
                        {t('subscription.autoRenewal')}
                      </div>
                    </div>
                    <button
                      onClick={() => setAutopayEnabled((v) => !v)}
                      role="switch"
                      aria-checked={autopayEnabled}
                      aria-label={t('subscription.autopay', 'Auto-payment')}
                      className="relative h-7 w-[52px] shrink-0 rounded-full transition-colors duration-300"
                      style={{
                        background: autopayEnabled
                          ? 'rgb(var(--color-accent-500))'
                          : 'rgb(var(--color-gray-400))',
                      }}
                    >
                      <span
                        className="absolute left-[3px] top-[3px] h-[22px] w-[22px] rounded-full bg-white transition-transform duration-300"
                        style={{
                          transform: autopayEnabled ? 'translateX(23px)' : 'translateX(0)',
                        }}
                      />
                    </button>
                  </div>
                )}

              {/* Summary & Purchase */}
              {(selectedTariffPeriod || useCustomDays) && (
                <div className="rounded-xl bg-gray-250 p-5 dark:bg-gray-850">
                  {(() => {
                    // ProxyKeys custom: при активном device selector (device_price > 0)
                    // используем base_tariff_price_kopeks — цену БЕЗ доп. устройств.
                    // Доп. устройства считаем отдельно в extraDevicesCost ниже.
                    // Без selector — оригинальная логика (price_kopeks = base + extra).
                    // hasDeviceSelector: true только при fresh покупке с поддержкой
                    // выбора устройств. В этом режиме используем base_tariff_price_kopeks
                    // (цена без устройств) + отдельный расчёт extraDevicesCost ниже.
                    // При продлении (или без device_price) — оригинальная логика:
                    // price_kopeks уже включает extra devices (через upstream breakdown).
                    const hasDeviceSelector =
                      isFreshPurchase &&
                      !!tariff.device_price_kopeks &&
                      tariff.device_price_kopeks > 0;
                    const basePeriodPrice = useCustomDays
                      ? customDays * (tariff.price_per_day_kopeks ?? 0)
                      : hasDeviceSelector
                        ? (selectedTariffPeriod?.base_tariff_price_kopeks ??
                          selectedTariffPeriod?.price_kopeks ??
                          0)
                        : (selectedTariffPeriod?.price_kopeks ?? 0);
                    const existingPeriodOriginal = useCustomDays
                      ? tariff.original_price_per_day_kopeks &&
                        tariff.original_price_per_day_kopeks > (tariff.price_per_day_kopeks ?? 0)
                        ? customDays * tariff.original_price_per_day_kopeks
                        : undefined
                      : selectedTariffPeriod?.original_price_kopeks &&
                          selectedTariffPeriod.original_price_kopeks >
                            selectedTariffPeriod.price_kopeks
                        ? selectedTariffPeriod.original_price_kopeks
                        : undefined;
                    const promoPeriod = applyPromoDiscount(basePeriodPrice, existingPeriodOriginal);

                    const trafficPrice =
                      useCustomTraffic && tariff.custom_traffic_enabled
                        ? customTrafficGb * (tariff.traffic_price_per_gb_kopeks ?? 0)
                        : 0;

                    // ProxyKeys custom: стоимость доп. устройств сверх baseDeviceLimit.
                    // Считается ТОЛЬКО при активном selector (hasDeviceSelector), т.к.
                    // в этом режиме basePeriodPrice = base_tariff_price_kopeks (без extra).
                    // При продлении (selector скрыт) basePeriodPrice = price_kopeks, который
                    // уже включает extra devices — добавлять extraDevicesCost повторно
                    // было бы двойным счётом.
                    const periodDaysForMonths = useCustomDays
                      ? customDays
                      : (selectedTariffPeriod?.days ?? 30);
                    const months = Math.max(1, Math.round(periodDaysForMonths / 30));
                    const extraDevices = hasDeviceSelector
                      ? Math.max(0, deviceCount - baseDeviceLimit)
                      : 0;
                    const extraDevicesCost = hasDeviceSelector
                      ? extraDevices * (tariff.device_price_kopeks ?? 0) * months
                      : 0;

                    const totalPrice = promoPeriod.price + trafficPrice + extraDevicesCost;
                    const originalTotal = promoPeriod.original
                      ? promoPeriod.original + trafficPrice + extraDevicesCost
                      : null;

                    return (
                      <>
                        {/* ProxyKeys custom: breakdown (строки периода / трафика).
                        Рендерим ТОЛЬКО когда есть контент — т.е. НЕ per-device
                        pricing (есть upstream breakdown) ИЛИ включён custom traffic.
                        При per-device pricing без custom traffic breakdown пуст —
                        не рендерим пустой div (иначе остаётся полоса-разделитель). */}
                        {(!(tariff.device_price_kopeks && tariff.device_price_kopeks > 0) ||
                          (useCustomTraffic && tariff.custom_traffic_enabled)) && (
                          <div className="mb-4 space-y-2">
                            {tariff.device_price_kopeks &&
                            tariff.device_price_kopeks > 0 ? null : useCustomDays ? (
                              <div className="flex justify-between text-sm text-dark-300">
                                <span>
                                  {t('subscription.stepPeriod')}:{' '}
                                  {t('subscription.days', { count: customDays })}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span>{formatPrice(promoPeriod.price)}</span>
                                  {promoPeriod.original &&
                                    promoPeriod.original > promoPeriod.price && (
                                      <span className="text-xs text-dark-300 line-through">
                                        {formatPrice(promoPeriod.original)}
                                      </span>
                                    )}
                                </div>
                              </div>
                            ) : (
                              selectedTariffPeriod && (
                                <>
                                  {(selectedTariffPeriod.extra_devices_count ?? 0) > 0 &&
                                  selectedTariffPeriod.base_tariff_price_kopeks &&
                                  !hasDeviceSelector ? (
                                    <>
                                      <div className="flex justify-between text-sm text-dark-300">
                                        <span>
                                          {t('subscription.baseTariff')}:{' '}
                                          {selectedTariffPeriod.label}
                                        </span>
                                        <span>
                                          {formatPrice(
                                            selectedTariffPeriod.base_tariff_price_kopeks,
                                          )}
                                        </span>
                                      </div>
                                      <div className="flex justify-between text-sm text-dark-300">
                                        <span>
                                          {t('subscription.extraDevices')} (
                                          {selectedTariffPeriod.extra_devices_count})
                                        </span>
                                        <span>
                                          +
                                          {formatPrice(
                                            selectedTariffPeriod.extra_devices_cost_kopeks ?? 0,
                                          )}
                                        </span>
                                      </div>
                                    </>
                                  ) : (
                                    <div className="flex justify-between text-sm text-dark-300">
                                      <span>
                                        {t('subscription.summary.period', {
                                          label: selectedTariffPeriod.label,
                                        })}
                                      </span>
                                      <div className="flex items-center gap-2">
                                        <span>{formatPrice(promoPeriod.price)}</span>
                                        {promoPeriod.original &&
                                          promoPeriod.original > promoPeriod.price && (
                                            <span className="text-xs text-dark-300 line-through">
                                              {formatPrice(promoPeriod.original)}
                                            </span>
                                          )}
                                      </div>
                                    </div>
                                  )}
                                </>
                              )
                            )}
                            {useCustomTraffic && tariff.custom_traffic_enabled && (
                              <div className="flex justify-between text-sm text-dark-300">
                                <span>
                                  {t('subscription.summary.traffic', { gb: customTrafficGb })}
                                </span>
                                <span>+{formatPrice(trafficPrice)}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {promoPeriod.percent && (
                          <div className="mb-4 flex items-center justify-center gap-2 rounded-lg border border-gray-200/40 bg-gray-250 p-2 dark:border-gray-800/40 dark:bg-gray-850">
                            <span className="text-sm font-medium text-warning-500">
                              {t('promo.discountApplied')} -{promoPeriod.percent}%
                            </span>
                          </div>
                        )}

                        {/* ProxyKeys custom: total row с linear формулой для per-device pricing.
                        При device_price > 0 показываем «N × цена = итог» в одну строку:
                        формула dim, итог bright accent. Без border-t (полоса убрана).
                        Иначе — оригинальный total с border-t (разделяет от breakdown). */}
                        <div
                          className={`mb-4 flex items-center justify-between pt-2 ${
                            tariff.device_price_kopeks && tariff.device_price_kopeks > 0
                              ? ''
                              : 'border-t border-gray-200/50 dark:border-gray-800/50'
                          }`}
                        >
                          <span className="font-medium text-dark-100">
                            {t('subscription.total')}
                          </span>
                          <div className="text-right">
                            {tariff.device_price_kopeks && tariff.device_price_kopeks > 0 ? (
                              (() => {
                                const countForDisplay = isFreshPurchase
                                  ? deviceCount
                                  : tariff.device_limit || baseDeviceLimit;
                                const pricePerDevice =
                                  countForDisplay > 0
                                    ? Math.round(totalPrice / countForDisplay)
                                    : 0;
                                const dividesEvenly =
                                  pricePerDevice * countForDisplay === totalPrice;
                                return (
                                  <>
                                    {promoPeriod.original &&
                                      promoPeriod.original + extraDevicesCost > totalPrice && (
                                        <div className="text-sm text-dark-300 line-through">
                                          {formatPrice(promoPeriod.original + extraDevicesCost)}
                                        </div>
                                      )}
                                    <div className="text-2xl font-bold text-accent-500">
                                      <span className="mr-2 text-base font-normal text-dark-300">
                                        {countForDisplay} ×{' '}
                                        {formatPrice(
                                          dividesEvenly
                                            ? pricePerDevice
                                            : (tariff.device_price_kopeks ?? 0),
                                        )}{' '}
                                        =
                                      </span>
                                      {formatPrice(totalPrice)}
                                    </div>
                                  </>
                                );
                              })()
                            ) : (
                              <>
                                <span className="text-2xl font-bold text-accent-500">
                                  {formatPrice(totalPrice)}
                                </span>
                                {originalTotal && (
                                  <div className="text-sm text-dark-300 line-through">
                                    {formatPrice(originalTotal)}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => purchaseMutation.mutate()}
                          disabled={purchaseMutation.isPending}
                          className="btn-primary w-full py-3"
                        >
                          {purchaseMutation.isPending ? (
                            <span className="flex items-center justify-center gap-2">
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                              {t('common.loading')}
                            </span>
                          ) : // ProxyKeys custom: при продлении (tariff.is_current) — «Продлить»,
                          // при fresh покупке — «Купить».
                          isFreshPurchase ? (
                            t('subscription.purchase')
                          ) : (
                            t('subscription.renew')
                          )}
                        </button>

                        {sbpPurchaseButton}
                      </>
                    );
                  })()}

                  {purchaseMutation.isError &&
                    !getInsufficientBalanceError(purchaseMutation.error) && (
                      <div className="mt-3 text-center text-sm text-error-500">
                        {getErrorMessage(purchaseMutation.error)}
                      </div>
                    )}
                  {purchaseMutation.isError &&
                    getInsufficientBalanceError(purchaseMutation.error) && (
                      <div className="mt-3">
                        <InsufficientBalancePrompt
                          missingAmountKopeks={
                            getInsufficientBalanceError(purchaseMutation.error)?.missingAmount || 0
                          }
                          compact
                        />
                      </div>
                    )}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
