import { Link, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { initDataUser } from '@telegram-apps/sdk-react';

import { useAuthStore } from '@/store/auth';
import { displayName } from '@/utils/displayName';
import { useShallow } from 'zustand/shallow';
import { useTheme } from '@/hooks/useTheme';
import { usePlatform } from '@/platform';
import {
  brandingApi,
  getCachedBranding,
  setCachedBranding,
  preloadLogo,
  isLogoPreloaded,
} from '@/api/branding';
import { getUiLogoSrc } from '@/utils/brandLogo';
import { themeColorsApi } from '@/api/themeColors';
import { cn } from '@/lib/utils';

import LanguageSwitcher from '@/components/LanguageSwitcher';
import TicketNotificationBell from '@/components/TicketNotificationBell';

// Icons
import {
  HomeIcon,
  WalletIcon,
  UsersIcon,
  ChatIcon,
  UserIcon,
  LogoutIcon,
  GamepadIcon,
  ClipboardIcon,
  InfoIcon,
  CogIcon,
  WheelIcon,
  GiftIcon,
  MenuIcon,
  CloseIcon,
  SunIcon,
  MoonIcon,
} from './icons';

const FALLBACK_NAME = import.meta.env.VITE_APP_NAME || 'Cabinet';

import type { TelegramPlatform } from '@/hooks/useTelegramSDK';

interface AppHeaderProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  headerHeight: number;
  isFullscreen: boolean;
  safeAreaInset: { top: number; bottom: number; left: number; right: number };
  contentSafeAreaInset: { top: number; bottom: number; left: number; right: number };
  telegramPlatform?: TelegramPlatform;
  wheelEnabled?: boolean;
  referralEnabled?: boolean;
  hasContests?: boolean;
  hasPolls?: boolean;
  giftEnabled?: boolean;
}

