import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';
import { ViewportFrame, type ViewportWidth } from './ViewportFrame';

export interface SectionMeta {
  id: string;
  title: string;
  badge?: string;
}

interface PreviewShellProps {
  sections: SectionMeta[];
  children: ReactNode;
}

/**
 * Layout shell for the UI preview page.
 *
 * Three global controls:
 * - Theme: dark / light  (writes localStorage + dispatches theme-changed event)
 * - Locale: ru / en      (i18n.changeLanguage)
 * - Viewport: 390px (iPhone) / 768px (tablet) / full
 *
 * Layout: sticky sidebar (nav) on the left (lg+), scrollable content on
 * the right wrapped in a ViewportFrame so components render at realistic
 * device widths.
 */
export function PreviewShell({ sections, children }: PreviewShellProps) {
  const { theme, toggleTheme } = useTheme();
  const { i18n } = useTranslation();
  const [viewport, setViewport] = useState<ViewportWidth>(0);

  const currentLocale = i18n.language?.startsWith('en') ? 'en' : 'ru';

  const viewportLabel: Record<ViewportWidth, string> = {
    390: '📱 390',
    768: '📲 768',
    0: '🖥 Full',
  };

  return (
    <div className="min-h-screen bg-gray-050 text-dark-50 dark:bg-gray-950">
      {/* ─── Top control bar ─── */}
      <header className="sticky top-0 z-50 border-b border-gray-200/50 bg-gray-050/90 backdrop-blur-xl dark:border-gray-800/50 dark:bg-gray-950/90">
        <div className="flex flex-wrap items-center gap-3 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="font-display text-sm font-bold tracking-tight text-accent-500">
              UI Preview
            </span>
            <span className="rounded border border-dark-50/15 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-dark-50/40">
              dev
            </span>
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            {/* Theme toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-lg border border-dark-50/15 bg-dark-50/5 px-3 py-1.5 font-mono text-[11px] font-medium transition-colors hover:bg-dark-50/10"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
            </button>

            {/* Locale toggle */}
            <button
              type="button"
              onClick={() => i18n.changeLanguage(currentLocale === 'ru' ? 'en' : 'ru')}
              className="rounded-lg border border-dark-50/15 bg-dark-50/5 px-3 py-1.5 font-mono text-[11px] font-medium transition-colors hover:bg-dark-50/10"
              aria-label="Toggle locale"
            >
              {currentLocale === 'ru' ? '🇷🇺 RU' : '🇬🇧 EN'}
            </button>

            {/* Viewport toggle */}
            <div className="flex overflow-hidden rounded-lg border border-dark-50/15">
              {([390, 768, 0] as ViewportWidth[]).map((w, i) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setViewport(w)}
                  className={`px-2.5 py-1.5 font-mono text-[11px] font-medium transition-colors ${
                    viewport === w
                      ? 'bg-accent-500 text-on-accent'
                      : 'bg-dark-50/5 text-dark-50/50 hover:bg-dark-50/10'
                  } ${i > 0 ? 'border-l border-dark-50/10' : ''}`}
                >
                  {viewportLabel[w]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ─── Body: sidebar + content ─── */}
      <div className="mx-auto flex max-w-[1600px] gap-6 px-4 py-6">
        {/* Sidebar nav — sticky, lg+ only */}
        <aside className="hidden w-52 flex-shrink-0 lg:block">
          <nav className="sticky top-16 space-y-0.5">
            <p className="mb-2 px-2 font-mono text-[10px] font-semibold uppercase tracking-widest text-dark-50/30">
              Sections
            </p>
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] text-dark-50/60 transition-colors hover:bg-dark-50/5 hover:text-dark-50"
              >
                <span className="truncate">{s.title}</span>
                {s.badge && (
                  <span className="ml-auto rounded border border-dark-50/15 px-1 py-px font-mono text-[8px] uppercase text-dark-50/30">
                    {s.badge}
                  </span>
                )}
              </a>
            ))}
          </nav>
        </aside>

        {/* Content — wrapped in ViewportFrame */}
        <main className="min-w-0 flex-1">
          <ViewportFrame width={viewport}>{children}</ViewportFrame>
        </main>
      </div>
    </div>
  );
}
