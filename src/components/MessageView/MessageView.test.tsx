import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import MessageView from './MessageView'
import { useAppStore } from '../../stores/useAppStore'
import { mockUsers } from '../../data/mockData'

// Mock the store
vi.mock('../../stores/useAppStore')
const mockUseAppStore = vi.mocked(useAppStore)

// MessageComposer is now implemented and will be tested separately

describe('MessageView Component', () => {
  const mockMessages = [
    {
      id: 'msg-1',
      channelId: 'general',
      userId: 'user-alice',
      content: 'Hello everyone! 👋',
      timestamp: new Date('2024-01-15T10:30:00Z'),
      type: 'text' as const
    },
    {
      id: 'msg-2',
      channelId: 'general',
      userId: 'user-bob',
      content: 'Hey Alice! How are you doing?',
      timestamp: new Date('2024-01-15T10:32:00Z'),
      type: 'text' as const
    },
    {
      id: 'msg-3',
      channelId: 'general',
      userId: 'user-alice',
      content: 'I\'m doing great, thanks for asking!',
      timestamp: new Date('2024-01-15T10:35:00Z'),
      type: 'text' as const,
      editedAt: new Date('2024-01-15T10:36:00Z')
    },
    {
      id: 'msg-4',
      channelId: 'general',
      userId: 'user-alice',
      content: 'Alice Johnson joined the channel',
      timestamp: new Date('2024-01-15T09:00:00Z'),
      type: 'system' as const
    }
  ]

  const mockStore = {
    activeChannelId: 'general',
    channels: [
      { id: 'general', name: 'General', description: 'General discussion', type: 'public', createdAt: new Date(), memberCount: 5 }
    ],
    isLoading: false,
    getChannelMessages: vi.fn(() => mockMessages),
    getUserById: vi.fn((id: string) => mockUsers.find(user => user.id === id))
  }

  beforeEach(() => {
    mockUseAppStore.mockReturnValue(mockStore as any)
    vi.clearAllMocks()
  })

  describe('Message Display', () => {
    it('should render all messages for active channel', () => {
      render(
        <MemoryRouter>
          <MessageView />
        </MemoryRouter>
      )

      expect(screen.getByText('Hello everyone! 👋')).toBeInTheDocument()
      expect(screen.getByText('Hey Alice! How are you doing?')).toBeInTheDocument()
      expect(screen.getByText('I\'m doing great, thanks for asking!')).toBeInTheDocument()
    })

    it('should display user avatars and names', () => {
      render(
        <MemoryRouter>
          <MessageView />
        </MemoryRouter>
      )

      expect(screen.getAllByText('Alice Johnson')).toHaveLength(2) // 2 text messages from Alice
      expect(screen.getByText('Bob Chen')).toBeInTheDocument()
    })

    it('should show relative timestamps', () => {
      render(
        <MemoryRouter>
          <MessageView />
        </MemoryRouter>
      )

      // Should show relative time format
      const timestamps = screen.getAllByTestId(/message-timestamp/)
      expect(timestamps.length).toBeGreaterThan(0)
    })

    it('should indicate edited messages', () => {
      render(
        <MemoryRouter>
          <MessageView />
        </MemoryRouter>
      )

      expect(screen.getByText('(edited)')).toBeInTheDocument()
    })

    it('should display system messages differently', () => {
      render(
        <MemoryRouter>
          <MessageView />
        </MemoryRouter>
      )

      const systemMessage = screen.getByTestId('system-message-msg-4')
      expect(systemMessage).toHaveClass('text-gray-500', 'italic')
    })

    it('should group consecutive messages from same user', () => {
      const consecutiveMessages = [
        {
          id: 'msg-1',
          channelId: 'general',
          userId: 'user-alice',
          content: 'First message',
          timestamp: new Date('2024-01-15T10:30:00Z'),
          type: 'text' as const
        },
        {
          id: 'msg-2',
          channelId: 'general',
          userId: 'user-alice',
          content: 'Second message',
          timestamp: new Date('2024-01-15T10:30:30Z'),
          type: 'text' as const
        }
      ]

      mockUseAppStore.mockReturnValue({
        ...mockStore,
        getChannelMessages: vi.fn(() => consecutiveMessages)
      } as any)

      render(
        <MemoryRouter>
          <MessageView />
        </MemoryRouter>
      )

      // Second message should be grouped (no avatar/name shown)
      const groupedMessage = screen.getByTestId('grouped-message-msg-2')
      expect(groupedMessage).toBeInTheDocument()
    })
  })

  describe('Channel Header', () => {
    it('should display channel name and description', () => {
      render(
        <MemoryRouter>
          <MessageView />
        </MemoryRouter>
      )

      expect(screen.getByText('General')).toBeInTheDocument()
      expect(screen.getByText('General discussion')).toBeInTheDocument()
    })

    it('should show member count', () => {
      render(
        <MemoryRouter>
          <MessageView />
        </MemoryRouter>
      )

      expect(screen.getByText('5 members')).toBeInTheDocument()
    })

    it('should display channel type icon', () => {
      render(
        <MemoryRouter>
          <MessageView />
        </MemoryRouter>
      )

      expect(screen.getByTestId('channel-header-icon')).toBeInTheDocument()
    })
  })

  describe('Auto-scroll Behavior', () => {
    it('should auto-scroll to bottom on new messages', async () => {
      const scrollIntoViewMock = vi.fn()
      Element.prototype.scrollIntoView = scrollIntoViewMock

      render(
        <MemoryRouter>
          <MessageView />
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' })
      })
    })

    it('should scroll to bottom when channel changes', async () => {
      const scrollIntoViewMock = vi.fn()
      Element.prototype.scrollIntoView = scrollIntoViewMock

      const { rerender } = render(
        <MemoryRouter>
          <MessageView />
        </MemoryRouter>
      )

      // Change active channel
      mockUseAppStore.mockReturnValue({
        ...mockStore,
        activeChannelId: 'tech'
      } as any)

      rerender(
        <MemoryRouter>
          <MessageView />
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(scrollIntoViewMock).toHaveBeenCalled()
      })
    })
  })

  describe('Empty States', () => {
    it('should show empty state when no messages exist', () => {
      mockUseAppStore.mockReturnValue({
        ...mockStore,
        getChannelMessages: vi.fn(() => [])
      } as any)

      render(
        <MemoryRouter>
          <MessageView />
        </MemoryRouter>
      )

      expect(screen.getByText('No messages yet')).toBeInTheDocument()
      expect(screen.getByText('Be the first to start the conversation!')).toBeInTheDocument()
    })

    it('should show loading state', () => {
      mockUseAppStore.mockReturnValue({
        ...mockStore,
        isLoading: true
      } as any)

      render(
        <MemoryRouter>
          <MessageView />
        </MemoryRouter>
      )

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })

    it('should show message when no active channel', () => {
      mockUseAppStore.mockReturnValue({
        ...mockStore,
        activeChannelId: null
      } as any)

      render(
        <MemoryRouter>
          <MessageView />
        </MemoryRouter>
      )

      expect(screen.getByText('Select a channel to start messaging')).toBeInTheDocument()
    })
  })

  describe('Message Composer Integration', () => {
    it('should render message composer', () => {
      render(
        <MemoryRouter>
          <MessageView />
        </MemoryRouter>
      )

      expect(screen.getByTestId('message-composer')).toBeInTheDocument()
    })

    it('should not render composer when no active channel', () => {
      mockUseAppStore.mockReturnValue({
        ...mockStore,
        activeChannelId: null
      } as any)

      render(
        <MemoryRouter>
          <MessageView />
        </MemoryRouter>
      )

      expect(screen.queryByTestId('message-composer')).not.toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('should have proper responsive layout classes', () => {
      render(
        <MemoryRouter>
          <MessageView />
        </MemoryRouter>
      )

      const messageView = screen.getByTestId('message-view')
      expect(messageView).toHaveClass('flex', 'flex-col', 'h-full')
    })

    it('should handle mobile spacing correctly', () => {
      render(
        <MemoryRouter>
          <MessageView />
        </MemoryRouter>
      )

      const messagesList = screen.getByTestId('messages-list')
      expect(messagesList).toHaveClass('flex-1', 'overflow-y-auto')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <MemoryRouter>
          <MessageView />
        </MemoryRouter>
      )

      expect(screen.getByLabelText('Messages')).toBeInTheDocument()
      expect(screen.getByLabelText('Channel information')).toBeInTheDocument()
    })

    it('should announce new messages to screen readers', () => {
      render(
        <MemoryRouter>
          <MessageView />
        </MemoryRouter>
      )

      const messagesList = screen.getByTestId('messages-list')
      expect(messagesList).toHaveAttribute('aria-live', 'polite')
    })

    it('should have proper heading hierarchy', () => {
      render(
        <MemoryRouter>
          <MessageView />
        </MemoryRouter>
      )

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    })
  })
})