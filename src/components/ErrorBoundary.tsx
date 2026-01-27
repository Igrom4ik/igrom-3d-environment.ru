'use client'

import React from 'react'

interface ErrorBoundaryProps {
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '2rem', 
          fontFamily: 'system-ui, sans-serif',
          maxWidth: '600px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#e53e3e' }}>Something went wrong.</h2>
          <p style={{ color: '#4a5568', marginBottom: '1.5rem' }}>
            The application encountered an error. This might be due to a large file upload or a temporary glitch.
          </p>
          <div style={{ 
            background: '#f7fafc', 
            padding: '1rem', 
            borderRadius: '0.5rem', 
            overflow: 'auto', 
            textAlign: 'left',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
            color: '#2d3748'
          }}>
            {this.state.error?.toString()}
          </div>
          <button 
            type="button"
            onClick={() => {
              this.setState({ hasError: false })
              window.location.reload()
            }}
            style={{
              background: '#3182ce',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            Reload Page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
