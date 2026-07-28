import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ChevronRightIcon, SubscriptionIcon } from '@/components/icons';
import type { Subscription } from '../../types';

interface PurchaseCTAButtonProps {
  subscription: Subscription | null;
  /** In multi-tariff mode, link to /subscriptions/:id/renew instead of /subscription/purchase */
  isMultiTariff?: boolean;
}

export default function PurchaseCTAButton({
  subscription,
  isMultiTariff = false,
}: PurchaseCTAButtonProps) {
  const { t } = useTranslation();

  const isExpired =
    !subscription ||
    (!subscription.is_active && !subscription.is_trial && !subscription.is_limited);
  const isTrial = subscription?.is_trial;
  const isDaily = subscription?.is_daily;

  // Daily tariffs renew automatically — no manual renewal button needed in multi-tariff
  if (isMultiTariff && isDaily && !isExpired) return null;

  const accentColor = isExpired ? 'rgb(var(--color-error-500))' : 'rgb(var(--color-accent-500))';

  const buttonText = isExpired
    ? t('subscription.getSubscription')
    : isTrial
      ? t('subscription.trialUpgrade.title')
      : t('subscription.extend');

  const hintText = isExpired
    ? t('subscription.cta.expiredHint')
    : isTrial
      ? t('subscription.cta.trialHint')
      : isMultiTariff
        ? t('subscription.cta.renewHint', 'Продление подписки')
        : t('subscription.cta.activeHint');

  // Trial → purchase page (buy a real tariff, trial can't be renewed)
  // Multi-tariff active → per-subscription renew page
  // Otherwise → purchase page
  const linkTo = isTrial
    ? '/subscription/purchase'
    : isMultiTariff && subscription?.id
      ? `/subscriptions/${subscription.id}/renew`
      : '/subscription/purchase';

  return (
    <Link to={linkTo} className="block">
      <div className="group relative w-full cursor-pointer overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
        <div className="relative flex items-center justify-between rounded-[14px] px-5 py-4 transition-colors duration-300">
          {/* Left: icon + text */}
          <div className="flex items-center gap-3">
            {/* Sparkle icon */}
            <span
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center"
              style={{ color: accentColor }}
            >
              <SubscriptionIcon className="h-10 w-10" />
            </span>
            <div>
              <div className="text-[15px] font-semibold text-dark-50">{buttonText}</div>
              <div className="text-sm text-dark-300">{hintText}</div>
            </div>
          </div>

          {/* Right: chevron */}
          <ChevronRightIcon className="h-5 w-5 flex-shrink-0 text-dark-300 transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}
