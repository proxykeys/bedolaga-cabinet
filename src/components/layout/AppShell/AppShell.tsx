import { useState } from 'react';
import { useLocation, Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

import { useAuthStore } from '@/store/auth';
import { useHaptic } from '@/platform';
import { useTelegramSDK } from '@/hooks/useTelegramSDK';
import { useHeaderHeight } from '@/hooks/useHeaderHeight';
import { useTheme } from '@/hooks/useTheme';
import { useBranding } from '@/hooks/useBranding';
import { getUiLogoSrc } from '@/utils/brandLogo';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { useScrollRestoration } from '@/hooks/useScrollRestoration';
import { themeColorsApi } from '@/api/themeColors';
import { cn } from '@/lib/utils';

import WebSocketNotifications from '@/components/WebSocketNotifications';
import CampaignBonusNotifier from '@/components/CampaignBonusNotifier';
import SuccessNotificationModal from '@/components/SuccessNotificationModal';
import { PromptDialogHost } from '@/components/PromptDialogHost';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import TicketNotificationBell from '@/components/TicketNotificationBell';
import {
  SubscriptionIcon,
  GiftIcon,
  HomeIcon,
  CreditCardIcon,
  ChatIcon,
  UserIcon,
  UsersIcon,
  ShieldIcon,
  InfoIcon,
  LogoutIcon,
  SunIcon,
  MoonIcon,
} from '@/components/icons';

import { AppHeader } from './AppHeader';
import { useBackgroundConsumer } from '@/components/backgrounds/BackgroundHost';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const logout = useAuthStore((state) => state.logout);
  const { isFullscreen, safeAreaInset, contentSafeAreaInset, platform, isMobile } =
    useTelegramSDK();
  const { mobile: headerHeight } = useHeaderHeight();
  const haptic = useHaptic();
  const { toggleTheme, isDark } = useTheme();

  // Extracted hooks
  const { appName } = useBranding();
  const logoUrl = getUiLogoSrc(isDark);
  const { referralEnabled, wheelEnabled, hasContests, hasPolls, giftEnabled } = useFeatureFlags();
  useScrollRestoration();
  // Анимированный фон рендерит BackgroundHost в App (не перемонтируется при
  // смене роута) — здесь только регистрируем, что на этом роуте он нужен.
  useBackgroundConsumer();

  // Theme toggle visibility
  const { data: enabledThemes } = useQuery({
    queryKey: ['enabled-themes'],
    queryFn: themeColorsApi.getEnabledThemes,
    staleTime: 1000 * 60 * 5,
  });
  const canToggleTheme = enabledThemes?.dark && enabledThemes?.light;

  // Only apply fullscreen UI adjustments on mobile Telegram (iOS/Android)
  const isMobileFullscreen = isFullscreen && isMobile;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Desktop navigation — labels always visible (no hover-reveal gimmick)
  const desktopNav = [
    { path: '/', label: t('nav.dashboard'), icon: HomeIcon },
    { path: '/subscriptions', label: t('nav.subscription'), icon: SubscriptionIcon },
    { path: '/balance', label: t('nav.balance'), icon: CreditCardIcon },
    ...(referralEnabled ? [{ path: '/referral', label: t('nav.referral'), icon: UsersIcon }] : []),
    ...(giftEnabled ? [{ path: '/gift', label: t('nav.gift'), icon: GiftIcon }] : []),
    { path: '/support', label: t('nav.support'), icon: ChatIcon },
    { path: '/info', label: t('nav.info'), icon: InfoIcon },
    { path: '/profile', label: t('nav.profile'), icon: UserIcon },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleNavClick = () => {
    haptic.impact('light');
  };

  // A single elegant nav link: icon + label always visible, with a shared
  // framer-motion pill that slides to the active item on navigation.
  const renderNavLink = (
    path: string,
    label: string,
    Icon: React.ComponentType<{ className?: string }>,
    admin = false,
  ) => {
    const active = admin ? location.pathname.startsWith('/admin') : isActive(path);
    return (
      <Link
        key={path}
        to={path}
        onClick={handleNavClick}
        aria-label={label}
        className={cn(
          'relative flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium transition-colors duration-200',
          active
            ? admin
              ? 'text-warning-500'
              : 'text-dark-50'
            : admin
              ? 'text-warning-500 hover:bg-gray-300 hover:text-warning-300 dark:hover:bg-gray-700'
              : 'text-dark-300 hover:bg-gray-300 hover:text-dark-100 dark:hover:bg-gray-700',
        )}
      >
        {active && (
          <motion.span
            layoutId="desktop-nav-active"
            className={cn(
              // Подсветка-пилюля активного пункта — унифицирована с .login-header-control
              'absolute inset-0 rounded-xl',
              admin
                ? 'bg-gray-250 ring-1 ring-warning-500 dark:bg-gray-850'
                : 'bg-gray-300 dark:bg-gray-700',
            )}
            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
          />
        )}
        <Icon className="relative h-4 w-4 shrink-0" />
        <span className="relative whitespace-nowrap">{label}</span>
      </Link>
    );
  };

  // headerHeight comes from useHeaderHeight() — accounts for TG safe area in fullscreen

  return (
    <div className="min-h-viewport">
      {/* Global components */}
      <WebSocketNotifications />
      <CampaignBonusNotifier />
      <SuccessNotificationModal />
      <PromptDialogHost />

      {/* Desktop Header */}
      {/* w-screen вместо left-0 right-0: right-0 упирается в край вьюпорта БЕЗ
          скроллбара, и капсула по центру прыгала бы на полширины скроллбара при
          переходах между страницами со скроллом и без. 100vw даёт ту же ось
          центрирования, что и у body (тоже 100vw). */}
      <header className="fixed left-0 top-0 z-50 hidden w-screen border-b border-gray-200 bg-gray-050 dark:border-gray-800 dark:bg-gray-950 xl:block">
        {/* 3-зонный grid: лого | капсула | действия. Колонки 1fr_auto_1fr держат
            капсулу строго по центру вьюпорта НЕЗАВИСИМО от ширины лого/действий,
            а действия — у правого края. Поэтому ничего не «скачет» при переходах
            (в т.ч. в админку): смена ширины в одной зоне не двигает другие. */}
        <div className="mx-auto grid h-16 max-w-[1600px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-4">
          {/* Logo */}
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2.5 justify-self-start"
            onClick={handleNavClick}
          >
            <div className="flex h-10 items-center overflow-hidden">
              <img src={logoUrl} alt={appName || 'Logo'} className="h-8 w-auto object-contain" />
            </div>
            <span className="text-base font-semibold text-dark-100">{appName}</span>
          </Link>

          {/* Navigation — единая «капсула» (segmented control): все пункты видны
              всегда, без скролла/сжатия/сворачивания. Центрируется средней
              колонкой grid (justify-self-center), а не auto-margin'ами. */}
          <nav className="flex items-center gap-0.5 justify-self-center">
            {desktopNav.map((item) => renderNavLink(item.path, item.label, item.icon))}
            {isAdmin && (
              <>
                <div className="mx-1 h-5 w-px shrink-0 bg-gray-300/60 dark:bg-gray-700/60" />
                {renderNavLink('/admin', t('admin.nav.title'), ShieldIcon, true)}
              </>
            )}
          </nav>

          {/* Right side actions — правая колонка grid, прижата к краю, не сжимается */}
          <div className="flex shrink-0 items-center gap-2 justify-self-end">
            {/* Theme toggle — pill slider (v1 pattern, same as Login/Mobile).
                Uses global .login-header-control from src/styles/auth.css.
                `invisible` сохраняет слот в grid-разметке, чтобы nav-капсула
                по центру не прыгала при canToggle=false. */}
            <button
              onClick={() => {
                haptic.impact('light');
                toggleTheme();
              }}
              className={cn(
                'login-header-control relative flex h-10 w-[72px] items-center rounded-full px-1.5 transition-colors duration-200',
                !canToggleTheme && 'pointer-events-none invisible',
              )}
              title={isDark ? t('theme.light') || 'Light mode' : t('theme.dark') || 'Dark mode'}
              aria-label={
                isDark ? t('theme.light') || 'Light mode' : t('theme.dark') || 'Dark mode'
              }
            >
              <div
                className={`absolute top-1/2 h-7 w-7 -translate-y-1/2 rounded-full border border-gray-600 transition-all duration-300 light:border-gray-400 ${
                  isDark ? 'left-[7px]' : 'left-[37px]'
                }`}
                style={{
                  backgroundColor: isDark
                    ? 'rgb(var(--color-gray-950))'
                    : 'rgb(var(--color-gray-050))',
                }}
              />
              <div className="pointer-events-none absolute inset-0 z-10">
                <div
                  className={`absolute left-[11px] top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center transition-colors duration-300 ${
                    isDark ? 'text-gray-100' : 'text-gray-500'
                  }`}
                >
                  <MoonIcon className="h-4 w-4" />
                </div>
                <div
                  className={`absolute left-[41px] top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center transition-colors duration-300 ${
                    isDark ? 'text-gray-500' : 'text-gray-900'
                  }`}
                >
                  <SunIcon className="h-4 w-4" />
                </div>
              </div>
            </button>
            <TicketNotificationBell isAdmin={location.pathname.startsWith('/admin')} />
            <LanguageSwitcher />
            <button
              onClick={() => {
                haptic.impact('light');
                logout();
              }}
              className="login-header-control rounded-xl p-2 transition-colors duration-200"
              title={t('nav.logout')}
            >
              <LogoutIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <AppHeader
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        headerHeight={headerHeight}
        isFullscreen={isMobileFullscreen}
        safeAreaInset={safeAreaInset}
        contentSafeAreaInset={contentSafeAreaInset}
        telegramPlatform={platform}
        wheelEnabled={wheelEnabled}
        referralEnabled={referralEnabled}
        hasContests={hasContests}
        hasPolls={hasPolls}
        giftEnabled={giftEnabled}
      />

      {/* Desktop spacer */}
      <div className="hidden h-16 xl:block" />

      {/* Mobile spacer */}
      <div className="xl:hidden" style={{ height: headerHeight }} />

      {/* Main content */}
      <main className="mx-auto max-w-6xl px-4 py-6 pb-8 xl:px-6 xl:pb-8">{children}</main>
    </div>
  );
}
