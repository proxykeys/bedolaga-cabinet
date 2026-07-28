import type { ReactNode, Ref } from 'react';
import { motion } from 'framer-motion';
import { scale, scaleTransition, slideUp, slideUpTransition } from '../motion/transitions';
import { cn } from '@/lib/utils';

export type BlockingAccent = 'warning' | 'error' | 'info';

/**
 * Per-accent class recipe. `info` maps to the theme accent-* scale (default
 * blue). Colors are theme-driven CSS vars (RGB triples), never hardcoded hex.
 */
const accentMap: Record<BlockingAccent, { iconColor: string; dot: string }> = {
  warning: { iconColor: 'text-warning-500', dot: 'bg-warning-500' },
  error: { iconColor: 'text-error-500', dot: 'bg-error-500' },
  info: { iconColor: 'text-accent-500', dot: 'bg-accent-500' },
};

interface BlockingShellProps {
  /** Unique id wired to aria-labelledby (e.g. 'maintenance-title'). */
  titleId: string;
  accent: BlockingAccent;
  /** Rendered icon element (sized by the caller, e.g. <WrenchIcon className="h-9 w-9" />). */
  icon: ReactNode;
  /** Already-translated title. */
  title: string;
  description?: ReactNode;
  /** Per-screen body: reason cards, channel list, error block. */
  children?: ReactNode;
  /** CTA area — pass canonical <Button> elements. */
  actions?: ReactNode;
  /** Hint / contact-support line under the card. */
  footer?: ReactNode;
  /** Accent-tinted "working" dots, for screens that actively wait/poll. */
  pulse?: boolean;
  /** 'polite' for screens whose state changes (retry/error) should announce. */
  ariaLive?: 'polite' | 'off';
  /** Focus-trap ref — owned by the caller so each screen keeps its own trap. */
  screenRef: Ref<HTMLDivElement>;
}

/**
 * Shared premium shell for every full-screen blocking/status state: an opaque
 * dark canvas with a self-contained accent glow, a centered glass card, and a
 * gradient-ringed icon medallion. Replaces the old flat grey-circle + three
 * raw dots look. Behavior (focus trap, aria, actions) is supplied by each
 * screen; this component owns only the visual chrome.
 */
export default function BlockingShell({
  titleId,
  accent,
  icon,
  title,
  description,
  children,
  actions,
  footer,
  pulse = false,
  ariaLive = 'off',
  screenRef,
}: BlockingShellProps) {
  const a = accentMap[accent];

  return (
    <div
      ref={screenRef}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      className="fixed inset-0 z-[100] overflow-y-auto bg-gray-050 dark:bg-gray-950"
    >
      {/* Scroll-safe centering: min-h-full + items-center centers when it fits
           and scrolls without clipping the top when content is tall. */}
      <div className="relative flex min-h-full items-center justify-center p-6">
        <motion.div
          variants={scale}
          initial="initial"
          animate="animate"
          transition={scaleTransition}
          aria-live={ariaLive === 'polite' ? 'polite' : undefined}
          aria-atomic={ariaLive === 'polite' ? true : undefined}
          className="relative w-full max-w-md overflow-hidden rounded-[var(--bento-radius)] border border-gray-200/40 bg-gray-100 p-8 text-center dark:border-gray-800/40 dark:bg-gray-900 sm:p-10"
        >
          {/* Icon medallion — flat circle with accent-colored icon */}
          <motion.div
            variants={slideUp}
            initial="initial"
            animate="animate"
            transition={slideUpTransition}
            className="mb-6 flex justify-center"
          >
            <span
              className={cn('relative flex h-20 w-20 items-center justify-center', a.iconColor)}
            >
              {icon}
            </span>
          </motion.div>

          <h1 id={titleId} className="font-display text-2xl font-bold tracking-tight text-dark-50">
            {title}
          </h1>
          {description && (
            <p className="mt-3 text-base leading-relaxed text-dark-300">{description}</p>
          )}

          {children && <div className="mt-6 space-y-3 text-left">{children}</div>}

          {actions && <div className="mt-7 flex flex-col gap-3">{actions}</div>}

          {pulse && (
            <div aria-hidden className="mt-7 flex items-center justify-center gap-1.5">
              <span
                className={cn('h-1.5 w-1.5 animate-pulse rounded-full', a.dot)}
                style={{ animationDelay: '0ms' }}
              />
              <span
                className={cn('h-1.5 w-1.5 animate-pulse rounded-full', a.dot)}
                style={{ animationDelay: '300ms' }}
              />
              <span
                className={cn('h-1.5 w-1.5 animate-pulse rounded-full', a.dot)}
                style={{ animationDelay: '600ms' }}
              />
            </div>
          )}

          {footer && <p className="mt-6 text-sm text-dark-300">{footer}</p>}
        </motion.div>
      </div>
    </div>
  );
}
