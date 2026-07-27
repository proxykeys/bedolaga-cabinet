import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { brandingApi } from '@/api/branding';
import type { AnimationConfig } from '@/components/ui/backgrounds/types';
import { DEFAULT_ANIMATION_CONFIG } from '@/components/ui/backgrounds/types';
import { validateConfig, getCachedConfig, setCachedConfig } from '@/utils/backgroundConfig';

function RenderBackground({ config: _config }: { config: AnimationConfig }) {
  // Animated backgrounds neutralized per claude.com flat aesthetic.
  // All 21 background components (aurora, meteors, fireflies, vortex...) are
  // no longer rendered. The registry/admin editor remains functional; the
  // operator can still configure a background, but nothing is drawn.
  // To re-enable, restore the previous implementation from git history.
  return null;
}

export function BackgroundRenderer() {
  const { data: config } = useQuery({
    queryKey: ['animation-config'],
    queryFn: async () => {
      const raw = await brandingApi.getAnimationConfig();
      const result = validateConfig(raw) ?? DEFAULT_ANIMATION_CONFIG;
      setCachedConfig(result);
      return result;
    },
    initialData: getCachedConfig() ?? undefined,
    initialDataUpdatedAt: 0,
    staleTime: 30_000,
  });

  const effectiveConfig = config ?? DEFAULT_ANIMATION_CONFIG;
  return <RenderBackground config={effectiveConfig} />;
}

export function StaticBackgroundRenderer({ config }: { config: AnimationConfig }) {
  const validated = useMemo(() => validateConfig(config), [config]);
  if (!validated) return null;
  return <RenderBackground config={validated} />;
}
