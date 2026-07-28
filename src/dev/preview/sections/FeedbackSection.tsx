import { useState, useEffect } from 'react';
import { PreviewSection } from '../components/PreviewSection';
import { Snapshot } from '../components/Snapshot';
import { Button } from '@/components/primitives/Button';
import { useSuccessNotification, type SuccessNotificationData } from '@/store/successNotification';
import SuccessNotificationModal from '@/components/SuccessNotificationModal';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { WrenchIcon, BanIcon, InfoIcon, TelegramIcon, CloudWarningIcon } from '@/components/icons';

/**
 * Feedback section — full-screen blocking states, success modals, error
 * boundaries.
 *
 * Blocking screens are recreated as STATIC snapshots (not the live
 * components) because the real ones call useFocusTrap() which steals
 * keyboard focus and scrolls the page to the screen — breaking the
 * preview layout. The static versions replicate the exact visual markup
 * (BlockingShell layout) without any focus-trap or store side effects.
 */
export function FeedbackSection() {
  return (
    <PreviewSection
      id="feedback"
      title="Feedback"
      badge="phase 6"
      description="Блокирующие экраны, модалки успеха, error boundary — все состояния"
    >
      {/* ─── Blocking Screens ─── */}
      <SubGroup
        title="Blocking Screens"
        hint="5 full-screen состояний: maintenance, blacklist, account deleted, channel sub, backend unavailable"
      >
        <Snapshot label="blocking · maintenance" description="технические работы, warning accent">
          <BlockingFrame>
            <StaticBlockingCard
              accent="warning"
              icon={<WrenchIcon className="h-16 w-16" />}
              title="Технические работы"
              description="Ведутся технические работы. Сервис временно недоступен."
              reason="Обновление серверного оборудования"
              pulse
              footer="Пожалуйста, подождите"
            />
          </BlockingFrame>
        </Snapshot>

        <Snapshot label="blocking · blacklisted" description="пользователь забанен, error accent">
          <BlockingFrame>
            <StaticBlockingCard
              accent="error"
              icon={<BanIcon className="h-16 w-16" />}
              title="Аккаунт заблокирован"
              description="Ваш аккаунт заблокирован за нарушение правил сервиса."
            />
          </BlockingFrame>
        </Snapshot>

        <Snapshot label="blocking · account deleted" description="аккаунт удалён, info accent">
          <BlockingFrame>
            <StaticBlockingCard
              accent="info"
              icon={<InfoIcon className="h-16 w-16" />}
              title="Аккаунт удалён"
              description="Ваш аккаунт был отмечен как удалённый."
              actions={
                <a
                  href="#"
                  className="block rounded-xl bg-accent-500 px-6 py-3 font-medium text-on-accent transition-colors hover:bg-accent-600"
                >
                  Восстановить через Telegram
                </a>
              }
            />
          </BlockingFrame>
        </Snapshot>

        <Snapshot label="blocking · channel subscription" description="нужна подписка на канал">
          <BlockingFrame>
            <StaticBlockingCard
              accent="info"
              icon={<TelegramIcon className="h-16 w-16" />}
              title="Подписка на канал"
              description="Подпишитесь на канал, чтобы продолжить использование сервиса."
              actions={
                <a
                  href="#"
                  className="block rounded-xl bg-accent-500 px-6 py-3 font-medium text-on-accent transition-colors hover:bg-accent-600"
                >
                  Подписаться на @proxykeys_news
                </a>
              }
            />
          </BlockingFrame>
        </Snapshot>

        <Snapshot label="blocking · backend unavailable" description="сервер недоступен">
          <BlockingFrame>
            <StaticBlockingCard
              accent="error"
              icon={<CloudWarningIcon className="h-16 w-16" />}
              title="Сервис недоступен"
              description="Не удалось подключиться к серверу. Проверьте подключение к интернету и попробуйте снова."
              pulse
              footer="Попытка переподключения…"
            />
          </BlockingFrame>
        </Snapshot>
      </SubGroup>

      {/* ─── SuccessNotificationModal ─── */}
      <SubGroup
        title="SuccessNotificationModal"
        hint="модалка успеха после оплаты/пополнения. Нажми триггер чтобы открыть"
      >
        <Snapshot label="success · balance topup" description="после пополнения баланса">
          <SuccessPreview
            data={{
              type: 'balance_topup',
              amountKopeks: 100000,
              newBalanceKopeks: 250000,
            }}
          />
        </Snapshot>

        <Snapshot label="success · subscription purchased" description="после покупки подписки">
          <SuccessPreview
            data={{
              type: 'subscription_purchased',
              tariffName: 'ProxyKeys Pro',
              expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
              amountKopeks: 30000,
            }}
          />
        </Snapshot>

        <Snapshot label="success · subscription activated" description="активация новой подписки">
          <SuccessPreview
            data={{
              type: 'subscription_activated',
              tariffName: 'ProxyKeys Standard',
              expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
            }}
          />
        </Snapshot>

        <Snapshot label="success · subscription renewed" description="продление подписки">
          <SuccessPreview
            data={{
              type: 'subscription_renewed',
              tariffName: 'ProxyKeys Pro',
              expiresAt: new Date(Date.now() + 90 * 86400000).toISOString(),
              amountKopeks: 75000,
            }}
          />
        </Snapshot>

        <Snapshot label="success · devices purchased" description="после покупки устройств">
          <SuccessPreview
            data={{
              type: 'devices_purchased',
              devicesAdded: 2,
              newDeviceLimit: 7,
            }}
          />
        </Snapshot>

        <Snapshot label="success · traffic purchased" description="после покупки трафика">
          <SuccessPreview
            data={{
              type: 'traffic_purchased',
              trafficGbAdded: 50,
              newTrafficLimitGb: 150,
            }}
          />
        </Snapshot>
      </SubGroup>

      {/* ─── ErrorBoundary ─── */}
      <SubGroup
        title="ErrorBoundary"
        hint="page / widget / app уровни. Каждый показывает свой fallback UI"
      >
        <Snapshot label="error · page level" description="ошибка рендеринга страницы">
          <div className="rounded-xl bg-gray-050 p-4 dark:bg-gray-950">
            <ErrorBoundary level="page">
              <ThrowError />
            </ErrorBoundary>
          </div>
        </Snapshot>

        <Snapshot label="error · widget level" description="ошибка в виджете">
          <div className="rounded-xl bg-gray-050 p-4 dark:bg-gray-950">
            <ErrorBoundary level="widget">
              <ThrowError />
            </ErrorBoundary>
          </div>
        </Snapshot>

        <Snapshot label="error · app level" description="критическая ошибка приложения">
          <div className="rounded-xl bg-gray-050 p-4 dark:bg-gray-950">
            <ErrorBoundary level="app">
              <ThrowError />
            </ErrorBoundary>
          </div>
        </Snapshot>
      </SubGroup>
    </PreviewSection>
  );
}

