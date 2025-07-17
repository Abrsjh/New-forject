import { describe, it, expect, vi, beforeEach } from 'vitest'
import { 
  createErrorHandler,
  logError,
  getErrorMessage,
  isNetworkError,
  isValidationError,
  createRetryHandler,
  ErrorSeverity,
  AppError
} from './errorHandling'

// Mock console methods
const mockConsole = {
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn()
}

Object.assign(console, mockConsole)

describe('errorHandling', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createErrorHandler', () => {
    it('should create error handler with default options', () => {
      const handler = createErrorHandler()
      expect(typeof handler).toBe('function')
    })

    it('should handle errors with custom callback', () => {
      const mockCallback = vi.fn()
      const handler = createErrorHandler({ onError: mockCallback })
      
      const error = new Error('Test error')
      handler(error)
      
      expect(mockCallback).toHaveBeenCalledWith(error)
    })

    it('should log errors when logging is enabled', () => {
      const handler = createErrorHandler({ enableLogging: true })
      
      const error = new Error('Test error')
      handler(error)
      
      expect(console.error).toHaveBeenCalledWith('[ErrorHandler]', error)
    })

    it('should not log errors when logging is disabled', () => {
      const handler = createErrorHandler({ enableLogging: false })
      
      const error = new Error('Test error')
      handler(error)
      
      expect(console.error).not.toHaveBeenCalled()
    })
  })

  describe('logError', () => {
    it('should log error with high severity', () => {
      const error = new Error('Critical error')
      logError(error, ErrorSeverity.HIGH)
      
      expect(console.error).toHaveBeenCalledWith('[HIGH]', error)
    })

    it('should log error with medium severity', () => {
      const error = new Error('Warning error')
      logError(error, ErrorSeverity.MEDIUM)
      
      expect(console.warn).toHaveBeenCalledWith('[MEDIUM]', error)
    })

    it('should log error with low severity', () => {
      const error = new Error('Info error')
      logError(error, ErrorSeverity.LOW)
      
      expect(console.info).toHaveBeenCalledWith('[LOW]', error)
    })

    it('should include context when provided', () => {
      const error = new Error('Test error')
      const context = { component: 'MessageView', action: 'loadMessages' }
      
      logError(error, ErrorSeverity.HIGH, context)
      
      expect(console.error).toHaveBeenCalledWith('[HIGH]', error, 'Context:', context)
    })
  })

  describe('getErrorMessage', () => {
    it('should return error message for Error objects', () => {
      const error = new Error('Test error message')
      expect(getErrorMessage(error)).toBe('Test error message')
    })

    it('should return string for string errors', () => {
      expect(getErrorMessage('String error')).toBe('String error')
    })

    it('should return JSON string for object errors', () => {
      const errorObj = { code: 'VALIDATION_ERROR', message: 'Invalid input' }
      expect(getErrorMessage(errorObj)).toBe('{"code":"VALIDATION_ERROR","message":"Invalid input"}')
    })

    it('should return default message for unknown error types', () => {
      expect(getErrorMessage(null)).toBe('An unknown error occurred')
      expect(getErrorMessage(undefined)).toBe('An unknown error occurred')
      expect(getErrorMessage(123)).toBe('An unknown error occurred')
    })

    it('should handle circular references in objects', () => {
      const obj: any = { name: 'test' }
      obj.self = obj // Create circular reference
      
      const result = getErrorMessage(obj)
      expect(result).toBe('An unknown error occurred')
    })
  })

  describe('isNetworkError', () => {
    it('should identify network errors', () => {
      const networkError = new Error('Network request failed')
      networkError.name = 'NetworkError'
      
      expect(isNetworkError(networkError)).toBe(true)
    })

    it('should identify fetch errors', () => {
      const fetchError = new Error('Failed to fetch')
      expect(isNetworkError(fetchError)).toBe(true)
    })

    it('should identify timeout errors', () => {
      const timeoutError = new Error('Request timeout')
      expect(isNetworkError(timeoutError)).toBe(true)
    })

    it('should not identify non-network errors', () => {
      const regularError = new Error('Regular error')
      expect(isNetworkError(regularError)).toBe(false)
    })
  })

  describe('isValidationError', () => {
    it('should identify validation errors by name', () => {
      const validationError = new Error('Validation failed')
      validationError.name = 'ValidationError'
      
      expect(isValidationError(validationError)).toBe(true)
    })

    it('should identify validation errors by message', () => {
      const validationError = new Error('Invalid input provided')
      expect(isValidationError(validationError)).toBe(true)
    })

    it('should not identify non-validation errors', () => {
      const regularError = new Error('Regular error')
      expect(isValidationError(regularError)).toBe(false)
    })
  })

  describe('createRetryHandler', () => {
    it('should create retry handler with default options', () => {
      const handler = createRetryHandler(() => Promise.resolve('success'))
      expect(typeof handler).toBe('function')
    })

    it('should retry failed operations', async () => {
      let attempts = 0
      const operation = vi.fn().mockImplementation(() => {
        attempts++
        if (attempts < 3) {
          return Promise.reject(new Error('Temporary failure'))
        }
        return Promise.resolve('success')
      })

      const retryHandler = createRetryHandler(operation, { maxRetries: 3, delay: 10 })
      const result = await retryHandler()

      expect(result).toBe('success')
      expect(operation).toHaveBeenCalledTimes(3)
    })

    it('should fail after max retries', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('Persistent failure'))
      const retryHandler = createRetryHandler(operation, { maxRetries: 2, delay: 10 })

      await expect(retryHandler()).rejects.toThrow('Persistent failure')
      expect(operation).toHaveBeenCalledTimes(3) // Initial + 2 retries
    })

    it('should not retry non-retryable errors', async () => {
      const validationError = new Error('Invalid input')
      validationError.name = 'ValidationError'
      
      const operation = vi.fn().mockRejectedValue(validationError)
      const retryHandler = createRetryHandler(operation, { maxRetries: 3 })

      await expect(retryHandler()).rejects.toThrow('Invalid input')
      expect(operation).toHaveBeenCalledTimes(1) // No retries for validation errors
    })

    it('should call onRetry callback', async () => {
      const onRetry = vi.fn()
      let attempts = 0
      
      const operation = vi.fn().mockImplementation(() => {
        attempts++
        if (attempts < 2) {
          return Promise.reject(new Error('Temporary failure'))
        }
        return Promise.resolve('success')
      })

      const retryHandler = createRetryHandler(operation, { 
        maxRetries: 2, 
        delay: 10,
        onRetry 
      })
      
      await retryHandler()

      expect(onRetry).toHaveBeenCalledTimes(1)
      expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error))
    })
  })

  describe('AppError', () => {
    it('should create app error with all properties', () => {
      const error = new AppError(
        'Test error',
        'TEST_ERROR',
        ErrorSeverity.HIGH,
        { component: 'TestComponent' }
      )

      expect(error.message).toBe('Test error')
      expect(error.code).toBe('TEST_ERROR')
      expect(error.severity).toBe(ErrorSeverity.HIGH)
      expect(error.context).toEqual({ component: 'TestComponent' })
      expect(error.timestamp).toBeInstanceOf(Date)
    })

    it('should create app error with minimal properties', () => {
      const error = new AppError('Simple error')

      expect(error.message).toBe('Simple error')
      expect(error.code).toBe('UNKNOWN_ERROR')
      expect(error.severity).toBe(ErrorSeverity.MEDIUM)
      expect(error.context).toBeUndefined()
    })

    it('should be instance of Error', () => {
      const error = new AppError('Test error')
      expect(error).toBeInstanceOf(Error)
      expect(error.name).toBe('AppError')
    })
  })

  describe('Error Recovery', () => {
    it('should provide error recovery suggestions', () => {
      const networkError = new Error('Failed to fetch')
      const handler = createErrorHandler({ 
        enableLogging: true,
        onError: (error) => {
          if (isNetworkError(error)) {
            console.info('Recovery suggestion: Check your internet connection')
          }
        }
      })

      handler(networkError)

      expect(console.info).toHaveBeenCalledWith('Recovery suggestion: Check your internet connection')
    })
  })
})