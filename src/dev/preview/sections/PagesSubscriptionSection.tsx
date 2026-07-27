import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PreviewSection } from '../components/PreviewSection';
import { Snapshot } from '../components/Snapshot';
import { Card } from '@/components/data-display/Card';
import { Button } from '@/components/primitives/Button';
import { Switch } from '@/components/primitives/Switch';
import TrafficProgressBar from '@/components/dashboard/TrafficProgressBar';
import { useTheme } from '@/hooks/useTheme';
import { getGlassColors } from '@/utils/glassTheme';
import {
  CalendarIcon,
  CopyIcon,
  CheckIcon,
  DownloadIcon,
  PauseIcon,
  RefreshIcon,
  TrashIcon,
} from '@/components/icons';
import { activeGreen, activeTrial } from '../fixtures/subscriptions';
import { mockPurchaseOptions } from '../fixtures/purchaseOptions';
import { DeviceTopupSheet } from '@/components/subscription/sheets/DeviceTopupSheet';
import { DeviceReductionSheet } from '@/components/subscription/sheets/DeviceReductionSheet';
import { TrafficTopupSheet } from '@/components/subscription/sheets/TrafficTopupSheet';
import { ServerManagementSheet } from '@/components/subscription/sheets/ServerManagementSheet';

type SubState = 'active' | 'trial' | 'limited' | 'expired' | 'daily' | 'not-found';

/**
 * Full subscription detail page (/subscriptions/:id) — visual reconstruction.
 * Mirrors the real Subscription.tsx page layout: countdown, traffic,
 * connection link, autopay toggle, device/traffic/server management,
 * and all expandable sheets.
 */
export function PagesSubscriptionSection() {
  const [subState, setSubState] = useState<SubState>('active');

  return (
    <PreviewSection
      id="sub-page"
      title="Subscription Page"
      badge="page"
      description="Полная страница /subscriptions/:id во всех состояниях: active, trial, limited, expired, daily, not-found"
    >
      {/* State switcher */}
      <div className="mb-5 flex flex-wrap gap-2">
        {(['active', 'trial', 'limited', 'expired', 'daily', 'not-found'] as SubState[]).map(
          (s) => (
            <button
              key={s}
              onClick={() => setSubState(s)}
              className={`rounded-lg border px-3 py-1.5 font-mono text-[11px] font-medium transition-colors ${
                subState === s
                  ? 'border-accent-500 bg-gray-300 text-accent-500 dark:bg-gray-700'
                  : 'border-dark-50/15 bg-dark-50/5 text-dark-50/50 hover:bg-dark-50/10'
              }`}
            >
              {s}
            </button>
          ),
        )}
      </div>

      <Snapshot label={`subscription page · ${subState}`} description="полная страница подписки">
        {subState === 'not-found' ? <NotFoundState /> : <SubscriptionPageVisual state={subState} />}
      </Snapshot>
    </PreviewSection>
  );
}

