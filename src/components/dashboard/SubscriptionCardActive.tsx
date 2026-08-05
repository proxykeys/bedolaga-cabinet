import { uiLocale } from '@/utils/uiLocale';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import ConnectDeviceTile from './ConnectDeviceTile'; 5295fd67 (feat(custom): remove traffic/servers/unlimited UI — безлимитная модель)
import { useTheme } from '../../hooks/useTheme';
import { useTrafficZone } from '../../hooks/useTrafficZone';
import { getGlassColors } from '../../utils/glassTheme';
import { CalendarIcon } from '@/components/icons';
import { useHaptic } from '../../platform';
import type { Subscription } from '../../types';

interface SubscriptionCardActiveProps {
  subscription: Subscription;
  connectedDevices: number;
}

export default function SubscriptionCardActive({
  subscription,
  connectedDevices,
}: SubscriptionCardActiveProps) {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const g = getGlassColors(isDark);

  // All tariffs are unlimited → usedPercent is always 0 (green zone).
  // zone is kept only to drive accent colors on device indicators.
  const usedPercent = 0;
  const zone = useTrafficZone(usedPercent);
  const haptic = useHaptic();

  const isAtDeviceLimit =
    subscription.device_limit > 0 && connectedDevices >= subscription.device_limit;

  const formattedDate = new Date(subscription.end_date).toLocaleDateString(uiLocale());
  const daysLeft = subscription.days_left;

  return (
    <div
      className="relative overflow-hidden rounded-3xl lg:backdrop-blur-xl"
      style={{
        background: g.cardBg,
        border: `1px solid ${g.cardBorder}`,
        padding: '28px 28px 24px',
        boxShadow: g.shadow,
      }}
    >
      {/* ─── Header ─── */}
      <div className="mb-7 flex items-start justify-between">
        <div>
          {/* Trial badge */}
          {subscription.is_trial && (
            <div className="mb-2 flex items-center gap-2">
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
            </div>
          )}

          {/* Title */}
          <h2 className="text-lg font-bold tracking-tight text-dark-50">
            {subscription.tariff_name || t('subscription.currentPlan')}
          </h2>
        </div>
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

      {/* ─── View Subscription link ─── */}
      <div className="flex items-center justify-end px-0.5">
        <Link
          to={`/subscriptions/${subscription.id}`}
          className="text-xs font-medium text-dark-300 transition-colors hover:text-dark-100"
        >
          {t('dashboard.viewSubscription')} &rarr;
        </Link>
      </div>
    </div>
  );
}
