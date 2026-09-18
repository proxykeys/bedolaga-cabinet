import {
  brandingApi,
  getCachedBranding,
  getLogoBlobUrl,
  preloadLogo,
  setCachedBranding,
} from '@/api/branding';
import { letterFaviconDataUri, roundedFaviconDataUri, setFavicon } from '@/utils/favicon';

/**
 * One-shot bootstrap favicon: cover every page that has no branding hook
 * (login, redirect screens) and win the race the per-page effects lose.
 *
 * The per-page effects read the in-memory logo blob at render time; when the
 * blob is not preloaded yet they fall back to the letter monogram, and React
 * Query structural sharing (refetch deep-equals the cached initialData)
 * prevents the re-render that would fix the favicon. This helper awaits the
 * preload itself, so the custom logo always wins; any failure keeps the
 * static icon from index.html.
 */
export async function applyEarlyFavicon(): Promise<void> {
  try {
    let branding = getCachedBranding();
    if (!branding) {
      branding = await brandingApi.getBranding();
      setCachedBranding(branding);
    }
    if (branding.has_custom_logo && branding.logo_url) {
      await preloadLogo(branding);
    }
    const url = getLogoBlobUrl();
    if (url) {
      const rounded = await roundedFaviconDataUri(url);
      setFavicon(rounded || url);
      return;
    }
    if (branding.logo_letter) {
      setFavicon(letterFaviconDataUri(branding.logo_letter));
    }
  } catch {
    // Offline or branding endpoint down — keep the static index.html icon.
  }
}
