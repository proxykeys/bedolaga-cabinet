import { PreviewSection } from '../components/PreviewSection';
import { Snapshot } from '../components/Snapshot';
import { Card } from '@/components/data-display/Card';
import { Button } from '@/components/primitives/Button';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  CreditCardIcon,
  WalletIcon,
  ChatIcon,
  SendIcon,
  PlusIcon,
} from '@/components/icons';

/* ═══════════════════════════════════════════════════════════════════
 *  Balance Page — matches src/pages/Balance.tsx structure
 * ═══════════════════════════════════════════════════════════════════ */

export function PagesBalanceSection() {
  return (
    <PreviewSection
      id="balance-page"
      title="Balance Page"
      badge="page"
      description="Страница /balance: баланс, промокоды, методы оплаты, история транзакций, сохранённые карты"
    >
      <SubGroup title="Balance + Promocode">
        <Snapshot label="balance · default" description="баланс, промокод idle">
          <BalanceVisual balanceRubles={12490} promoMode="idle" />
        </Snapshot>

        <Snapshot label="balance · promocode success" description="промокод активирован">
          <BalanceVisual balanceRubles={12990} promoMode="success" />
        </Snapshot>

        <Snapshot label="balance · promocode error" description="ошибка промокода">
          <BalanceVisual balanceRubles={12490} promoMode="error" />
        </Snapshot>

        <Snapshot label="balance · promocode select-sub" description="выбор подписки для промокода">
          <BalanceVisual balanceRubles={12490} promoMode="select-sub" />
        </Snapshot>

        <Snapshot label="balance · zero" description="нулевой баланс">
          <BalanceVisual balanceRubles={0} promoMode="idle" />
        </Snapshot>
      </SubGroup>

      <SubGroup title="Payment Methods">
        <Snapshot label="payments · grid" description="сетка методов оплаты с диапазонами">
          <PaymentMethodsGrid />
        </Snapshot>

        <Snapshot label="payments · unavailable" description="некоторые методы недоступны">
          <PaymentMethodsGrid showUnavailable />
        </Snapshot>
      </SubGroup>

      <SubGroup title="Transaction History">
        <Snapshot label="history · expanded" description="история развёрнута, 4 транзакции">
          <TransactionHistoryExpanded />
        </Snapshot>

        <Snapshot label="history · collapsed" description="история свёрнута">
          <Card className="overflow-hidden">
            <div className="flex w-full items-center justify-between text-left">
              <h2 className="text-lg font-semibold text-dark-100">История транзакций</h2>
              <ChevronDownIcon className="h-5 w-5 text-dark-400" />
            </div>
          </Card>
        </Snapshot>

        <Snapshot label="history · empty" description="нет транзакций">
          <Card className="overflow-hidden">
            <div className="flex w-full items-center justify-between text-left">
              <h2 className="text-lg font-semibold text-dark-100">История транзакций</h2>
              <ChevronDownIcon className="h-5 w-5 rotate-180 text-dark-400" />
            </div>
            <div className="mt-4">
              <div className="py-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-linear-lg bg-gray-200 dark:bg-gray-800">
                  <WalletIcon className="h-8 w-8 text-dark-500" />
                </div>
                <div className="text-dark-400">Нет транзакций</div>
              </div>
            </div>
          </Card>
        </Snapshot>
      </SubGroup>

      <SubGroup title="Saved Cards">
        <Snapshot
          label="saved cards · navigation"
          description="карточка-ссылка на сохранённые карты"
        >
          <Card interactive>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCardIcon className="h-5 w-5 text-dark-400" />
                <span className="font-medium text-dark-100">Сохранённые карты</span>
              </div>
              <ChevronRightIcon className="h-5 w-5 text-dark-400" />
            </div>
          </Card>
        </Snapshot>
      </SubGroup>
    </PreviewSection>
  );
}

