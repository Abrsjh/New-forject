import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
import { 
  logError, 
  ErrorSeverity, 
  getErrorMessage,
  isNetworkError,
  isValidationError
} from '../../utils/errorHandling'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  enableRetry?: boolean
  showErrorDetails?: boolean
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
  retryCount: number
}

class ErrorBoundary extends Component<Props, State> {
  private maxRetries = 3

  constructor(props: Props) {
    super(props)
    this.state = { 
      hasError: false,
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error with appropriate severity
    const severity = this.getErrorSeverity(error)
    logError(error, severity, {
      component: 'ErrorBoundary',
      errorInfo: errorInfo.componentStack,
      retryCount: this.state.retryCount
    })

    // Update state with error info
    this.setState({ errorInfo })

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  private getErrorSeverity(error: Error): ErrorSeverity {
    if (isNetworkError(error)) {
      return ErrorSeverity.MEDIUM
    }
    if (isValidationError(error)) {
      return ErrorSeverity.LOW
    }
    return ErrorSeverity.HIGH
  }

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: prevState.retryCount + 1
      }))
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  private getErrorTitle(): string {
    const { error } = this.state
    
    if (!error) return 'Something went wrong'
    
    if (isNetworkError(error)) {
      return 'Connection Problem'
    }
    
    if (isValidationError(error)) {
      return 'Invalid Input'
    }
    
    return 'Application Error'
  }

  private getErrorDescription(): string {
    const { error } = this.state
    
    if (!error) return 'An unexpected error occurred.'
    
    if (isNetworkError(error)) {
      return 'Please check your internet connection and try again.'
    }
    
    if (isValidationError(error)) {
      return 'Please check your input and try again.'
    }
    
    return 'We apologize for the inconvenience. Please try again or contact support if the problem persists.'
  }

  private canRetry(): boolean {
    return this.props.enableRetry !== false && this.state.retryCount < this.maxRetries
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      const { error, errorInfo, retryCount } = this.state
      const showDetails = this.props.showErrorDetails ?? (process.env.NODE_ENV === 'development')

      return (
        <div 
          data-testid="error-boundary"
          className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4"
          role="alert"
          aria-live="assertive"
          aria-label="Error page"
        >
          <div className="max-w-lg w-full text-center">
            <div className="mb-8">
              <AlertTriangle 
                className="mx-auto h-16 w-16 text-red-500 mb-4" 
                aria-hidden="true"
              />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {this.getErrorTitle()}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {this.getErrorDescription()}
              </p>

              {/* Retry count indicator */}
              {retryCount > 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Retry attempt: {retryCount}/{this.maxRetries}
                </p>
              )}
              
              {/* Show error details if enabled */}
              {showDetails && error && (
                <details className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-left">
                  <summary className="cursor-pointer text-red-700 dark:text-red-300 font-medium flex items-center">
                    <Bug className="w-4 h-4 mr-2" />
                    Error Details
                  </summary>
                  <div className="mt-3 space-y-2">
                    <div>
                      <strong className="text-red-700 dark:text-red-300">Message:</strong>
                      <pre className="mt-1 text-sm text-red-600 dark:text-red-400 whitespace-pre-wrap">
                        {getErrorMessage(error)}
                      </pre>
                    </div>
                    {error.stack && (
                      <div>
                        <strong className="text-red-700 dark:text-red-300">Stack Trace:</strong>
                        <pre className="mt-1 text-xs text-red-600 dark:text-red-400 whitespace-pre-wrap max-h-32 overflow-y-auto">
                          {error.stack}
                        </pre>
                      </div>
                    )}
                    {errorInfo && (
                      <div>
                        <strong className="text-red-700 dark:text-red-300">Component Stack:</strong>
                        <pre className="mt-1 text-xs text-red-600 dark:text-red-400 whitespace-pre-wrap max-h-32 overflow-y-auto">
                          {errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </div>
            
            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {this.canRetry() && (
                <button
                  data-testid="retry-button"
                  onClick={this.handleRetry}
                  className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label="Retry operation"
                >
                  <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
                  Try Again
                </button>
              )}
              
              <button
                data-testid="reload-button"
                onClick={this.handleReload}
                className="inline-flex items-center justify-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                aria-label="Reload page"
              >
                <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
                Reload Page
              </button>
              
              <button
                data-testid="home-button"
                onClick={this.handleGoHome}
                className="inline-flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                aria-label="Go to home page"
              >
                <Home className="w-4 h-4 mr-2" aria-hidden="true" />
                Go Home
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary