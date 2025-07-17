import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom'
import { useAppStore } from './stores/useAppStore'
import { StorageManager } from './utils/storage'
import Layout from './components/Layout/Layout'
import NotFound from './components/NotFound/NotFound'
import LoadingSpinner from './components/LoadingSpinner/LoadingSpinner'
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary'
import { 
  setupGlobalErrorHandling, 
  createErrorHandler, 
  logError, 
  ErrorSeverity,
  AppError,
  ERROR_CODES
} from './utils/errorHandling'

// Channel route component that handles channel validation and navigation
const ChannelRoute: React.FC = () => {
  const { channelId } = useParams<{ channelId: string }>()
  const navigate = useNavigate()
  const { channels, setActiveChannel, isLoading } = useAppStore()

  useEffect(() => {
    if (!channelId || isLoading) return

    // Check if channel exists
    const channelExists = channels.some(channel => channel.id === channelId)
    
    if (channelExists) {
      setActiveChannel(channelId)
    } else if (channels.length > 0) {
      // Channel doesn't exist, show 404
      navigate('/404/channel', { replace: true })
    }
  }, [channelId, channels, setActiveChannel, navigate, isLoading])

  if (isLoading) {
    return <LoadingSpinner message="Loading channels..." />
  }

  if (!channelId) {
    return <NotFound />
  }

  const channelExists = channels.some(channel => channel.id === channelId)
  if (!channelExists) {
    return <NotFound type="channel" />
  }

  return <Layout />
}

// Root redirect component
const RootRedirect: React.FC = () => {
  const { channels, isLoading } = useAppStore()

  if (isLoading) {
    return <LoadingSpinner message="Loading..." />
  }

  // Redirect to first available channel or general as fallback
  const defaultChannel = channels.length > 0 ? channels[0].id : 'general'
  return <Navigate to={`/channel/${defaultChannel}`} replace />
}

// Theme effect hook
const useThemeEffect = () => {
  const { theme } = useAppStore()

  useEffect(() => {
    const resolvedTheme = StorageManager.getResolvedTheme(theme)
    
    if (resolvedTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])
}

// Error display component
const ErrorDisplay: React.FC<{ error: string; onDismiss: () => void }> = ({ error, onDismiss }) => (
  <div 
    className="fixed top-4 right-4 z-50 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg shadow-lg max-w-md"
    role="alert"
    aria-live="assertive"
  >
    <div className="flex items-center justify-between">
      <span className="text-sm">{error}</span>
      <button
        onClick={onDismiss}
        className="ml-4 text-red-500 hover:text-red-700 dark:text-red-300 dark:hover:text-red-100"
        aria-label="Dismiss error"
      >
        &times;
      </button>
    </div>
  </div>
)

// Main App component
const AppContent: React.FC = () => {
  const { initializeStore, loadMockData, error, clearError, isLoading } = useAppStore()

  // Initialize app on mount
  useEffect(() => {
    try {
      initializeStore()
      loadMockData()
    } catch (err) {
      const appError = new AppError(
        'Failed to initialize application',
        ERROR_CODES.STATE_ERROR,
        ErrorSeverity.HIGH,
        { component: 'App', action: 'initialize' }
      )
      logError(appError, ErrorSeverity.HIGH)
    }
  }, [initializeStore, loadMockData])

  // Setup global error handling
  useEffect(() => {
    setupGlobalErrorHandling()
  }, [])

  // Apply theme to document
  useThemeEffect()

  return (
    <>
      {/* Global error display */}
      {error && (
        <ErrorDisplay error={error} onDismiss={clearError} />
      )}

      {/* Global loading state */}
      {isLoading && (
        <LoadingSpinner 
          message="Loading OpenBoard..." 
          size="lg" 
          overlay={true}
          timeout={10000}
          onTimeout={() => {
            logError(
              new AppError(
                'Application loading timeout',
                ERROR_CODES.TIMEOUT_ERROR,
                ErrorSeverity.MEDIUM
              ),
              ErrorSeverity.MEDIUM
            )
          }}
        />
      )}

      {/* Routes */}
      <Routes>
        {/* Root redirect */}
        <Route path="/" element={<RootRedirect />} />
        
        {/* Channel routes */}
        <Route path="/channel/:channelId" element={<ChannelRoute />} />
        
        {/* 404 routes */}
        <Route path="/404/channel" element={<NotFound type="channel" />} />
        <Route path="/404" element={<NotFound />} />
        
        {/* Catch-all 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

// App wrapper with router and error boundary
const App: React.FC = () => {
  const handleAppError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log the error with context
    logError(error, ErrorSeverity.HIGH, {
      component: 'App',
      errorInfo: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    })

    // You could also send to error reporting service here
    // Example: sendToErrorReporting(error, errorInfo)
  }

  return (
    <ErrorBoundary 
      onError={handleAppError}
      enableRetry={true}
      showErrorDetails={process.env.NODE_ENV === 'development'}
    >
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App