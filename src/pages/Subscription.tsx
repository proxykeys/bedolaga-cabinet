import { uiLocale } from '@/utils/uiLocale';
import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link, Navigate, useNavigate, useParams } from 'react-router';
import { subscriptionApi } from '../api/subscription';
import { balanceApi } from '../api/balance';
import { API } from '../config/constants';
import { DEVICE_ALIAS_MAX_LENGTH } from '../constants/devices';
// ProxyKeys custom: страница подписки = главная, сверху показываем
// блок баланса/рефералов, а в empty-state — запуск триала.
import StatsGridContainer from '../components/subscription/StatsGridContainer';
import TrialOfferCard from '../components/dashboard/TrialOfferCard';
import { useDestructiveConfirm } from '../platform/hooks/useNativeDialog';
import { useTrafficZone } from '../hooks/useTrafficZone';
import { getGlassColors } from '../utils/glassTheme';
import { copyToClipboard } from '../utils/clipboard';
import { useTheme } from '../hooks/useTheme';
import InsufficientBalancePrompt from '../components/InsufficientBalancePrompt';
import { useCurrency } from '../hooks/useCurrency';
import { useCloseOnSuccessNotification } from '../store/successNotification';
import PurchaseCTAButton from '../components/subscription/PurchaseCTAButton';
import { CopyIcon, CheckIcon, PauseIcon, CalendarIcon, DevicesIcon } from '../components/icons';
import { useHaptic, usePlatform } from '../platform';
import { resolveConnectionUrlForUi } from '../utils/connectionLink';
import { getErrorMessage, getInsufficientBalanceError } from '../utils/subscriptionHelpers';
import { openPaymentUrl } from '../utils/openPaymentUrl';
import { useToast } from '../components/Toast';
import {
  isSbpFeatureDisabledError,
  sbpIntervalLabelKey,
  sbpUiState,
  type SbpUiState,
} from '../utils/sbpRecurring';
import { DeviceManagerSheet } from '../components/subscription/sheets/DeviceManagerSheet';
import { ServerManagementSheet } from '../components/subscription/sheets/ServerManagementSheet';
import { DeleteSubscriptionSheet } from '../components/subscription/sheets/DeleteSubscriptionSheet';
import { PageSkeleton, Skeleton, SkeletonGroup } from '@/components/ui/skeleton';
import { safeLocal } from '../utils/safeStorage';

