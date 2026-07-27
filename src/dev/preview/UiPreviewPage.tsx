import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router';
import { seedAuthStore, suppressBlocking } from './mocks/stores';
import { seedPreviewQueries } from './previewClient';
import { PreviewShell, type SectionMeta } from './components/PreviewShell';
import { DashboardSection } from './sections/DashboardSection';
import { SubscriptionSection } from './sections/SubscriptionSection';
import { AuthSection } from './sections/AuthSection';
import { PrimitivesSection } from './sections/PrimitivesSection';
import { FeedbackSection } from './sections/FeedbackSection';
import { MiscSection } from './sections/MiscSection';
import { PagesSubscriptionSection } from './sections/PagesSubscriptionSection';
import { PagesBalanceSection, PagesSupportSection } from './sections/PagesBalanceSupportSection';
import {
  PagesProfileReferralSection,
  PagesResultsSection,
} from './sections/PagesProfileReferralSection';
import { PagesConnectionSection } from './sections/PagesConnectionSection';

/**
 * Development-only UI preview page.
 *
 * Renders every cabinet component across all its visual states so the
 * UI can be audited without hunting through real pages or triggering
 * edge-case backend conditions.
 *
 * Architecture:
 * - Lives inside the real app's provider stack (PlatformProvider,
 *   ThemeColorsProvider, ToastProvider, etc.) so components render under
 *   production-accurate conditions.
 * - Seeds the app's TOP-LEVEL QueryClient directly (NOT a nested provider)
 *   so that outer providers like ThemeColorsProvider also see the seeded
 *   data — preventing theme-color flicker and backend fetches.
 * - Suppresses useBlockingStore so health-check failures don't flash
 *   the ServiceUnavailableScreen.
 * - Seeds useAuthStore with a mock user on mount; restores on unmount.
 *
 * Route: /dev/ui-preview  (DEV-only, gated in App.tsx)
 */
export default function UiPreviewPage() {
  const queryClient = useQueryClient();

  // Seed global stores + query cache; restore on unmount
  useEffect(() => {
    // Prevent browser scroll restoration from jumping to a saved position
    // (the preview page is very long and the browser remembers scroll offset)
    history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);

    const restoreAuth = seedAuthStore();
    const restoreBlocking = suppressBlocking();
    const restoreQueries = seedPreviewQueries(queryClient);

    return () => {
      restoreQueries();
      restoreBlocking();
      restoreAuth();
    };
  }, [queryClient]);

  const sections: SectionMeta[] = [
    { id: 'dashboard', title: 'Dashboard', badge: 'done' },
    { id: 'subscription', title: 'Subscription', badge: 'done' },
    { id: 'auth', title: 'Auth', badge: 'done' },
    { id: 'primitives', title: 'Primitives', badge: 'done' },
    { id: 'feedback', title: 'Feedback', badge: 'done' },
    { id: 'misc', title: 'Misc', badge: 'done' },
    { id: 'sub-page', title: 'Sub Page', badge: 'page' },
    { id: 'balance-page', title: 'Balance Page', badge: 'page' },
    { id: 'support-page', title: 'Support Page', badge: 'page' },
    { id: 'profile-referral', title: 'Profile/Referral', badge: 'page' },
    { id: 'results-page', title: 'Results', badge: 'page' },
    { id: 'connection-page', title: 'Connection', badge: 'page' },
  ];

  return (
    <PreviewShell sections={sections}>
      {/* ─── Intro ─── */}
      <div className="mb-8 rounded-2xl border border-accent-500 bg-gray-200 p-5 dark:bg-gray-800">
        <h1 className="text-2xl font-bold tracking-tight text-dark-50">
          UI Preview — ProxyKeys Cabinet
        </h1>
        <p className="mt-1.5 text-sm text-dark-50/50">
          Все компоненты кабинета во всех возможных состояниях. Используй сайдбар для навигации,
          тогглы сверху — для смены темы, локали и ширины вьюпорта.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
          <span className="rounded-md border border-dark-50/15 bg-dark-50/5 px-2 py-1 font-mono text-dark-50/50">
            route: /dev/ui-preview
          </span>
          <span className="rounded-md border border-dark-50/15 bg-dark-50/5 px-2 py-1 font-mono text-dark-50/50">
            outer QueryClient seeded
          </span>
          <span className="rounded-md border border-dark-50/15 bg-dark-50/5 px-2 py-1 font-mono text-dark-50/50">
            mock auth seeded
          </span>
        </div>
      </div>

      {/* ─── Dashboard (phase 2 — DONE) ─── */}
      <DashboardSection />

      {/* ─── Subscription (phase 3 — DONE) ─── */}
      <SubscriptionSection />

      {/* ─── Auth (phase 4 — DONE) ─── */}
      <AuthSection />

      {/* ─── Primitives (phase 5 — DONE) ─── */}
      <PrimitivesSection />

      {/* ─── Feedback (phase 6 — DONE) ─── */}
      <FeedbackSection />

      {/* ─── Misc (phase 7 — DONE) ─── */}
      <MiscSection />

      {/* ─── Full Pages (from v1 analysis) ─── */}
      <PagesSubscriptionSection />
      <PagesBalanceSection />
      <PagesSupportSection />
      <PagesProfileReferralSection />
      <PagesResultsSection />
      <PagesConnectionSection />

      {/* ─── Footer ─── */}
      <div className="mt-10 border-t border-dark-50/5 pt-6 text-center">
        <Link to="/" className="text-sm text-dark-50/40 transition-colors hover:text-dark-50/60">
          ← Back to app
        </Link>
      </div>
    </PreviewShell>
  );
}
