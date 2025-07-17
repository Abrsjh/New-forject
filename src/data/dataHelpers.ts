import type { User, Channel, Message } from '../types'
import { mockUsers, mockChannels, mockMessages } from './mockData'

// Data access helpers
export class DataHelpers {
  // User helpers
  static getAllUsers(): User[] {
    return [...mockUsers]
  }

  static getUserById(id: string): User | undefined {
    return mockUsers.find(user => user.id === id)
  }

  static getUsersByStatus(status: User['status']): User[] {
    return mockUsers.filter(user => user.status === status)
  }

  static getOnlineUsers(): User[] {
    return this.getUsersByStatus('online')
  }

  // Channel helpers
  static getAllChannels(): Channel[] {
    return [...mockChannels]
  }

  static getChannelById(id: string): Channel | undefined {
    return mockChannels.find(channel => channel.id === id)
  }

  static getPublicChannels(): Channel[] {
    return mockChannels.filter(channel => channel.type === 'public')
  }

  static getPrivateChannels(): Channel[] {
    return mockChannels.filter(channel => channel.type === 'private')
  }

  static getChannelsByName(searchTerm: string): Channel[] {
    const term = searchTerm.toLowerCase()
    return mockChannels.filter(channel => 
      channel.name.toLowerCase().includes(term) ||
      channel.description.toLowerCase().includes(term)
    )
  }

  // Message helpers
  static getAllMessages(): Record<string, Message[]> {
    // Deep clone to prevent mutations
    const clonedMessages: Record<string, Message[]> = {}
    Object.entries(mockMessages).forEach(([channelId, messages]) => {
      clonedMessages[channelId] = messages.map(msg => ({ ...msg }))
    })
    return clonedMessages
  }

  static getMessagesByChannel(channelId: string): Message[] {
    return mockMessages[channelId] ? [...mockMessages[channelId]] : []
  }

  static getLatestMessage(channelId: string): Message | undefined {
    const messages = mockMessages[channelId]
    return messages && messages.length > 0 ? messages[messages.length - 1] : undefined
  }

  static getMessagesByUser(userId: string): Message[] {
    const allMessages = Object.values(mockMessages).flat()
    return allMessages.filter(message => message.userId === userId)
  }

  static getMessageCount(channelId?: string): number {
    if (channelId) {
      return mockMessages[channelId]?.length || 0
    }
    return Object.values(mockMessages).flat().length
  }

  static searchMessages(query: string, channelId?: string): Message[] {
    const searchTerm = query.toLowerCase()
    const messagesToSearch = channelId 
      ? mockMessages[channelId] || []
      : Object.values(mockMessages).flat()

    return messagesToSearch.filter(message =>
      message.content.toLowerCase().includes(searchTerm)
    )
  }

  // Data validation helpers
  static validateDataIntegrity(): {
    isValid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    // Check if all message users exist
    const userIds = new Set(mockUsers.map(user => user.id))
    const allMessages = Object.values(mockMessages).flat()

    allMessages.forEach(message => {
      if (!userIds.has(message.userId)) {
        errors.push(`Message ${message.id} references non-existent user ${message.userId}`)
      }
    })

    // Check if all message channels exist
    const channelIds = new Set(mockChannels.map(channel => channel.id))
    Object.keys(mockMessages).forEach(channelId => {
      if (!channelIds.has(channelId)) {
        errors.push(`Messages exist for non-existent channel ${channelId}`)
      }
    })

    // Check for duplicate IDs
    const allUserIds = mockUsers.map(user => user.id)
    const uniqueUserIds = new Set(allUserIds)
    if (allUserIds.length !== uniqueUserIds.size) {
      errors.push('Duplicate user IDs found')
    }

    const allChannelIds = mockChannels.map(channel => channel.id)
    const uniqueChannelIds = new Set(allChannelIds)
    if (allChannelIds.length !== uniqueChannelIds.size) {
      errors.push('Duplicate channel IDs found')
    }

    const allMessageIds = allMessages.map(message => message.id)
    const uniqueMessageIds = new Set(allMessageIds)
    if (allMessageIds.length !== uniqueMessageIds.size) {
      errors.push('Duplicate message IDs found')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Statistics helpers
  static getDataStats() {
    const allMessages = Object.values(mockMessages).flat()
    const textMessages = allMessages.filter(msg => msg.type === 'text')
    const systemMessages = allMessages.filter(msg => msg.type === 'system')
    const editedMessages = allMessages.filter(msg => msg.editedAt)

    return {
      users: {
        total: mockUsers.length,
        online: this.getOnlineUsers().length,
        withEmail: mockUsers.filter(user => user.email).length
      },
      channels: {
        total: mockChannels.length,
        public: this.getPublicChannels().length,
        private: this.getPrivateChannels().length
      },
      messages: {
        total: allMessages.length,
        text: textMessages.length,
        system: systemMessages.length,
        edited: editedMessages.length,
        byChannel: Object.fromEntries(
          Object.entries(mockMessages).map(([channelId, messages]) => [
            channelId,
            messages.length
          ])
        )
      }
    }
  }
}