function BalanceVisual({
  balanceRubles,
  promoMode,
}: {
  balanceRubles: number;
  promoMode: 'idle' | 'success' | 'error' | 'select-sub';
}) {
  return (
    <div className="space-y-6 bg-gray-050 p-4 dark:bg-gray-950">
      <h1 className="text-2xl font-bold text-dark-50 sm:text-3xl">Баланс</h1>

      {/* Balance Card */}
      <Card>
        <div className="mb-2 text-sm text-dark-400">Текущий баланс</div>
        <div className="text-4xl font-bold text-dark-50 sm:text-5xl">
          {balanceRubles.toLocaleString('ru-RU')}
          <span className="ml-2 text-2xl text-dark-400">₽</span>
        </div>
      </Card>

      {/* Promo Code Section */}
      <Card>
        <h2 className="mb-4 text-lg font-semibold text-dark-100">Промокод</h2>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Введите промокод"
            className="input flex-1"
            readOnly={promoMode !== 'idle'}
            defaultValue={promoMode === 'idle' ? '' : 'PROMO2026'}
          />
          <Button disabled={promoMode !== 'idle'}>Активировать</Button>
        </div>

        {promoMode === 'success' && (
          <div className="mt-3 rounded-linear border border-success-500 bg-gray-200 p-3 text-sm text-success-500 dark:bg-gray-800">
            <div className="font-medium">Промокод активирован</div>
            <div className="mt-1">Начислено: 500.00 ₽</div>
          </div>
        )}

        {promoMode === 'error' && (
          <div className="mt-3 rounded-linear border border-error-500 bg-gray-200 p-3 text-sm text-error-500 dark:bg-gray-800">
            Промокод недействителен или истёк
          </div>
        )}

        {promoMode === 'select-sub' && (
          <div className="mt-3 space-y-2 rounded-linear border border-accent-500 bg-gray-200 p-3 dark:bg-gray-800">
            <div className="text-sm font-medium text-dark-200">
              К какой подписке применить промокод?
            </div>
            {[
              { id: 201, tariff_name: 'ProxyKeys Standard', days_left: 18 },
              { id: 202, tariff_name: 'ProxyKeys Pro', days_left: 45 },
            ].map((sub) => (
              <button
                key={sub.id}
                className="flex w-full min-w-0 items-center justify-between gap-3 rounded-linear border border-gray-300 bg-gray-300 px-3 py-2 text-sm text-dark-200 transition-colors hover:border-accent-500 hover:bg-gray-400 dark:border-gray-700 dark:bg-gray-600 dark:bg-gray-700"
              >
                <span className="truncate">{sub.tariff_name}</span>
                <span className="shrink-0 text-dark-400">{sub.days_left} дн.</span>
              </button>
            ))}
            <button className="text-xs text-dark-400 hover:text-dark-200">Отмена</button>
          </div>
        )}
      </Card>

      {/* Payment Methods */}
      <Card>
        <h2 className="mb-4 text-lg font-semibold text-dark-100">Пополнить баланс</h2>
        <PaymentMethodsGrid />
      </Card>

      {/* Transaction History (collapsed by default) */}
      <Card className="overflow-hidden">
        <div className="flex w-full items-center justify-between text-left">
          <h2 className="text-lg font-semibold text-dark-100">История транзакций</h2>
          <ChevronDownIcon className="h-5 w-5 text-dark-400" />
        </div>
      </Card>

      {/* Saved Cards */}
      <Card interactive>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CreditCardIcon className="h-5 w-5 text-dark-400" />
            <span className="font-medium text-dark-100">Сохранённые карты</span>
          </div>
          <ChevronRightIcon className="h-5 w-5 text-dark-400" />
        </div>
      </Card>
    </div>
  );
}

