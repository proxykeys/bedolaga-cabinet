/**
 * Shared button styling for connection blocks. The config-driven blocks
 * (BlockButtons) and the Happ TV quick-connect both render through this so the
 * latter adapts to exactly the same visual language as the styles coming from
 * the subscription-page config — no divergent one-off button styles.
 */
export function blockButtonClass(variant: 'light' | 'subtle', isLight?: boolean): string {
  if (variant === 'light') {
    return isLight
      ? 'rounded-xl border border-accent-500 px-4 py-2 text-sm font-medium text-accent-600 transition-all hover:bg-accent-500/10'
      : 'rounded-xl border border-accent-500 px-4 py-2 text-sm font-medium text-accent-500 transition-all hover:bg-gray-300 dark:hover:bg-gray-800';
  }
  return isLight
    ? 'rounded-xl px-3 py-1.5 text-sm font-medium text-dark-300 transition-all hover:bg-gray-300/30 dark:hover:bg-gray-800'
    : 'rounded-xl px-3 py-1.5 text-sm font-medium text-dark-300 transition-all hover:bg-gray-300/50 dark:hover:bg-gray-800';
}
