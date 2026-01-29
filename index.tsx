import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Simple Error Boundary to catch render errors
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px', 
          fontFamily: 'system-ui, -apple-system, sans-serif',
          maxWidth: '600px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <h1 style={{color: '#ef4444', marginBottom: '20px'}}>Something went wrong</h1>
          <p style={{color: '#374151', marginBottom: '20px'}}>The application crashed. Here is the error message:</p>
          <pre style={{
            color: '#dc2626', 
            background: '#fee2e2', 
            padding: '20px', 
            borderRadius: '8px',
            textAlign: 'left',
            overflowX: 'auto',
            fontSize: '14px'
          }}>
            {this.state.error?.toString()}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#0d9488',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);