function PaymentMethodsGrid({ showUnavailable = false }: { showUnavailable?: boolean }) {
  const methods = [
    {
      id: 'sbp',
      name: 'СБП',
      desc: 'Система быстрых платежей',
      min: 10000,
      max: 75000000,
      available: true,
    },
    {
      id: 'bank-card',
      name: 'Банковская карта',
      desc: 'Visa, Mastercard, Мир',
      min: 10000,
      max: 75000000,
      available: true,
    },
    {
      id: 'crypto',
      name: 'Криптовалюта',
      desc: 'BTC, ETH, USDT',
      min: 10000,
      max: 100000000,
      available: !showUnavailable,
    },
    {
      id: 'telegram-stars',
      name: 'Telegram Stars',
      desc: 'Звёзды Telegram',
      min: 10000,
      max: 5000000,
      available: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {methods.map((m) => (
        <Card
          key={m.id}
          interactive={m.available}
          className={m.available ? '' : 'cursor-not-allowed opacity-50'}
        >
          <div className="font-semibold text-dark-100">{m.name}</div>
          <div className="mt-1 text-sm text-dark-500">{m.desc}</div>
          <div className="mt-3 text-xs text-dark-400">
            {(m.min / 100).toLocaleString('ru-RU')} до {(m.max / 100).toLocaleString('ru-RU')} ₽
          </div>
        </Card>
      ))}
    </div>
  );
}

function TransactionHistoryExpanded() {
  const transactions = [
    { id: 1, type: 'DEPOSIT', date: '10.07.2026', amount: 1500, desc: 'СБП' },
    {
      id: 2,
      type: 'SUBSCRIPTION_PAYMENT',
      date: '09.07.2026',
      amount: -299,
      desc: 'ProxyKeys Standard',
    },
    {
      id: 3,
      type: 'REFERRAL_REWARD',
      date: '08.07.2026',
      amount: 90,
      desc: 'Partner campaign reward',
    },
    { id: 4, type: 'DEPOSIT', date: '01.07.2026', amount: 500, desc: 'Банковская карта' },
  ];

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
        return 'badge-success';
      case 'SUBSCRIPTION_PAYMENT':
        return 'badge-info';
      case 'REFERRAL_REWARD':
        return 'badge-warning';
      case 'WITHDRAWAL':
        return 'badge-error';
      default:
        return 'badge-neutral';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
        return 'Пополнение';
      case 'SUBSCRIPTION_PAYMENT':
        return 'Оплата подписки';
      case 'REFERRAL_REWARD':
        return 'Реферальное вознаграждение';
      case 'WITHDRAWAL':
        return 'Вывод средств';
      default:
        return type;
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="flex w-full items-center justify-between text-left">
        <h2 className="text-lg font-semibold text-dark-100">История транзакций</h2>
        <ChevronDownIcon className="h-5 w-5 rotate-180 text-dark-400" />
      </div>
      <div className="mt-4 space-y-3">
        {transactions.map((tx) => {
          const isPositive = tx.amount > 0;
          const sign = isPositive ? '+' : '-';
          const colorClass = isPositive ? 'text-success-500' : 'text-error-500';
          return (
            <div
              key={tx.id}
              className="flex items-center justify-between rounded-linear border border-gray-200/30 bg-gray-200/30 p-4 dark:border-gray-800/30 dark:bg-gray-800/30"
            >
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-3">
                  <span className={getTypeBadge(tx.type)}>{getTypeLabel(tx.type)}</span>
                  <span className="text-xs text-dark-500">{tx.date}</span>
                </div>
                <div className="text-sm text-dark-400">{tx.desc}</div>
              </div>
              <div className={`text-lg font-semibold ${colorClass}`}>
                {sign}
                {Math.abs(tx.amount).toLocaleString('ru-RU')} ₽
              </div>
            </div>
          );
        })}
      </div>
      {/* Pagination */}
      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-dark-500">
        <Button
          variant="secondary"
          size="sm"
          disabled
          className="min-w-[120px] flex-1 sm:flex-none"
        >
          Назад
        </Button>
        <div className="flex-1 text-center">Стр. 1 из 2</div>
        <Button variant="secondary" size="sm" className="min-w-[120px] flex-1 sm:flex-none">
          Вперёд
        </Button>
      </div>
    </Card>
  );
}

/* ═══════════════════════════════════════════════════════════════════
 *  Support Page — matches src/pages/Support.tsx structure
 *  2-panel split: list (left) + detail/form (right)
 * ═══════════════════════════════════════════════════════════════════ */

