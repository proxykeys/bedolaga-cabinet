import { useState } from 'react';
import { PreviewSection } from '../components/PreviewSection';
import { Snapshot } from '../components/Snapshot';
import { activeGreen, activeTrial, activeUnlimited, expiredPaid } from '../fixtures/subscriptions';
import { mockSubscriptionListItems } from '../fixtures/subscriptionsList';
import {
  mockClassicPurchaseOptions,
  mockPurchaseOptions,
  mockTariffs,
} from '../fixtures/purchaseOptions';
import SubscriptionListCard from '@/components/subscription/SubscriptionListCard';
import PurchaseCTAButton from '@/components/subscription/PurchaseCTAButton';
import { ClassicPurchaseWizard } from '@/components/subscription/purchase/ClassicPurchaseWizard';
import { DeviceTopupSheet } from '@/components/subscription/sheets/DeviceTopupSheet';
import { DeviceReductionSheet } from '@/components/subscription/sheets/DeviceReductionSheet';
import { TrafficTopupSheet } from '@/components/subscription/sheets/TrafficTopupSheet';
import { ServerManagementSheet } from '@/components/subscription/sheets/ServerManagementSheet';
import { DeleteSubscriptionSheet } from '@/components/subscription/sheets/DeleteSubscriptionSheet';
import { SwitchTariffSheet } from '@/components/subscription/sheets/SwitchTariffSheet';
import type { SubscriptionListItem } from '@/types';

/**
 * Helpers to build SubscriptionListItem variants for each visual state.
 */
function makeListItem(overrides: Partial<SubscriptionListItem>): SubscriptionListItem {
  return {
    ...mockSubscriptionListItems[0],
    id: Math.floor(Math.random() * 10000),
    ...overrides,
  };
}

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

/**
 * Subscription section — list cards, purchase CTA, and related components.
 *
 * Note: ClassicPurchaseWizard, TariffPickerGrid, and the 6 sheets are
 * deeply coupled to API queries/mutations and page-level state. They are
 * harder to isolate in a static preview without a full mock transport
 * layer. They will be added in a later iteration once the mock layer
 * supports intercepted mutations.
 */
