import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { PreviewSection } from '../components/PreviewSection';
import { Snapshot } from '../components/Snapshot';
import InstallationGuide from '@/components/connection/InstallationGuide';
import { mockAppConfig } from '../fixtures/appConfig';
import type { AppConfig } from '@/types';

type BlockType = 'cards' | 'timeline' | 'accordion' | 'minimal';

/**
 * Connection page + QR flow — uses the REAL InstallationGuide component
 * with a mock AppConfig so the preview renders byte-for-byte identical
 * to the production /connection page.
 *
 * Toggle between block types (cards/timeline/accordion/minimal) to see
 * how each renderer lays out the same content.
 */
export function PagesConnectionSection() {
  const [view, setView] = useState<'guide' | 'qr'>('guide');
  const [blockType, setBlockType] = useState<BlockType>('cards');

  // Clone appConfig with the selected block type so InstallationGuide
  // re-renders with a different Renderer.
  const appConfig: AppConfig = {
    ...mockAppConfig,
    uiConfig: { installationGuidesBlockType: blockType },
  };

  return (
    <PreviewSection
      id="connection-page"
      title="Connection Page"
      badge="page"
      description="Реальный InstallationGuide с mock AppConfig + QR-код. Переключатель block types показывает 4 рендерера"
    >
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {/* Guide / QR toggle */}
        <div className="flex overflow-hidden rounded-lg border border-dark-50/15">
          {(['guide', 'qr'] as const).map((v, i) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 font-mono text-[11px] font-medium transition-colors ${
                view === v
                  ? 'bg-accent-500 text-on-accent'
                  : 'bg-dark-50/5 text-dark-50/50 hover:bg-dark-50/10'
              } ${i > 0 ? 'border-l border-dark-50/10' : ''}`}
            >
              {v}
            </button>
          ))}
        </div>

        {/* Block type toggle (only for guide view) */}
        {view === 'guide' && (
          <div className="flex flex-wrap gap-1">
            <span className="self-center px-1 font-mono text-[10px] uppercase text-dark-50/30">
              block:
            </span>
            {(['cards', 'timeline', 'accordion', 'minimal'] as BlockType[]).map((bt) => (
              <button
                key={bt}
                onClick={() => setBlockType(bt)}
                className={`rounded-md border px-2 py-1 font-mono text-[10px] transition-colors ${
                  blockType === bt
                    ? 'border-accent-500 bg-gray-200 text-accent-500 dark:bg-gray-800'
                    : 'border-dark-50/15 bg-dark-50/5 text-dark-50/40 hover:bg-dark-50/10'
                }`}
              >
                {bt}
              </button>
            ))}
          </div>
        )}
      </div>

      <Snapshot
        label={`connection · ${view}${view === 'guide' ? ` · ${blockType}` : ''}`}
        description={
          view === 'guide'
            ? `реальный InstallationGuide, block type: ${blockType}`
            : 'реальный QRCodeSVG'
        }
      >
        <div className="rounded-xl bg-gray-050 p-4 dark:bg-gray-950">
          {view === 'guide' ? (
            <InstallationGuide
              appConfig={appConfig}
              onOpenDeepLink={() => {}}
              isTelegramWebApp={false}
              onGoBack={() => {}}
              onOpenQR={() => setView('qr')}
            />
          ) : (
            <ConnectionQRVisual />
          )}
        </div>
      </Snapshot>
    </PreviewSection>
  );
}

/** QR code screen — uses the REAL QRCodeSVG component */
function ConnectionQRVisual() {
  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex items-center gap-3">
        <button
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-gray-200 text-dark-200 dark:border-gray-800 dark:bg-gray-800"
          aria-label="Back"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-dark-100">QR-код подключения</h1>
      </div>

      <div className="flex flex-col items-center">
        <div className="flex w-full max-w-sm flex-col items-center px-6">
          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-dark-400">
            ProxyKeys
          </p>

          <p className="mb-8 text-center text-sm text-dark-400">
            Отсканируйте QR-код в VPN-приложении для быстрого подключения
          </p>

          {/* REAL QRCodeSVG — same component as production ConnectionQR.tsx */}
          <div className="rounded-3xl bg-white p-6">
            <QRCodeSVG
              value="https://sub.proxykeys.net/v2ray-key-abc12345"
              size={280}
              level="M"
              includeMargin={false}
              className="h-[280px] w-[280px] sm:h-[360px] sm:w-[360px]"
            />
          </div>

          <p className="mt-6 max-w-full truncate text-center font-mono text-xs text-dark-500">
            https://sub.proxykeys.net/v2ray-key-abc12345
          </p>
        </div>
      </div>
    </div>
  );
}
