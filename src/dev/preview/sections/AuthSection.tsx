import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PreviewSection } from '../components/PreviewSection';
import { Snapshot } from '../components/Snapshot';
/**
 * Static snapshot of TelegramLoginButton — avoids loading the Telegram
 * widget script (which creates an iframe that steals focus and scrolls
 * the page). Renders a lookalike button with no side effects.
 */
function StaticTelegramLoginButton() {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2 rounded-lg bg-[#229ED9] px-6 py-2.5 text-sm font-medium text-white">
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
        </svg>
        Log in with Telegram
      </div>
    </div>
  );
}
import OAuthProviderIcon from '@/components/OAuthProviderIcon';
import ProviderIcon, { TelegramIcon, EmailIcon } from '@/components/ProviderIcon';
import { EmailIcon as CentralEmailIcon, ChevronDownIcon, UsersIcon } from '@/components/icons';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ThemeTogglePill from '@/components/ThemeTogglePill';
import LegalFooter from '@/components/LegalFooter';
import { getUiLogoSrc } from '@/utils/brandLogo';
import { useTheme } from '@/hooks/useTheme';

/**
 * Auth section — full login card, provider icons, verification screens.
 *
 * The full login card is recreated statically to avoid the real Login
 * page's auto-auth logic and API calls. TelegramLoginButton is replaced
 * with StaticTelegramLoginButton (visual snapshot, no script/iframe/focus).
 */
export function AuthSection() {
  return (
    <PreviewSection
      id="auth"
      title="Auth"
      badge="phase 4"
      description="Полная карточка входа, иконки провайдеров, экраны верификации и сброса пароля"
    >
      {/* ─── Full Login Card ─── */}
      <SubGroup
        title="Login Card (полная)"
        hint="Реконструкция карточки входа целиком — брендинг, Telegram OIDC, OAuth, email форма"
      >
        <Snapshot label="login · login mode" description="вкладка «Вход», email форма развёрнута">
          <FullLoginCard mode="login" showEmailForm={true} />
        </Snapshot>

        <Snapshot
          label="login · register mode"
          description="вкладка «Регистрация» с name + confirm"
        >
          <FullLoginCard mode="register" showEmailForm={true} />
        </Snapshot>

        <Snapshot
          label="login · email collapsed"
          description="email форма свёрнута, только Telegram"
        >
          <FullLoginCard mode="login" showEmailForm={false} />
        </Snapshot>

        <Snapshot label="login · error" description="ошибка входа вверху карточки">
          <FullLoginCard mode="login" showEmailForm={true} error="Неверный email или пароль" />
        </Snapshot>

        <Snapshot
          label="login · check email"
          description="экран «проверьте почту» после регистрации"
        >
          <FullLoginCard
            mode="register"
            showEmailForm={true}
            registeredEmail="demo@proxykeys.net"
          />
        </Snapshot>

        <Snapshot label="login · forgot password" description="форма восстановления пароля">
          <FullLoginCard mode="login" showEmailForm={true} forgotPassword />
        </Snapshot>

        <Snapshot label="login · password short" description="валидация: пароль < 8 символов">
          <FullLoginCard
            mode="register"
            showEmailForm={true}
            passwordError="Пароль должен быть не менее 8 символов"
          />
        </Snapshot>

        <Snapshot label="login · referral banner" description="с реферальным кодом">
          <FullLoginCard mode="login" showEmailForm={false} referralCode="PKDEMO1001" />
        </Snapshot>
      </SubGroup>

      {/* ─── OAuthProviderIcon (only OAuth: google/yandex/discord/vk) ─── */}
      <SubGroup
        title="OAuthProviderIcon"
        hint="Только OAuth-провайдеры. Telegram и Email имеют отдельные иконки (см. ProviderIcon ниже)"
      >
        <Snapshot label="oauth icons · gallery" description="google, yandex, discord, vk">
          <div className="flex flex-wrap items-center gap-4 rounded-xl bg-gray-050 p-6 dark:bg-gray-950">
            {['google', 'yandex', 'discord', 'vk'].map((p) => (
              <div key={p} className="flex flex-col items-center gap-1.5">
                <OAuthProviderIcon provider={p} className="h-6 w-6" />
                <span className="text-[10px] text-dark-50/40">{p}</span>
              </div>
            ))}
          </div>
        </Snapshot>

        <Snapshot label="oauth · login row" description="как в карточке входа (с подписями)">
          <div className="flex items-stretch gap-2 rounded-xl bg-gray-050 p-6 dark:bg-gray-950">
            {[
              { name: 'google', display: 'Google' },
              { name: 'yandex', display: 'Yandex' },
              { name: 'discord', display: 'Discord' },
              { name: 'vk', display: 'VK' },
            ].map((p) => (
              <button
                key={p.name}
                className="flex flex-1 flex-col items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-gray-200/80 py-2.5 dark:border-gray-800 dark:bg-gray-800/80"
              >
                <OAuthProviderIcon provider={p.name} className="h-5 w-5" />
                <span className="text-[10px] leading-none text-dark-500">{p.display}</span>
              </button>
            ))}
          </div>
        </Snapshot>
      </SubGroup>

      {/* ─── ProviderIcon (telegram, email + OAuth) ─── */}
      <SubGroup
        title="ProviderIcon"
        hint="Объединённая иконка: telegram и email + OAuth провайдеры"
      >
        <Snapshot
          label="provider icon · gallery"
          description="telegram, email, google, yandex, discord, vk"
        >
          <div className="flex flex-wrap items-center gap-4 rounded-xl bg-gray-050 p-6 dark:bg-gray-950">
            <div className="flex flex-col items-center gap-1.5">
              <TelegramIcon className="h-6 w-6" />
              <span className="text-[10px] text-dark-50/40">telegram</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <EmailIcon className="h-6 w-6" />
              <span className="text-[10px] text-dark-50/40">email</span>
            </div>
            {['google', 'yandex', 'discord', 'vk'].map((p) => (
              <div key={p} className="flex flex-col items-center gap-1.5">
                <ProviderIcon provider={p} className="h-6 w-6" />
                <span className="text-[10px] text-dark-50/40">{p}</span>
              </div>
            ))}
          </div>
        </Snapshot>
      </SubGroup>

      {/* ─── VerifyEmail states (recreated) ─── */}
      <SubGroup
        title="VerifyEmail (screen states)"
        hint="loading / success / error — пересозданы статично (оригинал дёргает API на mount)"
      >
        <Snapshot label="verify · loading" description="спиннер, «проверяем…»">
          <VerifyEmailStaticState status="loading" />
        </Snapshot>

        <Snapshot label="verify · success" description="✓, «почта подтверждена»">
          <VerifyEmailStaticState status="success" />
        </Snapshot>

        <Snapshot label="verify · error" description="✗, «ссылка недействительна»">
          <VerifyEmailStaticState status="error" />
        </Snapshot>
      </SubGroup>

      {/* ─── ResetPassword states (recreated) ─── */}
      <SubGroup
        title="ResetPassword (screen states)"
        hint="form / success / error — пересозданы статично"
      >
        <Snapshot label="reset · form" description="форма ввода нового пароля">
          <ResetPasswordStaticState status="form" />
        </Snapshot>

        <Snapshot label="reset · success" description="✓, «пароль изменён»">
          <ResetPasswordStaticState status="success" />
        </Snapshot>

        <Snapshot label="reset · error" description="✗, «ошибка»">
          <ResetPasswordStaticState status="error" />
        </Snapshot>
      </SubGroup>
    </PreviewSection>
  );
}