export function PagesSupportSection() {
  return (
    <PreviewSection
      id="support-page"
      title="Support Page"
      badge="page"
      description="Страница /support: 2-панельный split (список + деталь), тред, форма создания"
    >
      <SubGroup title="Support · main view">
        <Snapshot
          label="support · list + empty detail"
          description="список тикетов, справа placeholder"
        >
          <SupportVisual mode="list-empty" />
        </Snapshot>

        <Snapshot label="support · list + thread" description="список тикетов, справа переписка">
          <SupportVisual mode="list-thread" />
        </Snapshot>

        <Snapshot label="support · list + create" description="список тикетов, справа форма">
          <SupportVisual mode="list-create" />
        </Snapshot>

        <Snapshot label="support · empty list" description="нет тикетов">
          <SupportVisual mode="empty-list" />
        </Snapshot>

        <Snapshot label="support · disabled" description="поддержка отключена">
          <SupportDisabledVisual />
        </Snapshot>
      </SubGroup>
    </PreviewSection>
  );
}

function SupportVisual({
  mode,
}: {
  mode: 'list-empty' | 'list-thread' | 'list-create' | 'empty-list';
}) {
  const tickets = [
    {
      id: 1,
      title: 'Не работает подключение на iOS',
      status: 'open',
      statusLabel: 'Открыт',
      date: '10.07.2026',
    },
    {
      id: 2,
      title: 'Вопрос по оплате криптовалютой',
      status: 'answered',
      statusLabel: 'Отвечен',
      date: '09.07.2026',
    },
    {
      id: 3,
      title: 'Запрос на добавление сервера',
      status: 'pending',
      statusLabel: 'В ожидании',
      date: '07.07.2026',
    },
  ];

  const getBadgeClass = (status: string) => {
    switch (status) {
      case 'open':
        return 'badge-success';
      case 'answered':
        return 'badge-info';
      case 'pending':
        return 'badge-warning';
      case 'closed':
        return 'badge-neutral';
      default:
        return 'badge-neutral';
    }
  };

  return (
    <div className="bg-gray-050 p-4 dark:bg-gray-950">
      <h1 className="mb-6 text-2xl font-bold text-dark-50 sm:text-3xl">Поддержка</h1>

      {mode === 'empty-list' ? (
        <div className="py-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-linear-lg bg-gray-200 dark:bg-gray-800">
            <ChatIcon className="h-8 w-8 text-dark-500" />
          </div>
          <div className="text-dark-400">У вас нет тикетов</div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: Ticket list */}
          <div className="lg:col-span-1">
            <Button variant="primary" size="sm" className="mb-4 w-full">
              <PlusIcon className="h-4 w-4" />
              Создать тикет
            </Button>
            <div className="space-y-2">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className={`rounded-linear border p-3 transition-colors ${
                    mode === 'list-thread' && ticket.id === 1
                      ? 'border-accent-500 bg-gray-200 dark:bg-gray-800'
                      : 'border-gray-200/30 bg-gray-200/30 hover:bg-gray-200/50 dark:border-gray-800/30 dark:bg-gray-800/30 dark:bg-gray-800/50'
                  }`}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <span className={getBadgeClass(ticket.status)}>{ticket.statusLabel}</span>
                    <span className="text-xs text-dark-500">{ticket.date}</span>
                  </div>
                  <div className="truncate text-sm font-medium text-dark-100">{ticket.title}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Detail panel */}
          <div className="lg:col-span-2">
            {mode === 'list-empty' && (
              <div className="flex h-full min-h-[300px] items-center justify-center rounded-linear border border-gray-200/30 bg-gray-200/20 dark:border-gray-800/30 dark:bg-gray-800/20">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-linear-lg bg-gray-200 dark:bg-gray-800">
                    <ChatIcon className="h-6 w-6 text-dark-500" />
                  </div>
                  <div className="text-dark-400">Выберите тикет</div>
                </div>
              </div>
            )}

            {mode === 'list-thread' && (
              <div className="rounded-linear border border-gray-200/30 bg-gray-200/20 dark:border-gray-800/30 dark:bg-gray-800/20">
                {/* Thread header */}
                <div className="border-b border-gray-200/50 p-4 dark:border-gray-800/50">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="badge-success">Открыт</span>
                    <span className="text-xs text-dark-500">Создан: 10.07.2026</span>
                  </div>
                  <h2 className="text-base font-semibold text-dark-100">
                    Не работает подключение на iOS
                  </h2>
                </div>

                {/* Messages */}
                <div className="max-h-96 space-y-4 overflow-y-auto p-4">
                  <div className="mr-4">
                    <div className="mb-1 text-xs font-medium text-dark-400">Вы</div>
                    <div className="rounded-linear border border-gray-200/30 bg-gray-200/50 p-3 text-sm text-dark-100 dark:border-gray-800/30 dark:bg-gray-800/50">
                      Привет! У меня не подключается VPN на iPhone 15.
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="mb-1 text-xs font-medium text-accent-500">Поддержка</div>
                    <div className="rounded-linear border border-accent-500 bg-gray-200 p-3 text-sm text-dark-100 dark:bg-gray-800">
                      Здравствуйте! Попробуйте обновить ссылку подключения в разделе «Подписка».
                    </div>
                  </div>
                  <div className="mr-4">
                    <div className="mb-1 text-xs font-medium text-dark-400">Вы</div>
                    <div className="rounded-linear border border-gray-200/30 bg-gray-200/50 p-3 text-sm text-dark-100 dark:border-gray-800/30 dark:bg-gray-800/50">
                      Спасибо, помогло!
                    </div>
                  </div>
                </div>

                {/* Reply form */}
                <div className="border-t border-gray-200/50 p-4 dark:border-gray-800/50">
                  <textarea
                    placeholder="Напишите сообщение..."
                    rows={2}
                    className="input mb-2 w-full resize-none"
                    readOnly
                  />
                  <div className="flex items-center justify-between">
                    <button className="text-dark-400 hover:text-dark-200">
                      <PlusIcon className="h-5 w-5" />
                    </button>
                    <Button variant="primary" size="sm">
                      <SendIcon className="h-4 w-4" />
                      Отправить
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {mode === 'list-create' && (
              <div className="rounded-linear border border-gray-200/30 bg-gray-200/20 p-4 dark:border-gray-800/30 dark:bg-gray-800/20">
                <h2 className="mb-4 text-base font-semibold text-dark-100">Новый тикет</h2>
                <div className="space-y-4">
                  <div>
                    <label className="label">Тема обращения</label>
                    <input
                      type="text"
                      placeholder="Опишите проблему кратко"
                      className="input w-full"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="label">Описание</label>
                    <textarea
                      placeholder="Опишите вашу проблему подробно..."
                      rows={5}
                      className="w-full resize-none rounded-linear border border-gray-200/50 bg-gray-200/80 p-3 text-sm text-dark-100 placeholder:text-dark-400 focus:outline-none dark:border-gray-800/50 dark:bg-gray-800/80"
                      readOnly
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 rounded-linear border border-dashed border-gray-300 px-4 py-2 text-sm text-dark-400 hover:border-dark-500 dark:border-gray-700">
                      <PlusIcon className="h-4 w-4" />
                      Прикрепить файл
                    </button>
                    <span className="text-xs text-dark-500">Максимум 10 файлов</span>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="primary" className="flex-1">
                      <SendIcon className="h-4 w-4" />
                      Отправить
                    </Button>
                    <Button variant="secondary">Отмена</Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SupportDisabledVisual() {
  return (
    <div className="bg-gray-050 p-4 dark:bg-gray-950">
      <h1 className="mb-6 text-2xl font-bold text-dark-50 sm:text-3xl">Поддержка</h1>
      <div className="py-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-linear-lg bg-gray-200 dark:bg-gray-800">
          <ChatIcon className="h-8 w-8 text-dark-500" />
        </div>
        <div className="mb-2 text-lg font-semibold text-dark-100">Поддержка недоступна</div>
        <div className="text-dark-400">Для связи используйте контактные данные ниже</div>
        <div className="mt-4">
          <a
            href="#"
            className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-6 py-3 font-medium text-on-accent"
          >
            <ChatIcon className="h-5 w-5" />
            Написать в Telegram
          </a>
        </div>
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
