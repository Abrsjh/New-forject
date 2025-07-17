import { describe, it, expect } from 'vitest'
import { DataHelpers } from './dataHelpers'
import { mockUsers, mockChannels, mockMessages } from './mockData'

describe('DataHelpers', () => {
  describe('User helpers', () => {
    it('should get all users', () => {
      const users = DataHelpers.getAllUsers()
      expect(users).toHaveLength(mockUsers.length)
      expect(users).not.toBe(mockUsers) // Should be a copy
    })

    it('should get user by ID', () => {
      const user = DataHelpers.getUserById('user-alice')
      expect(user).toBeDefined()
      expect(user?.name).toBe('Alice Johnson')
    })

    it('should return undefined for non-existent user', () => {
      const user = DataHelpers.getUserById('non-existent')
      expect(user).toBeUndefined()
    })

    it('should get users by status', () => {
      const onlineUsers = DataHelpers.getUsersByStatus('online')
      expect(onlineUsers.length).toBeGreaterThan(0)
      onlineUsers.forEach(user => {
        expect(user.status).toBe('online')
      })
    })

    it('should get online users', () => {
      const onlineUsers = DataHelpers.getOnlineUsers()
      expect(onlineUsers.length).toBeGreaterThan(0)
      onlineUsers.forEach(user => {
        expect(user.status).toBe('online')
      })
    })
  })

  describe('Channel helpers', () => {
    it('should get all channels', () => {
      const channels = DataHelpers.getAllChannels()
      expect(channels).toHaveLength(mockChannels.length)
      expect(channels).not.toBe(mockChannels) // Should be a copy
    })

    it('should get channel by ID', () => {
      const channel = DataHelpers.getChannelById('general')
      expect(channel).toBeDefined()
      expect(channel?.name).toBe('General')
    })

    it('should return undefined for non-existent channel', () => {
      const channel = DataHelpers.getChannelById('non-existent')
      expect(channel).toBeUndefined()
    })

    it('should get public channels', () => {
      const publicChannels = DataHelpers.getPublicChannels()
      expect(publicChannels.length).toBeGreaterThan(0)
      publicChannels.forEach(channel => {
        expect(channel.type).toBe('public')
      })
    })

    it('should get private channels', () => {
      const privateChannels = DataHelpers.getPrivateChannels()
      expect(privateChannels.length).toBeGreaterThan(0)
      privateChannels.forEach(channel => {
        expect(channel.type).toBe('private')
      })
    })

    it('should search channels by name', () => {
      const techChannels = DataHelpers.getChannelsByName('tech')
      expect(techChannels.length).toBeGreaterThan(0)
      expect(techChannels.some(channel => 
        channel.name.toLowerCase().includes('tech') ||
        channel.description.toLowerCase().includes('tech')
      )).toBe(true)
    })
  })

  describe('Message helpers', () => {
    it('should get all messages', () => {
      const messages = DataHelpers.getAllMessages()
      expect(typeof messages).toBe('object')
      expect(Object.keys(messages).length).toBeGreaterThan(0)
      
      // Should be a deep copy
      expect(messages).not.toBe(mockMessages)
    })

    it('should get messages by channel', () => {
      const generalMessages = DataHelpers.getMessagesByChannel('general')
      expect(generalMessages.length).toBeGreaterThan(0)
      generalMessages.forEach(message => {
        expect(message.channelId).toBe('general')
      })
    })

    it('should return empty array for non-existent channel', () => {
      const messages = DataHelpers.getMessagesByChannel('non-existent')
      expect(messages).toEqual([])
    })

    it('should get latest message from channel', () => {
      const latestMessage = DataHelpers.getLatestMessage('general')
      expect(latestMessage).toBeDefined()
      
      const allGeneralMessages = DataHelpers.getMessagesByChannel('general')
      const expectedLatest = allGeneralMessages[allGeneralMessages.length - 1]
      expect(latestMessage?.id).toBe(expectedLatest.id)
    })

    it('should get messages by user', () => {
      const aliceMessages = DataHelpers.getMessagesByUser('user-alice')
      expect(aliceMessages.length).toBeGreaterThan(0)
      aliceMessages.forEach(message => {
        expect(message.userId).toBe('user-alice')
      })
    })

    it('should get message count for channel', () => {
      const generalCount = DataHelpers.getMessageCount('general')
      expect(generalCount).toBeGreaterThan(0)
      
      const actualCount = mockMessages.general?.length || 0
      expect(generalCount).toBe(actualCount)
    })

    it('should get total message count', () => {
      const totalCount = DataHelpers.getMessageCount()
      const expectedTotal = Object.values(mockMessages).flat().length
      expect(totalCount).toBe(expectedTotal)
    })

    it('should search messages', () => {
      const results = DataHelpers.searchMessages('react')
      expect(results.length).toBeGreaterThan(0)
      results.forEach(message => {
        expect(message.content.toLowerCase()).toContain('react')
      })
    })

    it('should search messages in specific channel', () => {
      const results = DataHelpers.searchMessages('welcome', 'general')
      expect(results.length).toBeGreaterThan(0)
      results.forEach(message => {
        expect(message.channelId).toBe('general')
        expect(message.content.toLowerCase()).toContain('welcome')
      })
    })
  })

  describe('Data validation', () => {
    it('should validate data integrity', () => {
      const validation = DataHelpers.validateDataIntegrity()
      expect(validation.isValid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })
  })

  describe('Statistics', () => {
    it('should provide comprehensive data statistics', () => {
      const stats = DataHelpers.getDataStats()
      
      expect(stats.users.total).toBe(mockUsers.length)
      expect(stats.users.online).toBeGreaterThan(0)
      expect(stats.channels.total).toBe(mockChannels.length)
      expect(stats.channels.public).toBeGreaterThan(0)
      expect(stats.messages.total).toBeGreaterThan(0)
      expect(stats.messages.text).toBeGreaterThan(0)
      
      // Check byChannel stats
      Object.keys(mockMessages).forEach(channelId => {
        expect(stats.messages.byChannel[channelId]).toBe(mockMessages[channelId].length)
      })
    })
  })
})