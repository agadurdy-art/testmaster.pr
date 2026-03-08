import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f172a',
          color: '#e2e8f0',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          padding: '20px'
        }}>
          <div style={{ textAlign: 'center', maxWidth: 420 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>
              <i className="fas fa-exclamation-triangle" style={{ color: '#f59e0b' }}></i>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>
              Bir sorun oluştu
            </h2>
            <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 24 }}>
              Sayfa beklenmedik bir hatayla karşılaştı. Yeniden yükleyerek devam edebilirsiniz.
            </p>
            <button
              data-testid="error-boundary-reload-btn"
              onClick={() => window.location.reload()}
              style={{
                background: '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '10px 28px',
                fontSize: 15,
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              Sayfayı Yenile
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
