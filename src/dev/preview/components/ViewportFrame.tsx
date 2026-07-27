import type { ReactNode } from 'react';

export type ViewportWidth = 390 | 768 | 0; // 0 = full desktop

interface ViewportFrameProps {
  width: ViewportWidth;
  children: ReactNode;
  className?: string;
}

/**
 * Renders children inside a frame that EXACTLY mirrors the production
 * `<main>` from AppShell.tsx:
 *
 *   <main className="mx-auto max-w-6xl px-4 py-6 pb-28 lg:px-6 lg:pb-8">
 *
 * On full desktop (width=0): max-w-6xl (1152px) + lg:px-6 (48px) → content 1104px
 * On 390/768: constrained width + px-4 (32px) → content = width - 32px
 *
 * Tailwind responsive classes (lg:) key off the BROWSER window, not the
 * container, so we can't use them to emulate mobile. Instead we pick
 * fixed padding based on the selected viewport.
 */
export function ViewportFrame({ width, children, className = '' }: ViewportFrameProps) {
  if (width === 0) {
    // Full desktop — exact copy of AppShell main: max-w-6xl + lg:px-6
    return <div className={`mx-auto max-w-6xl px-6 py-6 pb-8 ${className}`}>{children}</div>;
  }

  // Fixed device width — emulates phone/tablet screen.
  // px-4 (not px-6) because 390/768 < lg breakpoint in production.
  return (
    <div
      className={`mx-auto px-4 py-6 pb-8 ${className}`}
      style={{ maxWidth: `${width}px`, width: '100%' }}
      data-viewport={width}
    >
      {children}
    </div>
  );
}