/** Isolated countdown so 1s interval doesn't re-render the whole page */
const CountdownTimer = memo(function CountdownTimer({
  endDate,
  isActive,
  glassColors: g,
}: {
  endDate: string;
  isActive: boolean;
  glassColors: ReturnType<typeof getGlassColors>;
}) {
  const { t } = useTranslation();
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const endTime = new Date(endDate).getTime();
    const tick = () => {
      const diff = Math.max(0, endTime - Date.now());
      setCountdown({
        days: Math.floor(diff / 86_400_000),
        hours: Math.floor((diff % 86_400_000) / 3_600_000),
        minutes: Math.floor((diff % 3_600_000) / 60_000),
        seconds: Math.floor((diff % 60_000) / 1_000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endDate]);

  const isExpired = !isActive;
  const isUrgent = countdown.days <= 3;

  const formattedDate = new Date(endDate).toLocaleDateString(uiLocale(), {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="min-w-0 overflow-hidden rounded-[14px] border border-gray-200 bg-transparent p-3.5 dark:border-gray-800">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-dark-300">
        <span
          className="flex h-6 w-6 items-center justify-center"
          style={{
            color: isExpired
              ? 'rgb(var(--color-error-500))'
              : isUrgent
                ? 'rgb(var(--color-warning-500))'
                : g.textSecondary,
          }}
        >
          <CalendarIcon className="h-6 w-6" />
        </span>
        {t('dashboard.remaining')}
      </div>
      {isExpired ? (
        <div
          className="text-[18px] font-bold tracking-tight"
          style={{ color: 'rgb(var(--color-error-500))' }}
        >
          {t('subscription.expired')}
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-1 font-mono tabular-nums">
            {countdown.days > 0 && (
              <>
                <span
                  className="text-[20px] font-bold tracking-tight"
                  style={{ color: isUrgent ? 'rgb(var(--color-warning-500))' : g.text }}
                >
                  {countdown.days}
                </span>
                <span className="mr-1 text-xs font-medium text-dark-300">
                  {t('subscription.daysShort')}
                </span>
              </>
            )}
            <span
              className="text-[20px] font-bold tracking-tight"
              style={{ color: isUrgent ? 'rgb(var(--color-warning-500))' : g.text }}
            >
              {String(countdown.hours).padStart(2, '0')}
            </span>
            <span
              className="mx-[-1px] text-[16px] font-bold opacity-30"
              style={{ color: isUrgent ? 'rgb(var(--color-warning-500))' : g.text }}
            >
              :
            </span>
            <span
              className="text-[20px] font-bold tracking-tight"
              style={{ color: isUrgent ? 'rgb(var(--color-warning-500))' : g.text }}
            >
              {String(countdown.minutes).padStart(2, '0')}
            </span>
            <span
              className="mx-[-1px] text-[16px] font-bold opacity-30"
              style={{ color: isUrgent ? 'rgb(var(--color-warning-500))' : g.text }}
            >
              :
            </span>
            <span
              className="text-[20px] font-bold tracking-tight"
              style={{ color: isUrgent ? 'rgb(var(--color-warning-500))' : g.text }}
            >
              {String(countdown.seconds).padStart(2, '0')}
            </span>
          </div>
          <div className="text-xs font-medium text-dark-300">
            {t('subscription.expiresAt')}: {formattedDate}
          </div>
        </div>
      )}
    </div>
  );
});

export default function Subscription() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { formatAmount, currencySymbol } = useCurrency();
  const navigate = useNavigate();
  const { subscriptionId: subIdParam } = useParams<{ subscriptionId?: string }>();
  const subscriptionId = subIdParam ? parseInt(subIdParam, 10) : undefined;
  const { isDark } = useTheme();
  const g = getGlassColors(isDark);
  const haptic = useHaptic();
  const { openLink, platform } = usePlatform();
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [showDeleteSheet, setShowDeleteSheet] = useState(false);
  const destructiveConfirm = useDestructiveConfirm();
  // ProxyKeys custom: empty-state на главной = запуск триала.
  const [trialError, setTrialError] = useState<string | null>(null);

  // Helper to format price from kopeks
  const formatPrice = (kopeks: number) =>
    kopeks === 0
      ? t('subscription.free', 'Бесплатно')
      : `${formatAmount(kopeks / 100)} ${currencySymbol}`;

  // Device/traffic topup state
  const [showDeviceManager, setShowDeviceManager] = useState(false);
  const [showServerManagement, setShowServerManagement] = useState(false);
  const [selectedServersToUpdate, setSelectedServersToUpdate] = useState<string[]>([]);

  // Revoke (reissue) cooldown state
  const [revokeCooldown, setRevokeCooldown] = useState(0);

  // Detect multi-tariff mode from cached subscriptions-list
  const { data: multiSubData } = useQuery({
    queryKey: ['subscriptions-list'],
    queryFn: () => subscriptionApi.getSubscriptions(),
    staleTime: 60_000,
  });
  const isMultiTariff = multiSubData?.multi_tariff_enabled ?? false;

  const { data: subscriptionResponse, isLoading } = useQuery({
    queryKey: ['subscription', subscriptionId],
    queryFn: () => subscriptionApi.getSubscription(subscriptionId),
    retry: false,
    staleTime: 0,
    refetchOnMount: 'always',
  });
  const { data: connectionLink, isLoading: isConnectionLinkLoading } = useQuery({
    queryKey: ['connection-link', subscriptionId],
    queryFn: () => subscriptionApi.getConnectionLink(subscriptionId),
    retry: false,
    staleTime: 0,
  });

  // Extract subscription from response (null if no subscription)
  const subscription = subscriptionResponse?.subscription ?? null;
  const displayedConnectionUrl = useMemo(
    () =>
      resolveConnectionUrlForUi({
        mode: connectionLink?.connect_mode,
        happSchemeLink: connectionLink?.happ_scheme_link,
        displayLink: connectionLink?.display_link,
        subscriptionUrl: connectionLink?.subscription_url,
        happCryptLink: connectionLink?.happ_cryptolink,
        happCryptoLink: connectionLink?.happ_crypto_link,
        happLink: connectionLink?.happ_link,
        fallbackUrl: isConnectionLinkLoading ? null : (subscription?.subscription_url ?? null),
      }),
    [
      connectionLink?.connect_mode,
      connectionLink?.display_link,
      connectionLink?.happ_cryptolink,
      connectionLink?.happ_crypto_link,
      connectionLink?.happ_link,
      connectionLink?.happ_scheme_link,
      connectionLink?.subscription_url,
      isConnectionLinkLoading,
      subscription?.subscription_url,
    ],
  );
  const shouldHideConnectionLink =
    subscription?.hide_subscription_link || connectionLink?.hide_link;

  // ProxyKeys custom: баланс и триал нужны для empty-state на главной (/),
  // когда у юзера ещё нет подписки. Включаем только когда нет подписки,
  // чтобы не делать лишних запросов при наличии active subscription.
  // subscriptionResponse?.has_subscription===false — единый сигнал «нет подписки».
  const hasNoSubscription = !subscription && !isLoading;
  const { data: balanceData } = useQuery({
    queryKey: ['balance'],
    queryFn: balanceApi.getBalance,
    enabled: hasNoSubscription,
    staleTime: API.BALANCE_STALE_TIME_MS,
  });
  const { data: trialInfo, isLoading: trialLoading } = useQuery({
    queryKey: ['trial-info'],
    queryFn: () => subscriptionApi.getTrialInfo(),
    enabled: hasNoSubscription,
  });
  const activateTrialMutation = useMutation({
    mutationFn: () => subscriptionApi.activateTrial(),
    onSuccess: () => {
      setTrialError(null);
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions-list'] });
      queryClient.invalidateQueries({ queryKey: ['trial-info'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-options'] });
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      setTrialError(error.response?.data?.detail || t('common.error'));
    },
  });

  // Traffic zone (theme-aware) — called unconditionally at top level.
  // All tariffs are unlimited, so usedPercent is 0 (green zone) — kept only
  // to drive accent colors on the status badge / device indicators.
  const usedPercent = subscription?.traffic_used_percent ?? 0;
  const zone = useTrafficZone(usedPercent);

  // Purchase options (needed for balance_kopeks in device/traffic/server management)
  const { data: purchaseOptions } = useQuery({
    queryKey: ['purchase-options', subscriptionId],
    queryFn: () => subscriptionApi.getPurchaseOptions(subscriptionId),
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const isTariffsMode = purchaseOptions?.sales_mode === 'tariffs';

  // SBP (Platega) recurring auto-payment status. Polls every 8s while a
  // payment is PENDING (waiting for bank-app confirmation) so the UI flips
  // to 'active'/'past_due' without a manual refresh; stops polling otherwise.
  const sbpQuery = useQuery({
    queryKey: ['sbp-recurring', subscriptionId],
    queryFn: () => subscriptionApi.getSbpRecurring(subscriptionId),
    enabled: !!subscription && !subscription.is_trial,
    retry: false,
    refetchInterval: (query) => (query.state.data?.status === 'PENDING' ? 8000 : false),
  });
  const sbpInfo = sbpQuery.data;
  // 403 with a specific detail means the feature itself is disabled on the
  // backend — distinct from "not resolved yet" or "other error", both of
  // which must fail quiet (render nothing) rather than flash the 'off' state.
  const sbpFeatureDisabled = isSbpFeatureDisabledError(sbpQuery.error);
  const sbpUiStateValue: SbpUiState =
    sbpInfo !== undefined || sbpFeatureDisabled
      ? sbpUiState(sbpInfo, sbpFeatureDisabled)
      : 'hidden';

  const enableSbpMutation = useMutation({
    mutationFn: () => subscriptionApi.enableSbpRecurring(subscriptionId),
    onSuccess: (data) => {
      if (data.redirect_url) {
        openPaymentUrl(data.redirect_url, platform, openLink);
      }
      queryClient.invalidateQueries({ queryKey: ['sbp-recurring', subscriptionId] });
      // Backend flips autopay_enabled off when SBP auto-pay is enabled.
      queryClient.invalidateQueries({ queryKey: ['subscription', subscriptionId] });
    },
    onError: (error: unknown) => {
      const detail = (error as { response?: { data?: { detail?: unknown } } })?.response?.data
        ?.detail;
      showToast({
        type: 'error',
        title: typeof detail === 'string' ? detail : t('subscription.sbpRecurring.enableError'),
        message: '',
        duration: 3000,
      });
    },
  });

  const cancelSbpMutation = useMutation({
    mutationFn: () => subscriptionApi.cancelSbpRecurring(subscriptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sbp-recurring', subscriptionId] });
      queryClient.invalidateQueries({ queryKey: ['subscription', subscriptionId] });
      showToast({
        type: 'success',
        title: t('subscription.sbpRecurring.cancelled'),
        message: '',
        duration: 3000,
      });
    },
    onError: (error: unknown) => {
      const detail = (error as { response?: { data?: { detail?: unknown } } })?.response?.data
        ?.detail;
      showToast({
        type: 'error',
        title: typeof detail === 'string' ? detail : t('subscription.sbpRecurring.cancelError'),
        message: '',
        duration: 3000,
      });
    },
  });

  const handleCancelSbp = async () => {
    const confirmed = await destructiveConfirm(
      t('subscription.sbpRecurring.confirmCancel'),
      t('subscription.sbpRecurring.cancel'),
    );
    if (!confirmed) return;
    cancelSbpMutation.mutate();
  };

  const autopayMutation = useMutation({
    mutationFn: (enabled: boolean) =>
      subscriptionApi.updateAutopay(enabled, undefined, subscriptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription', subscriptionId] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions-list'] });
      // Enabling balance-autopay cancels SBP auto-pay server-side — refresh so
      // the SBP block doesn't keep showing a now-stale 'active'/'pending' state.
      queryClient.invalidateQueries({ queryKey: ['sbp-recurring', subscriptionId] });
    },
  });

  // Devices query
  const { data: devicesData, isLoading: devicesLoading } = useQuery({
    queryKey: ['devices', subscriptionId],
    queryFn: () => subscriptionApi.getDevices(subscriptionId),
    enabled: !!subscription,
  });

  // Delete device mutation
  const deleteDeviceMutation = useMutation({
    mutationFn: (hwid: string) => subscriptionApi.deleteDevice(hwid, subscriptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices', subscriptionId] });
    },
  });

  // Delete all devices mutation
  const deleteAllDevicesMutation = useMutation({
    mutationFn: () => subscriptionApi.deleteAllDevices(subscriptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices', subscriptionId] });
    },
  });

  // Local device alias (rename) state. Only one device can be in edit-mode
  // at a time — `editingDeviceHwid` doubles as both the toggle and the
  // identifier of the row being edited.
  const [editingDeviceHwid, setEditingDeviceHwid] = useState<string | null>(null);
  const [editingDeviceName, setEditingDeviceName] = useState('');

  const renameDeviceMutation = useMutation({
    mutationFn: ({ hwid, name }: { hwid: string; name: string | null }) =>
      subscriptionApi.renameDevice(hwid, name, subscriptionId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['devices', subscriptionId] });
      // Soft success-tap, like other mutations on this page.
      haptic.notification('success');
      // Не сбрасываем edit-state, если пользователь уже перешёл на другой
      // девайс пока шёл запрос — иначе теряем его новый input. Имя не чистим
      // безусловно: оно либо принадлежит уже другому девайсу (нужно сохранить),
      // либо инпут уже закрылся (значение не отображается).
      setEditingDeviceHwid((current) => (current === variables.hwid ? null : current));
    },
    onError: () => {
      haptic.notification('error');
    },
  });

  // Pause subscription mutation
  const pauseMutation = useMutation({
    mutationFn: () => subscriptionApi.togglePause(subscriptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription', subscriptionId] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions-list'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
    },
  });

  // Auto-close all modals/forms when success notification appears
  // (setters are stable React guarantees — listed explicitly for react-compiler)
  const handleCloseAllModals = useCallback(() => {
    setShowDeviceManager(false);
    setShowServerManagement(false);
  }, [setShowDeviceManager, setShowServerManagement]);
  useCloseOnSuccessNotification(handleCloseAllModals);

  // (unified device manager: DeviceManagerSheet self-owns queries + mutations)

  // (countries query + update mutation moved into <ServerManagementSheet>)

  // Initialize revoke cooldown from localStorage on mount
  useEffect(() => {
    const ts = safeLocal.getItem(`revoke_ts_${subscriptionId ?? 'default'}`);
    if (ts) {
      const elapsed = Math.floor((Date.now() - parseInt(ts, 10)) / 1000);
      const remaining = Math.max(0, 900 - elapsed);
      setRevokeCooldown(remaining);
    }
  }, [subscriptionId]);

  // Countdown timer for revoke cooldown
  useEffect(() => {
    if (revokeCooldown <= 0) return;
    const timer = setInterval(() => {
      setRevokeCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [revokeCooldown]);

  // Revoke (reissue) subscription mutation
  const revokeMutation = useMutation({
    mutationFn: () => subscriptionApi.revokeSubscription(subscriptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['connection-link', subscriptionId] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions-list'] });
      // Remnawave resets device HWIDs on revoke — make sure the cabinet
      // re-reads the now-empty device list instead of showing the stale cache.
      queryClient.invalidateQueries({ queryKey: ['devices', subscriptionId] });
      haptic.notification('success');
      safeLocal.setItem(`revoke_ts_${subscriptionId ?? 'default'}`, Date.now().toString());
      setRevokeCooldown(900);
    },
    onError: () => {
      haptic.notification('error');
    },
  });

  const copyUrl = () => {
    if (displayedConnectionUrl) {
      void copyToClipboard(displayedConnectionUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRevoke = async () => {
    const confirmed = await destructiveConfirm(
      t('subscription.revoke.warning'),
      t('subscription.revoke.confirmBtn'),
      t('subscription.revoke.title'),
    );
    if (!confirmed) return;
    revokeMutation.mutate();
  };

  // In multi-tariff mode without a specific subscription ID, redirect to root
  // ProxyKeys custom: / — единая «главная = подписка», /subscriptions убран.
  if (isMultiTariff && !subscriptionId && !isLoading) {
    return <Navigate to="/" replace />;
  }

  if (isLoading) {
    return (
      <PageSkeleton leading={1} titleWidth="w-48">
        <Skeleton variant="card" className="h-64" />
        <Skeleton variant="card" count={2} className="h-20" />
      </PageSkeleton>
    );
  }

  if (!subscription && subscriptionId) {
    return (
      <div className="mx-auto max-w-lg p-4 text-center">
        <div className="mb-4 text-4xl">😕</div>
        <h2 className="mb-2 text-xl font-bold text-dark-50">
          {t('subscription.notFound', 'Подписка не найдена')}
        </h2>
        <p className="mb-4 text-sm text-dark-200">
          {t('subscription.notFoundDesc', 'Возможно, подписка была удалена или не существует')}
        </p>
        <button onClick={() => navigate('/')} className="btn-cta-md">
          {t('subscription.backToList', 'Мои подписки')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ProxyKeys custom: эта страница = главная (/).
          Баланс и рефералы всегда видны сверху (как на бывшей Dashboard).
          Без заголовка/Back-кнопки: для single-tariff это top-level экран
          (AppWithNavigator уже скрывает Telegram back на /). */}
      <StatsGridContainer />

      {/* Current Subscription */}
      {subscription ? (
        (() => {
          const connectedDevices = devicesData?.total ?? 0;
          const isAtDeviceLimit =
            subscription.device_limit > 0 && connectedDevices >= subscription.device_limit;
          const showAutopay = !subscription.is_trial && !subscription.is_daily;

          return (
            <div
              className="relative overflow-hidden rounded-3xl lg:backdrop-blur-xl"
              style={{
                background: g.cardBg,
                border: `1px solid ${g.cardBorder}`,
                boxShadow: g.shadow,
                padding: '28px 28px 24px',
              }}
            >
              {/* Decorative ambient radial + trial shimmer border were
                  removed: they carried no information, leaked zone/accent
                  hue into pure decoration (violates DESIGN.md
                  Tunable-but-Scarce + Status-Hue Lockout rules), and the
                  same chrome was distilled out of SubscriptionCardActive
                  earlier in this branch. Trial state is conveyed by the
                  header badge. */}

              {/* ─── Header ─── */}
              <div className="mb-6 flex items-start justify-between">
                <div>
                  {/* Plan name */}
                  <h2 className="text-lg font-bold tracking-tight text-dark-50">
                    {subscription.tariff_name || t('subscription.currentPlan')}
                  </h2>
                </div>

                {/* Status badge */}
                <span
                  className="max-w-[55%] shrink-0 rounded-full px-3 py-1 text-center font-mono text-xs font-semibold uppercase tracking-wider"
                  style={{
                    background: subscription.is_active
                      ? subscription.is_trial
                        ? 'rgb(var(--color-warning-500))'
                        : zone.mainHex
                      : subscription.is_limited
                        ? 'rgb(var(--color-warning-500))'
                        : 'rgb(var(--color-error-500))',
                    color: subscription.is_active
                      ? subscription.is_trial
                        ? 'rgb(var(--color-on-warning))'
                        : `rgb(var(--color-on-${zone.colorKey}))`
                      : subscription.is_limited
                        ? 'rgb(var(--color-on-warning))'
                        : 'rgb(var(--color-on-error))',
                  }}
                >
                  {subscription.is_active
                    ? subscription.is_trial
                      ? t('subscription.trialStatus')
                      : t('subscription.active')
                    : subscription.is_limited
                      ? t('subscription.trafficLimited')
                      : subscription.status === 'disabled'
                        ? t('subscription.pause.suspended')
                        : t('subscription.expired')}
                </span>
              </div>

              {/* ─── Connect Device + Subscription URL (2 cols on lg) ─── */}
              <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-stretch">
                {subscription.subscription_url && (
                  <button
                    type="button"
                    onClick={() => {
                      navigate(
                        subscriptionId ? `/connection?sub=${subscriptionId}` : '/connection',
                      );
                    }}
                    className="flex w-full items-center gap-3.5 rounded-[14px] border border-gray-200 bg-gray-250 p-3.5 text-left transition-colors duration-300 hover:border-gray-300 hover:bg-gray-300 dark:border-gray-800 dark:bg-gray-850 dark:hover:border-gray-700 dark:hover:bg-gray-800"
                  >
                    <span
                      className="flex h-9 w-9 flex-shrink-0 items-center justify-center"
                      style={{ color: zone.mainHex }}
                    >
                      <DevicesIcon className="h-9 w-9" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-base font-semibold tracking-tight text-dark-50">
                        {t('dashboard.connectDevice')}
                      </div>
                      <div className="mt-0.5 text-sm text-dark-300">
                        {subscription.device_limit === 0
                          ? t('dashboard.devicesConnectedUnlimited', { used: connectedDevices })
                          : t('dashboard.devicesOfMax', {
                              used: connectedDevices,
                              max: subscription.device_limit,
                            })}
                      </div>
                      {isAtDeviceLimit && (
                        <div
                          className="mt-1 text-xs font-medium"
                          style={{ color: 'rgb(var(--color-warning-500))' }}
                        >
                          {t('dashboard.deviceLimitReached')}
                        </div>
                      )}
                    </div>
                    {subscription.device_limit === 0 ? (
                      <div
                        className="flex flex-shrink-0 items-center text-lg text-dark-300"
                        aria-hidden="true"
                      >
                        ∞
                      </div>
                    ) : subscription.device_limit <= 10 ? (
                      <div className="flex flex-shrink-0 gap-1.5" aria-hidden="true">
                        {Array.from({ length: subscription.device_limit }, (_, i) => (
                          <div
                            key={i}
                            className="h-[7px] w-[7px] rounded-full transition-[background-color,box-shadow] duration-300"
                            style={{
                              background: i < connectedDevices ? zone.mainHex : g.textGhost,
                            }}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="flex w-16 flex-shrink-0 items-center" aria-hidden="true">
                        <div
                          className="h-[6px] w-full overflow-hidden rounded-full"
                          style={{ background: g.textGhost }}
                        >
                          {/* scaleX (compositor) instead of width (layout-thrash).
                            Track is 64px (w-16), so 0.0625 floor = 4px minimum,
                            preserving the prior minWidth behaviour. */}
                          <div
                            className="h-full w-full origin-left rounded-full transition-transform duration-500"
                            style={{
                              transform: `scaleX(${(() => {
                                const pct = connectedDevices / subscription.device_limit;
                                return connectedDevices > 0 ? Math.max(pct, 0.0625) : 0;
                              })()})`,
                              background: zone.mainHex,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </button>
                )}

                {/* ─── Subscription URL ─── */}
                {displayedConnectionUrl && !shouldHideConnectionLink && (
                  <div className="flex h-full flex-col justify-end gap-1.5">
                    <div className="text-xs font-medium uppercase tracking-wider text-dark-300">
                      {t('subscription.subscriptionUrlLabel')}
                    </div>
                    <div className="flex gap-2">
                      <code
                        className="block min-w-0 flex-1 truncate whitespace-nowrap rounded-[10px] px-3 py-2 font-mono text-sm text-dark-300"
                        style={{
                          background: g.codeBg,
                          border: `1px solid ${g.codeBorder}`,
                        }}
                        title={displayedConnectionUrl}
                      >
                        {displayedConnectionUrl}
                      </code>
                      <button
                        onClick={copyUrl}
                        className="flex h-auto items-center rounded-[10px] px-3 transition-colors duration-300"
                        style={{
                          background: copied ? 'rgb(var(--color-accent-500))' : g.innerBorder,
                          border: copied
                            ? '1px solid rgb(var(--color-accent-500))'
                            : `1px solid ${g.trackBg}`,
                          color: copied ? 'rgb(var(--color-on-accent))' : g.textMuted,
                        }}
                        aria-label={t('subscription.copyLink')}
                        title={t('subscription.copyLink')}
                      >
                        {copied ? <CheckIcon /> : <CopyIcon />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ─── Countdown + Autopay (2 cols on lg) ─── */}
              <div className={`mb-5 grid grid-cols-1 gap-4 ${showAutopay ? 'lg:grid-cols-2' : ''}`}>
                <CountdownTimer
                  endDate={subscription.end_date}
                  isActive={subscription.is_active || subscription.is_limited}
                  glassColors={g}
                />

                {/* ─── Autopay Toggle ─── */}
                {!subscription.is_trial && !subscription.is_daily && (
                  <div className="flex items-center justify-between gap-3 rounded-[14px] border border-gray-200 bg-transparent p-3.5 dark:border-gray-800">
                    <div className="min-w-0 flex-1">
                      <div className="text-base font-semibold text-dark-50">
                        {t('subscription.autoRenewal')}
                      </div>
                      {/* ProxyKeys custom: информация о стоимости и достаточности средств для автопродления.
                        Показывается только когда autopay включён и бэкенд вернул preview-цену.
                        deficit > 0 → warning «необходимо пополнить»; deficit = 0 → success «достаточно средств». */}
                      {subscription.autopay_enabled &&
                        subscription.autopay_price_kopeks != null &&
                        subscription.autopay_price_kopeks > 0 &&
                        (() => {
                          const balance = purchaseOptions?.balance_kopeks ?? 0;
                          const deficit = Math.max(0, subscription.autopay_price_kopeks - balance);
                          return (
                            <div className="mt-1.5 space-y-0.5 text-xs">
                              <div className="text-dark-300">
                                {t('subscription.autopayCost', {
                                  amount: formatPrice(subscription.autopay_price_kopeks),
                                })}
                              </div>
                              {deficit > 0 ? (
                                <div
                                  className="font-medium"
                                  style={{ color: 'rgb(var(--color-warning-500))' }}
                                >
                                  {t('subscription.autopayDeficit', {
                                    amount: formatPrice(deficit),
                                  })}
                                </div>
                              ) : (
                                <div
                                  className="font-medium"
                                  style={{ color: 'rgb(var(--color-success-500))' }}
                                >
                                  {t('subscription.autopayBalanceOk')}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                    </div>
                    <button
                      onClick={() => autopayMutation.mutate(!subscription.autopay_enabled)}
                      disabled={autopayMutation.isPending}
                      role="switch"
                      aria-checked={subscription.autopay_enabled}
                      aria-label={t('subscription.autopay', 'Auto-payment')}
                      className="relative h-7 w-[52px] shrink-0 rounded-full transition-colors duration-300"
                      style={{
                        background: subscription.autopay_enabled ? zone.mainHex : g.textGhost,
                      }}
                    >
                      {/* translateX (compositor) instead of left (layout-thrash).
                        Resting position pinned at left:3px; on toggles a 23px
                        slide on the GPU. */}
                      <span
                        className="absolute left-[3px] top-[3px] h-[22px] w-[22px] rounded-full bg-white transition-transform duration-300"
                        style={{
                          transform: subscription.autopay_enabled
                            ? 'translateX(23px)'
                            : 'translateX(0)',
                          boxShadow: 'none',
                        }}
                      />
                    </button>
                  </div>
                )}
              </div>

              {/* ─── SBP Recurring Auto-payment ───
                   Sibling of the autopay toggle above, guarded ONLY by
                   is_trial + uiState — daily-tariff subscriptions must see
                   this block too (backend supports a day-interval charge). */}
              {!subscription.is_trial && sbpUiStateValue !== 'hidden' && (
                <div
                  className="rounded-[14px] p-3.5"
                  style={{
                    background: g.innerBg,
                    border: `1px solid ${g.innerBorder}`,
                  }}
                >
                  {/* Заголовок и статус слева, компактное действие справа —
                      зеркально соседнему тогглу «Автопродление». На мобиле
                      кнопка падает вниз на всю ширину (w-full sm:w-auto). */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="text-base font-semibold text-dark-50">
                        {t('subscription.sbpRecurring.title')}
                      </div>

                      {sbpUiStateValue === 'off' && (
                        <div className="mt-0.5 text-xs text-dark-50/30">
                          {t('subscription.sbpRecurring.autopayHint')}
                        </div>
                      )}
                      {sbpUiStateValue === 'pending' && (
                        <div className="mt-0.5 text-xs text-dark-50/30">
                          {t('subscription.sbpRecurring.statusPending')}
                        </div>
                      )}
                      {sbpUiStateValue === 'active' && sbpInfo && (
                        <>
                          <div className="mt-0.5 text-xs text-dark-50/30">
                            {t('subscription.sbpRecurring.amountPerInterval', {
                              amount: formatAmount((sbpInfo.amount_kopeks ?? 0) / 100),
                              interval: t(sbpIntervalLabelKey(sbpInfo.interval)),
                            })}
                          </div>
                          {sbpInfo.next_charge_at && (
                            <div className="mt-0.5 text-xs text-dark-50/30">
                              {t('subscription.sbpRecurring.nextCharge', {
                                date: new Date(sbpInfo.next_charge_at).toLocaleDateString(
                                  uiLocale(),
                                  {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                  },
                                ),
                              })}
                            </div>
                          )}
                        </>
                      )}
                      {sbpUiStateValue === 'past_due' && (
                        <div className="mt-0.5 text-xs font-medium text-warning-400">
                          {t('subscription.sbpRecurring.statusPastDue')}
                        </div>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                      {sbpUiStateValue === 'off' && (
                        <button
                          onClick={() => enableSbpMutation.mutate()}
                          disabled={enableSbpMutation.isPending}
                          className="btn-cta-md w-full whitespace-nowrap disabled:opacity-50 sm:w-auto"
                        >
                          {enableSbpMutation.isPending ? (
                            <span className="mx-auto block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          ) : (
                            t('subscription.sbpRecurring.connect')
                          )}
                        </button>
                      )}

                      {sbpUiStateValue === 'pending' && (
                        <>
                          {sbpInfo?.redirect_url && (
                            <button
                              onClick={() => {
                                if (sbpInfo.redirect_url) {
                                  openPaymentUrl(sbpInfo.redirect_url, platform, openLink);
                                }
                              }}
                              className="btn-cta-md w-full whitespace-nowrap sm:w-auto"
                            >
                              {t('subscription.sbpRecurring.confirmInBank')}
                            </button>
                          )}
                          <button
                            onClick={handleCancelSbp}
                            disabled={cancelSbpMutation.isPending}
                            className="text-xs font-medium transition-colors disabled:opacity-50 sm:text-right"
                            style={{ color: 'rgb(var(--color-critical-500))' }}
                          >
                            {t('subscription.sbpRecurring.cancel')}
                          </button>
                        </>
                      )}

                      {(sbpUiStateValue === 'active' || sbpUiStateValue === 'past_due') && (
                        <button
                          onClick={handleCancelSbp}
                          disabled={cancelSbpMutation.isPending}
                          className="w-full whitespace-nowrap rounded-xl border border-error-500/30 bg-error-500/10 px-5 py-2.5 text-sm font-medium text-error-400 transition-colors hover:bg-error-500/20 disabled:opacity-50 sm:w-auto"
                        >
                          {t('subscription.sbpRecurring.cancel')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()
      ) : (
        // ProxyKeys custom: empty-state на главной (/) — запуск триала (если
        // доступен) + явная кнопка покупки. У юзера всегда есть путь к витрине.
        <div className="space-y-3">
          {trialLoading ? (
            <div className="bento-card">
              <div className="skeleton mb-3 h-14 w-14 rounded-full" />
              <div className="skeleton mb-2 h-6 w-40" />
              <div className="skeleton h-4 w-full" />
            </div>
          ) : trialInfo?.is_available ? (
            <TrialOfferCard
              trialInfo={trialInfo}
              balanceKopeks={balanceData?.balance_kopeks ?? 0}
              balanceRubles={balanceData?.balance_rubles ?? 0}
              activateTrialMutation={activateTrialMutation}
              trialError={trialError}
            />
          ) : null}
          <Link
            to="/subscription/purchase"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent-500 p-3.5 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-600"
          >
            <span className="text-base">+</span>{' '}
            {t('subscriptions.browsePlans', 'Посмотреть тарифы и купить подписку')}
          </Link>
        </div>
      )}

      {/* Daily Subscription Pause */}
      {subscription && subscription.is_daily && !subscription.is_trial && (
        <div
          className="relative overflow-hidden rounded-3xl"
          style={{
            background: g.cardBg,
            border: `1px solid ${g.cardBorder}`,
            boxShadow: g.shadow,
            padding: '24px 28px',
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold tracking-tight text-dark-50">
                {t('subscription.pause.title')}
              </h2>
              <div className="mt-1 text-sm text-dark-300">
                {subscription.is_limited
                  ? t('subscription.trafficLimited')
                  : subscription.status === 'disabled'
                    ? t('subscription.pause.suspended')
                    : subscription.is_daily_paused
                      ? t('subscription.pause.paused')
                      : t('subscription.pause.active')}
              </div>
            </div>
            <button
              onClick={() => pauseMutation.mutate()}
              disabled={pauseMutation.isPending}
              className="rounded-[10px] px-4 py-2 text-sm font-semibold transition-colors duration-300"
              style={{
                background: 'transparent',
                border:
                  subscription.is_daily_paused || subscription.status === 'disabled'
                    ? '1px solid rgb(var(--color-accent-500))'
                    : '1px solid rgb(var(--color-warning-500))',
                color:
                  subscription.is_daily_paused || subscription.status === 'disabled'
                    ? 'rgb(var(--color-accent-500))'
                    : 'rgb(var(--color-warning-500))',
              }}
            >
              {pauseMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                </span>
              ) : subscription.is_daily_paused || subscription.status === 'disabled' ? (
                t('subscription.pause.resumeBtn')
              ) : (
                t('subscription.pause.pauseBtn')
              )}
            </button>
          </div>

          {/* Pause mutation error */}
          {pauseMutation.isError &&
            (() => {
              const balanceError = getInsufficientBalanceError(pauseMutation.error);
              if (balanceError) {
                const missingAmount = balanceError.required - balanceError.balance;
                return (
                  <div className="mt-4">
                    <InsufficientBalancePrompt
                      missingAmountKopeks={missingAmount}
                      message={t('subscription.pause.insufficientBalance')}
                      compact
                    />
                  </div>
                );
              }
              return (
                <div
                  className="mt-4 rounded-[10px] border border-gray-200 bg-transparent p-3 text-center text-sm dark:border-gray-800"
                  style={{
                    color: 'rgb(var(--color-error-500))',
                  }}
                >
                  {getErrorMessage(pauseMutation.error)}
                </div>
              );
            })()}

          {/* Paused info or Next charge progress bar */}
          {subscription.is_daily_paused ? (
            <div className="mt-4 rounded-[12px] border border-gray-200 bg-transparent p-4 dark:border-gray-800">
              <div className="flex items-start gap-3">
                <PauseIcon
                  className="h-5 w-5 shrink-0"
                  style={{ color: 'rgb(var(--color-warning-500))' }}
                />
                <div>
                  <div
                    className="text-sm font-semibold"
                    style={{ color: 'rgb(var(--color-warning-500))' }}
                  >
                    {t('subscription.pause.pausedInfo')}
                  </div>
                  <div className="mt-1 text-sm text-dark-300">
                    {t('subscription.pause.pausedDescription')}{' '}
                    {new Date(subscription.end_date).toLocaleDateString(uiLocale())} (
                    {t('subscription.pause.days', { count: subscription.days_left })})
                  </div>
                </div>
              </div>
            </div>
          ) : (
            subscription.next_daily_charge_at &&
            (() => {
              const now = new Date();
              const nextChargeStr = subscription.next_daily_charge_at.endsWith('Z')
                ? subscription.next_daily_charge_at
                : subscription.next_daily_charge_at + 'Z';
              const nextCharge = new Date(nextChargeStr);
              const totalMs = 24 * 60 * 60 * 1000;
              const remainingMs = Math.max(0, nextCharge.getTime() - now.getTime());
              const elapsedMs = totalMs - remainingMs;
              const progress = Math.min(100, (elapsedMs / totalMs) * 100);

              const hours = Math.floor(remainingMs / (1000 * 60 * 60));
              const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

              return (
                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wider text-dark-300">
                      {t('subscription.pause.nextCharge')}
                    </span>
                    <span className="font-mono text-sm font-semibold text-dark-50">
                      {hours > 0
                        ? `${hours}${t('subscription.pause.hours')} ${minutes}${t('subscription.pause.minutes')}`
                        : `${minutes}${t('subscription.pause.minutes')}`}
                    </span>
                  </div>
                  <div
                    className="relative h-2 overflow-hidden rounded-full"
                    style={{ background: g.trackBg }}
                  >
                    <div
                      className="absolute inset-0 origin-left rounded-full transition-transform duration-500"
                      style={{
                        transform: `scaleX(${progress / 100})`,
                        background:
                          'linear-gradient(90deg, rgb(var(--color-accent-500)), rgb(var(--color-accent-500)))',
                      }}
                    />
                  </div>
                  {subscription.daily_price_kopeks && (
                    <div className="mt-2 text-center text-sm text-dark-300">
                      {t('subscription.pause.willBeCharged')}:{' '}
                      {formatPrice(subscription.daily_price_kopeks)}
                    </div>
                  )}
                </div>
              );
            })()
          )}
        </div>
      )}

      {/* Purchase / Renewal CTA */}
      <PurchaseCTAButton subscription={subscription} isMultiTariff={isMultiTariff} />

      {/* Delete expired subscription */}
      {isMultiTariff &&
        subscription &&
        !subscription.is_active &&
        !subscription.is_trial &&
        !subscription.is_limited && (
          <div className="space-y-3">
            <DeleteSubscriptionSheet
              subscriptionId={subscription.id}
              open={showDeleteSheet}
              onOpen={() => setShowDeleteSheet(true)}
              onClose={() => setShowDeleteSheet(false)}
              textSecondary={g.textSecondary}
              onDeleted={() => {
                queryClient.invalidateQueries({ queryKey: ['subscriptions-list'] });
                navigate('/subscriptions', { replace: true });
              }}
            />
          </div>
        )}

      {/* Device Manager + Reissue Subscription (2 cols on lg) */}
      {subscription &&
        (subscription.is_active || subscription.is_limited) &&
        !subscription.is_trial && (
          <>
            <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
              {/* Unified Device Manager (buy + reduce) */}
              {subscription.device_limit !== 0 && (
                <DeviceManagerSheet
                  open={showDeviceManager}
                  onOpen={() => setShowDeviceManager(true)}
                  onClose={() => setShowDeviceManager(false)}
                  subscription={subscription}
                  subscriptionId={subscriptionId}
                  purchaseOptions={purchaseOptions}
                />
              )}

              {/* Reissue Subscription */}
              <button
                onClick={handleRevoke}
                disabled={revokeMutation.isPending || revokeCooldown > 0}
                className="w-full rounded-xl border border-gray-200/50 bg-gray-250 p-4 text-left transition-colors hover:border-gray-300 disabled:opacity-50 dark:border-gray-800/50 dark:bg-gray-850 dark:hover:border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="text-base font-medium text-dark-100">
                      {t('subscription.revoke.button')}
                    </div>
                    <div className="mt-1 text-sm text-dark-300">
                      {revokeCooldown > 0
                        ? t('subscription.revoke.cooldown', {
                            minutes: Math.floor(revokeCooldown / 60),
                            seconds: revokeCooldown % 60,
                          })
                        : t('subscription.revoke.description')}
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-warning-500">
                    {revokeMutation.isPending ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-warning-500 border-t-transparent" />
                    ) : (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              </button>
              {revokeMutation.error && (
                <p className="text-sm text-error-500">{getErrorMessage(revokeMutation.error)}</p>
              )}
            </div>

            {/* Server Management - only in classic mode */}
            {!isTariffsMode && (
              <div
                className="relative overflow-hidden rounded-3xl"
                style={{
                  background: g.cardBg,
                  border: `1px solid ${g.cardBorder}`,
                  boxShadow: g.shadow,
                  padding: '24px 28px',
                }}
              >
                <h2 className="mb-4 text-base font-bold tracking-tight text-dark-50">
                  {t('subscription.additionalOptions.title')}
                </h2>
                <ServerManagementSheet
                  open={showServerManagement}
                  onOpen={() => setShowServerManagement(true)}
                  onClose={() => setShowServerManagement(false)}
                  subscription={subscription}
                  subscriptionId={subscriptionId}
                  selectedServers={selectedServersToUpdate}
                  onSelectedServersChange={setSelectedServersToUpdate}
                  purchaseOptions={purchaseOptions}
                />
              </div>
            )}
          </>
        )}

      {/* My Devices Section */}
      {subscription && (
        <div
          className="relative overflow-hidden rounded-3xl"
          style={{
            background: g.cardBg,
            border: `1px solid ${g.cardBorder}`,
            boxShadow: g.shadow,
            padding: '24px 28px',
          }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold tracking-tight text-dark-50">
              {t('subscription.myDevices')}
            </h2>
            {devicesData && devicesData.devices.length > 0 && (
              <button
                onClick={async () => {
                  // Platform-aware destructive confirm: Telegram native popup
                  // in Mini App, inline panel on web. Replaces the bare
                  // browser confirm() which broke premium frame + lost
                  // haptic / theming inside Telegram.
                  const confirmed = await destructiveConfirm(
                    t('subscription.confirmDeleteAllDevices'),
                    t('subscription.deleteAllDevices'),
                    t('subscription.deleteAllDevices'),
                  );
                  if (confirmed) deleteAllDevicesMutation.mutate();
                }}
                disabled={deleteAllDevicesMutation.isPending}
                className="text-xs font-medium transition-colors"
                style={{ color: 'rgb(var(--color-error-500))' }}
              >
                {t('subscription.deleteAllDevices')}
              </button>
            )}
          </div>

          {devicesLoading ? (
            <SkeletonGroup className="space-y-3">
              <Skeleton variant="card" count={3} className="h-16" />
            </SkeletonGroup>
          ) : devicesData && devicesData.devices.length > 0 ? (
            <div className="space-y-2">
              <div className="mb-2 font-mono text-sm text-dark-300">
                {devicesData.device_limit === 0
                  ? `${devicesData.total} · ∞`
                  : `${devicesData.total} / ${t('subscription.devices', { count: devicesData.device_limit })}`}
              </div>
              {devicesData.devices.map((device) => {
                const isEditing = editingDeviceHwid === device.hwid;
                // Display priority: user alias → device model → platform.
                const displayName =
                  (device.local_name && device.local_name.trim()) ||
                  device.device_model ||
                  device.platform;

                return (
                  <div
                    key={device.hwid}
                    className="flex items-center justify-between rounded-[12px] border border-gray-200 bg-transparent p-3.5 dark:border-gray-800"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <svg
                        className="h-9 w-9 flex-shrink-0"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={g.textSecondary}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                      </svg>
                      <div className="min-w-0 flex-1">
                        {isEditing ? (
                          <input
                            type="text"
                            autoFocus
                            value={editingDeviceName}
                            maxLength={DEVICE_ALIAS_MAX_LENGTH}
                            placeholder={device.device_model || device.platform}
                            onChange={(e) => setEditingDeviceName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const trimmed = editingDeviceName.trim();
                                renameDeviceMutation.mutate({
                                  hwid: device.hwid,
                                  name: trimmed || null,
                                });
                              } else if (e.key === 'Escape') {
                                e.preventDefault();
                                setEditingDeviceHwid(null);
                                setEditingDeviceName('');
                              }
                            }}
                            className="w-full rounded-md border-none bg-transparent px-2 py-1 text-sm font-semibold text-dark-50 outline-none focus:ring-1"
                            style={{
                              background: g.trackBg,
                              boxShadow: `inset 0 0 0 1px ${g.innerBorder}`,
                            }}
                          />
                        ) : (
                          <div className="truncate text-sm font-semibold text-dark-50">
                            {displayName}
                          </div>
                        )}
                        <div className="mt-0.5 flex items-center gap-1.5 text-sm text-dark-300">
                          <span className="truncate">{device.platform}</span>
                          <span className="font-mono text-dark-300">
                            {device.hwid.slice(0, 8).toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-1">
                      {isEditing ? (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              const trimmed = editingDeviceName.trim();
                              renameDeviceMutation.mutate({
                                hwid: device.hwid,
                                name: trimmed || null,
                              });
                            }}
                            disabled={renameDeviceMutation.isPending}
                            className="p-2 transition-colors"
                            style={{ color: g.textSecondary }}
                            title={t('subscription.renameDeviceSave', 'Сохранить')}
                            aria-label={t('subscription.renameDeviceSave', 'Сохранить')}
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <path d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingDeviceHwid(null);
                              setEditingDeviceName('');
                            }}
                            disabled={renameDeviceMutation.isPending}
                            className="p-2 transition-colors"
                            style={{ color: g.textFaint }}
                            title={t('subscription.renameDeviceCancel', 'Отмена')}
                            aria-label={t('subscription.renameDeviceCancel', 'Отмена')}
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <path d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingDeviceHwid(device.hwid);
                              setEditingDeviceName(device.local_name || '');
                            }}
                            className="p-2 transition-colors"
                            style={{ color: g.textFaint }}
                            title={t('subscription.renameDevice', 'Переименовать')}
                            aria-label={t('subscription.renameDevice', 'Переименовать')}
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              const confirmed = await destructiveConfirm(
                                t('subscription.confirmDeleteDevice'),
                                t('subscription.deleteDevice'),
                                t('subscription.deleteDevice'),
                              );
                              if (confirmed) deleteDeviceMutation.mutate(device.hwid);
                            }}
                            disabled={deleteDeviceMutation.isPending}
                            className="p-2 transition-colors"
                            style={{ color: g.textFaint }}
                            title={t('subscription.deleteDevice')}
                            aria-label={t('subscription.deleteDevice')}
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <path d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-dark-300">
              {t('subscription.noDevices')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
