import { PreviewSection } from '../components/PreviewSection';
import { Snapshot } from '../components/Snapshot';
import { createNoopMutation, createPendingMutation } from '../mocks/noopMutation';
import {
  activeGreen,
  activeWarning,
  activeDanger,
  activeCritical,
  activeUnlimited,
  activeTrial,
  activeUnlimitedDevices,
  activeManyDevices,
  expiredLimited,
  expiredPaid,
  expiredPaidNoBalance,
  expiredTrial,
  expiredSuspendedDaily,
  expiredDailyActive,
} from '../fixtures/subscriptions';
import { mockTrialAvailable, mockTrialPaid, mockTrialUnavailable } from '../fixtures/tariffs';
import { mockPendingGifts, mockNoPendingGifts } from '../fixtures/gifts';
import { mockReferralInfo } from '../fixtures/referrals';

import SubscriptionCardActive from '@/components/dashboard/SubscriptionCardActive';
import SubscriptionCardExpired from '@/components/dashboard/SubscriptionCardExpired';
import TrialOfferCard from '@/components/dashboard/TrialOfferCard';
import TrafficProgressBar from '@/components/dashboard/TrafficProgressBar';
import StatsGrid from '@/components/dashboard/StatsGrid';
import PendingGiftCard from '@/components/dashboard/PendingGiftCard';

/**
 * Dashboard section — all dashboard components in all visual states.
 *
 * Layout: responsive grid of Snapshots, each containing one component
 * instance seeded with fixture data for a specific state.
 */