function SubscriptionPageVisual({ state }: { state: Exclude<SubState, 'not-found'> }) {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const g = getGlassColors(isDark);
  const [copied, setCopied] = useState(false);
  const [autopay, setAutopay] = useState(true);
  const [showDeviceTopup, setShowDeviceTopup] = useState(false);
  const [devicesToAdd, setDevicesToAdd] = useState(1);
  const [showDeviceReduction, setShowDeviceReduction] = useState(false);
  const [targetLimit, setTargetLimit] = useState(3);
  const [showTrafficTopup, setShowTrafficTopup] = useState(false);
  const [selectedTrafficPkg, setSelectedTrafficPkg] = useState<number | null>(50);
  const [showServerMgmt, setShowServerMgmt] = useState(false);
  const [selectedServers, setSelectedServers] = useState<string[]>(['srv-nl-01']);

  // Config by state
  const config = getStateConfig(state);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 bg-gray-050 p-4 dark:bg-gray-950">
      {/* ─── Header ─── */}
      <div className="flex items-center gap-2">
        <h1 className="flex-1 text-xl font-bold tracking-tight text-dark-50">
          {config.tariffName}
        </h1>
        {state === 'daily' && (
          <span className="rounded-md bg-accent-500 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-black">
            Daily
          </span>
        )}
        {config.isTrial && (
          <span className="rounded-md bg-warning-500 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-black">
            Trial
          </span>
        )}
      </div>

      {/* ─── Countdown / expiry ─── */}
      <div
        className="min-w-0 overflow-hidden rounded-[14px] p-3.5"
        style={{
          background: g.innerBg,
          border: config.isExpired
            ? '1px solid rgb(var(--color-error-500))'
            : config.daysLeft <= 3
              ? '1px solid rgb(var(--color-warning-500))'
              : `1px solid ${g.innerBorder}`,
        }}
      >
        <div className="mb-2 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-dark-50/35">
          <div
            className="flex h-6 w-6 items-center justify-center rounded-[7px]"
            style={{
              background: g.hoverBg,
            }}
          >
            <CalendarIcon
              className="h-[13px] w-[13px]"
              {...(config.isExpired ? { style: { color: 'rgb(var(--color-error-500))' } } : {})}
            />
          </div>
          {t('dashboard.remaining')}
        </div>
        {config.isExpired ? (
          <div
            className="text-[18px] font-bold tracking-tight"
            style={{ color: 'rgb(var(--color-error-500))' }}
          >
            {t('subscription.expired')}
          </div>
        ) : (
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1 font-mono tabular-nums">
              <span
                className="text-[20px] font-bold tracking-tight"
                style={{ color: config.daysLeft <= 3 ? 'rgb(var(--color-warning-500))' : g.text }}
              >
                {String(config.daysLeft).padStart(2, '0')}
              </span>
              <span className="mr-1 text-[10px] font-medium text-dark-50/25">
                {t('subscription.daysShort')}
              </span>
              <span className="text-[20px] font-bold tracking-tight text-dark-50">18:42:05</span>
            </div>
          </div>
        )}
      </div>

      {/* ─── Traffic section ─── */}
      {!config.isExpired && (
        <Card size="md">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-dark-100">{t('subscription.traffic')}</span>
            <button className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium text-dark-50/35 transition-colors hover:bg-dark-50/5 hover:text-dark-50/50">
              <RefreshIcon className="h-3 w-3" />
              {t('common.refresh')}
            </button>
          </div>
          <div className="mb-2 flex items-baseline justify-between">
            <span className="font-mono text-[11px] text-dark-50/30">
              {config.isUnlimited
                ? `${config.usedGb} ГБ`
                : `${config.usedGb} / ${config.limitGb} ГБ`}
            </span>
            <span className="text-2xl font-bold tracking-tight text-dark-50">
              {config.isUnlimited ? '∞' : `${config.usedPercent}%`}
            </span>
          </div>
          <TrafficProgressBar
            usedGb={config.usedGb}
            limitGb={config.limitGb}
            percent={config.usedPercent}
            isUnlimited={config.isUnlimited}
          />
        </Card>
      )}

      {/* ─── Connection link ─── */}
      {!config.isExpired && (
        <Card size="md">
          <div className="mb-3 text-[11px] font-medium uppercase tracking-wider text-dark-50/35">
            {t('subscription.connectionLink')}
          </div>
          <div
            className="flex items-center gap-2 rounded-xl border p-3"
            style={{ borderColor: g.innerBorder, background: g.innerBg }}
          >
            <code className="min-w-0 flex-1 truncate font-mono text-[11px] text-dark-50/50">
              {config.isUnlimited
                ? 'https://sub.proxykeys.net/unlimited-key-abc'
                : 'https://sub.proxykeys.net/v2ray-key-xyz'}
            </code>
            <button
              onClick={handleCopy}
              className="flex-shrink-0 rounded-lg p-2 text-dark-50/40 transition-colors hover:bg-dark-50/10 hover:text-dark-50"
            >
              {copied ? (
                <CheckIcon className="h-4 w-4 text-success-500" />
              ) : (
                <CopyIcon className="h-4 w-4" />
              )}
            </button>
          </div>
          <div className="mt-3 flex gap-2">
            <Button size="sm" variant="primary" className="flex-1">
              <DownloadIcon className="h-4 w-4" />
              {t('subscription.connectDevice')}
            </Button>
            <Button size="sm" variant="secondary">
              QR
            </Button>
          </div>
        </Card>
      )}

      {/* ─── Autopay / Daily toggle ─── */}
      {!config.isExpired && (
        <Card size="md">
          {state === 'daily' ? (
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-dark-100">
                  {t('subscription.dailyAutoCharge', 'Автосписание')}
                </div>
                <div className="mt-0.5 text-xs text-dark-400">
                  15 ₽ / день · следующее списание: завтра 12:00
                </div>
              </div>
              <Switch checked={autopay} onChange={setAutopay} />
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-dark-100">
                  {t('subscription.autopay', 'Автопродление')}
                </div>
                <div className="mt-0.5 text-xs text-dark-400">
                  {autopay ? 'Включено за 3 дня до окончания' : 'Выключено'}
                </div>
              </div>
              <Switch checked={autopay} onChange={setAutopay} />
            </div>
          )}
        </Card>
      )}

      {/* ─── Additional options (sheets) ─── */}
      {!config.isExpired && (
        <Card size="md">
          <div className="mb-3 text-[11px] font-medium uppercase tracking-wider text-dark-50/35">
            {t('subscription.additionalOptions.title', 'Дополнительные опции')}
          </div>
          <div className="space-y-2">
            <DeviceTopupSheet
              open={showDeviceTopup}
              onOpen={() => setShowDeviceTopup(true)}
              onClose={() => setShowDeviceTopup(false)}
              subscription={state === 'trial' ? activeTrial : activeGreen}
              subscriptionId={activeGreen.id}
              devicesToAdd={devicesToAdd}
              onDevicesToAddChange={setDevicesToAdd}
              purchaseOptions={mockPurchaseOptions}
            />
            <DeviceReductionSheet
              open={showDeviceReduction}
              onOpen={() => setShowDeviceReduction(true)}
              onClose={() => setShowDeviceReduction(false)}
              subscriptionPresent={true}
              subscriptionId={activeGreen.id}
              targetDeviceLimit={targetLimit}
              onTargetDeviceLimitChange={setTargetLimit}
            />
            {!config.isUnlimited && (
              <TrafficTopupSheet
                open={showTrafficTopup}
                onOpen={() => setShowTrafficTopup(true)}
                onClose={() => setShowTrafficTopup(false)}
                subscription={activeGreen}
                subscriptionId={activeGreen.id}
                selectedTrafficPackage={selectedTrafficPkg}
                onSelectedTrafficPackageChange={setSelectedTrafficPkg}
                purchaseOptions={mockPurchaseOptions}
              />
            )}
            <ServerManagementSheet
              open={showServerMgmt}
              onOpen={() => setShowServerMgmt(true)}
              onClose={() => setShowServerMgmt(false)}
              subscription={activeGreen}
              subscriptionId={activeGreen.id}
              selectedServers={selectedServers}
              onSelectedServersChange={setSelectedServers}
              purchaseOptions={mockPurchaseOptions}
            />
          </div>
        </Card>
      )}

      {/* ─── Danger zone ─── */}
      <Card size="md">
        <div className="flex items-center gap-2">
          {state === 'daily' && (
            <Button variant="secondary" size="sm" className="flex-1">
              <PauseIcon className="h-4 w-4" />
              Приостановить
            </Button>
          )}
          <Button variant="destructive" size="sm" className="flex-1">
            <TrashIcon className="h-4 w-4" />
            {t('subscription.delete', 'Удалить подписку')}
          </Button>
        </div>
      </Card>
    </div>
  );
}

