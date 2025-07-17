/**
 * Error handling utilities for comprehensive error management
 * Includes error boundaries, logging, recovery, and retry mechanisms
 */

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

/**
 * Custom application error class
 */
export class AppError extends Error {
  public readonly code: string
  public readonly severity: ErrorSeverity
  public readonly context?: Record<string, any>
  public readonly timestamp: Date

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context?: Record<string, any>
  ) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.severity = severity
    this.context = context
    this.timestamp = new Date()

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError)
    }
  }
}

/**
 * Error handler configuration
 */
export interface ErrorHandlerConfig {
  enableLogging?: boolean
  onError?: (error: Error) => void
  enableRecovery?: boolean
  maxRetries?: number
}

/**
 * Creates a configurable error handler
 * @param config - Error handler configuration
 * @returns Error handler function
 */
export function createErrorHandler(config: ErrorHandlerConfig = {}) {
  const {
    enableLogging = true,
    onError,
    enableRecovery = false
  } = config

  return (error: Error) => {
    // Log the error if logging is enabled
    if (enableLogging) {
      logError(error, ErrorSeverity.HIGH)
    }

    // Call custom error callback if provided
    if (onError) {
      try {
        onError(error)
      } catch (callbackError) {
        console.error('Error in error handler callback:', callbackError)
      }
    }

    // Provide recovery suggestions if enabled
    if (enableRecovery) {
      provideRecoverySuggestions(error)
    }
  }
}

/**
 * Logs errors with appropriate severity levels
 * @param error - Error to log
 * @param severity - Error severity level
 * @param context - Additional context information
 */
export function logError(
  error: Error, 
  severity: ErrorSeverity = ErrorSeverity.MEDIUM,
  context?: Record<string, any>
): void {
  const logMessage = `[${severity}]`
  
  switch (severity) {
    case ErrorSeverity.HIGH:
      console.error(logMessage, error, ...(context ? ['Context:', context] : []))
      break
    case ErrorSeverity.MEDIUM:
      console.warn(logMessage, error, ...(context ? ['Context:', context] : []))
      break
    case ErrorSeverity.LOW:
      console.info(logMessage, error, ...(context ? ['Context:', context] : []))
      break
  }
}

/**
 * Extracts a readable error message from various error types
 * @param error - Error of unknown type
 * @returns Human-readable error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  
  if (typeof error === 'string') {
    return error
  }
  
  if (error && typeof error === 'object') {
    try {
      return JSON.stringify(error)
    } catch {
      // Handle circular references or other JSON.stringify errors
      return 'An unknown error occurred'
    }
  }
  
  return 'An unknown error occurred'
}

/**
 * Checks if an error is a network-related error
 * @param error - Error to check
 * @returns True if error is network-related
 */
export function isNetworkError(error: Error): boolean {
  const networkErrorPatterns = [
    /network/i,
    /fetch/i,
    /timeout/i,
    /connection/i,
    /offline/i
  ]
  
  const isNetworkErrorName = error.name === 'NetworkError' || error.name === 'TypeError'
  const hasNetworkMessage = networkErrorPatterns.some(pattern => 
    pattern.test(error.message)
  )
  
  return isNetworkErrorName || hasNetworkMessage
}

/**
 * Checks if an error is a validation error
 * @param error - Error to check
 * @returns True if error is validation-related
 */
export function isValidationError(error: Error): boolean {
  const validationErrorPatterns = [
    /validation/i,
    /invalid/i,
    /required/i,
    /format/i
  ]
  
  const isValidationErrorName = error.name === 'ValidationError'
  const hasValidationMessage = validationErrorPatterns.some(pattern =>
    pattern.test(error.message)
  )
  
  return isValidationErrorName || hasValidationMessage
}

/**
 * Checks if an error should be retried
 * @param error - Error to check
 * @returns True if error is retryable
 */
export function isRetryableError(error: Error): boolean {
  // Don't retry validation errors or client errors
  if (isValidationError(error)) {
    return false
  }
  
  // Retry network errors and temporary failures
  if (isNetworkError(error)) {
    return true
  }
  
  // Retry specific error patterns
  const retryablePatterns = [
    /temporary/i,
    /rate limit/i,
    /service unavailable/i,
    /internal server error/i
  ]
  
  return retryablePatterns.some(pattern => pattern.test(error.message))
}

