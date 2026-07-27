import type { UseMutationResult } from '@tanstack/react-query';

/**
 * Creates a no-op UseMutationResult for preview purposes.
 *
 * Many dashboard components (SubscriptionCardActive, TrialOfferCard) expect
 * a UseMutationResult prop (refreshTrafficMutation, activateTrialMutation).
 * In the preview we don't want real network calls, so this stub satisfies
 * the prop type while keeping all fields safe defaults.
 */
export function createNoopMutation<TData = unknown, TVars = void>(): UseMutationResult<
  TData,
  unknown,
  TVars,
  unknown
> {
  return {
    mutate: () => {},
    mutateAsync: async () => ({}) as TData,
    reset: () => {},
    isPending: false,
    isPaused: false,
    isError: false,
    isSuccess: false,
    isIdle: true,
    status: 'idle',
    data: undefined,
    error: null,
    failureCount: 0,
    failureReason: null,
    submittedAt: 0,
    context: undefined,
    variables: undefined,
  };
}

/**
 * Creates a UseMutationResult simulating a PENDING state.
 * The button shows a spinner and is disabled.
 */
export function createPendingMutation<TData = unknown, TVars = void>(): UseMutationResult<
  TData,
  unknown,
  TVars,
  unknown
> {
  return {
    ...createNoopMutation<TData, TVars>(),
    isPending: true,
    isIdle: false,
    status: 'pending',
  } as UseMutationResult<TData, unknown, TVars, unknown>;
}

/**
 * Creates a UseMutationResult simulating an ERROR state.
 * Useful for showing error banners / messages.
 */
export function createErrorMutation<TData = unknown, TVars = void>(
  errorMessage = 'Произошла ошибка. Попробуйте позже.',
): UseMutationResult<TData, unknown, TVars, unknown> {
  return {
    ...createNoopMutation<TData, TVars>(),
    isError: true,
    isIdle: false,
    status: 'error',
    error: new Error(errorMessage),
  } as UseMutationResult<TData, unknown, TVars, unknown>;
}
