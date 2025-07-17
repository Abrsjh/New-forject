// User types
export interface User {
  id: string
  name: string
  avatar: string
  status: 'online' | 'offline' | 'away'
  email?: string
}

// Channel types
export interface Channel {
  id: string
  name: string
  description: string
  type: 'public' | 'private'
  createdAt: Date
  memberCount: number
}

// Message types
export interface Message {
  id: string
  channelId: string
  userId: string
  content: string
  timestamp: Date
  type: 'text' | 'system'
  editedAt?: Date
}

// Utility types for message creation
export type CreateMessage = Omit<Message, 'id' | 'timestamp'>

// Theme types
export type Theme = 'light' | 'dark' | 'system'

// App state interface following Zustand patterns
export interface AppState {
  // Channel Management
  channels: Channel[]
  activeChannelId: string | null
  
  // Message Management - grouped by channelId for performance
  messages: Record<string, Message[]>
  
  // UI State
  theme: Theme
  sidebarOpen: boolean
  searchQuery: string
  isLoading: boolean
  error: string | null
  
  // Actions
  setActiveChannel: (id: string) => void
  addMessage: (channelId: string, message: Omit<Message, 'id' | 'timestamp'>) => void
  toggleTheme: () => void
  setSearchQuery: (query: string) => void
  toggleSidebar: () => void
  clearError: () => void
  setLoading?: (isLoading: boolean) => void
  setError?: (error: string) => void
  initializeStore?: () => void
  loadMockData?: () => void
  resetStore?: () => void
  
  // Computed getters
  getChannelMessages: (channelId: string) => Message[]
  getFilteredChannels: () => Channel[]
}

// Storage types for localStorage
export interface StorageData {
  theme: Theme
  sidebarOpen?: boolean
  lastActiveChannel?: string
}

// Component prop types
export interface ChannelListProps {
  channels: Channel[]
  activeChannelId: string | null
  searchQuery: string
  onChannelSelect: (channelId: string) => void
  onSearchChange: (query: string) => void
}

export interface MessageListProps {
  messages: Message[]
  users: Record<string, User>
  isLoading: boolean
}

export interface MessageComposerProps {
  channelId: string
  onSendMessage: (content: string) => void
  disabled?: boolean
}

// Error types
export interface AppError {
  code: string
  message: string
  timestamp: Date
}