import { useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { themeColorsApi } from '../api/themeColors';
import { DEFAULT_THEME_COLORS } from '../types/theme';
import { applyThemeColors } from '../hooks/useThemeColors';
import { usePlatform } from '@/platform';
import { useTheme } from '../hooks/useTheme';

interface ThemeColorsProviderProps {
  children: React.ReactNode;
}

export function ThemeColorsProvider({ children }: ThemeColorsProviderProps) {
  const { data: colors } = useQuery({
    queryKey: ['theme-colors'],
    queryFn: themeColorsApi.getColors,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const { theme: platformTheme, capabilities } = usePlatform();
  const { isDark } = useTheme();

  // Apply colors when the query resolves.
  // IMPORTANT: do NOT fallback to DEFAULT when colors is undefined (loading).
  // Otherwise on every page reload: main.tsx applies cached custom colors →
  // React mounts → this effect fires with undefined → overwrites with DEFAULT
  // → flash → network resolves → back to custom. By skipping the undefined
  // state, the cached colors from main.tsx/applyCachedThemeColors() stay
  // until the real data arrives.
  useEffect(() => {
    if (colors) {
      applyThemeColors(colors);
    }
  }, [colors]);

  // Sync Telegram header and bottom bar colors with theme
  const syncTelegramColors = useCallback(() => {
    if (!capabilities.hasThemeSync) return;

    const themeColors = colors || DEFAULT_THEME_COLORS;
    // Use surface color for header/bottom bar to match app UI
    const headerColor = isDark ? themeColors.darkSurface : themeColors.lightSurface;

    platformTheme.setHeaderColor(headerColor);
    platformTheme.setBottomBarColor(headerColor);
  }, [capabilities.hasThemeSync, colors, isDark, platformTheme]);

  // Apply Telegram colors when theme or colors change
  useEffect(() => {
    syncTelegramColors();
  }, [syncTelegramColors]);

  return <>{children}</>;
}
