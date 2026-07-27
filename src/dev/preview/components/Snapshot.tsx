import type { ReactNode } from 'react';

interface SnapshotProps {
  /** Short label describing the state being shown, e.g. "active, green zone" */
  label: string;
  /** Optional secondary description shown under the label */
  description?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Wrapper that renders a component instance with a caption describing
 * the state it represents.
 *
 * IMPORTANT: the component is rendered WITHOUT any wrapping background or
 * border so it looks byte-for-byte identical to production. The caption
 * sits above the component, separated by a thin divider. This preserves
 * real dimensions and proportions — cards that are full-width in prod
 * remain full-width here.
 */
export function Snapshot({ label, description, children, className = '' }: SnapshotProps) {
  return (
    <div className={`group ${className}`}>
      <div className="mb-2 flex items-baseline gap-2 px-1">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-accent-500">
          {label}
        </span>
        {description && <span className="text-[10px] text-dark-50/35">{description}</span>}
      </div>
      {children}
    </div>
  );
}