export function AppHeader({
  mobileMenuOpen,
  setMobileMenuOpen,
  headerHeight,
  isFullscreen,
  safeAreaInset,
  contentSafeAreaInset,
  telegramPlatform,
  wheelEnabled,
  referralEnabled,
  hasContests,
  hasPolls,
  giftEnabled,
}: AppHeaderProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const { user, logout, isAdmin } = useAuthStore(
    useShallow((state) => ({ user: state.user, logout: state.logout, isAdmin: state.isAdmin })),
  );
  const { toggleTheme, isDark } = useTheme();
  const { haptic } = usePlatform();
  const [userPhotoUrl, setUserPhotoUrl] = useState<string | null>(null);
  const [logoLoaded, setLogoLoaded] = useState(() => isLogoPreloaded());

  // Branding
  const { data: branding } = useQuery({
    queryKey: ['branding'],
    queryFn: async () => {
      const data = await brandingApi.getBranding();
      setCachedBranding(data);
      await preloadLogo(data);
      return data;
    },
    initialData: getCachedBranding() ?? undefined,
    initialDataUpdatedAt: 0,
    staleTime: 60000,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  const appName = branding ? branding.name : FALLBACK_NAME;
  // Static theme-aware logo (v1 pattern) — operator's branding API logo
  // is intentionally ignored to preserve ProxyKeys identity.
  const logoUrl = getUiLogoSrc(isDark);

  // Theme toggle visibility
  const { data: enabledThemes } = useQuery({
    queryKey: ['enabled-themes'],
    queryFn: themeColorsApi.getEnabledThemes,
    staleTime: 1000 * 60 * 5,
  });
  const canToggle = enabledThemes?.dark && enabledThemes?.light;

  // Get user photo from Telegram
  useEffect(() => {
    try {
      const user = initDataUser();
      if (user?.photo_url) {
        setUserPhotoUrl(user.photo_url);
      }
    } catch {
      // Not in Telegram or init data not available
    }
  }, []);

  // Lock scroll when menu is open (works in iframe/Telegram Mini App)
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const preventDefault = (e: TouchEvent) => {
      // Allow scrolling inside menu content
      const target = e.target as HTMLElement;
      if (target.closest('.mobile-menu-content')) return;
      e.preventDefault();
    };

    document.addEventListener('touchmove', preventDefault, { passive: false });
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('touchmove', preventDefault);
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };
  const isAdminActive = () => location.pathname.startsWith('/admin');

  // ProxyKeys custom: пункт «Подписки» убран — главная (/) = подписка.
  const navItems = [
    { path: '/', label: t('nav.dashboard'), icon: HomeIcon },
    { path: '/balance', label: t('nav.balance'), icon: WalletIcon },
    ...(referralEnabled ? [{ path: '/referral', label: t('nav.referral'), icon: UsersIcon }] : []),
    { path: '/support', label: t('nav.support'), icon: ChatIcon },
    ...(hasContests ? [{ path: '/contests', label: t('nav.contests'), icon: GamepadIcon }] : []),
    ...(hasPolls ? [{ path: '/polls', label: t('nav.polls'), icon: ClipboardIcon }] : []),
    ...(wheelEnabled ? [{ path: '/wheel', label: t('nav.wheel'), icon: WheelIcon }] : []),
    ...(giftEnabled ? [{ path: '/gift', label: t('nav.gift'), icon: GiftIcon }] : []),
    { path: '/info', label: t('nav.info'), icon: InfoIcon },
  ];

  return (
    <>
      {/* Header - only on mobile. Solid bg (no .glass / opacity / shadow) using
          the same canonical gray tokens as the page (bg-gray-050 / dark:bg-gray-950),
          so the header matches the page background exactly — claude.com flat. */}
      <header
        className="fixed left-0 right-0 top-0 z-50 border-b border-gray-200 bg-gray-050 dark:border-gray-800 dark:bg-gray-950 xl:hidden"
        style={{
          paddingTop: isFullscreen
            ? `${Math.max(safeAreaInset.top, contentSafeAreaInset.top) + (telegramPlatform === 'android' ? 48 : 45)}px`
            : undefined,
        }}
      >
        <div
          className="mx-auto w-full px-4"
          onClick={() => mobileMenuOpen && setMobileMenuOpen(false)}
        >
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={cn('flex flex-shrink-0 items-center gap-2.5', !appName && 'mr-4')}
            >
              <div className="flex h-10 items-center overflow-hidden">
                <img
                  src={logoUrl}
                  alt={appName || 'Logo'}
                  className={cn(
                    'h-8 w-auto object-contain transition-opacity duration-200',
                    logoLoaded ? 'opacity-100' : 'opacity-0',
                  )}
                  onLoad={() => setLogoLoaded(true)}
                />
              </div>
              {appName && (
                <span className="whitespace-nowrap text-base font-semibold text-dark-100">
                  {appName}
                </span>
              )}
            </Link>

            {/* Right side */}
            <div className="flex items-center gap-1.5">
              {/* Theme toggle — pill slider (v1 pattern, same as Login page).
                  Uses global .login-header-control from src/styles/auth.css. */}
              {canToggle && (
                <button
                  onClick={() => {
                    haptic.impact('light');
                    toggleTheme();
                    setMobileMenuOpen(false);
                  }}
                  className="login-header-control relative flex h-10 w-[72px] items-center rounded-full px-1.5 transition-colors duration-200"
                  title={isDark ? t('theme.light') || 'Light mode' : t('theme.dark') || 'Dark mode'}
                  aria-label={
                    isDark ? t('theme.light') || 'Light mode' : t('theme.dark') || 'Dark mode'
                  }
                >
                  {/* Sliding knob */}
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
                  {/* Icons layer (non-interactive) */}
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
              )}

              <div onClick={() => setMobileMenuOpen(false)}>
                <TicketNotificationBell isAdmin={isAdminActive()} />
              </div>
              <div onClick={() => setMobileMenuOpen(false)}>
                <LanguageSwitcher />
              </div>

              {/* Mobile menu button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  haptic.impact('light');
                  setMobileMenuOpen(!mobileMenuOpen);
                }}
                className={`rounded-xl p-2.5 transition-all duration-200 ${
                  mobileMenuOpen
                    ? 'bg-gray-300 text-dark-100 dark:bg-gray-700'
                    : 'text-dark-300 hover:bg-gray-300 hover:text-dark-100 dark:hover:bg-gray-800'
                }`}
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  <CloseIcon className="h-6 w-6" />
                ) : (
                  <MenuIcon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-x-0 bottom-0 z-40 animate-fade-in xl:hidden"
          style={{ top: headerHeight }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-gray-1000/60"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Menu content */}
          <div
            className="mobile-menu-content absolute inset-x-0 bottom-0 top-0 overflow-y-auto overscroll-contain border-t border-gray-200/50 bg-gray-100/95 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] dark:border-gray-800/50 dark:bg-gray-900/95"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div className="mx-auto max-w-6xl px-4 py-4">
              {/* User info */}
              <div className="mb-4 flex items-center justify-between border-b border-gray-200/50 pb-4 dark:border-gray-800/50">
                <div className="flex items-center gap-3">
                  {userPhotoUrl ? (
                    <img
                      src={userPhotoUrl}
                      alt="Avatar"
                      className="h-10 w-10 rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full bg-gray-300 dark:bg-gray-700',
                      userPhotoUrl ? 'hidden' : '',
                    )}
                  >
                    <UserIcon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-dark-100">
                      {displayName(user)}
                    </div>
                    <div className="truncate text-xs text-dark-300">
                      @{user?.username || `ID: ${user?.telegram_id}`}
                    </div>
                  </div>
                </div>
              </div>

              {/* Nav items */}
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={isActive(item.path) ? 'nav-item-active' : 'nav-item'}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                ))}

                {isAdmin && (
                  <>
                    <div className="divider my-3" />
                    <div className="px-4 py-1 text-xs font-medium uppercase tracking-wider text-dark-300">
                      {t('admin.nav.title')}
                    </div>
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'nav-item',
                        isAdminActive()
                          ? 'bg-gray-250 text-warning-500 dark:bg-gray-850'
                          : 'text-warning-500',
                      )}
                    >
                      <CogIcon className="h-5 w-5" />
                      {t('admin.nav.title')}
                    </Link>
                  </>
                )}

                <div className="divider my-3" />

                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className={isActive('/profile') ? 'nav-item-active' : 'nav-item'}
                >
                  <UserIcon className="h-5 w-5" />
                  {t('nav.profile')}
                </Link>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="nav-item w-full text-error-500"
                >
                  <LogoutIcon className="h-5 w-5" />
                  {t('nav.logout')}
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
