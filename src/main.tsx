import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

type ErrorBoundaryProps = {
  children: React.ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: unknown;
};

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      const error = this.state.error instanceof Error ? this.state.error : new Error(String(this.state.error));

      return <div style={{ color: 'red', padding: '20px', background: 'black', zIndex: 9999, position: 'absolute' }}>
        <h1>Crash</h1>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{error.toString()}</pre>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{error.stack}</pre>
      </div>;
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