/**
 * Retry handler configuration
 */
export interface RetryConfig {
  maxRetries?: number
  delay?: number
  backoffMultiplier?: number
  onRetry?: (attempt: number, error: Error) => void
}

/**
 * Creates a retry handler for operations
 * @param operation - Operation to retry
 * @param config - Retry configuration
 * @returns Retry handler function
 */
export function createRetryHandler<T>(
  operation: () => Promise<T>,
  config: RetryConfig = {}
): () => Promise<T> {
  const {
    maxRetries = 3,
    delay = 1000,
    backoffMultiplier = 2,
    onRetry
  } = config

  return async (): Promise<T> => {
    let lastError: Error
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        
        // Don't retry if this is the last attempt or error is not retryable
        if (attempt === maxRetries || !isRetryableError(lastError)) {
          throw lastError
        }
        
        // Call retry callback if provided
        if (onRetry) {
          onRetry(attempt + 1, lastError)
        }
        
        // Wait before retrying with exponential backoff
        const waitTime = delay * Math.pow(backoffMultiplier, attempt)
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }
    
    throw lastError!
  }
}

/**
 * Provides recovery suggestions based on error type
 * @param error - Error to analyze
 */
function provideRecoverySuggestions(error: Error): void {
  if (isNetworkError(error)) {
    console.info('Recovery suggestion: Check your internet connection')
  } else if (isValidationError(error)) {
    console.info('Recovery suggestion: Please check your input and try again')
  } else {
    console.info('Recovery suggestion: Please try refreshing the page')
  }
}

/**
 * Common error codes used throughout the application
 */
export const ERROR_CODES = {
  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  CONNECTION_ERROR: 'CONNECTION_ERROR',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  REQUIRED_FIELD: 'REQUIRED_FIELD',
  
  // Application errors
  COMPONENT_ERROR: 'COMPONENT_ERROR',
  STATE_ERROR: 'STATE_ERROR',
  STORAGE_ERROR: 'STORAGE_ERROR',
  
  // Unknown errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
} as const

/**
 * Error boundary helper for React components
 */
export interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

/**
 * Creates error boundary state from error
 * @param error - Error that occurred
 * @param errorInfo - React error info
 * @returns Error boundary state
 */
export function createErrorBoundaryState(
  error: Error,
  errorInfo?: React.ErrorInfo
): ErrorBoundaryState {
  return {
    hasError: true,
    error,
    errorInfo
  }
}

/**
 * Resets error boundary state
 * @returns Reset error boundary state
 */
export function resetErrorBoundaryState(): ErrorBoundaryState {
  return {
    hasError: false,
    error: undefined,
    errorInfo: undefined
  }
}

/**
 * Loading state management
 */
export interface LoadingState {
  isLoading: boolean
  error?: Error
  data?: any
}

/**
 * Creates initial loading state
 * @returns Initial loading state
 */
export function createLoadingState(): LoadingState {
  return {
    isLoading: false,
    error: undefined,
    data: undefined
  }
}

/**
 * Creates loading state
 * @returns Loading state
 */
export function setLoadingState(): LoadingState {
  return {
    isLoading: true,
    error: undefined,
    data: undefined
  }
}

/**
 * Creates success state with data
 * @param data - Success data
 * @returns Success state
 */
export function setSuccessState(data: any): LoadingState {
  return {
    isLoading: false,
    error: undefined,
    data
  }
}

/**
 * Creates error state
 * @param error - Error that occurred
 * @returns Error state
 */
export function setErrorState(error: Error): LoadingState {
  return {
    isLoading: false,
    error,
    data: undefined
  }
}

/**
 * Global error handler for unhandled errors
 */
export function setupGlobalErrorHandling(): void {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason instanceof Error 
      ? event.reason 
      : new Error(String(event.reason))
    
    logError(error, ErrorSeverity.HIGH, { 
      type: 'unhandledrejection',
      promise: event.promise 
    })
    
    // Prevent the default browser behavior
    event.preventDefault()
  })
  
  // Handle global errors
  window.addEventListener('error', (event) => {
    const error = event.error instanceof Error 
      ? event.error 
      : new Error(event.message)
    
    logError(error, ErrorSeverity.HIGH, {
      type: 'global',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    })
  })
}