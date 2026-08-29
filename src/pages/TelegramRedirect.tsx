import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/auth';
import { useShallow } from 'zustand/shallow';
import { brandingApi } from '../api/branding';
import { isInTelegramWebApp, getTelegramInitData } from '../hooks/useTelegramSDK';
import { tokenStorage } from '../utils/token';
import { getSafeRedirectPath } from '../utils/safeRedirect';
import { getUiLogoSrc } from '../utils/brandLogo';
import { useTheme } from '../hooks/useTheme';
import LegalConsent from '../components/LegalConsent';
import { CheckIcon, XIcon, ExclamationIcon } from '@/components/icons';
import { safeLocal, safeSession } from '../utils/safeStorage';

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_COUNT_KEY = 'telegram_redirect_retry_count';

export default function TelegramRedirect() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    loginWithTelegram,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuthStore(
    useShallow((state) => ({
      loginWithTelegram: state.loginWithTelegram,
      isAuthenticated: state.isAuthenticated,
      isLoading: state.isLoading,
    })),
  );
  const [status, setStatus] = useState<
    'loading' | 'success' | 'error' | 'consent' | 'not-telegram'
  >('loading');
  const [errorMessage, setErrorMessage] = useState('');
  // 428-consent: новый пользователь отмечает документы до создания аккаунта
  const [consentDocuments, setConsentDocuments] = useState<string[]>([]);
  const [acceptedDocuments, setAcceptedDocuments] = useState<Record<string, boolean>>({});
  const [consentSubmitting, setConsentSubmitting] = useState(false);
  const [retryCount, setRetryCount] = useState(() => {
    const stored = safeSession.getItem(RETRY_COUNT_KEY);
    return stored ? parseInt(stored, 10) : 0;
  });

  // Get branding for nice display
  const { data: branding } = useQuery({
    queryKey: ['branding'],
    queryFn: brandingApi.getBranding,
    staleTime: 60000,
  });

  const appName = branding ? branding.name : import.meta.env.VITE_APP_NAME || 'ProxyKeys';
  const { isDark } = useTheme();
  const logoUrl = getUiLogoSrc(isDark);

  // Get redirect target from URL params (validated)
  const redirectTo = getSafeRedirectPath(searchParams.get('redirect'));

  useEffect(() => {
    // All timers scheduled inside this effect funnel through `timers` so the
    // cleanup can cancel everything when the effect re-runs (deps change
    // during loginWithTelegram) or the page unmounts — preventing
    // setState-on-unmounted-component warnings and stray late navigations.
    const timers: ReturnType<typeof setTimeout>[] = [];
    const schedule = (fn: () => void, ms: number) => {
      timers.push(setTimeout(fn, ms));
    };

    // If already authenticated, redirect immediately
    if (isAuthenticated && !authLoading) {
      setStatus('success');
      schedule(() => navigate(redirectTo), 500);
      return () => timers.forEach(clearTimeout);
    }

    const initTelegram = async () => {
      // Check if running in Telegram WebApp
      const initData = getTelegramInitData();

      if (!isInTelegramWebApp() || !initData) {
        // Not in Telegram, show message and redirect to login
        setStatus('not-telegram');
        schedule(() => navigate('/login'), 2000);
        return;
      }

      // Note: ready(), expand(), and theme CSS vars are already handled by SDK init in main.tsx

      try {
        await loginWithTelegram(initData);
        setStatus('success');
        // Small delay for nice UX
        schedule(() => navigate(redirectTo), 800);
      } catch (err: unknown) {
        console.error('Telegram auth failed:', err);
        const error = err as {
          response?: { status?: number; data?: { detail?: unknown } };
        };
        // 428 = новый пользователь: бэк требует согласие с офертой/политикой.
        // detail — объект {code, message, documents, missing, prechecked}; рисуем
        // чекбоксы и повторяем вход после галочек с тем же initData.
        if (error.response?.status === 428) {
          const consentDetail = error.response?.data?.detail as
            | { documents?: string[]; prechecked?: boolean }
            | undefined;
          const documents = Array.isArray(consentDetail?.documents) ? consentDetail.documents : [];
          if (documents.length > 0) {
            setAcceptedDocuments((prev) => {
              const next = { ...prev };
              for (const document of documents) {
                if (next[document] === undefined)
                  next[document] = Boolean(consentDetail?.prechecked);
              }
              return next;
            });
            setConsentDocuments(documents);
            setStatus('consent');
            return;
          }
        }
        const detail = error.response?.data?.detail;
        setErrorMessage(typeof detail === 'string' ? detail : t('auth.telegramRequired'));
        setStatus('error');
      }
    };

    // Small delay to show loading screen
    schedule(initTelegram, 300);

    return () => timers.forEach(clearTimeout);
  }, [loginWithTelegram, navigate, isAuthenticated, authLoading, redirectTo, t]);

  // Handle retry with limit to prevent infinite loops
  const handleRetry = () => {
    if (retryCount >= MAX_RETRY_ATTEMPTS) {
      setErrorMessage(t('telegramRedirect.maxRetries'));
      safeSession.removeItem(RETRY_COUNT_KEY);
      return;
    }
    const newCount = retryCount + 1;
    setRetryCount(newCount);
    // Счётчик читается после reload, поэтому память тут не считается: если
    // сохранить некуда, лимит попыток не сработает никогда и пользователь
    // останется крутить перезагрузку. Тогда сразу говорим, что попытки исчерпаны.
    if (!safeSession.setItem(RETRY_COUNT_KEY, String(newCount))) {
      setErrorMessage(t('telegramRedirect.maxRetries'));
      return;
    }

    // Clear all cached auth state to prevent stale token/initData loops
    tokenStorage.clearTokens();
    safeSession.removeItem('tapps/launchParams');
    safeSession.removeItem('telegram_init_data');
    safeLocal.removeItem('cabinet-auth');
    safeLocal.removeItem('tg_user_id');

    setStatus('loading');
    setErrorMessage('');
    window.location.reload();
  };

  // Clear retry count on successful auth
  useEffect(() => {
    if (status === 'success') {
      safeSession.removeItem(RETRY_COUNT_KEY);
    }
  }, [status]);

  const toggleConsentDocument = (document: string, value: boolean) => {
    setAcceptedDocuments((prev) => ({ ...prev, [document]: value }));
  };

  const allConsentDocumentsAccepted =
    consentDocuments.length === 0 ||
    consentDocuments.every((document) => acceptedDocuments[document]);

  const handleConsentContinue = async () => {
    const initData = getTelegramInitData();
    if (!initData) {
      setStatus('not-telegram');
      return;
    }
    const acceptedKeys = consentDocuments.filter((document) => acceptedDocuments[document]);
    setConsentSubmitting(true);
    try {
      await loginWithTelegram(initData, acceptedKeys);
      setStatus('success');
      setTimeout(() => navigate(redirectTo), 800);
    } catch (err: unknown) {
      console.error('Telegram consent retry failed:', err);
      const error = err as { response?: { data?: { detail?: unknown } } };
      const detail = error.response?.data?.detail;
      setErrorMessage(typeof detail === 'string' ? detail : t('auth.telegramRequired'));
      setStatus('error');
    } finally {
      setConsentSubmitting(false);
    }
  };

  return (
    <div className="min-h-viewport flex items-center justify-center p-4">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950" />

      <div className="relative w-full max-w-sm text-center">
        {/* Logo */}
        <div className="mx-auto mb-6 flex h-20 items-center justify-center overflow-hidden">
          <img src={logoUrl} alt={appName} className="h-16 w-auto object-contain" />
        </div>

        <h1 className="mb-2 text-2xl font-bold text-dark-50">{appName}</h1>

        {/* Loading State */}
        {status === 'loading' && (
          <div className="mt-8">
            <div className="border-3 mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-accent-500 border-t-transparent" />
            <p className="text-dark-300">{t('auth.authenticating')}</p>
            <p className="mt-2 text-sm text-dark-300">{t('common.loading')}</p>
          </div>
        )}

        {/* Success State */}
        {status === 'success' && (
          <div className="mt-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center">
              <CheckIcon className="h-8 w-8 text-success-500" />
            </div>
            <p className="text-dark-200">{t('auth.loginSuccess')}</p>
            <p className="mt-2 text-sm text-dark-300">{t('telegramRedirect.redirecting')}</p>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="mt-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center">
              <XIcon className="h-8 w-8 text-error-500" />
            </div>
            <p className="mb-2 text-dark-200">{t('auth.loginFailed')}</p>
            <p className="mb-6 text-sm text-error-500">{errorMessage}</p>
            <div className="flex flex-col gap-3">
              <button onClick={handleRetry} className="btn-primary w-full">
                {t('auth.tryAgain')}
              </button>
              <button onClick={() => navigate('/login')} className="btn-secondary w-full">
                {t('telegramRedirect.loginAlternative')}
              </button>
            </div>
          </div>
        )}

        {/* Consent State: backend answered 428 on the automatic Telegram login */}
        {status === 'consent' && (
          <div className="mt-8 text-left">
            <h2 className="mb-2 text-lg font-bold text-dark-50">
              {t('auth.legalConsentTitle', 'Ещё один шаг')}
            </h2>
            <p className="mb-4 text-sm text-dark-400">
              {t(
                'auth.legalConsentSubtitle',
                'Чтобы создать аккаунт, подтвердите, что ознакомились с документами.',
              )}
            </p>
            <LegalConsent
              documents={consentDocuments}
              accepted={acceptedDocuments}
              onChange={toggleConsentDocument}
              disabled={consentSubmitting}
            />
            <button
              type="button"
              onClick={handleConsentContinue}
              disabled={!allConsentDocumentsAccepted || consentSubmitting}
              className="btn-primary mt-5 w-full"
            >
              {consentSubmitting
                ? t('common.loading', 'Загрузка...')
                : t('auth.legalConsentContinue', 'Продолжить')}
            </button>
          </div>
        )}

        {/* Not in Telegram State */}
        {status === 'not-telegram' && (
          <div className="mt-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center">
              <ExclamationIcon className="h-8 w-8 text-warning-500" />
            </div>
            <p className="mb-2 text-dark-200">{t('telegramRedirect.openInTelegram')}</p>
            <p className="mb-6 text-sm text-dark-300">{t('telegramRedirect.openInTelegramDesc')}</p>
            <p className="text-sm text-dark-300">{t('telegramRedirect.redirectToLogin')}</p>
          </div>
        )}

        {/* Telegram branding */}
        <div className="mt-12 flex items-center justify-center gap-2 text-dark-300">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
          </svg>
          <span className="text-xs">Telegram Mini App</span>
        </div>
      </div>
    </div>
  );
}