/**
 * Container for blocking screen snapshots — fixed height, clips overflow.
 * Unlike the previous version, does NOT use the real blocking screen
 * components (which call useFocusTrap and steal focus/scroll the page).
 */
function BlockingFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative h-[420px] overflow-hidden rounded-xl border border-dark-50/10"
      style={{ contain: 'strict' }}
    >
      {children}
    </div>
  );
}

type BlockingAccent = 'warning' | 'error' | 'info';

const ACCENT_CLASSES: Record<BlockingAccent, { iconColor: string; dot: string }> = {
  warning: { iconColor: 'text-warning-500', dot: 'bg-warning-500' },
  error: { iconColor: 'text-error-500', dot: 'bg-error-500' },
  info: { iconColor: 'text-accent-500', dot: 'bg-accent-500' },
};

/**
 * Static recreation of BlockingShell — replicates the exact visual layout
 * without useFocusTrap (which steals focus and scrolls the page).
 * Flat monochrome per claude.com aesthetic.
 */
function StaticBlockingCard({
  accent,
  icon,
  title,
  description,
  reason,
  actions,
  pulse,
  footer,
}: {
  accent: BlockingAccent;
  icon: React.ReactNode;
  title: string;
  description: string;
  reason?: string;
  actions?: React.ReactNode;
  pulse?: boolean;
  footer?: string;
}) {
  const a = ACCENT_CLASSES[accent];

  return (
    <div className="flex h-full items-center justify-center bg-gray-050 p-6 dark:bg-gray-950">
      <div className="relative w-full max-w-md overflow-hidden rounded-[var(--bento-radius)] border border-gray-200/40 bg-gray-100 p-8 text-center dark:border-gray-800/40 dark:bg-gray-900 sm:p-10">
        <div className="mb-6 flex justify-center">
          <span className={`relative flex h-16 w-16 items-center justify-center ${a.iconColor}`}>
            {icon}
          </span>
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-dark-50">{title}</h1>
        <p className="mt-3 text-base leading-relaxed text-dark-400">{description}</p>

        {reason && (
          <div className="mt-6 rounded-xl border border-gray-200/30 bg-gray-200/50 p-4 text-left dark:border-gray-800/30 dark:bg-gray-800/50">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-dark-500">
              Причина:
            </p>
            <p className="text-sm text-dark-300">{reason}</p>
          </div>
        )}

        {actions && <div className="mt-7 flex flex-col gap-3">{actions}</div>}

        {pulse && (
          <div aria-hidden className="mt-7 flex items-center justify-center gap-1.5">
            <span
              className={`h-1.5 w-1.5 animate-pulse rounded-full ${a.dot}`}
              style={{ animationDelay: '0ms' }}
            />
            <span
              className={`h-1.5 w-1.5 animate-pulse rounded-full ${a.dot}`}
              style={{ animationDelay: '300ms' }}
            />
            <span
              className={`h-1.5 w-1.5 animate-pulse rounded-full ${a.dot}`}
              style={{ animationDelay: '600ms' }}
            />
          </div>
        )}

        {footer && <p className="mt-6 text-sm text-dark-500">{footer}</p>}
      </div>
    </div>
  );
}

/* ─── Success modal + error boundary demos ─── */

function SuccessPreview({ data }: { data: SuccessNotificationData }) {
  const show = useSuccessNotification((s) => s.show);
  const [opened, setOpened] = useState(false);

  // Must be in useEffect, not in render — calling show() during render
  // is an anti-pattern that triggers React warnings.
  useEffect(() => {
    if (opened) {
      show(data);
    }
  }, [opened, data, show]);

  return (
    <div className="rounded-xl bg-gray-050 p-6 dark:bg-gray-950">
      <Button onClick={() => setOpened(true)}>Показать модалку</Button>
      <SuccessNotificationModal />
    </div>
  );
}

function ThrowError(): null {
  throw new Error('Demo error: intentionally thrown for ErrorBoundary preview');
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