/* ═══════════════════════════════════════════════════════════════════
 *  Full Login Card — static recreation of the Login page's auth card
 * ═══════════════════════════════════════════════════════════════════ */

function FullLoginCard({
  mode,
  showEmailForm,
  error,
  registeredEmail,
  forgotPassword,
  passwordError,
  referralCode,
}: {
  mode: 'login' | 'register';
  showEmailForm: boolean;
  error?: string;
  registeredEmail?: string;
  forgotPassword?: boolean;
  passwordError?: string;
  referralCode?: string;
}) {
  const { isDark } = useTheme();
  const logoUrl = getUiLogoSrc(isDark);
  const { t } = useTranslation();
  const [authMode, setAuthMode] = useState<'login' | 'register'>(mode);

  return (
    <div className="relative flex min-h-[500px] items-center justify-center bg-gray-050 px-4 py-8 dark:bg-gray-950 sm:px-6">
      {/* Language switcher + theme toggle — fixed corner, same as production Login.tsx */}
      <div className="absolute right-3 top-3 z-50 flex items-center gap-2">
        <ThemeTogglePill />
        <LanguageSwitcher />
      </div>
      <div className="relative w-full max-w-md space-y-5">
        {/* Logo & branding — minimal treatment, no card container (claude.com aesthetic).
            Logo is theme-aware (dark/light PNG variants, v1 pattern). */}
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 items-center justify-center overflow-hidden">
            <img src={logoUrl} alt="ProxyKeys" className="h-10 w-auto object-contain" />
          </div>
          {referralCode && (
            <div className="mt-3 rounded-xl border border-gray-200 bg-gray-250 p-2.5 dark:border-gray-800 dark:bg-gray-850">
              <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
                <UsersIcon className="h-4 w-4 flex-shrink-0" />
                <span className="text-xs font-medium">
                  Вас пригласили! Реферальный код: {referralCode}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Check Email Screen OR Main auth card */}
        {registeredEmail ? (
          <div className="card text-center dark:bg-gray-850">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-200 dark:bg-gray-950">
              <CentralEmailIcon className="h-7 w-7 text-success-400" />
            </div>
            <h2 className="mb-2 text-lg font-bold text-gray-900 dark:text-gray-050">
              {t('auth.checkEmail', 'Check your email')}
            </h2>
            <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
              {t('auth.verificationSent', 'We sent a verification link to:')}
            </p>
            <p className="mb-4 text-sm font-medium text-gray-800 dark:text-gray-200">
              {registeredEmail}
            </p>
            <p className="mb-5 text-xs text-gray-600 dark:text-gray-400">
              {t(
                'auth.clickLinkToVerify',
                'Click the link in the email to verify your account and log in.',
              )}
            </p>
            <button className="btn-secondary w-full">Back to login</button>
          </div>
        ) : (
          <div className="card dark:bg-gray-850">
            {/* Error banner — v1 soft glow */}
            {error && (
              <div
                role="alert"
                className="mb-4 rounded-xl border border-error-500/30 bg-error-500/10 px-4 py-2.5 text-sm text-error-400"
              >
                {error}
              </div>
            )}

            {/* Telegram auth section */}
            <div className="space-y-3">
              <div className="flex justify-center">
                <StaticTelegramLoginButton />
              </div>
            </div>

            {/* OAuth providers — compact icon row */}
            <div className="my-4 flex items-center gap-3">
              <div className="auth-divider h-px flex-1" />
              <span className="text-xs text-gray-500">{t('auth.or', 'or')}</span>
              <div className="auth-divider h-px flex-1" />
            </div>
            <div className="flex items-stretch gap-2">
              {[
                { name: 'google', display: 'Google' },
                { name: 'yandex', display: 'Yandex' },
                { name: 'discord', display: 'Discord' },
                { name: 'vk', display: 'VK' },
              ].map((p) => (
                <button
                  key={p.name}
                  type="button"
                  className="auth-secondary-surface flex flex-1 flex-col items-center justify-center gap-1.5 rounded-xl py-2.5 transition-all"
                  title={p.display}
                >
                  <OAuthProviderIcon provider={p.name} className="h-5 w-5" />
                  <span className="text-[10px] leading-none text-gray-500">{p.display}</span>
                </button>
              ))}
            </div>

            {/* Email auth section — collapsible */}
            <div className="my-4 flex items-center gap-3">
              <div className="auth-divider h-px flex-1" />
              <button
                type="button"
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                  showEmailForm ? 'auth-email-toggle-open' : 'auth-secondary-surface'
                }`}
              >
                <CentralEmailIcon className="h-3.5 w-3.5" />
                <span>{t('auth.loginWithEmail')}</span>
                <ChevronDownIcon
                  className={`h-3 w-3 transition-transform duration-300 ${showEmailForm ? 'rotate-180' : ''}`}
                />
              </button>
              <div className="auth-divider h-px flex-1" />
            </div>

            {/* Collapsible email form */}
            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                showEmailForm ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
              }`}
            >
              <div className="overflow-hidden">
                <div className="space-y-4 pb-1 pt-1">
                  {forgotPassword ? (
                    /* Forgot password form */
                    <div className="space-y-4">
                      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                        Введите email — мы отправим инструкции для сброса пароля
                      </p>
                      <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
                        <div>
                          <label className="label">Email</label>
                          <input
                            type="email"
                            required
                            className="input"
                            placeholder="you@example.com"
                            autoFocus
                          />
                        </div>
                        <button type="submit" className="btn-primary w-full py-2.5">
                          Отправить ссылку
                        </button>
                      </form>
                      <div className="text-center">
                        <button className="text-sm text-gray-600 transition-colors hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">
                          Назад
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Login / Register tabs — auth-segmented-* classes */}
                      <div className="auth-segmented-rail">
                        <button
                          type="button"
                          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                            authMode === 'login'
                              ? 'auth-segmented-item-active'
                              : 'auth-segmented-item'
                          }`}
                          onClick={() => setAuthMode('login')}
                        >
                          {t('auth.login')}
                        </button>
                        <button
                          type="button"
                          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                            authMode === 'register'
                              ? 'auth-segmented-item-active'
                              : 'auth-segmented-item'
                          }`}
                          onClick={() => setAuthMode('register')}
                        >
                          {t('auth.register', 'Register')}
                        </button>
                      </div>

                      {/* Email form */}
                      <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
                        {authMode === 'register' && (
                          <div>
                            <label className="label">{t('auth.firstName', 'First Name')}</label>
                            <input
                              type="text"
                              className="input"
                              placeholder={t('auth.firstNamePlaceholder', 'Your name (optional)')}
                            />
                          </div>
                        )}
                        <div>
                          <label className="label">{t('auth.email')}</label>
                          <input
                            type="email"
                            required
                            className="input"
                            placeholder="you@example.com"
                          />
                        </div>
                        <div>
                          <label className="label">{t('auth.password')}</label>
                          <input
                            type="password"
                            required
                            className="input"
                            placeholder="••••••••"
                          />
                          {passwordError && (
                            <p className="mt-1.5 text-xs text-error-400">{passwordError}</p>
                          )}
                        </div>
                        {authMode === 'register' && (
                          <div>
                            <label className="label">
                              {t('auth.confirmPassword', 'Confirm Password')}
                            </label>
                            <input
                              type="password"
                              required
                              className="input"
                              placeholder="••••••••"
                            />
                          </div>
                        )}
                        <button type="submit" className="btn-primary w-full py-2.5">
                          {authMode === 'login' ? t('auth.login') : t('auth.register', 'Register')}
                        </button>
                      </form>

                      {authMode === 'register' && (
                        <p className="text-center text-xs text-gray-600 dark:text-gray-400">
                          {t(
                            'auth.verificationEmailNotice',
                            'After registration, a verification email will be sent to your address',
                          )}
                        </p>
                      )}
                      {authMode === 'login' && (
                        <div className="text-center">
                          <button className="text-sm text-gray-600 transition-colors hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">
                            {t('auth.forgotPassword', 'Forgot password?')}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        <LegalFooter className="pt-1" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
 *  VerifyEmail / ResetPassword static states
 * ═══════════════════════════════════════════════════════════════════ */

function VerifyEmailStaticState({ status }: { status: 'loading' | 'success' | 'error' }) {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-[240px] items-center justify-center bg-gray-050 px-4 py-8 dark:bg-gray-950">
      <div className="w-full max-w-md text-center">
        {status === 'loading' && (
          <div>
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" />
            <h2 className="text-lg font-semibold text-dark-50">
              {t('emailVerification.verifying')}
            </h2>
            <p className="mt-2 text-sm text-dark-400">{t('emailVerification.pleaseWait')}</p>
          </div>
        )}
        {status === 'success' && (
          <div>
            <div className="mb-4 text-5xl text-success-500 sm:text-6xl">✓</div>
            <h2 className="text-lg font-semibold text-dark-50">{t('emailVerification.success')}</h2>
            <p className="mt-2 text-sm text-dark-400">
              {t('emailVerification.redirecting', 'Redirecting to dashboard...')}
            </p>
          </div>
        )}
        {status === 'error' && (
          <div>
            <div className="mb-4 text-5xl text-error-500 sm:text-6xl">✗</div>
            <h2 className="text-lg font-semibold text-dark-50">{t('emailVerification.failed')}</h2>
            <p className="mt-2 text-sm text-dark-400">
              {t('emailVerification.linkExpired', 'Verification link is invalid or expired')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ResetPasswordStaticState({ status }: { status: 'form' | 'success' | 'error' }) {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-[240px] items-center justify-center bg-gray-050 px-4 py-8 dark:bg-gray-950">
      <div className="w-full max-w-md text-center">
        {status === 'form' && (
          <div className="space-y-4 text-left">
            <h2 className="text-center text-lg font-semibold text-dark-50">
              {t('auth.resetPassword', 'Reset password')}
            </h2>
            <div>
              <label className="label">{t('auth.newPassword', 'New password')}</label>
              <input type="password" placeholder="••••••••" className="input w-full" readOnly />
            </div>
            <div>
              <label className="label">{t('auth.confirmPassword', 'Confirm password')}</label>
              <input type="password" placeholder="••••••••" className="input w-full" readOnly />
            </div>
            <button className="btn-primary w-full py-2.5">
              {t('auth.resetPassword', 'Reset password')}
            </button>
          </div>
        )}
        {status === 'success' && (
          <div>
            <div className="mb-4 text-5xl text-success-500 sm:text-6xl">✓</div>
            <h2 className="text-lg font-semibold text-dark-50">
              {t('auth.passwordChanged', 'Password changed')}
            </h2>
            <p className="mt-2 text-sm text-dark-400">
              {t('auth.passwordChangedHint', 'You can now log in with your new password')}
            </p>
          </div>
        )}
        {status === 'error' && (
          <div>
            <div className="mb-4 text-5xl text-error-500 sm:text-6xl">✗</div>
            <h2 className="text-lg font-semibold text-dark-50">
              {t('auth.resetFailed', 'Reset failed')}
            </h2>
            <p className="mt-2 text-sm text-dark-400">
              {t('emailVerification.linkExpired', 'Link is invalid or expired')}
            </p>
          </div>
        )}
      </div>
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
