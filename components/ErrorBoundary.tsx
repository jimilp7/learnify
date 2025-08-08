"use client"

import { Component, ReactNode } from "react"
import { AlertCircle, RotateCcw, Home } from "lucide-react"

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onRetry?: () => void
  onReset?: () => void
  showRetry?: boolean
  showReset?: boolean
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error('🔴 Error Boundary caught an error:', error)
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🔴 Error Boundary error details:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    })
    
    this.setState({ error, errorInfo })
  }

  handleRetry = () => {
    console.log('🔄 Error Boundary: Retrying...')
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
    this.props.onRetry?.()
  }

  handleReset = () => {
    console.log('🏠 Error Boundary: Resetting to home...')
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
    this.props.onReset?.()
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-red-50">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-xl font-semibold text-gray-900">
                Something went wrong
              </h1>
              <p className="text-gray-600 leading-relaxed">
                We encountered an unexpected error. Don&apos;t worry, your learning progress is safe.
              </p>
            </div>

            {/* Error details for development */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
                <div className="text-sm font-medium text-red-800 mb-2">
                  Error Details (Development Only):
                </div>
                <div className="text-xs text-red-700 font-mono break-all">
                  {this.state.error.message}
                </div>
              </div>
            )}

            <div className="flex flex-col space-y-3 pt-4">
              {this.props.showRetry !== false && (
                <button
                  onClick={this.handleRetry}
                  className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-blue-600 text-white rounded-2xl font-medium hover:bg-blue-700 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Try Again
                </button>
              )}
              
              {this.props.showReset !== false && (
                <button
                  onClick={this.handleReset}
                  className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-2xl font-medium hover:bg-gray-200 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  Start Over
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

// Hook for functional components to trigger error boundary
export const useErrorHandler = () => {
  const throwError = (error: Error) => {
    throw error
  }
  
  return { throwError }
}