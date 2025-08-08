"use client"

import { ErrorBoundary } from "./ErrorBoundary"

interface ClientErrorBoundaryWrapperProps {
  children: React.ReactNode
}

export default function ClientErrorBoundaryWrapper({ children }: ClientErrorBoundaryWrapperProps) {
  const handleReset = () => {
    // Reload the page to reset the app state
    window.location.reload()
  }

  return (
    <ErrorBoundary onReset={handleReset}>
      {children}
    </ErrorBoundary>
  )
}