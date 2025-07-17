import React, { useState, useRef, useEffect } from 'react'
import { Send, X } from 'lucide-react'
import { useAppStore } from '../../stores/useAppStore'

interface MessageComposerProps {
  channelId: string
  disabled?: boolean
}

const MessageComposer: React.FC<MessageComposerProps> = ({ channelId, disabled = false }) => {
  const [message, setMessage] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { addMessage, error, clearError } = useAppStore()

  // Character limit constants
  const MAX_CHARACTERS = 2000
  const WARNING_THRESHOLD = 1900

  // Focus input on mount and after sending
  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus()
    }
  }, [disabled])

  // Calculate character count and validation
  const characterCount = message.length
  const isNearLimit = characterCount >= WARNING_THRESHOLD
  const isAtLimit = characterCount >= MAX_CHARACTERS
  const isValidMessage = message.trim().length > 0 && !disabled

  // Get character count color based on usage
  const getCharacterCountColor = () => {
    if (isAtLimit) return 'text-red-500 dark:text-red-400'
    if (isNearLimit) return 'text-orange-500 dark:text-orange-400'
    return 'text-gray-500 dark:text-gray-400'
  }

  // Handle input change with character limit enforcement
  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value
    
    // Enforce character limit
    if (value.length <= MAX_CHARACTERS) {
      setMessage(value)
    } else {
      // Truncate to max characters
      setMessage(value.slice(0, MAX_CHARACTERS))
    }
  }

  // Handle form submission
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    sendMessage()
  }

  // Handle key down events
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
    // Allow Shift+Enter for new lines
  }

  // Send message function
  const sendMessage = () => {
    const trimmedMessage = message.trim()
    
    if (!trimmedMessage || disabled) {
      return
    }

    // Add message to store (using current user - in a real app this would come from auth)
    addMessage(channelId, {
      channelId,
      userId: 'current-user', // This would be the authenticated user's ID
      content: trimmedMessage,
      type: 'text'
    })

    // Clear input and refocus
    setMessage('')
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  // Handle error dismissal
  const handleDismissError = () => {
    clearError()
  }

  return (
    <div data-testid="message-composer" className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      {/* Error display */}
      {error && (
        <div 
          data-testid="error-message"
          className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
            <button
              data-testid="dismiss-error"
              onClick={handleDismissError}
              className="ml-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
              aria-label="Dismiss error"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Message composer form */}
      <form 
        data-testid="message-form"
        onSubmit={handleSubmit}
        className="p-4"
      >
        <div className="flex items-end space-x-3">
          {/* Message input */}
          <div className="flex-1">
            <div className="relative">
              <textarea
                ref={inputRef}
                data-testid="message-input"
                value={message}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                placeholder={disabled ? 'Message sending is disabled' : 'Type a message...'}
                className={`w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                  disabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                rows={1}
                style={{
                  minHeight: '40px',
                  maxHeight: '120px',
                  height: 'auto'
                }}
                aria-label="Type your message"
                aria-describedby="character-count"
              />
            </div>
            
            {/* Character count */}
            <div className="flex justify-between items-center mt-1">
              <div className="flex-1" />
              <span
                id="character-count"
                data-testid="character-count"
                className={`text-xs ${getCharacterCountColor()}`}
                aria-live="polite"
              >
                {characterCount}/{MAX_CHARACTERS}
              </span>
            </div>
          </div>

          {/* Send button */}
          <button
            type="submit"
            data-testid="send-button"
            disabled={!isValidMessage}
            className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
              isValidMessage
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {/* Keyboard shortcuts hint */}
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          <span>Press Enter to send, Shift+Enter for new line</span>
        </div>
      </form>
    </div>
  )
}

export default MessageComposer