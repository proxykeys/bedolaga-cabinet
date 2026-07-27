export type TrafficZone = 'normal' | 'warning' | 'danger' | 'critical';

export type TrafficColorKey = 'accent' | 'warning' | 'error';

interface TrafficZoneResult {
  zone: TrafficZone;
  textClass: string;
  dotClass: string;
  labelKey: string;
  /** Solid color value for the main zone color: `rgb(var(--color-accent-500))`.
   *  Anchored on shade-500 (the operator's verbatim hex), never a lighter
   *  shade or alpha-blended tint. */
  mainVar: string;
  /** Raw CSS variable reference for the main zone color: `var(--color-accent-500)`.
   *  Consumers that need to compose their own rgba() can use this; prefer
   *  `mainVar` (solid) wherever possible. */
  mainVarRaw: string;
  /** Key into ThemeColors for resolving mainHex at runtime */
  colorKey: TrafficColorKey;
}

const ZONES: Record<TrafficZone, Omit<TrafficZoneResult, 'zone'>> = {
  normal: {
    textClass: 'text-accent-500',
    dotClass: 'bg-accent-500',
    labelKey: 'dashboard.zone.normal',
    mainVar: 'rgb(var(--color-accent-500))',
    mainVarRaw: 'var(--color-accent-500)',
    colorKey: 'accent',
  },
  warning: {
    textClass: 'text-warning-500',
    dotClass: 'bg-warning-500',
    labelKey: 'dashboard.zone.warning',
    mainVar: 'rgb(var(--color-warning-500))',
    mainVarRaw: 'var(--color-warning-500)',
    colorKey: 'warning',
  },
  danger: {
    textClass: 'text-warning-500',
    dotClass: 'bg-warning-500',
    labelKey: 'dashboard.zone.danger',
    mainVar: 'rgb(var(--color-warning-500))',
    mainVarRaw: 'var(--color-warning-500)',
    colorKey: 'warning',
  },
  critical: {
    textClass: 'text-error-500',
    dotClass: 'bg-error-500',
    labelKey: 'dashboard.zone.critical',
    mainVar: 'rgb(var(--color-error-500))',
    mainVarRaw: 'var(--color-error-500)',
    colorKey: 'error',
  },
};

export function getTrafficZone(percent: number): TrafficZoneResult {
  let zone: TrafficZone;
  if (percent >= 90) zone = 'critical';
  else if (percent >= 75) zone = 'danger';
  else if (percent >= 50) zone = 'warning';
  else zone = 'normal';

  return { zone, ...ZONES[zone] };
}
