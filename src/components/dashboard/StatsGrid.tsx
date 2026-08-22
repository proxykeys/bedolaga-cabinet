import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { useCurrency } from '../../hooks/useCurrency';
import { StatCard } from '@/components/stats';
import { CardIcon, ChevronRightIcon, SubscriptionIcon, UsersIcon } from '@/components/icons';

interface StatsGridProps {
  balanceRubles: number;
  referralCount: number;
  earningsRubles: number;
  refLoading: boolean;
  /** ProxyKeys custom: скрыть карточку рефералов (balance сохраняет позицию в grid-cols-2) */
  showReferrals?: boolean;
  /** ProxyKeys custom: кнопка «Купить подписку» в ячейке рефералов.
   *  Только когда подписки нет (empty-state); при активной/триал/истёкшей
   *  CTA уже рендерит PurchaseCTAButton — дубль не нужен. */
  showBuyCta?: boolean;
}

export default function StatsGrid({
  balanceRubles,
  referralCount,
  earningsRubles,
  refLoading,
  showReferrals = true,
  showBuyCta = false,
}: StatsGridProps) {
  const { t } = useTranslation();
  const { formatAmount, currencySymbol } = useCurrency();

  const chevron = <ChevronRightIcon className="h-4 w-4 shrink-0 text-dark-300" />;

  return (
    <div className="grid grid-cols-2 gap-2.5">
      <Link to="/balance" className="block h-full">
        <StatCard
          label={t('dashboard.stats.balance')}
          value={`${formatAmount(balanceRubles)} ${currencySymbol}`}
          icon={<CardIcon className="h-5 w-5" />}
          tone="accent"
          trailing={chevron}
        />
      </Link>
      {showReferrals ? (
        <Link to="/referral" className="block h-full">
          <StatCard
            label={t('dashboard.stats.referrals')}
            value={`${referralCount}`}
            subValue={`+${formatAmount(earningsRubles)} ${currencySymbol}`}
            icon={<UsersIcon className="h-5 w-5" />}
            tone="neutral"
            loading={refLoading}
            trailing={chevron}
          />
        </Link>
      ) : showBuyCta ? (
        /* ProxyKeys custom: кнопка покупки на месте скрытой карточки рефералов.
           Та же ячейка сетки и стили StatCard — высота равна карточке баланса
           (grid stretch + h-full). Только в empty-state (showBuyCta). */
        <Link
          to="/subscription/purchase"
          className="group flex h-full items-center gap-2.5 rounded-xl bg-gray-250 p-3 transition-colors hover:bg-gray-300 dark:bg-gray-850 dark:hover:bg-gray-800"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center text-accent-500 [&>svg]:h-8 [&>svg]:w-8">
            <SubscriptionIcon />
          </span>
          <span className="min-w-0 flex-1 truncate text-sm font-semibold text-dark-50 sm:text-base">
            {t('subscriptions.buy', 'Купить подписку')}
          </span>
          <ChevronRightIcon className="h-4 w-4 shrink-0 text-dark-300 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      ) : null}
    </div>
  );
}
