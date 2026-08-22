import { Link, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';
import { usePlatform } from '@/platform';

// Icons
import { HomeIcon, WalletIcon, UsersIcon, ChatIcon, WheelIcon } from './icons';

interface MobileBottomNavProps {
  isKeyboardOpen: boolean;
  referralEnabled?: boolean;
  wheelEnabled?: boolean;
}

export function MobileBottomNav({
  isKeyboardOpen,
  referralEnabled,
  wheelEnabled,
}: MobileBottomNavProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const { haptic } = usePlatform();

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  // Core navigation items for bottom bar.
  //
  // Support is ALWAYS present — frustrated paying customers must find help
  // in the primary nav, not in the hamburger drawer. Previously Wheel
  // (a brand-moment surface) displaced Support (a critical-path surface)
  // when the wheel feature flag was on; that trade is hostile to the
  // support-user persona and was flagged by the /impeccable critique.
  //
  // Slot priority when both Wheel and Referral are enabled and only
  // four slots remain after Dashboard / Balance / Support:
  //   - Wheel wins (operator opted in as a deliberate brand moment)
  //   - Referral falls back to the hamburger drawer
  // When only one of them is enabled, that one fills the slot.
  //
  // ProxyKeys custom: пункт «Подписки» убран — главная (/) = подписка.
  const coreItems = [
    { path: '/', label: t('nav.dashboard'), icon: HomeIcon },
    { path: '/balance', label: t('nav.balance'), icon: WalletIcon },
    ...(wheelEnabled
      ? [{ path: '/wheel', label: t('nav.wheel'), icon: WheelIcon }]
      : referralEnabled
        ? [{ path: '/referral', label: t('nav.referral'), icon: UsersIcon }]
        : []),
    { path: '/support', label: t('nav.support'), icon: ChatIcon },
  ];

  const handleNavClick = () => {
    haptic.impact('light');
  };

  return (
    <nav
      className={cn(
        'fixed z-50 transition-all duration-200 hdr:hidden',
        'bg-gray-100/95 backdrop-blur-linear dark:bg-gray-900/95',
        'border border-gray-200/30 dark:border-gray-800/30',
        isKeyboardOpen ? 'pointer-events-none opacity-0' : 'opacity-100',
      )}
      style={{
        bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
        left: '16px',
        right: '16px',
        borderRadius: 'var(--bento-radius, 24px)',
        padding: '8px 4px',
        boxShadow: 'none',
      }}
    >
      <div className="flex justify-around">
        {coreItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={handleNavClick}
            className={cn(
              'relative flex min-w-[56px] flex-1 shrink-0 flex-col items-center justify-center rounded-2xl px-3 py-2.5 transition-all duration-200',
              isActive(item.path) ? 'text-accent-500' : 'text-dark-300 hover:text-dark-200',
            )}
          >
            {isActive(item.path) && (
              <motion.div
                layoutId="bottom-nav-active"
                className="absolute inset-0 rounded-2xl bg-gray-250 dark:bg-gray-850"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
            <item.icon className="relative z-10 h-5 w-5" />
            <span className="relative z-10 mt-1 whitespace-nowrap text-xs">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