export function SubscriptionSection() {
  return (
    <PreviewSection
      id="subscription"
      title="Subscription"
      badge="phase 3"
      description="Карточки списка подписок и CTA-кнопки покупки. Wizard и sheets будут добавлены позже."
    >
      {/* ─── SubscriptionListCard — все статусы ─── */}
      <SubGroup
        title="SubscriptionListCard"
        hint="Статусы: active / limited / expired / trial + daily + autopay indicators"
      >
        <Snapshot label="active" description="обычная активная подписка">
          <SubscriptionListCard
            subscription={makeListItem({
              status: 'active',
              tariff_name: 'ProxyKeys Standard',
              traffic_limit_gb: 100,
              traffic_used_gb: 18,
              is_trial: false,
              autopay_enabled: false,
              end_date: daysFromNow(20),
            })}
            onClick={() => {}}
          />
        </Snapshot>

        <Snapshot label="active · autopay" description="автопродление включено">
          <SubscriptionListCard
            subscription={makeListItem({
              status: 'active',
              tariff_name: 'ProxyKeys Pro',
              traffic_limit_gb: 100,
              traffic_used_gb: 45,
              is_trial: false,
              autopay_enabled: true,
              end_date: daysFromNow(30),
            })}
            onClick={() => {}}
          />
        </Snapshot>

        <Snapshot label="limited" description="трафик исчерпан, amber">
          <SubscriptionListCard
            subscription={makeListItem({
              status: 'limited',
              tariff_name: 'ProxyKeys Standard',
              traffic_limit_gb: 100,
              traffic_used_gb: 100,
              is_trial: false,
              autopay_enabled: true,
              end_date: daysFromNow(15),
            })}
            onClick={() => {}}
          />
        </Snapshot>

        <Snapshot label="trial" description="trial badge, warning">
          <SubscriptionListCard
            subscription={makeListItem({
              status: 'active',
              tariff_name: 'Trial',
              traffic_limit_gb: 10,
              traffic_used_gb: 4.2,
              device_limit: 1,
              is_trial: true,
              end_date: daysFromNow(2),
            })}
            onClick={() => {}}
          />
        </Snapshot>

        <Snapshot label="expired" description="истёкшая, error">
          <SubscriptionListCard
            subscription={makeListItem({
              status: 'expired',
              tariff_name: 'ProxyKeys Standard',
              traffic_limit_gb: 100,
              traffic_used_gb: 87,
              is_trial: false,
              autopay_enabled: false,
              end_date: daysFromNow(-2),
            })}
            onClick={() => {}}
          />
        </Snapshot>

        <Snapshot label="unlimited" description="∞ трафик, active">
          <SubscriptionListCard
            subscription={makeListItem({
              status: 'active',
              tariff_name: 'ProxyKeys Unlimited',
              traffic_limit_gb: 0,
              traffic_used_gb: 340,
              is_trial: false,
              autopay_enabled: true,
              end_date: daysFromNow(45),
            })}
            onClick={() => {}}
          />
        </Snapshot>

        <Snapshot label="daily · active" description="дневная, автосписание вкл">
          <SubscriptionListCard
            subscription={makeListItem({
              status: 'active',
              tariff_name: 'ProxyKeys Daily',
              traffic_limit_gb: 10,
              traffic_used_gb: 2.5,
              is_trial: false,
              is_daily: true,
              is_daily_paused: false,
              end_date: daysFromNow(1),
            })}
            onClick={() => {}}
          />
        </Snapshot>

        <Snapshot label="daily · paused" description="дневная на паузе">
          <SubscriptionListCard
            subscription={makeListItem({
              status: 'disabled',
              tariff_name: 'ProxyKeys Daily',
              traffic_limit_gb: 10,
              traffic_used_gb: 8,
              is_trial: false,
              is_daily: true,
              is_daily_paused: true,
              end_date: daysFromNow(-1),
            })}
            onClick={() => {}}
          />
        </Snapshot>

        <Snapshot label="critical traffic" description="95% used, red bar">
          <SubscriptionListCard
            subscription={makeListItem({
              status: 'active',
              tariff_name: 'ProxyKeys Pro',
              traffic_limit_gb: 100,
              traffic_used_gb: 95,
              is_trial: false,
              autopay_enabled: false,
              end_date: daysFromNow(5),
            })}
            onClick={() => {}}
          />
        </Snapshot>
      </SubGroup>

      {/* ─── PurchaseCTAButton — все состояния ─── */}
      <SubGroup
        title="PurchaseCTAButton"
        hint="expired (красный) / trial upgrade / active renew / multi-tariff renew"
      >
        <Snapshot label="cta · no subscription" description="hidden — empty-state имеет свой CTA">
          <div className="rounded-xl border border-dashed border-dark-50/10 p-4 text-center text-xs text-dark-50/30">
            <PurchaseCTAButton subscription={null} />
            <span className="mt-1 block">(кнопка скрыта — CTA в empty-state)</span>
          </div>
        </Snapshot>

        <Snapshot label="cta · expired" description="истёкшая, красный">
          <PurchaseCTAButton subscription={expiredPaid} />
        </Snapshot>

        <Snapshot label="cta · trial" description="trial → upgrade">
          <PurchaseCTAButton subscription={activeTrial} />
        </Snapshot>

        <Snapshot label="cta · active" description="активная → продлить">
          <PurchaseCTAButton subscription={activeGreen} />
        </Snapshot>

        <Snapshot label="cta · active · multi-tariff" description="мульти-тариф, renew">
          <PurchaseCTAButton subscription={activeGreen} isMultiTariff />
        </Snapshot>

        <Snapshot label="cta · unlimited · multi-tariff" description="unlimited, multi-tariff">
          <PurchaseCTAButton subscription={activeUnlimited} isMultiTariff />
        </Snapshot>

        <Snapshot label="cta · daily · multi-tariff" description="daily auto-renews → hidden">
          <div className="rounded-xl border border-dashed border-dark-50/10 p-4 text-center text-xs text-dark-50/30">
            <PurchaseCTAButton subscription={{ ...activeGreen, is_daily: true }} isMultiTariff />
            <span className="mt-1 block">(кнопка скрыта — daily продляется автоматически)</span>
          </div>
        </Snapshot>
      </SubGroup>

      {/* ─── ClassicPurchaseWizard ─── */}
      <SubGroup
        title="ClassicPurchaseWizard"
        hint="Мультистеп-визард: period → traffic → servers → devices → confirm. Нажми «Получить подписку»"
      >
        <Snapshot label="wizard · collapsed" description="начальное состояние, кнопка открыть">
          <ClassicPurchaseWizard
            classicOptions={mockClassicPurchaseOptions}
            subscription={activeTrial}
            subscriptionId={activeTrial.id}
          />
        </Snapshot>

        <Snapshot
          label="wizard · full multi-step"
          description="с тарифом Standard, все опции доступны"
        >
          <ClassicPurchaseWizard
            classicOptions={mockClassicPurchaseOptions}
            subscription={null}
            subscriptionId={undefined}
          />
        </Snapshot>
      </SubGroup>

      {/* ─── Sheets ─── */}
      <SubGroup
        title="Sheets (6 шт.)"
        hint="Расширения подписки: устройства, трафик, серверы, смена тарифа, удаление. Нажми чтобы развернуть"
      >
        <Snapshot
          label="sheet · device topup"
          description="докупка устройств, collapsed + expanded"
        >
          <div className="space-y-3">
            <DeviceTopupSheetDemo />
          </div>
        </Snapshot>

        <Snapshot label="sheet · device reduction" description="уменьшение лимита устройств">
          <div className="space-y-3">
            <DeviceReductionSheetDemo />
          </div>
        </Snapshot>

        <Snapshot label="sheet · traffic topup" description="докупка трафика">
          <div className="space-y-3">
            <TrafficTopupSheetDemo />
          </div>
        </Snapshot>

        <Snapshot label="sheet · server management" description="управление серверами">
          <div className="space-y-3">
            <ServerManagementSheetDemo />
          </div>
        </Snapshot>

        <Snapshot label="sheet · switch tariff" description="смена тарифа">
          <SwitchTariffSheetDemo />
        </Snapshot>

        <Snapshot label="sheet · delete subscription" description="удаление подписки">
          <DeleteSubscriptionSheetDemo />
        </Snapshot>
      </SubGroup>
    </PreviewSection>
  );
}

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

