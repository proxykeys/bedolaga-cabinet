import { useQuery } from '@tanstack/react-query';
import { balanceApi } from '../../api/balance';
import { referralApi } from '../../api/referral';
import { API } from '../../config/constants';
import StatsGrid from '../dashboard/StatsGrid';

/**
 * ProxyKeys custom: перетягивает на единую «главную = подписка» страницу
 * блок баланса и рефералов (раньше он жил только на Dashboard).
 * Обёртка вокруг существующего <StatsGrid/>, чтобы не утяжелять Subscription.tsx
 * лишними queries и не плодить конфликты при rebase upstream.
 */
export default function StatsGridContainer() {
  const { data: balanceData } = useQuery({
    queryKey: ['balance'],
    queryFn: balanceApi.getBalance,
    staleTime: API.BALANCE_STALE_TIME_MS,
    refetchOnMount: 'always',
  });

  const { data: referralInfo, isLoading: refLoading } = useQuery({
    queryKey: ['referral-info'],
    queryFn: referralApi.getReferralInfo,
  });

  return (
    <StatsGrid
      balanceRubles={balanceData?.balance_rubles || 0}
      referralCount={referralInfo?.total_referrals || 0}
      earningsRubles={referralInfo?.available_balance_rubles || 0}
      refLoading={refLoading}
    />
  );
}
