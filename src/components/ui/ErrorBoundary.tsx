import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
  message: string | null;
};

export class ErrorBoundary extends React.Component<Props, State> {
  declare props: Props;
  state: State = { hasError: false, message: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error) {
    console.error('Neora UI crashed:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#030305] text-white flex items-center justify-center p-6">
          <div className="max-w-lg w-full rounded-3xl border border-red-500/20 bg-slate-950/90 p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-red-300">
              <AlertTriangle className="h-5 w-5" />
              <h1 className="text-lg font-semibold">Neora UI failed to render</h1>
            </div>
            <p className="mt-3 text-sm text-slate-300">
              A JavaScript error blocked the interface from becoming interactive.
            </p>
            {this.state.message && (
              <pre className="mt-4 whitespace-pre-wrap rounded-2xl border border-white/10 bg-black/30 p-4 text-xs text-slate-300">
                {this.state.message}
              </pre>
            )}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-200 transition hover:bg-cyan-500/15"
            >
              <RefreshCw className="h-4 w-4" />
              Reload UI
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