export function DashboardSection() {
  const noopMutation = createNoopMutation();
  const pendingMutation = createPendingMutation();

  return (
    <PreviewSection
      id="dashboard"
      title="Dashboard"
      badge="phase 2"
      description="Карточки подписок, трафик, триал, статы, подарки — во всех возможных состояниях"
    >
      {/* ─── SubscriptionCardActive — 6 состояний ─── */}
      <SubGroup
        title="SubscriptionCardActive"
        hint="Зависит от traffic_used_percent (зоны), is_trial, traffic_limit_gb=0 (∞), device limit"
      >
        <Snapshot label="active · green zone" description="18% · норма">
          <SubscriptionCardActive
            subscription={activeGreen}
            trafficData={{
              traffic_used_gb: 18,
              traffic_used_percent: 18,
              is_unlimited: false,
            }}
            refreshTrafficMutation={noopMutation}
            trafficRefreshCooldown={0}
            connectedDevices={2}
          />
        </Snapshot>

        <Snapshot label="active · warning zone" description="62% · амбер">
          <SubscriptionCardActive
            subscription={activeWarning}
            trafficData={{
              traffic_used_gb: 62,
              traffic_used_percent: 62,
              is_unlimited: false,
            }}
            refreshTrafficMutation={noopMutation}
            trafficRefreshCooldown={0}
            connectedDevices={3}
          />
        </Snapshot>

        <Snapshot label="active · danger zone" description="82% · оранжевый">
          <SubscriptionCardActive
            subscription={activeDanger}
            trafficData={{
              traffic_used_gb: 82,
              traffic_used_percent: 82,
              is_unlimited: false,
            }}
            refreshTrafficMutation={noopMutation}
            trafficRefreshCooldown={0}
            connectedDevices={4}
          />
        </Snapshot>

        <Snapshot label="active · critical zone" description="95% · красный, 3 дня">
          <SubscriptionCardActive
            subscription={activeCritical}
            trafficData={{
              traffic_used_gb: 95,
              traffic_used_percent: 95,
              is_unlimited: false,
            }}
            refreshTrafficMutation={noopMutation}
            trafficRefreshCooldown={30}
            connectedDevices={5}
          />
        </Snapshot>

        <Snapshot label="active · unlimited" description="∞ трафик">
          <SubscriptionCardActive
            subscription={activeUnlimited}
            trafficData={{
              traffic_used_gb: 340,
              traffic_used_percent: 0,
              is_unlimited: true,
            }}
            refreshTrafficMutation={noopMutation}
            trafficRefreshCooldown={0}
            connectedDevices={2}
          />
        </Snapshot>

        <Snapshot label="active · trial" description="trial badge, 1 устройство">
          <SubscriptionCardActive
            subscription={activeTrial}
            trafficData={{
              traffic_used_gb: 4.2,
              traffic_used_percent: 42,
              is_unlimited: false,
            }}
            refreshTrafficMutation={noopMutation}
            trafficRefreshCooldown={0}
            connectedDevices={1}
          />
        </Snapshot>

        <Snapshot label="active · unlimited devices" description="device_limit=0 → ∞">
          <SubscriptionCardActive
            subscription={activeUnlimitedDevices}
            trafficData={{
              traffic_used_gb: 18,
              traffic_used_percent: 18,
              is_unlimited: false,
            }}
            refreshTrafficMutation={noopMutation}
            trafficRefreshCooldown={0}
            connectedDevices={3}
          />
        </Snapshot>

        <Snapshot label="active · many devices" description="device_limit=15 → progress bar">
          <SubscriptionCardActive
            subscription={activeManyDevices}
            trafficData={{
              traffic_used_gb: 42,
              traffic_used_percent: 42,
              is_unlimited: false,
            }}
            refreshTrafficMutation={noopMutation}
            trafficRefreshCooldown={0}
            connectedDevices={7}
          />
        </Snapshot>
      </SubGroup>

      {/* ─── SubscriptionCardExpired — 5 состояний ─── */}
      <SubGroup
        title="SubscriptionCardExpired"
        hint="Ветвления: is_limited (amber), is_trial (только тарифы), is_daily+disabled (возобновить), баланс"
      >
        <Snapshot label="expired · limited" description="трафик исчерпан, amber">
          <SubscriptionCardExpired
            subscription={expiredLimited}
            balanceKopeks={150000}
            balanceRubles={1500}
          />
        </Snapshot>

        <Snapshot label="expired · has balance" description="«Быстро продлить»">
          <SubscriptionCardExpired
            subscription={expiredPaid}
            balanceKopeks={150000}
            balanceRubles={1500}
          />
        </Snapshot>

        <Snapshot label="expired · no balance" description="«Пополнить»">
          <SubscriptionCardExpired
            subscription={expiredPaidNoBalance}
            balanceKopeks={0}
            balanceRubles={0}
          />
        </Snapshot>

        <Snapshot label="expired · trial" description="только «Тарифы» full-width">
          <SubscriptionCardExpired
            subscription={expiredTrial}
            balanceKopeks={0}
            balanceRubles={0}
          />
        </Snapshot>

        <Snapshot label="expired · suspended daily" description="«Возобновить»">
          <SubscriptionCardExpired
            subscription={expiredSuspendedDaily}
            balanceKopeks={50000}
            balanceRubles={500}
          />
        </Snapshot>

        <Snapshot
          label="expired · daily not paused"
          description="expired-daily, «Быстро продлить» (purchaseTariff 1)"
        >
          <SubscriptionCardExpired
            subscription={expiredDailyActive}
            balanceKopeks={50000}
            balanceRubles={500}
          />
        </Snapshot>
      </SubGroup>

      {/* ─── TrialOfferCard — 6 состояний ─── */}
      <SubGroup
        title="TrialOfferCard"
        hint="Бесплатный / платный с балансом / платный без баланса / ошибка / loading / недоступен"
      >
        <Snapshot label="trial · free" description="бесплатный, активировать">
          <TrialOfferCard
            trialInfo={mockTrialAvailable}
            balanceKopeks={150000}
            balanceRubles={1500}
            activateTrialMutation={noopMutation}
            trialError={null}
          />
        </Snapshot>

        <Snapshot label="trial · paid · can afford" description="платный, хватает баланса">
          <TrialOfferCard
            trialInfo={mockTrialPaid}
            balanceKopeks={150000}
            balanceRubles={1500}
            activateTrialMutation={noopMutation}
            trialError={null}
          />
        </Snapshot>

        <Snapshot label="trial · paid · insufficient" description="не хватает, «Пополнить»">
          <TrialOfferCard
            trialInfo={mockTrialPaid}
            balanceKopeks={2000}
            balanceRubles={20}
            activateTrialMutation={noopMutation}
            trialError={null}
          />
        </Snapshot>

        <Snapshot label="trial · error" description="ошибка активации">
          <TrialOfferCard
            trialInfo={mockTrialAvailable}
            balanceKopeks={150000}
            balanceRubles={1500}
            activateTrialMutation={noopMutation}
            trialError="Не удалось активировать триал. Попробуйте позже."
          />
        </Snapshot>

        <Snapshot label="trial · pending" description="кнопка «Загрузка…» (isPending)">
          <TrialOfferCard
            trialInfo={mockTrialAvailable}
            balanceKopeks={150000}
            balanceRubles={1500}
            activateTrialMutation={pendingMutation}
            trialError={null}
          />
        </Snapshot>

        <Snapshot label="trial · unavailable" description="is_available=false">
          <TrialOfferCard
            trialInfo={mockTrialUnavailable}
            balanceKopeks={150000}
            balanceRubles={1500}
            activateTrialMutation={noopMutation}
            trialError={null}
          />
        </Snapshot>
      </SubGroup>

      {/* ─── TrafficProgressBar — 6 состояний ─── */}
      <SubGroup
        title="TrafficProgressBar"
        hint="Зоны: normal / warning / danger / critical + unlimited + compact"
      >
        <Snapshot label="progress · 18%" description="green zone">
          <div className="p-4">
            <TrafficProgressBar usedGb={18} limitGb={100} percent={18} isUnlimited={false} />
          </div>
        </Snapshot>

        <Snapshot label="progress · 62%" description="warning zone">
          <div className="p-4">
            <TrafficProgressBar usedGb={62} limitGb={100} percent={62} isUnlimited={false} />
          </div>
        </Snapshot>

        <Snapshot label="progress · 82%" description="danger zone">
          <div className="p-4">
            <TrafficProgressBar usedGb={82} limitGb={100} percent={82} isUnlimited={false} />
          </div>
        </Snapshot>

        <Snapshot label="progress · 95%" description="critical zone">
          <div className="p-4">
            <TrafficProgressBar usedGb={95} limitGb={100} percent={95} isUnlimited={false} />
          </div>
        </Snapshot>

        <Snapshot label="progress · unlimited" description="∞ flowing">
          <div className="p-4">
            <TrafficProgressBar usedGb={340} limitGb={0} percent={0} isUnlimited={true} />
          </div>
        </Snapshot>

        <Snapshot label="progress · compact" description="compact mode, 45%">
          <div className="p-4">
            <TrafficProgressBar
              usedGb={45}
              limitGb={100}
              percent={45}
              isUnlimited={false}
              compact
            />
          </div>
        </Snapshot>
      </SubGroup>

      {/* ─── StatsGrid ─── */}
      <SubGroup title="StatsGrid" hint="Баланс + рефералы. refLoading state">
        <Snapshot label="stats · loaded" description="данные загружены">
          <StatsGrid
            balanceRubles={1500}
            referralCount={mockReferralInfo.total_referrals}
            earningsRubles={mockReferralInfo.available_balance_rubles}
            refLoading={false}
          />
        </Snapshot>

        <Snapshot label="stats · loading" description="рефералы грузятся">
          <StatsGrid balanceRubles={1500} referralCount={0} earningsRubles={0} refLoading={true} />
        </Snapshot>

        <Snapshot label="stats · zero" description="нулевой баланс, 0 рефералов">
          <StatsGrid balanceRubles={0} referralCount={0} earningsRubles={0} refLoading={false} />
        </Snapshot>
      </SubGroup>

      {/* ─── PendingGiftCard ─── */}
      <SubGroup
        title="PendingGiftCard"
        hint="Подарки к активации. 0 / 1 / 2 элемента + tariff_name=null"
      >
        <Snapshot label="gifts · 2 pending" description="два подарка, с сообщением и без">
          <PendingGiftCard gifts={mockPendingGifts} />
        </Snapshot>

        <Snapshot label="gifts · null tariff name" description="подарок без названия тарифа">
          <PendingGiftCard
            gifts={[
              {
                token: 'gift-no-name',
                tariff_name: null,
                period_days: 30,
                gift_message: 'Подарок без названия тарифа',
                sender_display: 'Аноним',
                created_at: new Date().toISOString(),
              },
            ]}
          />
        </Snapshot>

        <Snapshot label="gifts · empty" description="нет подарков (карта не рендерится)">
          <PendingGiftCard gifts={mockNoPendingGifts} />
        </Snapshot>
      </SubGroup>
    </PreviewSection>
  );
}

/**
 * Sub-group within a section — groups related snapshots under a title.
 */
function SubGroup({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      <div className="mb-3 flex items-baseline gap-2 border-b border-dark-50/5 pb-2">
        <h3 className="font-mono text-[13px] font-semibold uppercase tracking-wider text-dark-50/70">
          {title}
        </h3>
        {hint && <span className="text-[11px] text-dark-50/30">{hint}</span>}
      </div>
      <div className="flex flex-col gap-5">{children}</div>
    </div>
  );
}
