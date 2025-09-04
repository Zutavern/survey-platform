'use client'

import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from './button'
import { Card, CardContent, CardHeader, CardTitle } from './card'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{
    fallback?: React.ComponentType<{error?: Error, resetError: () => void}>
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  }>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{
    fallback?: React.ComponentType<{error?: Error, resetError: () => void}>
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  }>) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({ error, errorInfo })
    this.props.onError?.(error, errorInfo)
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback
      
      if (FallbackComponent) {
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />
      }
      
      return <DefaultErrorFallback error={this.state.error} resetError={this.resetError} />
    }

    return this.props.children
  }
}

function DefaultErrorFallback({ error, resetError }: { error?: Error, resetError: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Etwas ist schiefgelaufen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">
            Es ist ein unerwarteter Fehler aufgetreten. Bitte versuchen Sie es erneut.
          </p>
          
          {error && process.env.NODE_ENV === 'development' && (
            <details className="bg-slate-50 p-3 rounded text-xs">
              <summary className="cursor-pointer font-medium">Fehlerdetails (Entwicklung)</summary>
              <pre className="mt-2 whitespace-pre-wrap">{error.toString()}</pre>
              {error.stack && (
                <pre className="mt-2 text-xs text-slate-500">{error.stack}</pre>
              )}
            </details>
          )}
          
          <div className="flex gap-2">
            <Button onClick={resetError} size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Erneut versuchen
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.location.reload()}
            >
              Seite neu laden
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Dashboard-specific error fallback
export function DashboardErrorFallback({ error, resetError }: { error?: Error, resetError: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Dashboard-Fehler
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600">
              Das Dashboard konnte nicht geladen werden. Dies kann an einem temporären Problem liegen.
            </p>
            
            <div className="flex gap-2">
              <Button onClick={resetError} size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Dashboard neu laden
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.location.href = '/'}
              >
                Zur Startseite
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}