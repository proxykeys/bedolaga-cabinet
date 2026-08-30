import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks/useTheme';
import { getGlassColors } from '../../utils/glassTheme';
import { useHaptic } from '../../platform';
import { CalendarIcon, CheckIcon, ChevronRightIcon, DevicesIcon } from '@/components/icons';
import type { SubscriptionListItem } from '../../types';
import { connectFooterState } from './connectFooterState';
import { SubscriptionConnectFooter } from './SubscriptionConnectFooter';

function formatDate(iso: string | null, locale?: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(locale ?? undefined, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

function StatusBadge({
  status,
  isTrial,
  t,
}: {
  status: string;
  isTrial: boolean;
  t: (key: string, fallback: string) => string;
}) {
  const isActive = status === 'active' || status === 'trial';
  const isLimited = status === 'limited';
  const isExpired = status === 'expired' || status === 'disabled';

  if (isTrial) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-warning-500 px-2 py-0.5 text-xs font-semibold text-black">
        <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
        {t('subscription.statusTrial', 'Тестовая')}
      </span>
    );
  }

  const color = isActive
    ? 'bg-success-500 text-black'
    : isLimited
      ? 'bg-warning-500 text-black'
      : 'bg-error-500 text-black';

  const label = isActive
    ? t('subscription.statusActive', 'Активна')
    : isLimited
      ? t('subscription.statusLimited', 'Ограничена')
      : isExpired
        ? t('subscription.statusExpired', 'Истекла')
        : status;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${color}`}
    >
      {label}
    </span>
  );
}

export default function SubscriptionListCard({
  subscription,
  onClick,
  connect,
}: {
  subscription: SubscriptionListItem;
  onClick: () => void;
  /**
   * Подключение устройства прямо из карточки. Задаётся только на главной:
   * список «Все подписки» остаётся простым перечнем без действий.
   */
  connect?: {
    /** `undefined`, пока число устройств не загрузилось. */
    connectedDevices: number | undefined;
    onConnect: () => void;
    onManage: () => void;
  };
}) {
  const { t, i18n } = useTranslation();
  const { isDark } = useTheme();
  const g = getGlassColors(isDark);
  const { impact } = useHaptic();

  const handleClick = () => {
    impact('light');
    onClick();
  };

  const isTrial = subscription.is_trial;

  const borderColor = g.cardBorder;

  const bgColor = g.cardBg;

  const footer = connect
    ? connectFooterState({
        status: subscription.status,
        subscriptionUrl: subscription.subscription_url,
        deviceLimit: subscription.device_limit,
        connected: connect.connectedDevices,
      })
    : { kind: 'hidden' as const };

  // Подвал — своя зона нажатия, поэтому карточка снаружи не `<button>`:
  // вложенные кнопки невалидны и ведут себя в браузерах непредсказуемо.
  return (
    <div
      className="overflow-hidden rounded-2xl border transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
      style={{ background: bgColor, borderColor }}
    >
      <button onClick={handleClick} className="w-full p-4 text-left">
        {/* Header: tariff name + status badge + chevron */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate text-base font-semibold" style={{ color: g.text }}>
              {subscription.tariff_name || t('subscription.defaultName', 'Подписка')}
            </span>
            <StatusBadge status={subscription.status} isTrial={isTrial} t={t} />
          </div>
          <ChevronRightIcon className="h-4 w-4 shrink-0 opacity-30" />
        </div>

        {/* Stats row */}
        <div
          className="mt-2.5 flex items-center gap-4 text-[12px]"
          style={{ color: g.textSecondary }}
        >
          {footer.kind === 'hidden' && (
            <span className="flex items-center gap-1">
              <DevicesIcon className="h-3.5 w-3.5 opacity-50" />
              {subscription.device_limit}
            </span>
          )}
          <span className="flex items-center gap-1">
            <CalendarIcon className="h-3.5 w-3.5 opacity-50" />
            {formatDate(subscription.end_date, i18n.language)}
          </span>
          {!isTrial &&
            (() => {
              const isDaily = subscription.is_daily;
              const enabled = isDaily
                ? !subscription.is_daily_paused
                : subscription.autopay_enabled;
              const label = isDaily
                ? t('subscription.dailyAutoCharge', 'Автосписание')
                : t('subscription.autopay', 'Автопродление');
              return (
                <span
                  className={`flex items-center gap-1 ${enabled ? 'text-success-400/70' : 'text-error-400/50'}`}
                >
                  {enabled ? (
                    <CheckIcon className="h-3 w-3" />
                  ) : (
                    <svg
                      className="h-3 w-3"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  {label}
                </span>
              );
            })()}
        </div>
      </button>

      <SubscriptionConnectFooter
        state={footer}
        borderColor={borderColor}
        mutedColor={g.textSecondary}
        onConnect={() => connect?.onConnect()}
        onManage={() => connect?.onManage()}
      />
    </div>
  );
}
