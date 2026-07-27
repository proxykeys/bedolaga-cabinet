import { useState } from 'react';
import { PreviewSection } from '../components/PreviewSection';
import { Snapshot } from '../components/Snapshot';
import { Button } from '@/components/primitives/Button';
import InsufficientBalancePrompt from '@/components/InsufficientBalancePrompt';
import { ColorPicker } from '@/components/ColorPicker';
import { DateField } from '@/components/DateField';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import FortuneWheel from '@/components/wheel/FortuneWheel';
import WheelLegend from '@/components/wheel/WheelLegend';
import { useToast, ToastProvider } from '@/components/Toast';
import type { WheelPrize } from '@/api/wheel';

export function MiscSection() {
  return (
    <PreviewSection
      id="misc"
      title="Misc"
      badge="phase 7"
      description="Остальные компоненты: баланс, пикеры, колесо фортуны, тосты, локализация"
    >
      {/* ─── InsufficientBalancePrompt ─── */}
      <SubGroup
        title="InsufficientBalancePrompt"
        hint="full + compact. Показывается когда не хватает средств на покупку"
      >
        <Snapshot label="insufficient · full" description="полная версия с кнопкой">
          <div className="rounded-xl bg-gray-050 p-4 dark:bg-gray-950">
            <InsufficientBalancePrompt missingAmountKopeks={50000} />
          </div>
        </Snapshot>

        <Snapshot label="insufficient · compact" description="компактная, inline">
          <div className="rounded-xl bg-gray-050 p-4 dark:bg-gray-950">
            <InsufficientBalancePrompt missingAmountKopeks={15000} compact />
          </div>
        </Snapshot>

        <Snapshot label="insufficient · custom message" description="кастомное сообщение">
          <div className="rounded-xl bg-gray-050 p-4 dark:bg-gray-950">
            <InsufficientBalancePrompt
              missingAmountKopeks={75000}
              message="Для продления на 90 дней нужно больше средств"
            />
          </div>
        </Snapshot>
      </SubGroup>

      {/* ─── ColorPicker ─── */}
      <SubGroup title="ColorPicker" hint="HEX / RGB / HSL. Нажми чтобы открыть палитру">
        <Snapshot label="colorpicker · accent" description="выбор accent-цвета">
          <div className="rounded-xl bg-gray-050 p-4 dark:bg-gray-950">
            <ColorPickerDemo label="Accent цвет" initial="#3b82f6" />
          </div>
        </Snapshot>

        <Snapshot label="colorpicker · disabled" description="заблокированный">
          <div className="rounded-xl bg-gray-050 p-4 dark:bg-gray-950">
            <ColorPicker label="Заблокирован" value="#22c55e" onChange={() => {}} disabled />
          </div>
        </Snapshot>
      </SubGroup>

      {/* ─── DateField ─── */}
      <SubGroup title="DateField" hint="Дата с поповером-календарём. Нажми чтобы открыть">
        <Snapshot label="datefield · default" description="выбор даты">
          <div className="rounded-xl bg-gray-050 p-4 dark:bg-gray-950">
            <DateFieldDemo />
          </div>
        </Snapshot>
      </SubGroup>

      {/* ─── LanguageSwitcher ─── */}
      <SubGroup title="LanguageSwitcher" hint="Переключатель языка. Нажми чтобы развернуть">
        <Snapshot label="language · switcher" description="RU / EN / FA / ZH">
          <div className="flex justify-end rounded-xl bg-gray-050 p-4 dark:bg-gray-950">
            <LanguageSwitcher />
          </div>
        </Snapshot>
      </SubGroup>

      {/* ─── FortuneWheel + WheelLegend ─── */}
      <SubGroup title="FortuneWheel + WheelLegend" hint="Колесо фортуны с призами и легендой">
        <Snapshot label="wheel · idle" description="статичное колесо, 6 призов">
          <div className="rounded-xl bg-gray-050 p-4 dark:bg-gray-950">
            <WheelDemo />
          </div>
        </Snapshot>
      </SubGroup>

      {/* ─── Toast ─── */}
      <SubGroup title="Toast" hint="4 типа: success, error, info, warning. Нажми чтобы показать">
        <Snapshot label="toast · all types" description="кнопки триггеры для каждого типа">
          <div className="rounded-xl bg-gray-050 p-4 dark:bg-gray-950">
            <ToastDemo />
          </div>
        </Snapshot>
      </SubGroup>
    </PreviewSection>
  );
}

/** Interactive ColorPicker demo with controlled state */
function ColorPickerDemo({ label, initial }: { label: string; initial: string }) {
  const [color, setColor] = useState(initial);
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div
          className="h-10 w-10 rounded-lg border border-gray-200/50 dark:border-gray-800/50"
          style={{ background: color }}
        />
        <span className="font-mono text-sm text-dark-100">{color}</span>
      </div>
      <ColorPicker label={label} value={color} onChange={setColor} />
    </div>
  );
}

/** Interactive DateField demo */
function DateFieldDemo() {
  const [date, setDate] = useState('');
  return (
    <div className="space-y-2">
      <DateField value={date} onChange={setDate} placeholder="Выберите дату окончания" />
      {date && <p className="text-sm text-dark-400">Выбрано: {date}</p>}
    </div>
  );
}

/** FortuneWheel + WheelLegend demo */
function WheelDemo() {
  const prizes: WheelPrize[] = [
    {
      id: 1,
      display_name: '+5 дней',
      emoji: '🎁',
      color: '#3b82f6',
      prize_type: 'subscription_days',
    },
    { id: 2, display_name: '+50 ₽', emoji: '💰', color: '#22c55e', prize_type: 'balance_bonus' },
    { id: 3, display_name: '+10 ГБ', emoji: '📊', color: '#f59e0b', prize_type: 'traffic' },
    { id: 4, display_name: 'Мимо', emoji: '😢', color: '#64748b', prize_type: 'none' },
    { id: 5, display_name: 'Промокод', emoji: '🎟️', color: '#a855f7', prize_type: 'promocode' },
    { id: 6, display_name: '+1 устройство', emoji: '📱', color: '#ec4899', prize_type: 'devices' },
  ];

  return (
    <div className="flex flex-col items-center gap-6">
      <FortuneWheel
        prizes={prizes}
        isSpinning={false}
        targetRotation={null}
        onSpinComplete={() => {}}
      />
      <WheelLegend prizes={prizes} />
    </div>
  );
}

/** Toast demo — needs ToastProvider context, so wrap locally */
function ToastDemo() {
  return (
    <ToastProvider>
      <ToastButtons />
    </ToastProvider>
  );
}

function ToastButtons() {
  const { showToast } = useToast();

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        variant="secondary"
        onClick={() => showToast({ type: 'success', message: 'Операция выполнена успешно!' })}
      >
        Success toast
      </Button>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => showToast({ type: 'error', message: 'Произошла ошибка.' })}
      >
        Error toast
      </Button>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => showToast({ type: 'info', message: 'Информационное сообщение.' })}
      >
        Info toast
      </Button>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => showToast({ type: 'warning', message: 'Внимание! Мало трафика.' })}
      >
        Warning toast
      </Button>
      <Button
        size="sm"
        variant="secondary"
        onClick={() =>
          showToast({
            type: 'success',
            title: 'Платёж получен',
            message: 'Баланс пополнен на 500 ₽',
            duration: 5000,
          })
        }
      >
        With title + duration
      </Button>
    </div>
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
