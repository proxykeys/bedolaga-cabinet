import { useTranslation } from 'react-i18next';

// ProxyKeys custom: чек-бокс явного акцепта юр-документа в точке действия
// (оплата, включение автопродления). Стили повторяют LegalConsent с экрана
// регистрации — единый паттерн согласия во всём кабинете.

interface ConsentCheckboxProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** i18n-ключ текста перед ссылкой на документ */
  prefixKey: string;
  /** Дефолт префикса, если ключа нет в локали */
  prefixFallback: string;
  /** Публичный путь документа (/offer, /recurrent-payments) */
  href: string;
  /** i18n-ключ подписи ссылки */
  linkKey: string;
  /** Дефолт подписи ссылки */
  linkFallback: string;
  /** Опциональный второй документ (напр. рекуррентные платежи при autopay ON) */
  secondHref?: string;
  secondLinkKey?: string;
  secondLinkFallback?: string;
  disabled?: boolean;
  className?: string;
}

export default function ConsentCheckbox({
  id,
  checked,
  onChange,
  prefixKey,
  prefixFallback,
  href,
  linkKey,
  linkFallback,
  secondHref,
  secondLinkKey,
  secondLinkFallback,
  disabled = false,
  className = '',
}: ConsentCheckboxProps) {
  const { t } = useTranslation();

  return (
    <label
      htmlFor={id}
      className={`flex cursor-pointer items-start gap-2.5 text-xs leading-relaxed text-dark-400 ${className}`}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-dark-600 bg-dark-800 text-accent-500 focus:ring-accent-500"
      />
      <span>
        {t(prefixKey, prefixFallback)}{' '}
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent-400 underline underline-offset-2 transition-colors hover:text-accent-300"
          onClick={(e) => e.stopPropagation()}
        >
          {t(linkKey, linkFallback)}
        </a>
        {secondHref && secondLinkKey && (
          <>
            {' '}
            {t('legal.consent.and', 'и')}{' '}
            <a
              href={secondHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-400 underline underline-offset-2 transition-colors hover:text-accent-300"
              onClick={(e) => e.stopPropagation()}
            >
              {t(secondLinkKey, secondLinkFallback ?? '')}
            </a>
          </>
        )}
      </span>
    </label>
  );
}
