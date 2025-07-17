import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { AppState, Message, Theme } from '../types'
import { mockChannels, mockMessages } from '../data/mockData'
import { StorageManager } from '../utils/storage'
import { validateMessageContent } from '../utils/typeGuards'

// Generate unique ID for messages
const generateId = (): string => {
  return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export const useAppStore = create<AppState>()(
  devtools(
    (set, get) => ({
      // Initial state
      channels: [],
      activeChannelId: null,
      messages: {},
      theme: 'light',
      sidebarOpen: true,
      searchQuery: '',
      isLoading: false,
      error: null,

      // Channel management actions
      setActiveChannel: (id: string) => {
        set({ activeChannelId: id }, false, 'setActiveChannel')
        
        // Persist to localStorage
        StorageManager.setSettings({ lastActiveChannel: id })
      },

      // Message management actions
      addMessage: (channelId: string, messageData) => {
        const { content, userId, type } = messageData
        
        // Validate message content
        if (!validateMessageContent(content)) {
          set({ error: 'Message content is invalid' }, false, 'addMessage/error')
          return
        }

        const newMessage: Message = {
          id: generateId(),
          channelId,
          userId,
          content: content.trim(),
          timestamp: new Date(),
          type
        }

        set((state) => {
          const channelMessages = state.messages[channelId] || []
          return {
            messages: {
              ...state.messages,
              [channelId]: [...channelMessages, newMessage]
            },
            error: null // Clear any previous errors
          }
        }, false, 'addMessage')
      },

      // Theme management actions
      toggleTheme: () => {
        set((state) => {
          let newTheme: Theme
          switch (state.theme) {
            case 'light':
              newTheme = 'dark'
              break
            case 'dark':
              newTheme = 'system'
              break
            case 'system':
              newTheme = 'light'
              break
            default:
              newTheme = 'light'
          }

          // Persist to localStorage
          StorageManager.setTheme(newTheme)

          return { theme: newTheme }
        }, false, 'toggleTheme')
      },

      // UI state management actions
      setSearchQuery: (query: string) => {
        set({ searchQuery: query }, false, 'setSearchQuery')
      },

      toggleSidebar: () => {
        set((state) => {
          const newSidebarOpen = !state.sidebarOpen
          
          // Persist to localStorage
          StorageManager.setSettings({ sidebarOpen: newSidebarOpen })
          
          return { sidebarOpen: newSidebarOpen }
        }, false, 'toggleSidebar')
      },

      clearError: () => {
        set({ error: null }, false, 'clearError')
      },

      // Additional utility actions
      setLoading: (isLoading: boolean) => {
        set({ isLoading }, false, 'setLoading')
      },

      setError: (error: string) => {
        set({ error }, false, 'setError')
      },

      // Computed getters
      getChannelMessages: (channelId: string) => {
        const state = get()
        return state.messages[channelId] || []
      },

      getFilteredChannels: () => {
        const state = get()
        const { channels, searchQuery } = state
        
        if (!searchQuery.trim()) {
          return channels
        }

        const query = searchQuery.toLowerCase()
        return channels.filter(channel =>
          channel.name.toLowerCase().includes(query) ||
          channel.description.toLowerCase().includes(query)
        )
      },

      // Initialization actions
      initializeStore: () => {
        set((state) => {
          // Load theme from localStorage
          const savedTheme = StorageManager.getTheme()
          
          // Load settings from localStorage
          const settings = StorageManager.getSettings()
          
          return {
            ...state,
            theme: savedTheme,
            sidebarOpen: settings.sidebarOpen ?? true,
          }
        }, false, 'initializeStore')
      },

      loadMockData: () => {
        set((state) => {
          const settings = StorageManager.getSettings()
          const defaultActiveChannel = settings.lastActiveChannel || mockChannels[0]?.id || null
          
          return {
            ...state,
            channels: [...mockChannels],
            messages: { ...mockMessages },
            activeChannelId: defaultActiveChannel,
            isLoading: false
          }
        }, false, 'loadMockData')
      },

      // Reset store (useful for testing)
      resetStore: () => {
        set({
          channels: [],
          activeChannelId: null,
          messages: {},
          theme: 'light',
          sidebarOpen: true,
          searchQuery: '',
          isLoading: false,
          error: null,
        }, false, 'resetStore')
      }
    }),
    {
      name: 'openboard-store',
      // Only enable devtools in development
      enabled: process.env.NODE_ENV === 'development'
    }
  )
)

// Initialize store on module load
useAppStore.getState().initializeStore()

// Auto-load mock data (in a real app, this would be replaced with API calls)
useAppStore.getState().loadMockData()