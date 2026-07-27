import { useTranslation } from 'react-i18next';
import { useTrafficZone } from '../../hooks/useTrafficZone';
import { formatTraffic } from '../../utils/formatTraffic';
import { useTheme } from '../../hooks/useTheme';
import { getGlassColors } from '../../utils/glassTheme';

interface TrafficProgressBarProps {
  usedGb: number;
  limitGb: number;
  percent: number;
  isUnlimited: boolean;
  compact?: boolean;
}

const THRESHOLDS = [50, 75, 90];

export default function TrafficProgressBar({
  usedGb: _usedGb,
  limitGb,
  percent,
  isUnlimited,
  compact = false,
}: TrafficProgressBarProps) {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const g = getGlassColors(isDark);
  const zone = useTrafficZone(percent);

  // Flat solid fill color per claude.com aesthetic (no gradient).
  const fillColor = zone.mainVar;
  const clampedPercent = Math.min(percent, 100);
  const barHeight = compact ? 8 : 14;

  if (isUnlimited) {
    return (
      <div role="progressbar" aria-label={t('dashboard.unlimited')}>
        {/* Unlimited bar — flat solid fill */}
        <div
          className="relative overflow-hidden"
          style={{
            height: barHeight,
            borderRadius: 10,
            background: g.trackBg,
            border: `1px solid ${g.trackBorder}`,
          }}
        >
          <div className="absolute inset-0" style={{ background: zone.mainVar }} />
        </div>
      </div>
    );
  }

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(clampedPercent)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${t('subscription.traffic')}: ${clampedPercent.toFixed(1)}%`}
    >
      {/* Track */}
      <div
        className="relative overflow-hidden"
        style={{
          height: barHeight,
          borderRadius: 10,
          background: g.trackBg,
          border: `1px solid ${g.trackBorder}`,
        }}
      >
        {/* Fill bar — scaleX (compositor) instead of width (layout reflow).
            Flat solid fill per claude.com aesthetic. */}
        <div
          className="absolute bottom-0 left-0 top-0 w-full origin-left"
          style={{
            transform: `scaleX(${clampedPercent / 100})`,
            background: fillColor,
            borderRadius: 10,
            transition: 'transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />

        {/* Threshold markers */}
        {THRESHOLDS.map((threshold) => (
          <div
            key={threshold}
            className="absolute bottom-0 top-0"
            style={{
              left: `${threshold}%`,
              width: 1,
              background: g.textGhost,
            }}
            aria-hidden="true"
          />
        ))}
      </div>

      {/* Scale labels */}
      {!compact && limitGb > 0 && (
        <div
          className="mt-1.5 flex justify-between px-0.5 font-mono text-xs font-medium text-dark-300"
          aria-hidden="true"
        >
          {[0, 25, 50, 75, 100].map((v) => (
            <span key={v}>{formatTraffic((limitGb * v) / 100)}</span>
          ))}
        </div>
      )}
    </div>
  );
}
