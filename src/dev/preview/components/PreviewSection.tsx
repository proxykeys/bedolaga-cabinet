import type { ReactNode } from 'react';

interface PreviewSectionProps {
  /** DOM id for anchor navigation */
  id: string;
  /** Display title */
  title: string;
  /** Optional short description of what the section covers */
  description?: string;
  /** Optional badge: phase number, status, etc. */
  badge?: string;
  children: ReactNode;
}

/**
 * A labeled section within the preview page. Each section groups all
 * visual states of a category of components (Dashboard cards, auth forms,
 * primitives, etc.). The id is used by the sidebar for anchor navigation.
 */
export function PreviewSection({ id, title, description, badge, children }: PreviewSectionProps) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-dark-50/5 py-10 first:border-t-0">
      <header className="mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold tracking-tight text-dark-50">{title}</h2>
          {badge && (
            <span className="rounded-md bg-accent-500 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-black">
              {badge}
            </span>
          )}
        </div>
        {description && <p className="mt-1 text-sm text-dark-50/40">{description}</p>}
      </header>
      {children}
    </section>
  );
}
