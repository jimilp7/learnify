"use client"

import React, { Component, ReactNode } from 'react'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: (error: Error, retry: () => void) => ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  showRetry?: boolean
  showGoHome?: boolean
  onGoHome?: () => void
  context?: string
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 Error Boundary caught an error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      context: this.props.context
    })

    this.setState({
      error,
      errorInfo
    })

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Report error for monitoring (could integrate with error reporting service)
    this.reportError(error, errorInfo)
  }

  private reportError = (error: Error, errorInfo: React.ErrorInfo) => {
    // In a real app, this could send to an error reporting service
    // like Sentry, LogRocket, etc.
    console.error('📊 Error reported:', {
      message: error.message,
      stack: error.stack,
      context: this.props.context,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown'
    })
  }

  private handleRetry = () => {
    console.log('🔄 Retrying after error boundary catch')
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  private handleGoHome = () => {
    console.log('🏠 Going home after error boundary catch')
    if (this.props.onGoHome) {
      this.props.onGoHome()
    }
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry)
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="text-red-500">
              <AlertCircle className="w-16 h-16 mx-auto mb-4" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">
                Something went wrong
              </h1>
              <p className="text-gray-600">
                {this.props.context ? `An error occurred in ${this.props.context}.` : 'An unexpected error occurred.'} 
                {' '}Don&apos;t worry, you can try again or go back to start over.
              </p>
            </div>

            <div className="bg-gray-100 rounded-lg p-4 text-left">
              <p className="text-sm text-gray-700 font-medium mb-2">Error Details:</p>
              <p className="text-xs text-gray-600 font-mono break-all">
                {this.state.error.message}
              </p>
            </div>

            <div className="flex flex-col space-y-3">
              {(this.props.showRetry !== false) && (
                <button
                  onClick={this.handleRetry}
                  className="flex items-center justify-center space-x-2 bg-blue-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Try Again</span>
                </button>
              )}
              
              {this.props.showGoHome && (
                <button
                  onClick={this.handleGoHome}
                  className="flex items-center justify-center space-x-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-300 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  <span>Start Over</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary