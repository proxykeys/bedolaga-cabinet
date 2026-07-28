import { useState } from 'react';
import { PreviewSection } from '../components/PreviewSection';
import { Snapshot } from '../components/Snapshot';
import { Card } from '@/components/data-display/Card';
import { Button } from '@/components/primitives/Button';
import { Switch } from '@/components/primitives/Switch';
import { StatCard } from '@/components/data-display/StatCard';
import ProviderIcon from '@/components/ProviderIcon';
import {
  CopyIcon,
  CheckIcon,
  ShareIcon,
  UsersIcon,
  LinkIcon,
  WalletIcon,
  BanknotesIcon,
  ClockIcon,
  PercentIcon,
  UserPlusIcon,
  GiftIcon,
  PartnerIcon,
  ExclamationIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CardIcon,
  PencilIcon,
} from '@/components/icons';

/* ═══════════════════════════════════════════════════════════════════
 *  Profile Page
 * ═══════════════════════════════════════════════════════════════════ */

export function PagesProfileReferralSection() {
  return (
    <PreviewSection
      id="profile-referral"
      title="Profile / Referral / Accounts"
      badge="page"
      description="Профиль, реферальная программа, привязанные аккаунты"
    >
      {/* ─── Profile ─── */}
      <SubGroup title="Profile Page">
        <Snapshot label="profile · email verified" description="email подтверждён">
          <ProfileVisual emailVerified />
        </Snapshot>
        <Snapshot label="profile · email unverified" description="email не подтверждён, warning">
          <ProfileVisual />
        </Snapshot>
        <Snapshot label="profile · no email" description="email не задан, кнопка привязать">
          <ProfileVisual noEmail />
        </Snapshot>
      </SubGroup>

      {/* ─── Referral ─── */}
      <SubGroup title="Referral Page">
        <Snapshot
          label="referral · full page"
          description="полная страница: статы, ссылки, условия, рефералы, партнёр"
        >
          <ReferralVisual />
        </Snapshot>
        <Snapshot label="referral · disabled" description="рефералка отключена">
          <ReferralDisabledVisual />
        </Snapshot>
      </SubGroup>

      {/* ─── Connected Accounts ─── */}
      <SubGroup title="Connected Accounts">
        <Snapshot label="accounts · linked" description="telegram + email привязаны">
          <ConnectedAccountsVisual linkedTelegram linkedEmail />
        </Snapshot>
        <Snapshot label="accounts · email only" description="только email">
          <ConnectedAccountsVisual linkedTelegram={false} linkedEmail />
        </Snapshot>
        <Snapshot label="accounts · none" description="ничего не привязано">
          <ConnectedAccountsVisual linkedTelegram={false} linkedEmail={false} />
        </Snapshot>
        <Snapshot label="accounts · email link form" description="inline форма привязки email">
          <ConnectedAccountsVisual linkedTelegram={false} linkedEmail={false} showEmailForm />
        </Snapshot>
        <Snapshot label="accounts · unlink mode" description="отвязка провайдера">
          <ConnectedAccountsVisual linkedTelegram linkedEmail showUnlink />
        </Snapshot>
      </SubGroup>
    </PreviewSection>
  );
}

/* ═══════════════════════════════════════════════════════════════════
 *  Profile
 * ═══════════════════════════════════════════════════════════════════ */

