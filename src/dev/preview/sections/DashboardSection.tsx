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
      description="Карточки подписок, триал, статы, подарки — во всех возможных состояниях"
    >
      {/* ─── SubscriptionCardActive — состояния ─── */}
      <SubGroup
        title="SubscriptionCardActive"
        hint="is_trial badge, device limit (∞ / dots / progress), days left"
      >
        <Snapshot label="active · green" description="норма, 2 устройства">
          <SubscriptionCardActive subscription={activeGreen} connectedDevices={2} />
        </Snapshot>

        <Snapshot label="active · 3 days left" description="warning, 3 устройства">
          <SubscriptionCardActive subscription={activeWarning} connectedDevices={3} />
        </Snapshot>

        <Snapshot label="active · 1 day left" description="critical, 4 устройства">
          <SubscriptionCardActive subscription={activeDanger} connectedDevices={4} />
        </Snapshot>

        <Snapshot label="active · expired soon" description="0 days, 5 устройств">
          <SubscriptionCardActive subscription={activeCritical} connectedDevices={5} />
        </Snapshot>

        <Snapshot label="active · unlimited" description="безлимит, 2 устройства">
          <SubscriptionCardActive subscription={activeUnlimited} connectedDevices={2} />
        </Snapshot>

        <Snapshot label="active · trial" description="trial badge, 1 устройство">
          <SubscriptionCardActive subscription={activeTrial} connectedDevices={1} />
        </Snapshot>

        <Snapshot label="active · unlimited devices" description="device_limit=0 → ∞">
          <SubscriptionCardActive subscription={activeUnlimitedDevices} connectedDevices={3} />
        </Snapshot>

        <Snapshot label="active · many devices" description="device_limit=15 → progress bar">
          <SubscriptionCardActive subscription={activeManyDevices} connectedDevices={7} />
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

        <Snapshot
          label="stats · no-referrals · buy (ProxyKeys empty-state)"
          description="ячейка рефералов → кнопка «Купить подписку», высота = баланс"
        >
          <StatsGrid
            balanceRubles={1500}
            referralCount={0}
            earningsRubles={0}
            refLoading={false}
            showReferrals={false}
            showBuyCta
          />
        </Snapshot>

        <Snapshot
          label="stats · no-referrals · subscribed (ProxyKeys)"
          description="есть подписка (активная/триал/истёкшая) — ячейка пустая, CTA рендерит PurchaseCTAButton"
        >
          <StatsGrid
            balanceRubles={1500}
            referralCount={0}
            earningsRubles={0}
            refLoading={false}
            showReferrals={false}
          />
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
