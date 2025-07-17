import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import MessageComposer from './MessageComposer'
import { useAppStore } from '../../stores/useAppStore'

// Mock the store
vi.mock('../../stores/useAppStore')
const mockUseAppStore = vi.mocked(useAppStore)

// Mock current user for testing
// const mockCurrentUser = {
//   id: 'current-user',
//   name: 'Current User',
//   avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=current',
//   status: 'online' as const,
//   email: 'current@example.com'
// }

describe('MessageComposer', () => {
  const mockAddMessage = vi.fn()
  const mockClearError = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    
    mockUseAppStore.mockReturnValue({
      addMessage: mockAddMessage,
      clearError: mockClearError,
      error: null,
      // Add other required store properties
      channels: [],
      activeChannelId: 'test-channel',
      messages: {},
      theme: 'light',
      sidebarOpen: true,
      searchQuery: '',
      isLoading: false,
      setActiveChannel: vi.fn(),
      toggleTheme: vi.fn(),
      setSearchQuery: vi.fn(),
      toggleSidebar: vi.fn(),
      getChannelMessages: vi.fn(),
      getFilteredChannels: vi.fn()
    } as any)
  })

  describe('Rendering', () => {
    it('should render message input form', () => {
      render(<MessageComposer channelId="test-channel" />)
      
      expect(screen.getByTestId('message-composer')).toBeInTheDocument()
      expect(screen.getByTestId('message-input')).toBeInTheDocument()
      expect(screen.getByTestId('send-button')).toBeInTheDocument()
    })

    it('should have proper placeholder text', () => {
      render(<MessageComposer channelId="test-channel" />)
      
      const input = screen.getByTestId('message-input')
      expect(input).toHaveAttribute('placeholder', 'Type a message...')
    })

    it('should show character count', () => {
      render(<MessageComposer channelId="test-channel" />)
      
      expect(screen.getByTestId('character-count')).toBeInTheDocument()
      expect(screen.getByText('0/2000')).toBeInTheDocument()
    })
  })

  describe('Input Validation', () => {
    it('should disable send button when input is empty', () => {
      render(<MessageComposer channelId="test-channel" />)
      
      const sendButton = screen.getByTestId('send-button')
      expect(sendButton).toBeDisabled()
    })

    it('should disable send button when input is only whitespace', async () => {
      const user = userEvent.setup()
      render(<MessageComposer channelId="test-channel" />)
      
      const input = screen.getByTestId('message-input')
      const sendButton = screen.getByTestId('send-button')
      
      await user.type(input, '   ')
      expect(sendButton).toBeDisabled()
    })

    it('should enable send button when input has valid content', async () => {
      const user = userEvent.setup()
      render(<MessageComposer channelId="test-channel" />)
      
      const input = screen.getByTestId('message-input')
      const sendButton = screen.getByTestId('send-button')
      
      await user.type(input, 'Hello world')
      expect(sendButton).toBeEnabled()
    })

    it('should enforce character limit', async () => {
      const user = userEvent.setup()
      render(<MessageComposer channelId="test-channel" />)
      
      const input = screen.getByTestId('message-input')
      const longMessage = 'a'.repeat(2001) // Exceeds 2000 character limit
      
      await user.type(input, longMessage)
      
      // Input should be truncated to 2000 characters
      expect(input).toHaveValue('a'.repeat(2000))
      expect(screen.getByText('2000/2000')).toBeInTheDocument()
    })

    it('should show warning when approaching character limit', async () => {
      const user = userEvent.setup()
      render(<MessageComposer channelId="test-channel" />)
      
      const input = screen.getByTestId('message-input')
      const nearLimitMessage = 'a'.repeat(1950) // Close to 2000 limit
      
      await user.type(input, nearLimitMessage)
      
      const characterCount = screen.getByTestId('character-count')
      expect(characterCount).toHaveClass('text-orange-500') // Warning color
    })

    it('should show error when at character limit', async () => {
      const user = userEvent.setup()
      render(<MessageComposer channelId="test-channel" />)
      
      const input = screen.getByTestId('message-input')
      const maxMessage = 'a'.repeat(2000)
      
      await user.type(input, maxMessage)
      
      const characterCount = screen.getByTestId('character-count')
      expect(characterCount).toHaveClass('text-red-500') // Error color
    })
  })

  describe('Message Sending', () => {
    it('should send message when send button is clicked', async () => {
      const user = userEvent.setup()
      render(<MessageComposer channelId="test-channel" />)
      
      const input = screen.getByTestId('message-input')
      const sendButton = screen.getByTestId('send-button')
      
      await user.type(input, 'Hello world')
      await user.click(sendButton)
      
      expect(mockAddMessage).toHaveBeenCalledWith('test-channel', {
        userId: 'current-user', // This will be the current user ID
        content: 'Hello world',
        type: 'text'
      })
    })

    it('should send message when Enter key is pressed', async () => {
      const user = userEvent.setup()
      render(<MessageComposer channelId="test-channel" />)
      
      const input = screen.getByTestId('message-input')
      
      await user.type(input, 'Hello world')
      await user.keyboard('{Enter}')
      
      expect(mockAddMessage).toHaveBeenCalledWith('test-channel', {
        userId: 'current-user',
        content: 'Hello world',
        type: 'text'
      })
    })

    it('should not send message when Shift+Enter is pressed', async () => {
      const user = userEvent.setup()
      render(<MessageComposer channelId="test-channel" />)
      
      const input = screen.getByTestId('message-input')
      
      await user.type(input, 'Hello world')
      await user.keyboard('{Shift>}{Enter}{/Shift}')
      
      expect(mockAddMessage).not.toHaveBeenCalled()
      expect(input).toHaveValue('Hello world\n') // Should add newline
    })

    it('should clear input after sending message', async () => {
      const user = userEvent.setup()
      render(<MessageComposer channelId="test-channel" />)
      
      const input = screen.getByTestId('message-input')
      const sendButton = screen.getByTestId('send-button')
      
      await user.type(input, 'Hello world')
      await user.click(sendButton)
      
      expect(input).toHaveValue('')
      expect(screen.getByText('0/2000')).toBeInTheDocument()
    })

    it('should trim whitespace from message content', async () => {
      const user = userEvent.setup()
      render(<MessageComposer channelId="test-channel" />)
      
      const input = screen.getByTestId('message-input')
      const sendButton = screen.getByTestId('send-button')
      
      await user.type(input, '  Hello world  ')
      await user.click(sendButton)
      
      expect(mockAddMessage).toHaveBeenCalledWith('test-channel', {
        userId: 'current-user',
        content: 'Hello world',
        type: 'text'
      })
    })
  })

  describe('Focus Management', () => {
    it('should focus input on mount', () => {
      render(<MessageComposer channelId="test-channel" />)
      
      const input = screen.getByTestId('message-input')
      expect(input).toHaveFocus()
    })

    it('should refocus input after sending message', async () => {
      const user = userEvent.setup()
      render(<MessageComposer channelId="test-channel" />)
      
      const input = screen.getByTestId('message-input')
      const sendButton = screen.getByTestId('send-button')
      
      await user.type(input, 'Hello world')
      await user.click(sendButton)
      
      expect(input).toHaveFocus()
    })
  })

  describe('Error Handling', () => {
    it('should display error message when store has error', () => {
      mockUseAppStore.mockReturnValue({
        addMessage: mockAddMessage,
        clearError: mockClearError,
        error: 'Failed to send message',
        // Add other required store properties
        channels: [],
        activeChannelId: 'test-channel',
        messages: {},
        theme: 'light',
        sidebarOpen: true,
        searchQuery: '',
        isLoading: false,
        setActiveChannel: vi.fn(),
        toggleTheme: vi.fn(),
        setSearchQuery: vi.fn(),
        toggleSidebar: vi.fn(),
        getChannelMessages: vi.fn(),
        getFilteredChannels: vi.fn()
      } as any)

      render(<MessageComposer channelId="test-channel" />)
      
      expect(screen.getByTestId('error-message')).toBeInTheDocument()
      expect(screen.getByText('Failed to send message')).toBeInTheDocument()
    })

    it('should clear error when dismiss button is clicked', async () => {
      const user = userEvent.setup()
      
      mockUseAppStore.mockReturnValue({
        addMessage: mockAddMessage,
        clearError: mockClearError,
        error: 'Failed to send message',
        // Add other required store properties
        channels: [],
        activeChannelId: 'test-channel',
        messages: {},
        theme: 'light',
        sidebarOpen: true,
        searchQuery: '',
        isLoading: false,
        setActiveChannel: vi.fn(),
        toggleTheme: vi.fn(),
        setSearchQuery: vi.fn(),
        toggleSidebar: vi.fn(),
        getChannelMessages: vi.fn(),
        getFilteredChannels: vi.fn()
      } as any)

      render(<MessageComposer channelId="test-channel" />)
      
      const dismissButton = screen.getByTestId('dismiss-error')
      await user.click(dismissButton)
      
      expect(mockClearError).toHaveBeenCalled()
    })
  })

  describe('Disabled State', () => {
    it('should disable input and button when disabled prop is true', () => {
      render(<MessageComposer channelId="test-channel" disabled />)
      
      const input = screen.getByTestId('message-input')
      const sendButton = screen.getByTestId('send-button')
      
      expect(input).toBeDisabled()
      expect(sendButton).toBeDisabled()
    })

    it('should show disabled message when disabled', () => {
      render(<MessageComposer channelId="test-channel" disabled />)
      
      const input = screen.getByTestId('message-input')
      expect(input).toHaveAttribute('placeholder', 'Message sending is disabled')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<MessageComposer channelId="test-channel" />)
      
      const input = screen.getByTestId('message-input')
      const sendButton = screen.getByTestId('send-button')
      
      expect(input).toHaveAttribute('aria-label', 'Type your message')
      expect(sendButton).toHaveAttribute('aria-label', 'Send message')
    })

    it('should have proper form structure', () => {
      render(<MessageComposer channelId="test-channel" />)
      
      const form = screen.getByTestId('message-form')
      expect(form).toBeInTheDocument()
    })

    it('should associate character count with input', () => {
      render(<MessageComposer channelId="test-channel" />)
      
      const input = screen.getByTestId('message-input')
      const characterCount = screen.getByTestId('character-count')
      
      expect(input).toHaveAttribute('aria-describedby')
      expect(characterCount).toHaveAttribute('id')
    })
  })
})