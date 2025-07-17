/**
 * Timestamp utilities for message display and auto-scroll functionality
 * Includes relative formatting, date grouping, and scroll position management
 */

import { formatDistanceToNow, format, isToday, isYesterday, isSameDay } from 'date-fns'
import type { Message } from '../types'

/**
 * Date separator item for message grouping
 */
export interface DateSeparator {
  type: 'date-separator'
  date: Date
  label: string
}

/**
 * Combined type for messages and date separators
 */
export type MessageItem = Message | DateSeparator

/**
 * Formats a message timestamp based on context
 * @param timestamp - Message timestamp
 * @param showTime - Whether to show exact time instead of relative
 * @returns Formatted timestamp string
 */
export function formatMessageTimestamp(timestamp: Date, showTime: boolean = false): string {
  try {
    if (isNaN(timestamp.getTime())) {
      return 'Invalid date'
    }

    if (showTime) {
      return format(timestamp, 'h:mm a')
    }

    return formatDistanceToNow(timestamp, { addSuffix: true })
  } catch (error) {
    return 'Invalid date'
  }
}

/**
 * Determines if a date separator should be shown between messages
 * @param currentMessage - Current message
 * @param previousMessage - Previous message (if any)
 * @returns True if date separator should be shown
 */
export function shouldShowDateSeparator(
  currentMessage: Message, 
  previousMessage: Message | undefined
): boolean {
  if (!previousMessage) {
    return true // Always show separator for first message
  }

  // Show separator if messages are on different days
  return !isSameDay(currentMessage.timestamp, previousMessage.timestamp)
}

/**
 * Formats a date for use in date separators
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatDateSeparator(date: Date): string {
  if (isToday(date)) {
    return 'Today'
  }
  
  if (isYesterday(date)) {
    return 'Yesterday'
  }
  
  return format(date, 'EEEE, MMMM d, yyyy')
}

/**
 * Groups messages by date and inserts date separators
 * @param messages - Array of messages to group
 * @returns Array of messages and date separators
 */
export function groupMessagesByDate(messages: Message[]): MessageItem[] {
  if (messages.length === 0) {
    return []
  }

  const result: MessageItem[] = []
  
  for (let i = 0; i < messages.length; i++) {
    const currentMessage = messages[i]
    const previousMessage = messages[i - 1]
    
    // Add date separator if needed
    if (shouldShowDateSeparator(currentMessage, previousMessage)) {
      const separator: DateSeparator = {
        type: 'date-separator',
        date: currentMessage.timestamp,
        label: formatDateSeparator(currentMessage.timestamp)
      }
      result.push(separator)
    }
    
    // Add the message
    result.push(currentMessage)
  }
  
  return result
}

/**
 * Scroll behavior options
 */
export type ScrollBehavior = 'auto' | 'smooth' | 'instant'

/**
 * Gets appropriate scroll behavior based on context
 * @param isAutoScroll - Whether this is an automatic scroll
 * @param isUserNavigation - Whether this is user-initiated navigation
 * @returns Scroll behavior
 */
export function getScrollBehavior(
  isAutoScroll: boolean, 
  isUserNavigation: boolean
): ScrollBehavior {
  if (isAutoScroll) {
    return 'smooth'
  }
  
  if (isUserNavigation) {
    return 'instant'
  }
  
  return 'auto'
}

/**
 * Determines if auto-scroll should be triggered
 * @param scrollContainer - Scroll container element
 * @param autoScrollEnabled - Whether auto-scroll is enabled
 * @param threshold - Distance from bottom to consider "at bottom" (default: 50px)
 * @returns True if should auto-scroll
 */
export function shouldAutoScroll(
  scrollContainer: HTMLElement | null,
  autoScrollEnabled: boolean,
  threshold: number = 50
): boolean {
  if (!autoScrollEnabled || !scrollContainer) {
    return false
  }

  const { scrollTop, scrollHeight, clientHeight } = scrollContainer
  const distanceFromBottom = scrollHeight - scrollTop - clientHeight
  
  // Consider user "at bottom" if within threshold
  return distanceFromBottom <= threshold
}

/**
 * Scroll position management utilities
 */
export interface ScrollPosition {
  scrollTop: number
  scrollHeight: number
  timestamp: number
}

/**
 * Saves current scroll position
 * @param scrollContainer - Scroll container element
 * @returns Scroll position object
 */
export function saveScrollPosition(scrollContainer: HTMLElement | null): ScrollPosition | null {
  if (!scrollContainer) {
    return null
  }

  return {
    scrollTop: scrollContainer.scrollTop,
    scrollHeight: scrollContainer.scrollHeight,
    timestamp: Date.now()
  }
}

/**
 * Restores scroll position, accounting for content changes
 * @param scrollContainer - Scroll container element
 * @param savedPosition - Previously saved scroll position
 * @param behavior - Scroll behavior
 */
export function restoreScrollPosition(
  scrollContainer: HTMLElement | null,
  savedPosition: ScrollPosition | null,
  behavior: ScrollBehavior = 'auto'
): void {
  if (!scrollContainer || !savedPosition) {
    return
  }

  const { scrollTop, scrollHeight: oldScrollHeight } = savedPosition
  const currentScrollHeight = scrollContainer.scrollHeight
  
  // If content was added above current position, adjust scroll position
  const heightDifference = currentScrollHeight - oldScrollHeight
  const newScrollTop = scrollTop + (heightDifference > 0 ? heightDifference : 0)
  
  scrollContainer.scrollTo({
    top: newScrollTop,
    behavior
  })
}

/**
 * Smoothly scrolls to bottom of container
 * @param scrollContainer - Scroll container element
 * @param behavior - Scroll behavior
 */
export function scrollToBottom(
  scrollContainer: HTMLElement | null,
  behavior: ScrollBehavior = 'smooth'
): void {
  if (!scrollContainer) {
    return
  }

  scrollContainer.scrollTo({
    top: scrollContainer.scrollHeight,
    behavior
  })
}

/**
 * Enhanced auto-scroll with position preservation
 * @param scrollContainer - Scroll container element
 * @param shouldScroll - Whether to perform auto-scroll
 * @param preservePosition - Whether to preserve scroll position if not at bottom
 * @param behavior - Scroll behavior
 */
export function performAutoScroll(
  scrollContainer: HTMLElement | null,
  shouldScroll: boolean = true,
  preservePosition: boolean = true,
  behavior: ScrollBehavior = 'smooth'
): void {
  if (!scrollContainer || !shouldScroll) {
    return
  }

  const wasAtBottom = shouldAutoScroll(scrollContainer, true)
  
  if (wasAtBottom) {
    scrollToBottom(scrollContainer, behavior)
  } else if (!preservePosition) {
    // Force scroll to bottom even if user was not at bottom
    scrollToBottom(scrollContainer, behavior)
  }
  // If preservePosition is true and user was not at bottom, do nothing
}

/**
 * Debounced scroll handler for performance
 * @param callback - Callback function to execute
 * @param delay - Debounce delay in milliseconds
 * @returns Debounced function
 */
export function debounceScroll<T extends (...args: any[]) => void>(
  callback: T,
  delay: number = 100
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      callback(...args)
    }, delay)
  }
}

/**
 * Timestamp grouping configuration
 */
export interface TimestampGroupConfig {
  showDateSeparators: boolean
  showRelativeTime: boolean
  groupingThreshold: number // minutes
  dateFormat: string
  timeFormat: string
}

/**
 * Default timestamp configuration
 */
export const DEFAULT_TIMESTAMP_CONFIG: TimestampGroupConfig = {
  showDateSeparators: true,
  showRelativeTime: true,
  groupingThreshold: 5, // 5 minutes
  dateFormat: 'EEEE, MMMM d, yyyy',
  timeFormat: 'h:mm a'
}

/**
 * Creates a timestamp formatter with custom configuration
 * @param config - Timestamp configuration
 * @returns Formatter functions
 */
export function createTimestampFormatter(config: Partial<TimestampGroupConfig> = {}) {
  const finalConfig = { ...DEFAULT_TIMESTAMP_CONFIG, ...config }
  
  return {
    formatMessage: (timestamp: Date, showTime: boolean = false) => 
      formatMessageTimestamp(timestamp, showTime),
    
    formatSeparator: (date: Date) => formatDateSeparator(date),
    
    groupMessages: (messages: Message[]) => 
      finalConfig.showDateSeparators ? groupMessagesByDate(messages) : messages,
    
    config: finalConfig
  }
}