/* ═══════════════════════════════════════════════════════════════════
 *  Interactive sheet demos — each manages its own open/close state
 * ═══════════════════════════════════════════════════════════════════ */

function DeviceTopupSheetDemo() {
  const [open, setOpen] = useState(false);
  const [devicesToAdd, setDevicesToAdd] = useState(1);
  return (
    <>
      <DeviceTopupSheet
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        subscription={activeGreen}
        subscriptionId={activeGreen.id}
        devicesToAdd={devicesToAdd}
        onDevicesToAddChange={setDevicesToAdd}
        purchaseOptions={mockPurchaseOptions}
      />
    </>
  );
}

function DeviceReductionSheetDemo() {
  const [open, setOpen] = useState(false);
  const [targetLimit, setTargetLimit] = useState(3);
  return (
    <DeviceReductionSheet
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      subscriptionPresent={true}
      subscriptionId={activeGreen.id}
      targetDeviceLimit={targetLimit}
      onTargetDeviceLimitChange={setTargetLimit}
    />
  );
}

function TrafficTopupSheetDemo() {
  const [open, setOpen] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState<number | null>(50);
  return (
    <TrafficTopupSheet
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      subscription={activeGreen}
      subscriptionId={activeGreen.id}
      selectedTrafficPackage={selectedPkg}
      onSelectedTrafficPackageChange={setSelectedPkg}
      purchaseOptions={mockPurchaseOptions}
    />
  );
}

function ServerManagementSheetDemo() {
  const [open, setOpen] = useState(false);
  const [selectedServers, setSelectedServers] = useState<string[]>(['srv-nl-01']);
  return (
    <ServerManagementSheet
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      subscription={activeGreen}
      subscriptionId={activeGreen.id}
      selectedServers={selectedServers}
      onSelectedServersChange={setSelectedServers}
      purchaseOptions={mockPurchaseOptions}
    />
  );
}

function SwitchTariffSheetDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-2">
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-xl border border-gray-200/50 bg-gray-200/50 p-4 text-left transition-colors hover:border-gray-300 dark:border-gray-700 dark:border-gray-800/50 dark:bg-gray-800/50"
      >
        <div className="font-medium text-dark-100">Сменить тариф</div>
        <div className="mt-1 text-sm text-dark-400">Открыть SwitchTariffSheet</div>
      </button>
      <SwitchTariffSheet
        open={open}
        tariffId={2}
        subscriptionId={activeGreen.id}
        tariffs={mockTariffs}
        onClose={() => setOpen(false)}
        onExpiredFallback={() => {}}
      />
    </div>
  );
}

function DeleteSubscriptionSheetDemo() {
  const [open, setOpen] = useState(false);
  return (
    <DeleteSubscriptionSheet
      subscriptionId={activeGreen.id}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      onDeleted={() => setOpen(false)}
      textSecondary="rgba(255,255,255,0.3)"
    />
  );
}
