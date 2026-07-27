/**
 * Theme-aware surface color tokens — gray-* based (1:1 with claude.com
 * bg-bg-100/200/300/400 surface hierarchy, tuned for stronger resting contrast).
 *
 * The gray-* palette is NOT subject to the `.light` palette swap (see
 * globals.css comment on gray palette) — it stays stable across themes.
 * This is why surface backgrounds MUST branch on isDark here, unlike text
 * colors which go through the dark-* CSS variables (auto-inverted by .light).
 *
 * Hierarchy mapping (stronger delta than claude.com defaults for clearer
 * resting-state separation between card and clickable elements):
 *   body bg       gray-050  (light) / gray-950  (dark)
 *   card          gray-100  (light) / gray-900  (dark)
 *   raised        gray-250  (light) / gray-750  (dark)  ← clickable inside card
 *   hover         gray-300  (light) / gray-700  (dark)
 *   border        gray-200  (light) / gray-800  (dark)
 *   border hover  gray-300  (light) / gray-700  (dark)
 *
 * Light→dark delta is ~22 RGB units for raised (was ~6 with gray-150 — too
 * subtle, now ~22 with gray-250 — clearly perceptible at rest).
 */
export function getGlassColors(isDark: boolean) {
  return {
    // Card container — flat solid surface.
    cardBg: isDark ? 'rgb(26, 25, 24)' : 'rgb(245, 244, 239)', // gray-900 / gray-100
    cardBorder: isDark ? 'rgb(38, 38, 36)' : 'rgb(231, 231, 223)', // gray-800 / gray-200

    // Inner sections (raised — clickable elements inside a card)
    // Dark uses gray-850 (delta 10 from card) — was gray-750 (delta 45, too light)
    innerBg: isDark ? 'rgb(31, 30, 29)' : 'rgb(221, 221, 212)', // gray-850 / gray-250
    innerBorder: isDark ? 'rgb(38, 38, 36)' : 'rgb(231, 231, 223)', // gray-800 / gray-200

    // Hover states
    hoverBg: isDark ? 'rgb(38, 38, 36)' : 'rgb(208, 208, 200)', // gray-800 / gray-300
    hoverBorder: isDark ? 'rgb(38, 38, 36)' : 'rgb(208, 208, 200)', // gray-800 / gray-300

    // Text — literal colors, NOT CSS variables (these don't swap in .light)
    // Opacity tuned for WCAG AA contrast against card backgrounds in both themes.
    text: isDark ? '#fff' : '#1a1a2e',
    textSecondary: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
    textMuted: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)',
    textFaint: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)',
    textGhost: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',

    // Progress bar track — same as inner surface
    trackBg: isDark ? 'rgb(31, 30, 29)' : 'rgb(221, 221, 212)', // gray-850 / gray-250
    trackBorder: isDark ? 'rgb(38, 38, 36)' : 'rgb(231, 231, 223)', // gray-800 / gray-200

    // Code blocks
    codeBg: isDark ? 'rgb(31, 30, 29)' : 'rgb(221, 221, 212)', // gray-850 / gray-250
    codeBorder: isDark ? 'rgb(38, 38, 36)' : 'rgb(231, 231, 223)', // gray-800 / gray-200

    // Glow effects — disabled
    glowAlpha: '00',

    // Shadows — flat
    shadow: 'none',
  };
}
