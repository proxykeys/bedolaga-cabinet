import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import { useTelegramSDK, setCachedFullscreenEnabled } from '@/hooks/useTelegramSDK';
import {
  brandingApi,
  getCachedBranding,
  setCachedBranding,
  preloadLogo,
  isLogoPreloaded,
} from '@/api/branding';
import { setFavicon, letterFaviconDataUri, roundedFaviconDataUri } from '@/utils/favicon';

const FALLBACK_NAME = import.meta.env.VITE_APP_NAME || 'Cabinet';
const FALLBACK_LOGO = import.meta.env.VITE_APP_LOGO || 'V';

export function useBranding() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { isTelegramWebApp, requestFullscreen, isMobile } = useTelegramSDK();

  // Branding data
  const { data: branding } = useQuery({
    queryKey: ['branding'],
    queryFn: async () => {
      const data = await brandingApi.getBranding();
      setCachedBranding(data);
      await preloadLogo(data);
      return data;
    },
    initialData: getCachedBranding() ?? undefined,
    initialDataUpdatedAt: 0,
    staleTime: 60000,
    enabled: isAuthenticated,
  });

  const appName = branding ? branding.name : FALLBACK_NAME;
  const logoLetter = branding?.logo_letter || FALLBACK_LOGO;
  const hasCustomLogo = branding?.has_custom_logo || false;
  const logoUrl = branding ? brandingApi.getLogoUrl(branding) : null;

  // Set document title
  useEffect(() => {
    document.title = appName || FALLBACK_NAME;
  }, [appName]);

  // Update favicon — custom logo (rounded like the header tile) when available,
  // else a brand-letter monogram so the tab always carries an icon.
  // The logo blob is module state, not React state: when it is not preloaded
  // yet we must await the preload here, otherwise a letter monogram would win
  // (React Query structural sharing may never re-render after the blob lands).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let url = logoUrl;
      if (!url && hasCustomLogo && branding?.logo_url) {
        await preloadLogo(branding);
        url = brandingApi.getLogoUrl(branding);
      }
      if (!url) {
        if (!cancelled) setFavicon(letterFaviconDataUri(logoLetter));
        return;
      }
      const rounded = await roundedFaviconDataUri(url);
      if (!cancelled) setFavicon(rounded || url);
    })();
    return () => {
      cancelled = true;
    };
  }, [logoUrl, logoLetter, hasCustomLogo, branding]);

  // Fullscreen setting from server
  const { data: fullscreenSetting } = useQuery({
    queryKey: ['fullscreen-enabled'],
    queryFn: brandingApi.getFullscreenEnabled,
    staleTime: 60000,
  });

  const fullscreenRequestedRef = useRef(false);

  useEffect(() => {
    if (!fullscreenSetting || !isTelegramWebApp) return;
    setCachedFullscreenEnabled(fullscreenSetting.enabled);
    if (fullscreenSetting.enabled && isMobile && !fullscreenRequestedRef.current) {
      fullscreenRequestedRef.current = true;
      requestFullscreen();
    }
  }, [fullscreenSetting, isTelegramWebApp, requestFullscreen, isMobile]);

  return {
    appName,
    logoLetter,
    hasCustomLogo,
    logoUrl,
    isLogoPreloaded,
  };
}
