import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

interface RootErrorBoundaryProps {
  children: ReactNode;
}

interface RootErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class RootErrorBoundary extends Component<RootErrorBoundaryProps, RootErrorBoundaryState> {
  public state: RootErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): RootErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Fatal top-level error caught by RootErrorBoundary:', error, errorInfo);
  }

  public handleReload = () => {
    try {
      sessionStorage.clear();
    } catch {}
    window.location.reload();
  };

  public handleResetAndReload = () => {
    try {
      sessionStorage.clear();
      // Keep user login if possible, clear transient caches
      localStorage.removeItem('kazaki_notifications_v1');
    } catch {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          dir="rtl"
          style={{
            minHeight: '100dvh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0c0a09',
            color: '#ffffff',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            padding: '20px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              maxWidth: '420px',
              width: '100%',
              backgroundColor: 'rgba(28, 25, 23, 0.95)',
              borderRadius: '24px',
              padding: '32px 24px',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                margin: '0 auto 16px',
                padding: '2px',
                background: 'linear-gradient(135deg, #f43f5e, #fb7185, #f59e0b)',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  background: '#000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img src="/logo.jpg" alt="KAZAKI" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#fff' }}>
              متجر KAZAKI.IQ
            </h2>
            <p style={{ fontSize: '13px', color: '#d6d3d1', lineHeight: '1.6', margin: '0 0 20px 0' }}>
              حدث تنبيه أثناء تهيئة المتجر على هذا المتصفح. يمكنك المتابعة بشكل طبيعي عبر الضغط على الزر أدناه.
            </p>
            <button
              onClick={this.handleReload}
              style={{
                width: '100%',
                padding: '14px 20px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #e11d48, #db2777)',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 'bold',
                border: 'none',
                cursor: 'pointer',
                marginBottom: '10px',
                boxShadow: '0 4px 14px rgba(225, 29, 72, 0.4)',
              }}
            >
              متابعة التصفح وتحديث المتجر
            </button>
            <button
              onClick={this.handleResetAndReload}
              style={{
                width: '100%',
                padding: '12px 20px',
                borderRadius: '16px',
                background: 'transparent',
                color: '#a8a29e',
                fontSize: '12px',
                border: '1px solid rgba(255,255,255,0.1)',
                cursor: 'pointer',
              }}
            >
              مسح الذاكرة المؤقتة وإعادة المحاولة
            </button>
            {this.state.error && (
              <details style={{ marginTop: '16px', textAlign: 'left', fontSize: '11px', color: '#78716c' }}>
                <summary style={{ cursor: 'pointer', textAlign: 'center', color: '#a8a29e' }}>تفاصيل الخطأ للمطورين</summary>
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', marginTop: '8px' }}>
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  );
}
