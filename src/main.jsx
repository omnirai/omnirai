import React, { StrictMode, Component } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Runtime Error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.removeItem('chatgpt_current_id');
    } catch (_) {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-screen bg-[#0d0f12] text-white flex flex-col items-center justify-center p-6 text-center select-none font-sans">
          <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
            <img src="/omnira_ai.svg" alt="OMNIRA" className="w-10 h-10 object-contain" />
          </div>
          <h1 className="text-xl font-bold tracking-tight mb-2">Something went wrong</h1>
          <p className="text-xs text-neutral-400 max-w-md mb-6 leading-relaxed">
            An unexpected error occurred. Click below to reload OMNIRA AI smoothly.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              Try Again
            </button>
            <button
              onClick={this.handleReset}
              className="px-5 py-2 rounded-full bg-white text-neutral-900 hover:bg-neutral-100 text-xs font-semibold transition-colors cursor-pointer shadow-md"
            >
              Reset & Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