function NotFoundState() {
  return (
    <div className="flex min-h-[400px] items-center justify-center bg-gray-050 p-6 dark:bg-gray-950">
      <div className="text-center">
        <div className="mb-4 text-5xl text-dark-50/20">🔍</div>
        <h2 className="text-lg font-semibold text-dark-50">Подписка не найдена</h2>
        <p className="mt-2 text-sm text-dark-400">
          Подписка была удалена или у вас нет к ней доступа.
        </p>
        <Button variant="primary" size="md" className="mt-6">
          К списку подписок
        </Button>
      </div>
    </div>
  );
}

function getStateConfig(state: Exclude<SubState, 'not-found'>) {
  switch (state) {
    case 'active':
      return {
        ...activeGreen,
        tariffName: 'ProxyKeys Standard',
        usedPercent: 42,
        usedGb: 42,
        limitGb: 100,
        daysLeft: 18,
        isExpired: false,
        isTrial: false,
        isUnlimited: false,
      };
    case 'trial':
      return {
        tariffName: 'Trial 15 GB',
        usedPercent: 76,
        usedGb: 11.4,
        limitGb: 15,
        daysLeft: 2,
        isExpired: false,
        isTrial: true,
        isUnlimited: false,
      };
    case 'limited':
      return {
        tariffName: 'ProxyKeys Standard',
        usedPercent: 100,
        usedGb: 50,
        limitGb: 50,
        daysLeft: 15,
        isExpired: false,
        isTrial: false,
        isUnlimited: false,
      };
    case 'expired':
      return {
        tariffName: 'Expired Pro',
        usedPercent: 100,
        usedGb: 100,
        limitGb: 100,
        daysLeft: 0,
        isExpired: true,
        isTrial: false,
        isUnlimited: false,
      };
    case 'daily':
      return {
        tariffName: 'Daily Pro',
        usedPercent: 25,
        usedGb: 2.5,
        limitGb: 10,
        daysLeft: 1,
        isExpired: false,
        isTrial: false,
        isUnlimited: false,
      };
  }
}
