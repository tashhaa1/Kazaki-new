import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  public handleReload = () => {
    window.location.reload();
  };

  public handleReset = () => {
    try {
      sessionStorage.clear();
    } catch {}
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-900 text-white flex flex-col items-center justify-center p-6 text-center" dir="rtl">
          <div className="max-w-md w-full bg-stone-800/90 rounded-3xl p-8 border border-rose-500/30 shadow-2xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white">متجر KAZAKI.IQ</h2>
            <p className="text-sm text-stone-300">
              حدث تنبيه أثناء تحميل بعض عناصر الصفحة على هذا المتصفح. يمكنك المتابعة بشكل طبيعي عبر الضغط على الزر أدناه.
            </p>
            <div className="pt-2 flex flex-col gap-2.5">
              <button
                onClick={this.handleReset}
                className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-sm shadow-lg cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>متابعة التصفح وتحديث المتجر</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
