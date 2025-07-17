import { describe, it, expect, beforeEach, vi } from 'vitest'
import { 
  formatMessageTimestamp, 
  shouldShowDateSeparator, 
  groupMessagesByDate,
  formatDateSeparator,
  getScrollBehavior,
  shouldAutoScroll
} from './timestampUtils'
import type { Message } from '../types'

// Mock date-fns functions
vi.mock('date-fns', () => ({
  formatDistanceToNow: vi.fn((date) => `${Math.floor((Date.now() - date.getTime()) / 1000)}s ago`),
  format: vi.fn((date, formatStr) => {
    if (formatStr === 'h:mm a') return '10:30 AM'
    if (formatStr === 'EEEE, MMMM d, yyyy') return 'Monday, January 15, 2024'
    if (formatStr === 'MMM d') return 'Jan 15'
    return date.toISOString()
  }),
  isToday: vi.fn(() => false),
  isYesterday: vi.fn(() => false),
  isSameDay: vi.fn(() => false),
  differenceInMinutes: vi.fn(() => 30)
}))

describe('timestampUtils', () => {
  const mockMessages: Message[] = [
    {
      id: 'msg-1',
      channelId: 'general',
      userId: 'user-1',
      content: 'First message',
      timestamp: new Date('2024-01-15T10:00:00Z'),
      type: 'text'
    },
    {
      id: 'msg-2',
      channelId: 'general',
      userId: 'user-1',
      content: 'Second message',
      timestamp: new Date('2024-01-15T10:05:00Z'),
      type: 'text'
    },
    {
      id: 'msg-3',
      channelId: 'general',
      userId: 'user-2',
      content: 'Third message',
      timestamp: new Date('2024-01-16T10:00:00Z'),
      type: 'text'
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('formatMessageTimestamp', () => {
    it('should format timestamp for recent messages', () => {
      const result = formatMessageTimestamp(new Date('2024-01-15T10:30:00Z'), false)
      expect(result).toContain('ago')
    })

    it('should format timestamp with time for detailed view', () => {
      const result = formatMessageTimestamp(new Date('2024-01-15T10:30:00Z'), true)
      expect(result).toBe('10:30 AM')
    })

    it('should handle edge cases with invalid dates', () => {
      const result = formatMessageTimestamp(new Date('invalid'), false)
      expect(result).toBe('Invalid date')
    })
  })

  describe('shouldShowDateSeparator', () => {
    it('should show separator for first message', () => {
      const result = shouldShowDateSeparator(mockMessages[0], undefined)
      expect(result).toBe(true)
    })

    it('should show separator when date changes', () => {
      const result = shouldShowDateSeparator(mockMessages[2], mockMessages[1])
      expect(result).toBe(true)
    })

    it('should not show separator for same day messages', () => {
      const { isSameDay } = require('date-fns')
      isSameDay.mockReturnValue(true)
      
      const result = shouldShowDateSeparator(mockMessages[1], mockMessages[0])
      expect(result).toBe(false)
    })
  })

  describe('formatDateSeparator', () => {
    it('should format today as "Today"', () => {
      const { isToday } = require('date-fns')
      isToday.mockReturnValue(true)
      
      const result = formatDateSeparator(new Date())
      expect(result).toBe('Today')
    })

    it('should format yesterday as "Yesterday"', () => {
      const { isYesterday } = require('date-fns')
      isYesterday.mockReturnValue(true)
      
      const result = formatDateSeparator(new Date())
      expect(result).toBe('Yesterday')
    })

    it('should format other dates with full format', () => {
      const result = formatDateSeparator(new Date('2024-01-15T10:00:00Z'))
      expect(result).toBe('Monday, January 15, 2024')
    })
  })

  describe('groupMessagesByDate', () => {
    it('should group messages by date with separators', () => {
      const result = groupMessagesByDate(mockMessages)
      
      expect(result).toHaveLength(4) // 2 separators + 3 messages
      expect(result[0].type).toBe('date-separator')
      expect(result[1]).toBe(mockMessages[0])
      expect(result[2]).toBe(mockMessages[1])
      expect(result[3].type).toBe('date-separator')
    })

    it('should handle empty message array', () => {
      const result = groupMessagesByDate([])
      expect(result).toEqual([])
    })

    it('should handle single message', () => {
      const result = groupMessagesByDate([mockMessages[0]])
      
      expect(result).toHaveLength(2) // 1 separator + 1 message
      expect(result[0].type).toBe('date-separator')
      expect(result[1]).toBe(mockMessages[0])
    })
  })

  describe('getScrollBehavior', () => {
    it('should return smooth for auto-scroll', () => {
      const result = getScrollBehavior(true, false)
      expect(result).toBe('smooth')
    })

    it('should return instant for user navigation', () => {
      const result = getScrollBehavior(false, true)
      expect(result).toBe('instant')
    })

    it('should return auto for normal scrolling', () => {
      const result = getScrollBehavior(false, false)
      expect(result).toBe('auto')
    })
  })

  describe('shouldAutoScroll', () => {
    it('should auto-scroll when user is at bottom', () => {
      const mockElement = {
        scrollTop: 1000,
        scrollHeight: 1100,
        clientHeight: 100
      } as HTMLElement
      
      const result = shouldAutoScroll(mockElement, true)
      expect(result).toBe(true)
    })

    it('should not auto-scroll when user has scrolled up', () => {
      const mockElement = {
        scrollTop: 500,
        scrollHeight: 1100,
        clientHeight: 100
      } as HTMLElement
      
      const result = shouldAutoScroll(mockElement, true)
      expect(result).toBe(false)
    })

    it('should auto-scroll for new messages when at bottom', () => {
      const mockElement = {
        scrollTop: 990, // Close to bottom (within threshold)
        scrollHeight: 1100,
        clientHeight: 100
      } as HTMLElement
      
      const result = shouldAutoScroll(mockElement, true)
      expect(result).toBe(true)
    })

    it('should not auto-scroll when disabled', () => {
      const mockElement = {
        scrollTop: 1000,
        scrollHeight: 1100,
        clientHeight: 100
      } as HTMLElement
      
      const result = shouldAutoScroll(mockElement, false)
      expect(result).toBe(false)
    })
  })

  describe('Integration', () => {
    it('should work together for complete timestamp functionality', () => {
      const groupedMessages = groupMessagesByDate(mockMessages)
      
      // Should have date separators
      const separators = groupedMessages.filter(item => 
        typeof item === 'object' && 'type' in item && item.type === 'date-separator'
      )
      expect(separators.length).toBeGreaterThan(0)
      
      // Should format timestamps correctly
      const firstMessage = mockMessages[0]
      const timestamp = formatMessageTimestamp(firstMessage.timestamp, false)
      expect(timestamp).toBeDefined()
    })
  })
})