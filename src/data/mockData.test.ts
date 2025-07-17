import { describe, it, expect } from 'vitest'
import { mockUsers, mockChannels, mockMessages } from './mockData'
import { isValidUser, isValidChannel, isValidMessage } from '../utils/typeGuards'

describe('Mock Data', () => {
  describe('mockUsers', () => {
    it('should contain at least 5 diverse users', () => {
      expect(mockUsers.length).toBeGreaterThanOrEqual(5)
    })

    it('should have all valid user objects', () => {
      mockUsers.forEach(user => {
        expect(isValidUser(user)).toBe(true)
      })
    })

    it('should have unique user IDs', () => {
      const userIds = mockUsers.map(user => user.id)
      const uniqueIds = new Set(userIds)
      expect(uniqueIds.size).toBe(userIds.length)
    })

    it('should have realistic names and avatars', () => {
      mockUsers.forEach(user => {
        expect(user.name.length).toBeGreaterThan(2)
        expect(user.avatar).toMatch(/^https?:\/\//)
      })
    })

    it('should have diverse status values', () => {
      const statuses = mockUsers.map(user => user.status)
      const uniqueStatuses = new Set(statuses)
      expect(uniqueStatuses.size).toBeGreaterThan(1)
    })
  })

  describe('mockChannels', () => {
    it('should contain at least 4 meaningful channels', () => {
      expect(mockChannels.length).toBeGreaterThanOrEqual(4)
    })

    it('should have all valid channel objects', () => {
      mockChannels.forEach(channel => {
        expect(isValidChannel(channel)).toBe(true)
      })
    })

    it('should have unique channel IDs', () => {
      const channelIds = mockChannels.map(channel => channel.id)
      const uniqueIds = new Set(channelIds)
      expect(uniqueIds.size).toBe(channelIds.length)
    })

    it('should include expected default channels', () => {
      const channelIds = mockChannels.map(channel => channel.id)
      expect(channelIds).toContain('general')
      expect(channelIds).toContain('tech')
      expect(channelIds).toContain('random')
    })

    it('should have both public and private channels', () => {
      const types = mockChannels.map(channel => channel.type)
      expect(types).toContain('public')
      expect(types).toContain('private')
    })

    it('should have realistic member counts', () => {
      mockChannels.forEach(channel => {
        expect(channel.memberCount).toBeGreaterThan(0)
        expect(channel.memberCount).toBeLessThanOrEqual(mockUsers.length)
      })
    })
  })

  describe('mockMessages', () => {
    it('should contain messages for each channel', () => {
      const channelIds = mockChannels.map(channel => channel.id)
      channelIds.forEach(channelId => {
        const channelMessages = mockMessages[channelId]
        expect(Array.isArray(channelMessages)).toBe(true)
        expect(channelMessages.length).toBeGreaterThan(0)
      })
    })

    it('should have all valid message objects', () => {
      Object.values(mockMessages).flat().forEach(message => {
        expect(isValidMessage(message)).toBe(true)
      })
    })

    it('should have unique message IDs across all channels', () => {
      const allMessages = Object.values(mockMessages).flat()
      const messageIds = allMessages.map(message => message.id)
      const uniqueIds = new Set(messageIds)
      expect(uniqueIds.size).toBe(messageIds.length)
    })

    it('should reference valid users and channels', () => {
      const userIds = new Set(mockUsers.map(user => user.id))
      const channelIds = new Set(mockChannels.map(channel => channel.id))

      Object.entries(mockMessages).forEach(([channelId, messages]) => {
        expect(channelIds.has(channelId)).toBe(true)
        
        messages.forEach(message => {
          expect(userIds.has(message.userId)).toBe(true)
          expect(message.channelId).toBe(channelId)
        })
      })
    })

    it('should have realistic message content', () => {
      const allMessages = Object.values(mockMessages).flat()
      
      allMessages.forEach(message => {
        expect(message.content.length).toBeGreaterThan(0)
        expect(message.content.length).toBeLessThanOrEqual(2000)
      })
    })

    it('should have chronological timestamps within channels', () => {
      Object.values(mockMessages).forEach(channelMessages => {
        for (let i = 1; i < channelMessages.length; i++) {
          const prevTimestamp = channelMessages[i - 1].timestamp.getTime()
          const currentTimestamp = channelMessages[i].timestamp.getTime()
          expect(currentTimestamp).toBeGreaterThanOrEqual(prevTimestamp)
        }
      })
    })

    it('should include both text and system message types', () => {
      const allMessages = Object.values(mockMessages).flat()
      const messageTypes = allMessages.map(message => message.type)
      
      expect(messageTypes).toContain('text')
      expect(messageTypes).toContain('system')
    })

    it('should have some edited messages', () => {
      const allMessages = Object.values(mockMessages).flat()
      const editedMessages = allMessages.filter(message => message.editedAt)
      
      expect(editedMessages.length).toBeGreaterThan(0)
    })
  })

  describe('Data relationships', () => {
    it('should have consistent data relationships', () => {
      // All message user IDs should exist in users
      const userIds = new Set(mockUsers.map(user => user.id))
      const allMessages = Object.values(mockMessages).flat()
      
      allMessages.forEach(message => {
        expect(userIds.has(message.userId)).toBe(true)
      })
    })

    it('should have realistic timestamps (within last 30 days)', () => {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const allMessages = Object.values(mockMessages).flat()
      
      allMessages.forEach(message => {
        expect(message.timestamp.getTime()).toBeGreaterThan(thirtyDaysAgo.getTime())
        expect(message.timestamp.getTime()).toBeLessThanOrEqual(Date.now())
      })
    })
  })
})