import React from 'react'
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, RefreshCw, Bug, FileX } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  errorId: string
}

interface ReceiptErrorBoundaryProps {
  children: React.ReactNode
  onReset?: () => void
  fallbackComponent?: React.ComponentType<{
    error: Error
    resetError: () => void
    errorId: string
  }>
}

export class ReceiptErrorBoundary extends React.Component<
  ReceiptErrorBoundaryProps,
  ErrorBoundaryState
> {
  private resetTimeoutId: number | null = null

  constructor(props: ReceiptErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Generate unique error ID for tracking
    const errorId = `receipt_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    return {
      hasError: true,
      error,
      errorId
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      errorInfo
    })

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Receipt Upload Error Boundary')
      console.error('Error:', error)
      console.error('Error Info:', errorInfo)
      console.error('Component Stack:', errorInfo.componentStack)
      console.groupEnd()
    }

    // In production, you might want to send this to an error tracking service
    this.logErrorToService(error, errorInfo)
  }

  private logErrorToService = (error: Error, errorInfo: React.ErrorInfo) => {
    // This would send the error to your error tracking service
    // Examples: Sentry, LogRocket, Bugsnag, etc.
    
    const errorData = {
      id: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: null, // You might want to get this from your auth context
      context: 'receipt-upload'
    }

    // Log to console for now (replace with actual service call)
    console.log('Error logged:', errorData)
    
    // Example service call:
    // errorTrackingService.captureException(error, {
    //   tags: { component: 'receipt-upload' },
    //   extra: errorData
    // })
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    })

    // Call parent reset handler if provided
    this.props.onReset?.()
  }

  autoReset = () => {
    // Auto-reset after 10 seconds
    if (this.resetTimeoutId) {
      window.clearTimeout(this.resetTimeoutId)
    }
    
    this.resetTimeoutId = window.setTimeout(() => {
      this.resetError()
    }, 10000)
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      window.clearTimeout(this.resetTimeoutId)
    }
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback component if provided
      if (this.props.fallbackComponent) {
        const FallbackComponent = this.props.fallbackComponent
        return (
          <FallbackComponent
            error={this.state.error!}
            resetError={this.resetError}
            errorId={this.state.errorId}
          />
        )
      }

      // Default error UI
      return <DefaultErrorFallback {...this.state} resetError={this.resetError} />
    }

    return this.props.children
  }
}

interface DefaultErrorFallbackProps {
  error: Error | null
  errorId: string
  resetError: () => void
}

function DefaultErrorFallback({ error, errorId, resetError }: DefaultErrorFallbackProps) {
  const { toast } = useToast()

  const copyErrorInfo = () => {
    const errorText = `
Error ID: ${errorId}
Message: ${error?.message || 'Unknown error'}
Stack: ${error?.stack || 'No stack trace'}
Timestamp: ${new Date().toISOString()}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}
    `.trim()

    navigator.clipboard.writeText(errorText).then(() => {
      toast({
        title: 'Error details copied',
        description: 'Error information has been copied to clipboard',
      })
    })
  }

  const getErrorType = (error: Error | null): { type: string; icon: React.ReactNode; color: string } => {
    if (!error) return { type: 'Unknown', icon: <Bug className="h-4 w-4" />, color: 'secondary' }

    const message = error.message.toLowerCase()
    
    if (message.includes('network') || message.includes('fetch')) {
      return { type: 'Network Error', icon: <AlertTriangle className="h-4 w-4" />, color: 'destructive' }
    }
    
    if (message.includes('permission') || message.includes('unauthorized')) {
      return { type: 'Permission Error', icon: <FileX className="h-4 w-4" />, color: 'destructive' }
    }
    
    if (message.includes('file') || message.includes('upload')) {
      return { type: 'Upload Error', icon: <FileX className="h-4 w-4" />, color: 'destructive' }
    }
    
    return { type: 'Application Error', icon: <Bug className="h-4 w-4" />, color: 'destructive' }
  }

  const errorTypeInfo = getErrorType(error)

  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {errorTypeInfo.icon}
            <CardTitle className="text-destructive">Receipt Upload Error</CardTitle>
          </div>
          <Badge variant="destructive" className="text-xs">
            {errorTypeInfo.type}
          </Badge>
        </div>
        <CardDescription>
          Something went wrong while processing your receipt. This error has been logged for investigation.
        </CardDescription>
      </CardHeader>
      <CardBody className="space-y-4">
        {/* Error Details */}
        <div className="p-3 bg-muted/50 rounded-lg border">
          <div className="text-sm font-medium mb-1">Error Details:</div>
          <div className="text-sm text-muted-foreground font-mono break-words">
            {error?.message || 'An unexpected error occurred'}
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            ID: {errorId}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={resetError}
            className="flex items-center gap-2"
            variant="default"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          
          <Button 
            onClick={copyErrorInfo}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Bug className="h-4 w-4" />
            Copy Error Info
          </Button>
          
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Reload Page
          </Button>
        </div>

        {/* Helpful Tips */}
        <div className="text-sm text-muted-foreground space-y-1">
          <div className="font-medium">Try these steps:</div>
          <ul className="list-disc list-inside space-y-0.5 ml-2">
            <li>Check your internet connection</li>
            <li>Make sure the image file is not corrupted</li>
            <li>Try uploading a different image</li>
            <li>Refresh the page and try again</li>
          </ul>
        </div>
      </CardBody>
    </Card>
  )
}

// Hook for using error boundary in functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: { componentStack?: string }) => {
    // This would integrate with your error tracking service
    console.error('Receipt Upload Error:', error, errorInfo)
    
    // You could also throw the error to be caught by the nearest error boundary
    // throw error
  }
}

// Higher-order component for wrapping components with error boundary
export function withReceiptErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ReceiptErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ReceiptErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ReceiptErrorBoundary>
  )

  WrappedComponent.displayName = `withReceiptErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}