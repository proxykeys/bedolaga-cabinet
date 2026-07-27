import { Component, type ErrorInfo, type ReactNode } from 'react';
import { safeSession } from '../utils/safeStorage';

interface ErrorBoundaryProps {
  children: ReactNode;
  level?: 'app' | 'page' | 'widget';
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

function isChunkLoadError(error: Error): boolean {
  const msg = error.message || '';
  return (
    msg.includes('dynamically imported module') ||
    msg.includes('Importing a module script failed') ||
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('Loading chunk') ||
    msg.includes('ChunkLoadError') ||
    error.name === 'ChunkLoadError'
  );
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);

    // Auto-reload on chunk load failures (stale deploy)
    if (isChunkLoadError(error)) {
      const reloadKey = 'chunk_reload_ts';
      const lastReload = Number(safeSession.getItem(reloadKey) || '0');
      const now = Date.now();
      // Prevent reload loop — only auto-reload once per 30 seconds
      // См. App.tsx lazyWithRetry: без переживающей reload метки перезагрузка
      // зациклится, поэтому перезагружаемся только если метка реально легла.
      if (now - lastReload > 30_000 && safeSession.setItem(reloadKey, String(now))) {
        window.location.reload();
        return;
      }
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const { level = 'page' } = this.props;
    const isChunk = this.state.error ? isChunkLoadError(this.state.error) : false;

    if (level === 'app') {
      return (
        <div className="min-h-viewport flex items-center justify-center bg-gray-100 p-4 dark:bg-gray-900">
          <div className="max-w-md text-center">
            <div className="mb-4 text-4xl">⚠️</div>
            <h1 className="mb-2 text-xl font-bold text-dark-50">Something went wrong</h1>
            <p className="mb-6 text-dark-300">
              An unexpected error occurred. Please try reloading the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-xl bg-accent-500 px-6 py-3 font-medium text-on-accent transition-colors hover:bg-accent-600"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }

    if (level === 'widget') {
      return (
        <div className="rounded-xl border border-gray-200/40 bg-gray-250 p-4 text-center dark:border-gray-800/40 dark:bg-gray-850">
          <p className="text-sm text-error-500">Failed to load this section</p>
          <button
            onClick={this.handleReset}
            className="mt-2 text-sm text-accent-500 hover:text-accent-400"
          >
            Try again
          </button>
        </div>
      );
    }

    // level === 'page' (default)
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-4">
        <div className="max-w-md text-center">
          <div className="mb-4 text-4xl">⚠️</div>
          <h1 className="mb-2 text-xl font-bold text-dark-50">Something went wrong</h1>
          <p className="mb-6 text-sm text-dark-300">
            {isChunk
              ? 'App was updated. Reloading...'
              : this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-xl bg-accent-500 px-6 py-3 font-medium text-on-accent transition-colors hover:bg-accent-600"
          >
            {isChunk ? 'Reload' : 'Try again'}
          </button>
        </div>
      </div>
    );
  }
}
