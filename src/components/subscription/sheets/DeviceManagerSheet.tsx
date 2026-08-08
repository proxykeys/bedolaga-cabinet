import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionApi } from '../../../api/subscription';
import { getErrorMessage } from '../../../utils/subscriptionHelpers';
import InsufficientBalancePrompt from '../../InsufficientBalancePrompt';
import { ChevronRightIcon } from '../../icons';
import type { PurchaseOptions, Subscription } from '../../../types';

// ──────────────────────────────────────────────────────────────────
// Unified device manager — replaces DeviceTopupSheet + DeviceReductionSheet.
// Single counter (absolute target limit) drives both buy and reduce flows.
//
// target > current → "Купить за {цена}" (accent) → purchaseDevices(delta)
// target < current → "Уменьшить" (warning)      → reduceDevices(target)
// target = current → disabled
// ──────────────────────────────────────────────────────────────────

export interface DeviceManagerSheetProps {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  subscription: Subscription;
  subscriptionId: number | undefined;
  purchaseOptions: PurchaseOptions | undefined;
}

export function DeviceManagerSheet({
  open,
  onOpen,
  onClose,
  subscription,
  subscriptionId,
  purchaseOptions,
}: DeviceManagerSheetProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const formatPrice = (kopeks: number) => {
    const rubles = kopeks / 100;
    return rubles % 1 === 0 ? `${rubles} ₽` : `${rubles.toFixed(2)} ₽`;
  };

  // Fetch reduction info (gives us min, max, connected — works for both flows)
  const { data: reductionInfo, isLoading: reductionLoading } = useQuery({
    queryKey: ['device-reduction-info', subscriptionId],
    queryFn: () => subscriptionApi.getDeviceReductionInfo(subscriptionId),
    enabled: open && !!subscription,
  });

  const currentLimit = subscription.device_limit;

  // Target limit — initialized to current, user adjusts up or down
  const [targetLimit, setTargetLimit] = useState(currentLimit);

  // Reset to current when opening or when subscription changes
  useEffect(() => {
    if (open) setTargetLimit(currentLimit);
  }, [open, currentLimit]);

  // Fetch price preview only when increasing
  const delta = Math.max(0, targetLimit - currentLimit);
  const { data: priceData } = useQuery({
    queryKey: ['device-price', delta, subscriptionId],
    queryFn: () => subscriptionApi.getDevicePrice(delta, subscriptionId),
    enabled: open && delta > 0,
  });

  const buyMutation = useMutation({
    mutationFn: () => subscriptionApi.purchaseDevices(delta, subscriptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription', subscriptionId] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions-list'] });
      queryClient.invalidateQueries({ queryKey: ['devices', subscriptionId] });
      queryClient.invalidateQueries({ queryKey: ['device-price'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['device-reduction-info', subscriptionId] });
      onClose();
    },
  });

  const reduceMutation = useMutation({
    mutationFn: () => subscriptionApi.reduceDevices(targetLimit, subscriptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription', subscriptionId] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions-list'] });
      queryClient.invalidateQueries({ queryKey: ['devices', subscriptionId] });
      queryClient.invalidateQueries({ queryKey: ['device-reduction-info', subscriptionId] });
      onClose();
    },
  });

  // Bounds
  const minLimit = reductionInfo
    ? Math.max(reductionInfo.min_device_limit, reductionInfo.connected_devices_count)
    : 1;
  const maxLimit = priceData?.max_device_limit ?? null; // null = no ceiling (ProxyKeys)

  const isIncrease = targetLimit > currentLimit;
  const isDecrease = targetLimit < currentLimit;

  const insufficientBalance =
    isIncrease &&
    priceData?.available &&
    priceData.total_price_kopeks != null &&
    purchaseOptions != null &&
    priceData.total_price_kopeks > purchaseOptions.balance_kopeks;

  const buyDisabled = buyMutation.isPending || !priceData?.available || !!insufficientBalance;

  const reduceDisabled =
    reduceMutation.isPending ||
    targetLimit >= currentLimit ||
    targetLimit < (reductionInfo?.min_device_limit ?? 1) ||
    (reductionInfo != null && targetLimit < reductionInfo.connected_devices_count);

  // ─── Closed: trigger button ───
  if (!open) {
    return (
      <button
        onClick={onOpen}
        className="w-full rounded-xl border border-gray-200/50 bg-gray-250 p-4 text-left transition-colors hover:border-gray-300 dark:border-gray-800/50 dark:bg-gray-850 dark:hover:border-gray-700"
      >
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <div className="text-sm font-medium text-dark-100">
              {t('subscription.additionalOptions.deviceManagerTitle')}
            </div>
            <div className="mt-1 text-sm text-dark-300">
              {t('subscription.additionalOptions.currentDeviceLimit', { count: currentLimit })}
            </div>
            <div className="mt-0.5 text-xs text-dark-300/70">
              {t('subscription.additionalOptions.deviceManagerHint')}
            </div>
          </div>
          <ChevronRightIcon className="flex-shrink-0 text-dark-300" />
        </div>
      </button>
    );
  }

  // ─── Open: manager panel ───
  return (
    <div className="rounded-xl border border-gray-200/50 bg-gray-250 p-5 dark:border-gray-800/50 dark:bg-gray-850">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-dark-100">
          {t('subscription.additionalOptions.deviceManagerTitle')}
        </h3>
        <button
          onClick={onClose}
          className="text-sm text-dark-300 hover:text-dark-200"
          aria-label={t('common.close', 'Close')}
        >
          ✕
        </button>
      </div>

      {reductionLoading ? (
        <div className="flex items-center justify-center py-4">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Device counter */}
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() => setTargetLimit((v) => Math.max(minLimit, v - 1))}
              disabled={targetLimit <= minLimit}
              className="btn-secondary flex h-12 w-12 items-center justify-center !p-0 text-2xl"
              aria-label={t('subscription.additionalOptions.decrementDevices', 'Уменьшить')}
            >
              -
            </button>
            <div className="text-4xl font-bold text-dark-100">{targetLimit}</div>
            <button
              onClick={() => setTargetLimit((v) => v + 1)}
              disabled={maxLimit != null && targetLimit >= maxLimit}
              className="btn-secondary flex h-12 w-12 items-center justify-center !p-0 text-2xl"
              aria-label={t('subscription.additionalOptions.incrementDevices', 'Увеличить')}
            >
              +
            </button>
          </div>

          {/* Info line */}
          <div className="space-y-1 text-center text-sm text-dark-300">
            <div>
              {t('subscription.additionalOptions.currentDeviceLimit', { count: currentLimit })}
            </div>
            {reductionInfo && reductionInfo.connected_devices_count > 0 && (
              <div>
                {t('subscription.additionalOptions.connectedDevices', {
                  count: reductionInfo.connected_devices_count,
                })}
              </div>
            )}
          </div>

          {/* Disconnect warning (can't reduce below connected) */}
          {reductionInfo &&
            reductionInfo.connected_devices_count > reductionInfo.min_device_limit &&
            isDecrease &&
            targetLimit <= reductionInfo.connected_devices_count && (
              <div className="rounded-lg border border-gray-200/40 bg-gray-250 p-3 text-center text-sm text-warning-500 dark:border-gray-800/40 dark:bg-gray-850">
                {t('subscription.additionalOptions.disconnectDevicesFirst', {
                  count: reductionInfo.connected_devices_count,
                })}
              </div>
            )}

          {/* Price info (only when increasing) */}
          {isIncrease && priceData?.available && priceData.price_per_device_label && (
            <div className="text-center">
              <div className="mb-2 text-sm text-dark-300">
                {priceData.discount_percent != null &&
                priceData.discount_percent > 0 &&
                priceData.original_price_per_device_kopeks != null ? (
                  <span>
                    <span className="text-dark-300 line-through">
                      {formatPrice(priceData.original_price_per_device_kopeks)}
                    </span>
                    <span className="mx-1">{priceData.price_per_device_label}</span>
                  </span>
                ) : (
                  priceData.price_per_device_label
                )}
                /{t('subscription.perDevice').replace('/ ', '')} (
                {t('subscription.days', { count: priceData.days_left })})
              </div>
              {priceData.discount_percent != null && priceData.discount_percent > 0 && (
                <div className="mb-2">
                  <span className="inline-block rounded-full bg-success-500 px-2.5 py-0.5 text-sm font-medium text-black">
                    -{priceData.discount_percent}%
                  </span>
                </div>
              )}
              {priceData.total_price_kopeks === 0 ? (
                <div className="text-2xl font-bold text-success-500">
                  {t('subscription.switchTariff.free')}
                </div>
              ) : (
                <div className="text-2xl font-bold text-accent-500">
                  {priceData.discount_percent != null &&
                    priceData.discount_percent > 0 &&
                    priceData.base_total_price_kopeks != null && (
                      <span className="mr-2 text-lg text-dark-300 line-through">
                        {formatPrice(priceData.base_total_price_kopeks)}
                      </span>
                    )}
                  {priceData.total_price_label}
                </div>
              )}
            </div>
          )}

          {/* Insufficient balance */}
          {insufficientBalance &&
            priceData?.total_price_kopeks != null &&
            purchaseOptions != null && (
              <InsufficientBalancePrompt
                missingAmountKopeks={priceData.total_price_kopeks - purchaseOptions.balance_kopeks}
                compact
                onBeforeTopUp={async () => {
                  await subscriptionApi.saveDevicesCart(delta, subscriptionId);
                }}
              />
            )}

          {/* Action button — changes by direction */}
          {isIncrease ? (
            <button
              onClick={() => buyMutation.mutate()}
              disabled={buyDisabled}
              className="btn-primary w-full py-3"
            >
              {buyMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                </span>
              ) : (
                t('subscription.additionalOptions.buy')
              )}
            </button>
          ) : (
            <button
              onClick={() => reduceMutation.mutate()}
              disabled={reduceDisabled}
              className="btn-primary w-full py-3"
            >
              {reduceMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  {t('subscription.additionalOptions.reducing')}
                </span>
              ) : (
                t('subscription.additionalOptions.reduce')
              )}
            </button>
          )}

          {/* Errors */}
          {buyMutation.isError && (
            <div className="text-center text-sm text-error-500">
              {getErrorMessage(buyMutation.error)}
            </div>
          )}
          {reduceMutation.isError && (
            <div className="text-center text-sm text-error-500">
              {getErrorMessage(reduceMutation.error)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
