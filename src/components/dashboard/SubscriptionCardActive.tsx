import { uiLocale } from '@/utils/uiLocale';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import type { UseMutationResult } from '@tanstack/react-query';
import TrafficProgressBar from './TrafficProgressBar';
import Sparkline from './Sparkline';
import ConnectDeviceTile from './ConnectDeviceTile';
import { useAnimatedNumber } from '../../hooks/useAnimatedNumber';
import { useTheme } from '../../hooks/useTheme';
import { useTrafficZone } from '../../hooks/useTrafficZone';
import { formatTraffic } from '../../utils/formatTraffic';
import { getGlassColors } from '../../utils/glassTheme';
import { CalendarIcon, RefreshIcon } from '@/components/icons';
import type { Subscription } from '../../types';

interface SubscriptionCardActiveProps {
  subscription: Subscription;
  trafficData: {
    traffic_used_gb: number;
    traffic_used_percent: number;
    is_unlimited: boolean;
  } | null;
  refreshTrafficMutation: UseMutationResult<unknown, unknown, void, unknown>;
  trafficRefreshCooldown: number;
  connectedDevices: number;
}

export default function SubscriptionCardActive({
  subscription,
  trafficData,
  refreshTrafficMutation,
  trafficRefreshCooldown,
  connectedDevices,
}: SubscriptionCardActiveProps) {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const g = getGlassColors(isDark);

  const usedPercent = trafficData?.traffic_used_percent ?? subscription.traffic_used_percent;
  const usedGb = trafficData?.traffic_used_gb ?? subscription.traffic_used_gb;
  const isUnlimited = trafficData?.is_unlimited ?? subscription.traffic_limit_gb === 0;
  const zone = useTrafficZone(usedPercent);
  const animatedPercent = useAnimatedNumber(usedPercent);

  const formattedDate = new Date(subscription.end_date).toLocaleDateString(uiLocale());
  const daysLeft = subscription.days_left;

  // Sparkline placeholder data (hidden until API provides daily usage)
  const dailyUsage: number[] = [];

  return (
    <div
      className="relative overflow-hidden rounded-3xl lg:backdrop-blur-xl"
      style={{
        background: g.cardBg,
        border: `1px solid ${g.cardBorder}`,
        padding: '28px 28px 24px',
        boxShadow: 'none',
      }}
    >
      {/* Decorative trial-shimmer border + ambient background glow removed.
          Trial state is conveyed by the badge in the header; ambient glow
          carried no information and ate visual attention. */}

      {/* ─── Header ─── */}
      <div className="mb-7 flex items-start justify-between">
        <div>
          {/* Zone indicator */}
          <div className="mb-1 flex items-center gap-2">
            <div
              className="h-2 w-2 rounded-full"
              style={{
                background: zone.mainVar,
                transition: 'background 0.6s ease',
              }}
              aria-hidden="true"
            />
            <span
              className="font-mono text-[11px] font-semibold uppercase tracking-widest"
              style={{ color: zone.mainVar, transition: 'color 0.6s ease' }}
            >
              {isUnlimited ? t('dashboard.unlimited') : t(zone.labelKey)}
            </span>
            {subscription.is_trial && (
              <span className="inline-flex items-center gap-1 rounded-md bg-accent-500 px-2 py-0.5 font-mono text-xs font-bold uppercase tracking-widest text-black">
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path
                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {t('subscription.trialStatus')}
              </span>
            )}
          </div>

          {/* Title */}
          <h2 className="text-lg font-bold tracking-tight text-dark-50">
            {t('dashboard.trafficUsageTitle')}
          </h2>
        </div>

        {/* Big percentage / infinity */}
        <div className="text-right">
          {isUnlimited ? (
            <>
              <div
                className="font-display text-[28px] font-extrabold leading-none tracking-tight"
                style={{ color: zone.mainVar }}
              >
                &#8734;
              </div>
              <div className="mt-1 font-mono text-xs text-dark-50/70">
                {formatTraffic(usedGb)} {t('dashboard.usedSuffix')}
              </div>
            </>
          ) : (
            <>
              <div className="font-display text-[38px] font-extrabold leading-none tracking-tight text-dark-50">
                {animatedPercent.toFixed(0)}
                <span className="ml-px text-lg font-medium text-dark-50/70">%</span>
              </div>
              <div className="mt-0.5 font-mono text-xs text-dark-50/70">
                {formatTraffic(usedGb)} / {formatTraffic(subscription.traffic_limit_gb)}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ─── Progress Bar ─── */}
      <div className="mb-6">
        <TrafficProgressBar
          usedGb={usedGb}
          limitGb={subscription.traffic_limit_gb}
          percent={usedPercent}
          isUnlimited={isUnlimited}
        />
      </div>

      {/* ─── Connect Device Button ─── */}
      <ConnectDeviceTile
        subscription={subscription}
        connectedDevices={connectedDevices}
        usedPercent={usedPercent}
      />

      {/* ─── Stats row: Tariff + Days Left ─── */}
      <div className="mb-5 flex gap-2.5">
        {/* Tariff badge — clickable. Neutral chrome: the tariff name has
            no traffic-zone semantics, so tinting it by the traffic zone
            (DESIGN.md Status-Hue Lockout) was wrong. */}
        <Link
          to={`/subscriptions/${subscription.id}`}
          className="flex-1 rounded-[14px] border border-gray-200 bg-gray-250 p-3.5 transition-colors duration-200 hover:border-gray-300 hover:bg-gray-300 dark:border-gray-800 dark:bg-gray-850 dark:hover:border-gray-700 dark:hover:bg-gray-800"
        >
          <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-dark-300">
            {t('dashboard.tariff')}
          </div>
          <div className="min-w-0 truncate text-base font-bold leading-tight tracking-tight text-dark-50">
            {subscription.tariff_name || t('subscription.currentPlan')}
          </div>
          <div className="mt-0.5 font-mono text-xs text-dark-50/70">
            {t('dashboard.validUntil', { date: formattedDate })}
          </div>
        </Link>

        {/* Days remaining */}
        <div className="flex-1 rounded-[14px] border border-gray-200 bg-transparent p-3.5 dark:border-gray-800">
          <div className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-dark-300">
            <span
              className="flex h-6 w-6 items-center justify-center transition-colors duration-300"
              style={{
                color: daysLeft <= 3 ? 'rgb(var(--color-warning-500))' : g.textSecondary,
              }}
              aria-hidden="true"
            >
              <CalendarIcon className="h-6 w-6" />
            </span>
            {t('dashboard.remaining')}
          </div>
          <div className="flex items-baseline gap-1">
            <span
              className="text-[22px] font-bold tracking-tight transition-colors duration-300"
              style={{ color: daysLeft <= 3 ? 'rgb(var(--color-warning-500))' : g.text }}
            >
              {daysLeft}
            </span>
            <span className="text-xs font-medium text-dark-50/70">
              {t('subscription.daysShort')}
            </span>
          </div>
        </div>
      </div>

      {/* ─── Traffic Refresh ─── */}
      <div className="mb-5 flex items-center justify-between px-0.5">
        <button
          onClick={() => refreshTrafficMutation.mutate()}
          disabled={refreshTrafficMutation.isPending || trafficRefreshCooldown > 0}
          className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-dark-300 transition-colors hover:bg-gray-300/50 hover:text-dark-100 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-800"
          aria-label={t('common.refresh')}
        >
          <RefreshIcon
            className={`h-3 w-3 ${refreshTrafficMutation.isPending ? 'animate-spin' : ''}`}
          />
          {trafficRefreshCooldown > 0 ? `${trafficRefreshCooldown}s` : t('common.refresh')}
        </button>
        <Link
          to={`/subscriptions/${subscription.id}`}
          className="text-xs font-medium text-dark-300 transition-colors hover:text-dark-100"
        >
          {t('dashboard.viewSubscription')} &rarr;
        </Link>
      </div>

      {/* ─── Sparkline ─── */}
      {dailyUsage.length >= 2 && (
        <div className="rounded-[14px] border border-gray-200 bg-transparent p-3.5 pb-3 dark:border-gray-800">
          <div className="mb-2.5 flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-dark-300">
              {t('dashboard.usageLast14Days')}
            </span>
            <span className="font-mono text-xs text-dark-300">
              {t('dashboard.maxUsage', { amount: formatTraffic(Math.max(...dailyUsage)) })}
            </span>
          </div>
          <Sparkline data={dailyUsage} width={440} height={44} color={zone.mainVar} />
        </div>
      )}
    </div>
  );
}
