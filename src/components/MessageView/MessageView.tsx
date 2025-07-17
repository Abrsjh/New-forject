import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Hash, Lock, Users, MessageSquare } from 'lucide-react'
// import { formatDistanceToNow } from 'date-fns'
import { useAppStore } from '../../stores/useAppStore'
import { getUserById } from '../../data/mockData'
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner'
import { 
  groupMessagesByDate, 
  formatMessageTimestamp, 
  shouldAutoScroll, 
  performAutoScroll,
  saveScrollPosition,
  debounceScroll,
  type MessageItem,
  type DateSeparator,
} from '../../utils/timestampUtils'
import type { Message, Channel } from '../../types'

import MessageComposer from '../MessageComposer/MessageComposer'

const MessageView: React.FC = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  // const [savedScrollPosition, setSavedScrollPosition] = useState<ScrollPosition | null>(null)
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true)
  const [showDetailedTimestamps, setShowDetailedTimestamps] = useState(false)
  
  const { 
    activeChannelId, 
    channels, 
    isLoading, 
    getChannelMessages 
  } = useAppStore()

  const activeChannel = channels.find(channel => channel.id === activeChannelId)
  const messages = activeChannelId ? getChannelMessages(activeChannelId) : []
  const groupedMessages = groupMessagesByDate(messages)

  // Debounced scroll handler for performance
  const handleScroll = useCallback(
    debounceScroll(() => {
      if (scrollContainerRef.current) {
        const isAtBottom = shouldAutoScroll(scrollContainerRef.current, true)
        setAutoScrollEnabled(isAtBottom)
      }
    }, 100),
    []
  )

  // Enhanced auto-scroll with position management
  useEffect(() => {
    if (messagesEndRef.current && scrollContainerRef.current) {
      performAutoScroll(scrollContainerRef.current, autoScrollEnabled, true, 'smooth')
    }
  }, [messages, autoScrollEnabled])

  // Handle channel changes with scroll position preservation
  useEffect(() => {
    if (scrollContainerRef.current) {
      // Save current position when changing channels
      saveScrollPosition(scrollContainerRef.current)
      // setSavedScrollPosition(currentPosition)
      
      // Reset auto-scroll for new channel
      setAutoScrollEnabled(true)
      
      // Scroll to bottom for new channel after a brief delay
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
    }
  }, [activeChannelId])

  const shouldGroupMessage = (currentMessage: Message, previousMessage: Message | undefined): boolean => {
    if (!previousMessage) return false
    
    // Group if same user and within 5 minutes
    const timeDiff = currentMessage.timestamp.getTime() - previousMessage.timestamp.getTime()
    const fiveMinutes = 5 * 60 * 1000
    
    return (
      currentMessage.userId === previousMessage.userId &&
      currentMessage.type === 'text' &&
      previousMessage.type === 'text' &&
      timeDiff < fiveMinutes
    )
  }

  const renderChannelHeader = (channel: Channel) => (
    <div 
      className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
      aria-label="Channel information"
    >
      <div className="flex items-center">
        {channel.type === 'private' ? (
          <Lock className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" data-testid="channel-header-icon" />
        ) : (
          <Hash className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" data-testid="channel-header-icon" />
        )}
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            {channel.name}
          </h1>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <span>{channel.description}</span>
            <span className="mx-2">&bull;</span>
            <Users className="w-4 h-4 mr-1" />
            <span>{channel.memberCount} members</span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderDateSeparator = (separator: DateSeparator) => {
    return (
      <div 
        key={`separator-${separator.date.getTime()}`}
        data-testid={`date-separator-${separator.date.getTime()}`}
        className="flex items-center my-4 px-4"
      >
        <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
        <div className="px-4 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            {separator.label}
          </span>
        </div>
        <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
      </div>
    )
  }

  const renderMessage = (message: Message, _index: number, isGrouped: boolean) => {
    const user = getUserById(message.userId)
    const isSystem = message.type === 'system'

    if (isSystem) {
      return (
        <div 
          key={message.id}
          data-testid={`message-${message.id}`}
          className="px-4 py-2 text-center system-message"
        >
          <span className="text-sm text-gray-500 dark:text-gray-400 italic">
            {message.content}
          </span>
        </div>
      )
    }

    if (isGrouped) {
      return (
        <div 
          key={message.id}
          data-testid={`message-${message.id}`}
          className="px-4 py-1 hover:bg-gray-50 dark:hover:bg-gray-800 group grouped-message"
        >
          <div className="ml-12">
            <div className="flex items-baseline">
              <span className="text-sm text-gray-900 dark:text-white">
                {message.content}
              </span>
              {message.editedAt && (
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                  (edited)
                </span>
              )}
              <span 
                data-testid={`message-timestamp-${message.id}`}
                className="ml-2 text-xs text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={() => setShowDetailedTimestamps(!showDetailedTimestamps)}
                title="Click to toggle detailed timestamps"
              >
                {formatMessageTimestamp(message.timestamp, showDetailedTimestamps)}
              </span>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div 
        key={message.id}
        data-testid={`message-${message.id}`}
        className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 group"
      >
        <div className="flex">
          <img
            src={user?.avatar || 'https://via.placeholder.com/40'}
            alt={`${user?.name || 'Unknown user'} avatar`}
            className="w-10 h-10 rounded-full mr-3 flex-shrink-0"
            data-testid={`message-avatar-${message.id}`}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline mb-1">
              <span className="font-medium text-gray-900 dark:text-white mr-2">
                {user?.name || 'Unknown User'}
              </span>
              <span 
                data-testid={`message-timestamp-${message.id}`}
                className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer"
                onClick={() => setShowDetailedTimestamps(!showDetailedTimestamps)}
                title="Click to toggle detailed timestamps"
              >
                {formatMessageTimestamp(message.timestamp, showDetailedTimestamps)}
              </span>
              {message.editedAt && (
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                  (edited)
                </span>
              )}
            </div>
            <div className="text-sm text-gray-900 dark:text-white">
              {message.content}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderMessageItem = (item: MessageItem, _index: number) => {
    if (typeof item === 'object' && 'type' in item && item.type === 'date-separator') {
      return renderDateSeparator(item)
    }
    
    // Find the original message index for grouping logic
    const messageIndex = messages.findIndex(msg => msg.id === item.id)
    const previousMessage = messageIndex > 0 ? messages[messageIndex - 1] : undefined
    const isGrouped = shouldGroupMessage(item, previousMessage)
    return renderMessage(item, messageIndex, isGrouped)
  }

  const renderEmptyState = () => (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center">
        <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No messages yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Be the first to start the conversation!
        </p>
      </div>
    </div>
  )

  const renderNoChannelState = () => (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center">
        <Hash className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Select a channel to start messaging
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Choose a channel from the sidebar to view and send messages.
        </p>
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div data-testid="message-view" className="flex-1 flex items-center justify-center">
        <LoadingSpinner message="Loading messages..." />
      </div>
    )
  }

  if (!activeChannelId || !activeChannel) {
    return (
      <div data-testid="message-view" className="flex flex-col h-full">
        {renderNoChannelState()}
      </div>
    )
  }

  return (
    <div data-testid="message-view" className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Channel Header */}
      {renderChannelHeader(activeChannel)}

      {/* Messages List */}
      <div 
        ref={scrollContainerRef}
        data-testid="message-container"
        className="flex-1 overflow-y-auto"
        onScroll={handleScroll}
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
      >
        {messages.length === 0 ? (
          <div data-testid="empty-messages">
            {renderEmptyState()}
          </div>
        ) : (
          <div data-testid="message-list" className="pb-4">
            {groupedMessages.map((item, index) => renderMessageItem(item, index))}
            <div ref={messagesEndRef} />
          </div>
        )}
        
        {/* Scroll to bottom button */}
        {!autoScrollEnabled && messages.length > 0 && (
          <button
            data-testid="scroll-to-bottom"
            onClick={() => {
              setAutoScrollEnabled(true)
              if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
              }
            }}
            className="fixed bottom-20 right-6 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 z-10"
            aria-label="Scroll to bottom"
            title="Scroll to bottom"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Message Composer */}
      {activeChannel && (
        <MessageComposer 
          channelId={activeChannel.id}
          disabled={isLoading}
        />
      )}
    </div>
  )
}

export default MessageView