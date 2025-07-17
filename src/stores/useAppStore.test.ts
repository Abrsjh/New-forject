import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAppStore } from './useAppStore'
import { mockChannels, mockMessages } from '../data/mockData'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('useAppStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAppStore.setState({
      channels: [],
      activeChannelId: null,
      messages: {},
      theme: 'light',
      sidebarOpen: true,
      searchQuery: '',
      isLoading: false,
      error: null,
    })
    
    // Clear localStorage mocks
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
  })

  describe('Initial state', () => {
    it('should have correct initial state', () => {
      const state = useAppStore.getState()
      
      expect(state.channels).toEqual([])
      expect(state.activeChannelId).toBeNull()
      expect(state.messages).toEqual({})
      expect(state.theme).toBe('light')
      expect(state.sidebarOpen).toBe(true)
      expect(state.searchQuery).toBe('')
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('should load theme from localStorage on initialization', () => {
      localStorageMock.getItem.mockReturnValue('dark')
      
      // Re-initialize store
      const { initializeStore } = useAppStore.getState()
      initializeStore?.()
      
      expect(localStorageMock.getItem).toHaveBeenCalledWith('openboard-theme')
      expect(useAppStore.getState().theme).toBe('dark')
    })

    it('should handle invalid theme from localStorage', () => {
      localStorageMock.getItem.mockReturnValue('invalid-theme')
      
      const { initializeStore } = useAppStore.getState()
      initializeStore?.()
      
      expect(useAppStore.getState().theme).toBe('light') // fallback to default
    })
  })

  describe('Channel management', () => {
    it('should set active channel', () => {
      const { setActiveChannel } = useAppStore.getState()
      
      setActiveChannel('general')
      
      expect(useAppStore.getState().activeChannelId).toBe('general')
    })

    it('should persist active channel to localStorage', () => {
      const { setActiveChannel } = useAppStore.getState()
      
      setActiveChannel('tech')
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'openboard-settings',
        expect.stringContaining('"lastActiveChannel":"tech"')
      )
    })

    it('should load mock data correctly', () => {
      const { loadMockData } = useAppStore.getState()
      
      loadMockData?.()
      
      const state = useAppStore.getState()
      expect(state.channels).toHaveLength(mockChannels.length)
      expect(state.messages).toEqual(mockMessages)
      expect(state.activeChannelId).toBe('general') // Should default to first channel
    })
  })

  describe('Message management', () => {
    beforeEach(() => {
      // Load mock data for message tests
      useAppStore.getState().loadMockData?.()
    })

    it('should add new message to channel', () => {
      const { addMessage } = useAppStore.getState()
      
      const newMessage = {
        channelId: 'general',
        userId: 'user-alice',
        content: 'Test message',
        type: 'text' as const
      }
      
      addMessage('general', newMessage)
      
      const state = useAppStore.getState()
      const generalMessages = state.messages.general
      const lastMessage = generalMessages[generalMessages.length - 1]
      
      expect(lastMessage.content).toBe('Test message')
      expect(lastMessage.userId).toBe('user-alice')
      expect(lastMessage.id).toBeDefined()
      expect(lastMessage.timestamp).toBeInstanceOf(Date)
    })

    it('should generate unique message IDs', () => {
      const { addMessage } = useAppStore.getState()
      
      addMessage('general', {
        channelId: 'general',
        userId: 'user-alice',
        content: 'Message 1',
        type: 'text'
      })
      
      addMessage('general', {
        channelId: 'general',
        userId: 'user-bob',
        content: 'Message 2',
        type: 'text'
      })
      
      const state = useAppStore.getState()
      const generalMessages = state.messages.general
      const lastTwoMessages = generalMessages.slice(-2)
      
      expect(lastTwoMessages[0].id).not.toBe(lastTwoMessages[1].id)
    })

    it('should handle adding message to non-existent channel', () => {
      const { addMessage } = useAppStore.getState()
      
      addMessage('non-existent', {
        channelId: 'non-existent',
        userId: 'user-alice',
        content: 'Test message',
        type: 'text'
      })
      
      const state = useAppStore.getState()
      expect(state.messages['non-existent']).toHaveLength(1)
    })
  })

  describe('Theme management', () => {
    it('should toggle theme from light to dark', () => {
      const { toggleTheme } = useAppStore.getState()
      
      toggleTheme()
      
      expect(useAppStore.getState().theme).toBe('dark')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('openboard-theme', 'dark')
    })

    it('should toggle theme from dark to system', () => {
      useAppStore.setState({ theme: 'dark' })
      const { toggleTheme } = useAppStore.getState()
      
      toggleTheme()
      
      expect(useAppStore.getState().theme).toBe('system')
    })

    it('should toggle theme from system to light', () => {
      useAppStore.setState({ theme: 'system' })
      const { toggleTheme } = useAppStore.getState()
      
      toggleTheme()
      
      expect(useAppStore.getState().theme).toBe('light')
    })
  })

  describe('UI state management', () => {
    it('should toggle sidebar', () => {
      const { toggleSidebar } = useAppStore.getState()
      
      toggleSidebar()
      
      expect(useAppStore.getState().sidebarOpen).toBe(false)
      
      toggleSidebar()
      
      expect(useAppStore.getState().sidebarOpen).toBe(true)
    })

    it('should set search query', () => {
      const { setSearchQuery } = useAppStore.getState()
      
      setSearchQuery('test search')
      
      expect(useAppStore.getState().searchQuery).toBe('test search')
    })

    it('should clear error', () => {
      useAppStore.setState({ error: 'Test error' })
      const { clearError } = useAppStore.getState()
      
      clearError()
      
      expect(useAppStore.getState().error).toBeNull()
    })

    it('should set loading state', () => {
      const { setLoading } = useAppStore.getState()
      
      setLoading?.(true)
      expect(useAppStore.getState().isLoading).toBe(true)
      
      setLoading?.(false)
      expect(useAppStore.getState().isLoading).toBe(false)
    })

    it('should set error state', () => {
      const { setError } = useAppStore.getState()
      
      setError?.('Test error message')
      
      expect(useAppStore.getState().error).toBe('Test error message')
    })
  })

  describe('Computed getters', () => {
    beforeEach(() => {
      useAppStore.getState().loadMockData?.()
    })

    it('should get channel messages', () => {
      const { getChannelMessages } = useAppStore.getState()
      
      const generalMessages = getChannelMessages('general')
      
      expect(generalMessages).toEqual(mockMessages.general)
    })

    it('should return empty array for non-existent channel', () => {
      const { getChannelMessages } = useAppStore.getState()
      
      const messages = getChannelMessages('non-existent')
      
      expect(messages).toEqual([])
    })

    it('should get filtered channels based on search query', () => {
      const { setSearchQuery, getFilteredChannels } = useAppStore.getState()
      
      setSearchQuery('tech')
      const filteredChannels = getFilteredChannels()
      
      expect(filteredChannels.length).toBeGreaterThan(0)
      expect(filteredChannels.every(channel => 
        channel.name.toLowerCase().includes('tech') ||
        channel.description.toLowerCase().includes('tech')
      )).toBe(true)
    })

    it('should return all channels when search query is empty', () => {
      const { setSearchQuery, getFilteredChannels } = useAppStore.getState()
      
      setSearchQuery('')
      const filteredChannels = getFilteredChannels()
      
      expect(filteredChannels).toHaveLength(mockChannels.length)
    })
  })

  describe('Error handling', () => {
    it('should handle localStorage errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('localStorage error')
      })
      
      const { toggleTheme } = useAppStore.getState()
      
      expect(() => toggleTheme()).not.toThrow()
      expect(useAppStore.getState().theme).toBe('dark') // Should still update state
    })

    it('should handle JSON parse errors from localStorage', () => {
      localStorageMock.getItem.mockReturnValue('invalid json')
      
      const { initializeStore } = useAppStore.getState()
      
      expect(() => initializeStore?.()).not.toThrow()
      expect(useAppStore.getState().theme).toBe('light') // Should use default
    })
  })
})