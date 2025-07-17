import { describe, it, expect } from 'vitest'
import type { User, Channel, Message, AppState } from './index'

describe('TypeScript Types', () => {
  describe('User interface', () => {
    it('should have required properties with correct types', () => {
      const user: User = {
        id: 'user-1',
        name: 'John Doe',
        avatar: 'https://example.com/avatar.jpg',
        status: 'online'
      }

      expect(typeof user.id).toBe('string')
      expect(typeof user.name).toBe('string')
      expect(typeof user.avatar).toBe('string')
      expect(['online', 'offline', 'away']).toContain(user.status)
    })

    it('should allow optional email property', () => {
      const userWithEmail: User = {
        id: 'user-1',
        name: 'John Doe',
        avatar: 'https://example.com/avatar.jpg',
        status: 'online',
        email: 'john@example.com'
      }

      expect(typeof userWithEmail.email).toBe('string')
    })
  })

  describe('Channel interface', () => {
    it('should have required properties with correct types', () => {
      const channel: Channel = {
        id: 'general',
        name: 'General',
        description: 'General discussion',
        type: 'public',
        createdAt: new Date(),
        memberCount: 5
      }

      expect(typeof channel.id).toBe('string')
      expect(typeof channel.name).toBe('string')
      expect(typeof channel.description).toBe('string')
      expect(['public', 'private']).toContain(channel.type)
      expect(channel.createdAt).toBeInstanceOf(Date)
      expect(typeof channel.memberCount).toBe('number')
    })
  })

  describe('Message interface', () => {
    it('should have required properties with correct types', () => {
      const message: Message = {
        id: 'msg-1',
        channelId: 'general',
        userId: 'user-1',
        content: 'Hello world!',
        timestamp: new Date(),
        type: 'text'
      }

      expect(typeof message.id).toBe('string')
      expect(typeof message.channelId).toBe('string')
      expect(typeof message.userId).toBe('string')
      expect(typeof message.content).toBe('string')
      expect(message.timestamp).toBeInstanceOf(Date)
      expect(['text', 'system']).toContain(message.type)
    })

    it('should allow optional edited timestamp', () => {
      const editedMessage: Message = {
        id: 'msg-1',
        channelId: 'general',
        userId: 'user-1',
        content: 'Hello world! (edited)',
        timestamp: new Date(),
        type: 'text',
        editedAt: new Date()
      }

      expect(editedMessage.editedAt).toBeInstanceOf(Date)
    })
  })

  describe('AppState interface', () => {
    it('should have all required state properties', () => {
      const mockState: AppState = {
        // Channel Management
        channels: [],
        activeChannelId: null,
        
        // Message Management
        messages: {},
        
        // UI State
        theme: 'light',
        sidebarOpen: true,
        searchQuery: '',
        isLoading: false,
        error: null,
        
        // Actions (mock functions)
        setActiveChannel: () => {},
        addMessage: () => {},
        toggleTheme: () => {},
        setSearchQuery: () => {},
        toggleSidebar: () => {},
        clearError: () => {},
        
        // Computed getters (mock functions)
        getChannelMessages: () => [],
        getFilteredChannels: () => []
      }

      // Test state properties
      expect(Array.isArray(mockState.channels)).toBe(true)
      expect(mockState.activeChannelId === null || typeof mockState.activeChannelId === 'string').toBe(true)
      expect(typeof mockState.messages).toBe('object')
      expect(['light', 'dark', 'system']).toContain(mockState.theme)
      expect(typeof mockState.sidebarOpen).toBe('boolean')
      expect(typeof mockState.searchQuery).toBe('string')
      expect(typeof mockState.isLoading).toBe('boolean')
      expect(mockState.error === null || typeof mockState.error === 'string').toBe(true)

      // Test action functions
      expect(typeof mockState.setActiveChannel).toBe('function')
      expect(typeof mockState.addMessage).toBe('function')
      expect(typeof mockState.toggleTheme).toBe('function')
      expect(typeof mockState.setSearchQuery).toBe('function')
      expect(typeof mockState.toggleSidebar).toBe('function')
      expect(typeof mockState.clearError).toBe('function')
      expect(typeof mockState.getChannelMessages).toBe('function')
      expect(typeof mockState.getFilteredChannels).toBe('function')
    })
  })

  describe('Utility types', () => {
    it('should support CreateMessage type for new messages', () => {
      const newMessage: CreateMessage = {
        channelId: 'general',
        userId: 'user-1',
        content: 'New message',
        type: 'text'
      }

      expect(typeof newMessage.channelId).toBe('string')
      expect(typeof newMessage.userId).toBe('string')
      expect(typeof newMessage.content).toBe('string')
      expect(['text', 'system']).toContain(newMessage.type)
      // Should not have id or timestamp (auto-generated)
      expect('id' in newMessage).toBe(false)
      expect('timestamp' in newMessage).toBe(false)
    })

    it('should support Theme type with all valid values', () => {
      const themes: Theme[] = ['light', 'dark', 'system']
      
      themes.forEach(theme => {
        expect(['light', 'dark', 'system']).toContain(theme)
      })
    })
  })
})