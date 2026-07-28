import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import type { UseMutationResult } from '@tanstack/react-query';
import type { TrialInfo } from '../../types';
import { useCurrency } from '../../hooks/useCurrency';
import { useTheme } from '../../hooks/useTheme';
import { getGlassColors } from '../../utils/glassTheme';
import { BoltIcon, SparklesIcon } from '@/components/icons';

interface TrialOfferCardProps {
  trialInfo: TrialInfo;
  balanceKopeks: number;
  balanceRubles: number;
  activateTrialMutation: UseMutationResult<unknown, unknown, void, unknown>;
  trialError: string | null;
}

export default function TrialOfferCard({
  trialInfo,
  balanceKopeks,
  balanceRubles,
  activateTrialMutation,
  trialError,
}: TrialOfferCardProps) {
  const { t } = useTranslation();
  const { formatAmount, currencySymbol } = useCurrency();
  const { isDark } = useTheme();
  const g = getGlassColors(isDark);
  const isFree = !trialInfo.requires_payment;
  const canAfford = balanceKopeks >= trialInfo.price_kopeks;

  return (
    <div
      className="relative overflow-hidden rounded-3xl text-center"
      style={{
        background: g.cardBg,
        border: `1px solid ${g.cardBorder}`,
        padding: '32px 28px 28px',
      }}
    >
      {/* Decorative glow background and grid pattern removed per claude.com flat aesthetic */}

      {/* Icon */}
      <div className="relative mx-auto mb-5 flex h-14 w-14 items-center justify-center">
        {isFree ? (
          <span
            className="flex"
            style={{ color: 'rgb(var(--color-accent-500))' }}
            aria-hidden="true"
          >
            <SparklesIcon className="h-14 w-14" />
          </span>
        ) : (
          <span
            className="flex"
            style={{ color: 'rgb(var(--color-warning-500))' }}
            aria-hidden="true"
          >
            <BoltIcon className="h-14 w-14" />
          </span>
        )}
        {/* Glow effect removed per claude.com flat aesthetic */}
      </div>

      {/* Title */}
      <h2 className="mb-1.5 text-[22px] font-bold tracking-tight text-dark-50">
        {isFree ? t('dashboard.trialOffer.freeTitle') : t('dashboard.trialOffer.paidTitle')}
      </h2>
      <p className="mb-5 text-sm text-dark-200">
        {isFree ? t('dashboard.trialOffer.freeDesc') : t('dashboard.trialOffer.paidDesc')}
      </p>

      {/* Price tag for paid trial */}
      {!isFree && trialInfo.price_rubles > 0 && (
        <div className="mb-5 inline-flex items-baseline gap-1 rounded-xl border border-gray-200 bg-transparent px-5 py-2 dark:border-gray-800">
          <span className="text-[32px] font-extrabold leading-none tracking-tight text-warning-500">
            {trialInfo.price_rubles.toFixed(0)}
          </span>
          <span className="text-base font-semibold text-warning-500 opacity-70">
            {currencySymbol}
          </span>
        </div>
      )}

      {/* Trial stats */}
      <div className="mb-7 flex justify-center gap-8">
        {[
          { value: String(trialInfo.duration_days), label: t('subscription.trial.days') },
          {
            value: trialInfo.traffic_limit_gb === 0 ? '∞' : String(trialInfo.traffic_limit_gb),
            label: t('common.units.gb'),
          },
          {
            value: trialInfo.device_limit === 0 ? '∞' : String(trialInfo.device_limit),
            label: t('subscription.trial.devices'),
          },
        ].map((stat, i) => (
          <div key={i} className="text-center">
            <div className="text-4xl font-extrabold leading-none tracking-tight text-dark-50">
              {stat.value}
            </div>
            <div className="mt-1 text-xs font-medium text-dark-300">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Balance info for paid trial */}
      {!isFree && trialInfo.price_rubles > 0 && (
        <div className="mb-4 space-y-2 rounded-xl border border-gray-200 bg-transparent p-4 text-left dark:border-gray-800">
          <div className="flex items-center justify-between">
            <span className="text-sm text-dark-300">{t('balance.currentBalance')}</span>
            <span
              className={`font-display text-sm font-semibold ${canAfford ? 'text-success-500' : 'text-warning-500'}`}
            >
              {formatAmount(balanceRubles)} {currencySymbol}
            </span>
          </div>
          {!canAfford && (
            <div className="text-xs text-warning-500">
              {t('subscription.trial.insufficientBalance')}
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {trialError && (
        <div className="mb-4 rounded-xl border border-gray-200/40 bg-gray-250 p-3 text-center text-sm text-error-500 dark:border-gray-800/40 dark:bg-gray-850">
          {trialError}
        </div>
      )}

      {/* CTA Button — monochrome per claude.com aesthetic
          (was: bg-warning/accent-500 + on-*; now: .btn-primary-lg pattern). */}
      {!isFree && trialInfo.price_kopeks > 0 ? (
        canAfford ? (
          <button
            onClick={() => !activateTrialMutation.isPending && activateTrialMutation.mutate()}
            disabled={activateTrialMutation.isPending}
            className="btn-primary-lg w-full py-4 text-base disabled:opacity-50"
          >
            {activateTrialMutation.isPending
              ? t('common.loading')
              : t('subscription.trial.payAndActivate')}
          </button>
        ) : (
          <Link to="/balance" className="btn-primary-lg block w-full py-4 text-base">
            {t('subscription.trial.topUpToActivate')}
          </Link>
        )
      ) : (
        <button
          onClick={() => !activateTrialMutation.isPending && activateTrialMutation.mutate()}
          disabled={activateTrialMutation.isPending}
          className="btn-primary-lg w-full py-4 text-base disabled:opacity-50"
        >
          {activateTrialMutation.isPending ? t('common.loading') : t('subscription.trial.activate')}
        </button>
      )}
    </div>
  );
}
