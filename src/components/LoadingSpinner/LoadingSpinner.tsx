import React from 'react'
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react'

export interface LoadingSpinnerProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  variant?: 'spinner' | 'dots' | 'pulse'
  overlay?: boolean
  progress?: number
  error?: string
  success?: boolean
  timeout?: number
  onTimeout?: () => void
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Loading...', 
  size = 'md',
  className = '',
  variant = 'spinner',
  overlay = false,
  progress,
  error,
  success = false,
  timeout,
  onTimeout
}) => {
  const [hasTimedOut, setHasTimedOut] = React.useState(false)

  // Handle timeout
  React.useEffect(() => {
    if (timeout && onTimeout) {
      const timer = setTimeout(() => {
        setHasTimedOut(true)
        onTimeout()
      }, timeout)

      return () => clearTimeout(timer)
    }
  }, [timeout, onTimeout])

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  const containerClasses = overlay
    ? 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
    : 'flex flex-col items-center justify-center p-8'

  const renderSpinner = () => {
    if (error) {
      return (
        <AlertCircle 
          className={`text-red-500 dark:text-red-400 mb-2 ${sizeClasses[size]}`}
          aria-hidden="true"
          data-testid="error-icon"
        />
      )
    }

    if (success) {
      return (
        <CheckCircle 
          className={`text-green-500 dark:text-green-400 mb-2 ${sizeClasses[size]}`}
          aria-hidden="true"
          data-testid="success-icon"
        />
      )
    }

    switch (variant) {
      case 'dots':
        return (
          <div className="flex space-x-1 mb-2" data-testid="dots-spinner">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse ${
                  size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-2 h-2' : 'w-3 h-3'
                }`}
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1s'
                }}
              />
            ))}
          </div>
        )
      
      case 'pulse':
        return (
          <div 
            className={`bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse mb-2 ${sizeClasses[size]}`}
            data-testid="pulse-spinner"
          />
        )
      
      default:
        return (
          <Loader2 
            className={`animate-spin text-blue-600 dark:text-blue-400 mb-2 ${sizeClasses[size]}`}
            aria-hidden="true"
            data-testid="spinner-icon"
          />
        )
    }
  }

  const getMessage = () => {
    if (hasTimedOut) {
      return 'This is taking longer than expected...'
    }
    if (error) {
      return error
    }
    if (success) {
      return 'Complete!'
    }
    return message
  }

  const getMessageColor = () => {
    if (error) return 'text-red-600 dark:text-red-400'
    if (success) return 'text-green-600 dark:text-green-400'
    if (hasTimedOut) return 'text-orange-600 dark:text-orange-400'
    return 'text-gray-600 dark:text-gray-300'
  }

  return (
    <div 
      data-testid="loading-spinner"
      className={`${containerClasses} ${className}`}
      role="status"
      aria-live="polite"
      aria-label={error ? 'Error occurred' : success ? 'Operation completed' : 'Loading content'}
    >
      {overlay && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg">
          <div className="flex flex-col items-center">
            {renderSpinner()}
            <span className={`${textSizeClasses[size]} ${getMessageColor()}`}>
              {getMessage()}
            </span>
            
            {/* Progress bar */}
            {typeof progress === 'number' && !error && !success && (
              <div className="w-full max-w-xs mt-4">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                    data-testid="progress-bar"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {!overlay && (
        <>
          {renderSpinner()}
          <span className={`${textSizeClasses[size]} ${getMessageColor()}`}>
            {getMessage()}
          </span>
          
          {/* Progress bar for non-overlay */}
          {typeof progress === 'number' && !error && !success && (
            <div className="w-full max-w-xs mt-4">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                  data-testid="progress-bar"
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default LoadingSpinner