import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Surface to whatever error-monitoring tool is configured.
    // eslint-disable-next-line no-console
    console.error('UI crash:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    if (typeof window !== 'undefined') window.location.assign('/');
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6 font-sans">
        <div className="max-w-md text-center space-y-6 animate-fade-in">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-center text-charcoal">
            <AlertTriangle size={32} strokeWidth={1.5} />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black tracking-tight italic text-charcoal">
              Something broke<span className="brand-dot" aria-hidden="true"></span>
            </h1>
            <p className="text-sm text-stone-500 leading-relaxed">
              The page hit an unexpected error. We've logged it and are looking into it. Please try again.
            </p>
          </div>
          <button
            onClick={this.handleReset}
            className="luxury-button-primary h-12 px-8 inline-flex items-center gap-2 text-[10px] tracking-[0.3em]"
          >
            <RefreshCw size={14} /> Reload
          </button>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-300">
            Need help? <a href="mailto:hey@heylola.co" className="text-charcoal underline decoration-stone-300 underline-offset-2">hey@heylola.co</a>
          </p>
        </div>
      </div>
    );
  }
}
