import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';
import { MoonIcon, SunIcon } from './layout/AppShell/icons';

/**
 * Pill-slider theme toggle (72px) — ported from bedolaga-cabinet-v1.
 *
 * Layout: two icons (Moon left, Sun right) with a sliding 28px knob.
 * The knob animates between `left-[7px]` (dark) and `left-[37px]` (light).
 *
 * Surface: `.login-header-control` class lives in src/styles/auth.css.
 * Inline style is used only for the knob background-color, which swaps
 * between the canonical dark/light backgrounds.
 */
export default function ThemeTogglePill() {
  const { t } = useTranslation();
  const { isDark, toggleTheme, canToggle } = useTheme();

  if (!canToggle) return null;

  const title = isDark ? t('theme.light') || 'Light mode' : t('theme.dark') || 'Dark mode';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="login-header-control relative flex h-10 w-[72px] items-center rounded-full px-1.5 transition-colors duration-200"
      title={title}
      aria-label={title}
    >
      {/* Sliding knob */}
      <div
        className={`absolute top-1/2 h-7 w-7 -translate-y-1/2 rounded-full border border-gray-600 transition-all duration-300 light:border-gray-400 ${
          isDark ? 'left-[7px]' : 'left-[37px]'
        }`}
        style={{
          backgroundColor: isDark ? 'rgb(var(--color-gray-950))' : 'rgb(var(--color-gray-050))',
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
  );
}
