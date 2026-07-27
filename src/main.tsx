import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  init,
  restoreInitData,
  mountMiniApp,
  miniAppReady,
  mountViewport,
  expandViewport,
  mountSwipeBehavior,
  disableVerticalSwipes,
  mountClosingBehavior,
  disableClosingConfirmation,
  mountBackButton,
  bindThemeParamsCssVars,
  bindViewportCssVars,
  requestFullscreen,
  isFullscreen,
} from '@telegram-apps/sdk-react';
import { clearStaleSessionIfNeeded, tokenStorage, tokenRefreshManager } from './utils/token';
import { installEncodingSurrogateGuard } from './utils/installEncodingSurrogateGuard';
import { getTelegramInitData } from './utils/telegramInitData';
import { useAuthStore } from './store/auth';
import { AppWithNavigator } from './AppWithNavigator';
import { ErrorBoundary } from './components/ErrorBoundary';
import { initLogoPreload } from './api/branding';
import { checkBackendOnStartup } from './api/health';
import { getCachedFullscreenEnabled, isTelegramMobile } from './hooks/useTelegramSDK';
import { applyTelegramLanguage } from './i18n';
import { applyCachedThemeColors } from './hooks/useThemeColors';
import './styles/globals.css';
import './styles/claude-overrides.css';
import './styles/auth.css';

// Apply cached theme colors BEFORE React renders — prevents FOUC (flash of
// default colors before the network fetch resolves on every page reload).
// Reads from localStorage (written by applyThemeColors on every successful apply).
applyCachedThemeColors();

// Harden the global encoders against lone UTF-16 surrogates (truncated emoji in
// backend names/remarks) BEFORE anything renders or fetches — otherwise such a
// string crashes any encodeURI/encodeURIComponent/btoa path on iOS WebKit,
// including qrcode.react's internal encodeURI. See installEncodingSurrogateGuard.
installEncodingSurrogateGuard();

// Polyfill Object.hasOwn for older iOS/Android WebViews (Safari < 15.4, old Chrome).
// @telegram-apps/sdk v3 depends on valibot which uses Object.hasOwn internally.
// Without this, init() and any launch-params retrieval below throw
// LaunchParamsRetrieveError on affected devices.
// See: https://github.com/Telegram-Mini-Apps/tma.js/issues/683
if (typeof (Object as { hasOwn?: unknown }).hasOwn !== 'function') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (Object as any).hasOwn = (obj: object, prop: PropertyKey): boolean =>
    Object.prototype.hasOwnProperty.call(obj, prop);
}

// Only initialize Telegram SDK when running inside Telegram
const isTelegramEnv =
  !!(window as unknown as Record<string, unknown>).TelegramWebviewProxy ||
  location.hash.includes('tgWebApp') ||
  location.search.includes('tgWebApp');

const HMR_KEY = '__tg_sdk_initialized';
const alreadyInitialized = (window as unknown as Record<string, unknown>)[HMR_KEY] === true;

if (isTelegramEnv && !alreadyInitialized) {
  (window as unknown as Record<string, unknown>)[HMR_KEY] = true;

  try {
    init();
    restoreInitData();

    clearStaleSessionIfNeeded(getTelegramInitData());

    // Adopt the user's Telegram client language on first run (no explicit choice yet).
    applyTelegramLanguage();

    // Each mount in its own try/catch so one failure doesn't block others.
    // mountMiniApp() internally mounts themeParams in SDK v3,
    // so we don't call mountThemeParams() separately to avoid ConcurrentCallError.
    try {
      mountMiniApp();
    } catch {}
    try {
      bindThemeParamsCssVars();
    } catch {}
    try {
      mountSwipeBehavior();
      disableVerticalSwipes();
    } catch {}
    try {
      mountClosingBehavior();
      disableClosingConfirmation();
    } catch {}
    try {
      mountBackButton();
    } catch {}
    // Viewport must be mounted before requesting fullscreen
    mountViewport()
      .then(() => {
        bindViewportCssVars();
        expandViewport();

        // Auto-enter fullscreen if enabled in settings (mobile only)
        if (getCachedFullscreenEnabled() && isTelegramMobile()) {
          if (!isFullscreen()) {
            requestFullscreen();
          }
        }
      })
      .catch(() => {});

    miniAppReady();
  } catch {}
} else if (!isTelegramEnv) {
  // Outside Telegram — still clear stale session tokens if any
  clearStaleSessionIfNeeded(null);
}

// Bootstrap auth after the Telegram SDK is initialised so CloudStorage-backed
// refresh-token recovery can run inside initialize() (launch params + CloudStorage
// are only available post-init()).
//
// DEV PREVIEW GUARD: On /dev/ui-preview, seed mock auth + patch tokenStorage
// BEFORE initialize() runs. Without this, initialize() completes before the
// preview's useEffect, calls clearSession() (deletes tokens), and the API
// client redirects to /login. By patching at module level, initialize() sees
// valid fake tokens + lastFailureWasTransport=true and keeps the session.
if (import.meta.env.DEV && window.location.pathname === '/dev/ui-preview') {
  // Seed fake tokens so tokenStorage.getAccessToken() returns them
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  const payload = btoa(
    JSON.stringify({ sub: 'preview', exp: Math.floor(Date.now() / 1000) + 365 * 86400 }),
  )
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  const fakeJwt = `${header}.${payload}.preview`;
  tokenStorage.setTokens(fakeJwt, 'preview-fake-refresh-token');

  // Prevent clearSession() from deleting our fake tokens
  const originalClear = tokenStorage.clearTokens;
  tokenStorage.clearTokens = () => {};

  // Force lastFailureWasTransport so initialize() and API interceptor
  // keep the session instead of calling safeRedirectToLogin()
  Object.defineProperty(tokenRefreshManager, 'lastFailureWasTransport', {
    get: () => true,
    set: () => {},
    configurable: true,
  });

  // Set mock auth state
  useAuthStore.setState({
    isAuthenticated: true,
    isLoading: false,
    user: useAuthStore.getState().user,
  });

  // Store cleanup function for the preview component to call on unmount
  (window as unknown as Record<string, unknown>).__previewTokenCleanup = () => {
    tokenStorage.clearTokens = originalClear;
  };
}

void useAuthStore.getState().initialize();

// In parallel with auth bootstrap, eagerly check backend liveness so a dead
// backend paints the ServiceUnavailableScreen immediately instead of flashing
// the /login page first.
void checkBackendOnStartup();

if ('requestIdleCallback' in window) {
  requestIdleCallback(() => initLogoPreload());
} else {
  setTimeout(initLogoPreload, 100);
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary level="app">
      <QueryClientProvider client={queryClient}>
        <AppWithNavigator />
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
