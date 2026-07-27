import { useAuthStore } from '@/store/auth';
import { useBlockingStore } from '@/store/blocking';
import { mockUser } from '../fixtures/users';

/**
 * Seeds mock user data into the auth store for the preview.
 *
 * Token storage patching + lastFailureWasTransport are handled in main.tsx
 * (BEFORE initialize() runs) to win the race condition. This function only
 * sets the mock user and a zustand guard to keep auth asserted.
 */
export function seedAuthStore(): () => void {
  const store = useAuthStore.getState();
  const snapshot = {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isAdmin: store.isAdmin,
    isLoading: store.isLoading,
  };

  useAuthStore.setState({
    user: mockUser,
    isAuthenticated: true,
    isAdmin: false,
    isLoading: false,
    initialize: async () => {},
  });

  // Re-assert mock auth if initialize()'s in-flight promise clears it
  const unsubAuthGuard = useAuthStore.subscribe((state) => {
    if (!state.isAuthenticated && state.user === null) {
      useAuthStore.setState({
        user: mockUser,
        isAuthenticated: true,
        isAdmin: false,
        isLoading: false,
      });
    }
  });

  return () => {
    unsubAuthGuard();
    useAuthStore.setState(snapshot);

    // Restore tokenStorage.clearTokens if it was patched in main.tsx
    const cleanup = (window as unknown as Record<string, unknown>).__previewTokenCleanup;
    if (typeof cleanup === 'function') cleanup();
    delete (window as unknown as Record<string, unknown>).__previewTokenCleanup;
  };
}

/**
 * Suppresses the blocking store while the preview is active.
 */
export function suppressBlocking(): () => void {
  useBlockingStore.getState().clearBlocking();

  const originalSetBackendUnavailable = useBlockingStore.getState().setBackendUnavailable;
  const originalSetMaintenance = useBlockingStore.getState().setMaintenance;
  const originalSetBlacklisted = useBlockingStore.getState().setBlacklisted;
  const originalSetChannelSubscription = useBlockingStore.getState().setChannelSubscription;
  const originalSetAccountDeleted = useBlockingStore.getState().setAccountDeleted;

  useBlockingStore.setState({
    setBackendUnavailable: () => {},
    setMaintenance: () => {},
    setBlacklisted: () => {},
    setChannelSubscription: () => {},
    setAccountDeleted: () => {},
  });

  return () => {
    useBlockingStore.setState({
      setBackendUnavailable: originalSetBackendUnavailable,
      setMaintenance: originalSetMaintenance,
      setBlacklisted: originalSetBlacklisted,
      setChannelSubscription: originalSetChannelSubscription,
      setAccountDeleted: originalSetAccountDeleted,
    });
  };
}
