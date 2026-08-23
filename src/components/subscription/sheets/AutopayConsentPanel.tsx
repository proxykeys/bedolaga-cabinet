import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import ConsentCheckbox from '../../ConsentCheckbox';

// ProxyKeys custom: явная точка акцепта при ВКЛЮЧЕНИИ автопродления.
// Юр-контур: списание — с внутреннего Баланса (не с карты), поэтому по
// регуляторике достаточно одного явного подтверждения в момент включения +
// уведомлений перед списанием (см. /recurrent-payments, раздел 7).
// Отключение — наоборот, в один клик без подтверждений (принцип защиты
// потребителя). Inline-панель по образцу DeleteSubscriptionSheet.

export interface AutopayConsentPanelProps {
  /** Готовая строка цены автопродления (родитель форматирует по валюте), опционально */
  priceLabel?: string;
  /** Выполняющий mutation autopay(true) — дергается кнопкой «Включить» */
  onConfirm: () => void;
  onCancel: () => void;
  pending: boolean;
  /** color token подписи (textSecondary из glassTheme) */
  textSecondary: string;
}

export function AutopayConsentPanel({
  priceLabel,
  onConfirm,
  onCancel,
  pending,
  textSecondary,
}: AutopayConsentPanelProps) {
  const { t } = useTranslation();
  const [accepted, setAccepted] = useState(false);

  // Сброс чек-бокса при каждом новом открытии панели — согласие должно
  // фиксироваться осознанным действием, а не наследоваться от прошлого раза.
  useEffect(() => {
    setAccepted(false);
  }, []);

  return (
    <div className="mt-2 rounded-[14px] border border-gray-200 bg-transparent p-3.5 dark:border-gray-800">
      <div className="mb-1.5 text-sm font-semibold text-dark-50">
        {t('subscription.autopayConsentTitle', 'Включить автопродление')}
      </div>
      <div className="mb-3 text-xs leading-relaxed" style={{ color: textSecondary }}>
        {t(
          'subscription.autopayConsentText',
          'Подписка будет продлеваться автоматически за 1 день до окончания периода, списание — с внутреннего Баланса. Отключить можно в любой момент.',
        )}
        {priceLabel && <div className="mt-1 font-medium text-dark-200">{priceLabel}</div>}
      </div>
      <ConsentCheckbox
        id="autopay-recurrent-consent"
        checked={accepted}
        onChange={setAccepted}
        prefixKey="legal.consent.autopayPrefix"
        prefixFallback="Ознакомлен(а) с условиями"
        href="/recurrent-payments"
        linkKey="legal.consent.recurrentLabel"
        linkFallback="рекуррентных платежей"
        className="mb-3"
        disabled={pending}
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onConfirm}
          disabled={!accepted || pending}
          className="flex-1 rounded-xl bg-accent-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t('subscription.autopayConsentEnable', 'Включить')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={pending}
          className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium transition-colors hover:bg-gray-300 dark:border-gray-800 dark:hover:bg-gray-800"
          style={{ color: textSecondary }}
        >
          {t('common.cancel', 'Отмена')}
        </button>
      </div>
    </div>
  );
}