function ProfileVisual({
  emailVerified = false,
  noEmail = false,
}: {
  emailVerified?: boolean;
  noEmail?: boolean;
}) {
  const [notifExpiry, setNotifExpiry] = useState(true);
  const [notifTraffic, setNotifTraffic] = useState(true);
  const [notifBalance, setNotifBalance] = useState(false);
  const [notifNews, setNotifNews] = useState(true);
  const [notifPromo, setNotifPromo] = useState(false);

  return (
    <div className="space-y-6 bg-gray-050 p-4 dark:bg-gray-950">
      <h1 className="text-2xl font-bold text-dark-50 sm:text-3xl">Профиль</h1>

      {/* User Info Card */}
      <Card>
        <h2 className="mb-6 text-lg font-semibold text-dark-100">Информация об аккаунте</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-dark-800/50 py-3">
            <span className="text-dark-400">Telegram ID</span>
            <span className="font-medium text-dark-100">987654321</span>
          </div>
          <div className="flex items-center justify-between border-b border-dark-800/50 py-3">
            <span className="text-dark-400">Имя пользователя</span>
            <span className="font-medium text-dark-100">@proxykeys_demo</span>
          </div>
          <div className="flex items-center justify-between border-b border-dark-800/50 py-3">
            <span className="text-dark-400">Имя</span>
            <span className="font-medium text-dark-100">Demo User</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-dark-400">Дата регистрации</span>
            <span className="font-medium text-dark-100">15.01.2026</span>
          </div>
        </div>
      </Card>

      {/* Connected Accounts Link */}
      <Card interactive>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-dark-100">Привязанные аккаунты</h2>
            <p className="text-sm text-dark-400">Email, Telegram, OAuth</p>
          </div>
          <svg
            className="h-5 w-5 text-dark-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </div>
      </Card>

      {/* Referral Link Widget */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-dark-100">Ваша реферальная ссылка</h2>
          <a href="#" className="flex items-center gap-1 text-accent-500 hover:text-accent-300">
            <span className="text-sm">Рефералы</span>
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </a>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <input
              type="text"
              readOnly
              value="http://localhost:5173/login?ref=PKDEMO1001"
              className="input w-full text-sm"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="primary">
              <CopyIcon className="h-4 w-4" />
              <span className="ml-2">Копировать</span>
            </Button>
            <Button variant="secondary">
              <ShareIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="mt-3 text-sm text-dark-500">Делитесь ссылкой и получайте 25% комиссию</p>
      </Card>

      {/* Email Auth Card */}
      <Card>
        <h2 className="mb-6 text-lg font-semibold text-dark-100">Email-авторизация</h2>
        {noEmail ? (
          <div className="space-y-3">
            <p className="text-sm text-dark-400">Привяжите email для входа без Telegram</p>
            <Button variant="primary">Привязать email</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-dark-800/50 py-3">
              <span className="text-dark-400">Email</span>
              <div className="flex items-center gap-3">
                <span className="font-medium text-dark-100">demo@proxykeys.net</span>
                {emailVerified ? (
                  <span className="badge-success">Подтверждён</span>
                ) : (
                  <span className="badge-warning">Не подтверждён</span>
                )}
              </div>
            </div>

            {!emailVerified && (
              <div className="rounded-linear border border-warning-500 bg-gray-200 p-4 dark:bg-gray-800">
                <p className="mb-4 text-sm text-warning-500">Подтверждение email необходимо</p>
                <div className="flex items-center gap-3">
                  <Button>Отправить код</Button>
                  <button className="text-sm text-accent-500 hover:text-accent-300">
                    Изменить email
                  </button>
                </div>
              </div>
            )}

            {emailVerified && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-dark-400">Вы можете входить по email и паролю</p>
                <button className="flex items-center gap-2 text-sm text-accent-500 hover:text-accent-300">
                  <PencilIcon />
                  <span>Изменить email</span>
                </button>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Notification Settings */}
      <Card>
        <h2 className="mb-6 text-lg font-semibold text-dark-100">Уведомления</h2>
        <div className="space-y-6">
          <NotifRow title="Окончание подписки" desc="Напомнить об окончании">
            <Switch checked={notifExpiry} onCheckedChange={setNotifExpiry} />
          </NotifRow>
          <NotifRow title="Трафик заканчивается" desc="Предупредить при остатке" border>
            <Switch checked={notifTraffic} onCheckedChange={setNotifTraffic} />
          </NotifRow>
          <NotifRow title="Низкий баланс" desc="Предупредить при низком балансе" border>
            <Switch checked={notifBalance} onCheckedChange={setNotifBalance} />
          </NotifRow>
          <NotifRow title="Новости" desc="Уведомления о новостях" border>
            <Switch checked={notifNews} onCheckedChange={setNotifNews} />
          </NotifRow>
          <NotifRow title="Промо-предложения" desc="Скидки и спецпредложения" border>
            <Switch checked={notifPromo} onCheckedChange={setNotifPromo} />
          </NotifRow>
        </div>
      </Card>
    </div>
  );
}

function NotifRow({
  title,
  desc,
  border,
  children,
}: {
  title: string;
  desc: string;
  border?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`flex items-center justify-between ${border ? 'border-t border-dark-800/50 pt-6' : ''}`}
    >
      <div>
        <p className="font-medium text-dark-100">{title}</p>
        <p className="text-sm text-dark-400">{desc}</p>
      </div>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
 *  Referral
 * ═══════════════════════════════════════════════════════════════════ */

function ReferralVisual() {
  return (
    <div className="space-y-6 bg-gray-050 p-4 dark:bg-gray-950">
      <h1 className="text-2xl font-bold text-dark-50 sm:text-3xl">Реферальная программа</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
        <div className="col-span-2 md:col-span-1">
          <StatCard label="Всего рефералов" value={24} icon={<UsersIcon className="h-5 w-5" />} />
        </div>
        <StatCard
          label="Заработано"
          value="+4 500 ₽"
          icon={<BanknotesIcon className="h-5 w-5" />}
        />
        <StatCard label="Комиссия" value="25%" icon={<PercentIcon className="h-5 w-5" />} />
      </div>

      {/* Referral Links */}
      <div className="bento-card">
        <h2 className="mb-4 text-lg font-semibold text-dark-100">Ваши ссылки</h2>
        <div className="space-y-3">
          {/* Bot link */}
          <div>
            <div className="mb-1.5 flex items-center gap-2 text-sm font-medium text-dark-300">
              <svg className="h-4 w-4 text-accent-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
              </svg>
              Ссылка бота
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                readOnly
                value="https://t.me/proxykeysbot?start=PKDEMO1001"
                className="input flex-1 text-sm"
              />
              <button className="btn-primary shrink-0 px-4">
                <CopyIcon className="h-4 w-4" />
                <span className="ml-2">Копировать</span>
              </button>
            </div>
          </div>
          {/* Cabinet link */}
          <div>
            <div className="mb-1.5 flex items-center gap-2 text-sm font-medium text-dark-300">
              <LinkIcon className="h-4 w-4 text-accent-500" />
              Ссылка кабинета
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                readOnly
                value="https://my.proxykeys.net/login?ref=PKDEMO1001"
                className="input flex-1 text-sm"
              />
              <div className="flex gap-2">
                <button className="btn-primary shrink-0 px-4">
                  <CopyIcon className="h-4 w-4" />
                  <span className="ml-2">Копировать</span>
                </button>
                <button className="btn-secondary flex shrink-0 items-center px-4">
                  <ShareIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
        <p className="mt-3 text-sm text-dark-500">Делитесь ссылкой и получайте 25% комиссию</p>
      </div>

      {/* Program Terms */}
      <div className="bento-card">
        <h2 className="mb-4 text-lg font-semibold text-dark-100">Условия программы</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="Комиссия" value="25%" icon={<PercentIcon className="h-5 w-5" />} />
          <StatCard
            label="Мин. пополнение"
            value="100 ₽"
            icon={<BanknotesIcon className="h-5 w-5" />}
          />
          <StatCard label="Бонус новичку" value="+50 ₽" icon={<GiftIcon className="h-5 w-5" />} />
          <StatCard
            label="Бонус пригласившему"
            value="+50 ₽"
            icon={<UserPlusIcon className="h-5 w-5" />}
          />
        </div>
      </div>

      {/* Referrals List */}
      <div className="bento-card">
        <h2 className="mb-4 text-lg font-semibold text-dark-100">Ваши рефералы</h2>
        <div className="space-y-3">
          {[
            { id: 1, name: 'Алексей', date: '10.07.2026', paid: true },
            { id: 2, name: '@user123', date: '05.07.2026', paid: true },
            { id: 3, name: 'Мария', date: '01.07.2026', paid: false },
            { id: 4, name: 'Аноним #4', date: '28.06.2026', paid: false },
          ].map((ref) => (
            <div
              key={ref.id}
              className="flex items-center justify-between rounded-xl border border-gray-200/30 bg-gray-200/30 p-3 dark:border-gray-800/30 dark:bg-gray-800/30"
            >
              <div>
                <div className="font-medium text-dark-100">{ref.name}</div>
                <div className="mt-0.5 text-xs text-dark-500">{ref.date}</div>
              </div>
              {ref.paid ? (
                <span className="badge-success">Оплачен</span>
              ) : (
                <span className="badge-neutral">Ожидает</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Earnings History */}
      <div className="bento-card">
        <h2 className="mb-4 text-lg font-semibold text-dark-100">История заработка</h2>
        <div className="space-y-3">
          {[
            { id: 1, name: 'Алексей', reason: 'first_purchase', date: '10.07.2026', amount: 75 },
            { id: 2, name: '@user123', reason: 'renewal', date: '05.07.2026', amount: 25 },
            { id: 3, name: 'Мария', reason: 'first_purchase', date: '01.07.2026', amount: 50 },
          ].map((earning) => (
            <div
              key={earning.id}
              className="flex items-center justify-between rounded-xl border border-gray-200/30 bg-gray-200/30 p-3 dark:border-gray-800/30 dark:bg-gray-800/30"
            >
              <div>
                <div className="text-dark-100">{earning.name}</div>
                <div className="mt-0.5 text-xs text-dark-500">
                  {earning.reason === 'first_purchase' ? 'Первая оплата' : 'Продление'} •{' '}
                  {earning.date}
                </div>
              </div>
              <div className="font-semibold text-success-500">+{earning.amount} ₽</div>
            </div>
          ))}
        </div>
      </div>

      {/* Partner Section — status: none (Become a Partner) */}
      <div className="bento-card">
        <div className="flex items-start gap-4">
          <PartnerIcon className="h-10 w-10 shrink-0 text-accent-500" />
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-dark-100">Стать партнёром</h2>
            <p className="mt-1 text-sm text-dark-400">
              Получите повышенную комиссию и доступ к кампаниям
            </p>
            <button className="btn-primary mt-4 px-6">Подать заявку</button>
          </div>
        </div>
      </div>

      {/* Partner Section — status: approved (example) */}
      <div className="bento-card border-success-500">
        <div className="flex items-center gap-4">
          <PartnerIcon className="h-10 w-10 shrink-0 text-success-500" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-dark-100">Статус партнёра</h2>
              <span className="badge-success">Активен</span>
            </div>
            <p className="mt-1 text-sm text-dark-400">Ваша комиссия: 30%</p>
          </div>
        </div>
      </div>

      {/* Withdrawal Section */}
      <div className="space-y-6">
        <div className="bento-card">
          <div className="mb-4 flex items-center gap-3">
            <WalletIcon className="h-10 w-10 shrink-0 text-accent-500" />
            <h2 className="text-lg font-semibold text-dark-100">Вывод средств</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <div className="col-span-2 md:col-span-1">
              <StatCard
                label="Доступно"
                value="1 200 ₽"
                icon={<WalletIcon className="h-5 w-5" />}
              />
            </div>
            <StatCard
              label="Заработано"
              value="4 500 ₽"
              icon={<BanknotesIcon className="h-5 w-5" />}
            />
            <StatCard label="Выведено" value="3 300 ₽" icon={<ArrowUpIcon className="h-5 w-5" />} />
            <StatCard label="Потрачено" value="0 ₽" icon={<CardIcon className="h-5 w-5" />} />
            <StatCard label="Ожидание" value="0 ₽" icon={<ArrowDownIcon className="h-5 w-5" />} />
          </div>
          <div className="mt-4">
            <button className="btn-primary w-full px-6 sm:w-auto">Запросить вывод</button>
            <p className="mt-2 text-xs text-dark-500">Минимальная сумма: 500 ₽</p>
          </div>
        </div>

        {/* Withdrawal History */}
        <div className="bento-card">
          <h2 className="mb-4 text-lg font-semibold text-dark-100">История выводов</h2>
          <div className="space-y-3">
            {[
              {
                id: 1,
                amount: 1000,
                status: 'completed',
                date: '01.07.2026',
                details: 'СБП ••1234',
              },
              { id: 2, amount: 500, status: 'pending', date: '09.07.2026', details: 'СБП ••5678' },
            ].map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-gray-200/30 bg-gray-200/30 p-3 dark:border-gray-800/30 dark:bg-gray-800/30"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-dark-100">{item.amount} ₽</span>
                    <span
                      className={item.status === 'completed' ? 'badge-success' : 'badge-warning'}
                    >
                      {item.status === 'completed' ? 'Выполнен' : 'Ожидание'}
                    </span>
                  </div>
                  <div className="mt-0.5 text-xs text-dark-500">
                    {item.date} • {item.details}
                  </div>
                </div>
                {item.status === 'pending' && (
                  <button className="ml-3 shrink-0 text-sm text-error-500 hover:text-error-300">
                    Отмена
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReferralDisabledVisual() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 bg-gray-050 p-4 dark:bg-gray-950">
      <UsersIcon className="h-20 w-20 text-dark-500" />
      <div className="text-center">
        <h1 className="mb-2 text-2xl font-bold text-dark-100">Реферальная программа</h1>
        <p className="text-dark-400">Программа отключена</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
 *  Connected Accounts
 * ═══════════════════════════════════════════════════════════════════ */

function ConnectedAccountsVisual({
  linkedTelegram,
  linkedEmail,
  showEmailForm,
  showUnlink,
}: {
  linkedTelegram: boolean;
  linkedEmail: boolean;
  showEmailForm?: boolean;
  showUnlink?: boolean;
}) {
  return (
    <div className="space-y-4 bg-gray-050 p-4 dark:bg-gray-950">
      <div>
        <h1 className="text-2xl font-bold text-dark-50 sm:text-3xl">Привязанные аккаунты</h1>
        <p className="mt-1 text-sm text-dark-400">Управление способами входа</p>
      </div>

      {/* Telegram */}
      <Card>
        <div className="flex items-center gap-3">
          <ProviderIcon provider="telegram" className="h-8 w-8" />
          <div className="flex-1">
            <div className="font-semibold text-dark-100">Telegram</div>
            <div className="text-sm text-dark-400">
              {linkedTelegram ? '@proxykeys_demo' : 'Не привязан'}
            </div>
          </div>
          {linkedTelegram ? (
            showUnlink ? (
              <Button variant="destructive" size="sm">
                Отвязать
              </Button>
            ) : (
              <span className="text-sm text-success-500">Привязан</span>
            )
          ) : (
            <Button variant="primary" size="sm">
              Привязать
            </Button>
          )}
        </div>
        {/* Telegram link widget placeholder */}
        {!linkedTelegram && (
          <div className="mt-3 flex items-center justify-center rounded-xl border border-dashed border-gray-300 py-6 text-sm text-dark-400 dark:border-gray-700">
            OIDC-виджет загрузится здесь
          </div>
        )}
      </Card>

      {/* Email */}
      <Card>
        {showEmailForm ? (
          /* Inline email link form (email + password + confirm) */
          <div className="space-y-3">
            <div className="flex items-center gap-3 pb-3">
              <ProviderIcon provider="email" className="h-8 w-8" />
              <div className="flex-1">
                <div className="font-semibold text-dark-100">Привязать Email</div>
              </div>
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input w-full" placeholder="you@example.com" readOnly />
            </div>
            <div>
              <label className="label">Пароль</label>
              <input type="password" className="input w-full" placeholder="••••••••" readOnly />
            </div>
            <div>
              <label className="label">Подтвердите пароль</label>
              <input type="password" className="input w-full" placeholder="••••••••" readOnly />
            </div>
            <div className="flex gap-2">
              <Button variant="primary" className="flex-1">
                Привязать
              </Button>
              <Button variant="secondary">Отмена</Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <ProviderIcon provider="email" className="h-8 w-8" />
            <div className="flex-1">
              <div className="font-semibold text-dark-100">Email</div>
              <div className="text-sm text-dark-400">
                {linkedEmail ? 'demo@proxykeys.net' : 'Не привязан'}
              </div>
            </div>
            {linkedEmail ? (
              <span className="text-sm text-success-500">Привязан</span>
            ) : (
              <Button variant="primary" size="sm">
                Привязать
              </Button>
            )}
          </div>
        )}
      </Card>

      {/* OAuth providers */}
      {['google', 'yandex', 'discord', 'vk'].map((provider) => (
        <Card key={provider}>
          <div className="flex items-center gap-3">
            <ProviderIcon provider={provider} className="h-8 w-8" />
            <div className="flex-1">
              <div className="font-semibold capitalize text-dark-100">{provider}</div>
              <div className="text-sm text-dark-400">OAuth провайдер</div>
            </div>
            <Button variant="secondary" size="sm">
              Привязать
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
 *  Result Screens — TopUpResult + PurchaseSuccess
 * ═══════════════════════════════════════════════════════════════════ */

export function PagesResultsSection() {
  return (
    <PreviewSection
      id="results-page"
      title="Result Screens"
      badge="page"
      description="Экраны результата: top-up, purchase success, pending, failed, timeout"
    >
      <SubGroup title="Top-Up Result">
        <Snapshot label="topup · success" description="успешное пополнение">
          <TopUpResultVisual status="success" />
        </Snapshot>
        <Snapshot label="topup · failed" description="ошибка пополнения">
          <TopUpResultVisual status="failed" />
        </Snapshot>
        <Snapshot label="topup · pending" description="ожидание подтверждения">
          <TopUpResultVisual status="pending" />
        </Snapshot>
        <Snapshot label="topup · timeout" description="превышено время ожидания">
          <TopUpResultVisual status="timeout" />
        </Snapshot>
      </SubGroup>

      <SubGroup title="Purchase Success (landing flow)">
        <Snapshot label="purchase · success" description="QR-код + ссылка + копировать">
          <PurchaseSuccessVisual mode="success" />
        </Snapshot>
        <Snapshot label="purchase · pending" description="спиннер, ожидание оплаты">
          <PurchaseSuccessVisual mode="pending" />
        </Snapshot>
        <Snapshot label="purchase · failed" description="оплата не прошла">
          <PurchaseSuccessVisual mode="failed" />
        </Snapshot>
        <Snapshot label="purchase · timeout" description="превышено время polling">
          <PurchaseSuccessVisual mode="timeout" />
        </Snapshot>
        <Snapshot label="purchase · cabinet creds" description="email + пароль для кабинета">
          <PurchaseSuccessVisual mode="cabinet-creds" />
        </Snapshot>
        <Snapshot label="purchase · gift link share" description="ссылка для получателя подарка">
          <PurchaseSuccessVisual mode="gift-link" />
        </Snapshot>
      </SubGroup>
    </PreviewSection>
  );
}

function TopUpResultVisual({ status }: { status: 'success' | 'failed' | 'pending' | 'timeout' }) {
  return (
    <div className="flex min-h-[320px] items-center justify-center bg-gray-050 p-6 dark:bg-gray-950">
      <div className="w-full max-w-sm text-center">
        {status === 'success' && (
          <>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center">
              <CheckIcon className="h-16 w-16 text-success-500" />
            </div>
            <h1 className="text-2xl font-bold text-dark-50">Баланс пополнен</h1>
            <div className="mt-4 rounded-linear border border-gray-200 bg-gray-150 p-4 dark:border-gray-800 dark:bg-gray-850">
              <div className="text-sm text-dark-400">Зачислено</div>
              <div className="mt-1 text-3xl font-bold text-success-500">+1 500 ₽</div>
            </div>
            <Button variant="primary" className="mt-6 w-full">
              Перейти к балансу
            </Button>
          </>
        )}
        {status === 'failed' && (
          <>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center">
              <ExclamationIcon className="h-16 w-16 text-error-500" />
            </div>
            <h1 className="text-2xl font-bold text-dark-50">Платёж не прошёл</h1>
            <p className="mt-2 text-sm text-dark-400">Попробуйте другой метод оплаты</p>
            <div className="mt-6 flex gap-3">
              <Button variant="secondary" className="flex-1">
                К балансу
              </Button>
              <Button variant="primary" className="flex-1">
                Повторить
              </Button>
            </div>
          </>
        )}
        {status === 'pending' && (
          <>
            <div className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-4 border-accent-500 border-t-transparent" />
            <h1 className="text-2xl font-bold text-dark-50">Ожидание подтверждения…</h1>
            <p className="mt-2 text-sm text-dark-400">
              Платёж обрабатывается. Это может занять до 5 минут.
            </p>
          </>
        )}
        {status === 'timeout' && (
          <>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center">
              <ClockIcon className="h-16 w-16 text-warning-500" />
            </div>
            <h1 className="text-2xl font-bold text-dark-50">Время ожидания истекло</h1>
            <p className="mt-2 text-sm text-dark-400">
              Платёж мог быть обработан. Проверьте баланс.
            </p>
            <div className="mt-6 flex gap-3">
              <Button variant="secondary" className="flex-1">
                К балансу
              </Button>
              <Button variant="primary" className="flex-1">
                Проверить ещё раз
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function PurchaseSuccessVisual({ mode }: { mode: string }) {
  return (
    <div className="flex min-h-[320px] items-center justify-center bg-gray-050 p-6 dark:bg-gray-950">
      <div className="w-full max-w-sm text-center">
        {mode === 'pending' && (
          <>
            <div className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-4 border-accent-500 border-t-transparent" />
            <h1 className="text-2xl font-bold text-dark-50">Обработка платежа…</h1>
            <p className="mt-2 text-sm text-dark-400">Ожидаем подтверждение от платёжной системы</p>
          </>
        )}
        {mode === 'success' && (
          <>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center">
              <CheckIcon className="h-16 w-16 text-success-500" />
            </div>
            <h1 className="text-2xl font-bold text-dark-50">Подписка активирована!</h1>
            <div className="mt-4 rounded-2xl bg-white p-4">
              <div
                className="h-[200px] w-full bg-gray-100/10 dark:bg-gray-900/10"
                style={{
                  backgroundImage:
                    'url("data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 10 10%22%3E%3C/svg%3E")',
                }}
              />
            </div>
            <p className="mt-3 text-sm text-dark-400">Отсканируйте QR-код или скопируйте ссылку</p>
            <div className="mt-4 flex gap-2">
              <Button variant="primary" className="flex-1">
                <CopyIcon className="h-4 w-4" />
                Копировать ссылку
              </Button>
            </div>
          </>
        )}
        {mode === 'failed' && (
          <>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center">
              <ExclamationIcon className="h-16 w-16 text-error-500" />
            </div>
            <h1 className="text-2xl font-bold text-dark-50">Оплата не прошла</h1>
            <p className="mt-2 text-sm text-dark-400">Попробуйте снова или выберите другой метод</p>
            <Button variant="primary" className="mt-6 w-full">
              Повторить
            </Button>
          </>
        )}
        {mode === 'timeout' && (
          <>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center">
              <ClockIcon className="h-16 w-16 text-warning-500" />
            </div>
            <h1 className="text-2xl font-bold text-dark-50">Время ожидания истекло</h1>
            <p className="mt-2 text-sm text-dark-400">Платёж мог быть обработан с задержкой</p>
            <Button variant="primary" className="mt-6 w-full">
              Проверить ещё раз
            </Button>
          </>
        )}
        {mode === 'cabinet-creds' && (
          <>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center">
              <CheckIcon className="h-16 w-16 text-success-500" />
            </div>
            <h1 className="text-2xl font-bold text-dark-50">Доступ активирован!</h1>
            <div className="mt-4 space-y-2 rounded-linear border border-gray-200 bg-gray-150 p-4 text-left dark:border-gray-800 dark:bg-gray-850">
              <div className="flex justify-between text-sm">
                <span className="text-dark-400">Email</span>
                <span className="font-mono text-dark-100">user@example.com</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-dark-400">Пароль</span>
                <span className="font-mono text-dark-100">••••••••</span>
              </div>
            </div>
            <p className="mt-3 text-sm text-warning-500">Сохраните данные для входа в кабинет</p>
            <Button variant="primary" className="mt-4 w-full">
              Войти в кабинет
            </Button>
          </>
        )}
        {mode === 'gift-link' && (
          <>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center">
              <GiftIcon className="h-16 w-16 text-accent-500" />
            </div>
            <h1 className="text-2xl font-bold text-dark-50">Подарок отправлен!</h1>
            <p className="mt-2 text-sm text-dark-400">Поделитесь ссылкой с получателем:</p>
            <div className="mt-4 flex items-center gap-2 rounded-linear border border-gray-200 bg-gray-150 p-3 dark:border-gray-800 dark:bg-gray-850">
              <code className="min-w-0 flex-1 truncate font-mono text-xs text-dark-100">
                my.proxykeys.net/buy/gift/abc123
              </code>
              <button className="shrink-0 text-accent-500 hover:text-accent-300">
                <CopyIcon className="h-4 w-4" />
              </button>
            </div>
            <Button variant="secondary" className="mt-4 w-full">
              <ShareIcon className="h-4 w-4" />
              Поделиться в Telegram
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

function SubGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <div className="mb-3 border-b border-dark-50/5 pb-2">
        <h3 className="font-mono text-[13px] font-semibold uppercase tracking-wider text-dark-50/70">
          {title}
        </h3>
      </div>
      <div className="flex flex-col gap-5">{children}</div>
    </div>
  );
}
