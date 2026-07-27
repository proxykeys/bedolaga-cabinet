import logoDark from '@/assets/brand/logo-dark.png';
import logoLight from '@/assets/brand/logo-light.png';

/**
 * Returns the static brand logo URL for the current theme.
 *
 * Ported from bedolaga-cabinet-v1. The two PNG assets are committed to
 * src/assets/brand/ and switched by theme — no branding API dependency,
 * so the correct logo renders on first paint (no FOUC, no network fetch).
 *
 * Used by Login.tsx and any auth-related screen where the operator's
 * custom branding API logo should NOT override the ProxyKeys identity.
 */
export function getUiLogoSrc(isDark: boolean): string {
  return isDark ? logoDark : logoLight;
}
