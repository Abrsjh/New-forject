import { describe, it, expect } from 'vitest'
import {
  isValidUser,
  isValidChannel,
  isValidMessage,
  isValidTheme,
  validateMessageContent,
  validateChannelId,
  validateUserId
} from './typeGuards'

describe('Type Guards', () => {
  describe('isValidUser', () => {
    it('should return true for valid user objects', () => {
      const validUser = {
        id: 'user-1',
        name: 'John Doe',
        avatar: 'https://example.com/avatar.jpg',
        status: 'online'
      }
      
      expect(isValidUser(validUser)).toBe(true)
    })

    it('should return true for valid user with optional email', () => {
      const validUserWithEmail = {
        id: 'user-1',
        name: 'John Doe',
        avatar: 'https://example.com/avatar.jpg',
        status: 'online',
        email: 'john@example.com'
      }
      
      expect(isValidUser(validUserWithEmail)).toBe(true)
    })

    it('should return false for invalid user objects', () => {
      expect(isValidUser(null)).toBe(false)
      expect(isValidUser({})).toBe(false)
      expect(isValidUser({ id: 123 })).toBe(false)
      expect(isValidUser({ id: 'user-1', status: 'invalid' })).toBe(false)
    })
  })

  describe('isValidChannel', () => {
    it('should return true for valid channel objects', () => {
      const validChannel = {
        id: 'general',
        name: 'General',
        description: 'General discussion',
        type: 'public',
        createdAt: new Date(),
        memberCount: 5
      }
      
      expect(isValidChannel(validChannel)).toBe(true)
    })

    it('should return false for invalid channel objects', () => {
      expect(isValidChannel(null)).toBe(false)
      expect(isValidChannel({})).toBe(false)
      expect(isValidChannel({ id: 'general', type: 'invalid' })).toBe(false)
    })
  })

  describe('isValidMessage', () => {
    it('should return true for valid message objects', () => {
      const validMessage = {
        id: 'msg-1',
        channelId: 'general',
        userId: 'user-1',
        content: 'Hello world!',
        timestamp: new Date(),
        type: 'text'
      }
      
      expect(isValidMessage(validMessage)).toBe(true)
    })

    it('should return true for valid message with editedAt', () => {
      const editedMessage = {
        id: 'msg-1',
        channelId: 'general',
        userId: 'user-1',
        content: 'Hello world! (edited)',
        timestamp: new Date(),
        type: 'text',
        editedAt: new Date()
      }
      
      expect(isValidMessage(editedMessage)).toBe(true)
    })

    it('should return false for invalid message objects', () => {
      expect(isValidMessage(null)).toBe(false)
      expect(isValidMessage({})).toBe(false)
      expect(isValidMessage({ id: 'msg-1', type: 'invalid' })).toBe(false)
    })
  })

  describe('isValidTheme', () => {
    it('should return true for valid theme values', () => {
      expect(isValidTheme('light')).toBe(true)
      expect(isValidTheme('dark')).toBe(true)
      expect(isValidTheme('system')).toBe(true)
    })

    it('should return false for invalid theme values', () => {
      expect(isValidTheme('invalid')).toBe(false)
      expect(isValidTheme(null)).toBe(false)
      expect(isValidTheme(123)).toBe(false)
    })
  })

  describe('validateMessageContent', () => {
    it('should return true for valid message content', () => {
      expect(validateMessageContent('Hello world!')).toBe(true)
      expect(validateMessageContent('A'.repeat(2000))).toBe(true)
    })

    it('should return false for invalid message content', () => {
      expect(validateMessageContent('')).toBe(false)
      expect(validateMessageContent('   ')).toBe(false)
      expect(validateMessageContent('A'.repeat(2001))).toBe(false)
    })
  })

  describe('validateChannelId', () => {
    it('should return true for valid channel IDs', () => {
      expect(validateChannelId('general')).toBe(true)
      expect(validateChannelId('tech-talk')).toBe(true)
      expect(validateChannelId('random_stuff')).toBe(true)
    })

    it('should return false for invalid channel IDs', () => {
      expect(validateChannelId('a')).toBe(false) // too short
      expect(validateChannelId('A'.repeat(51))).toBe(false) // too long
      expect(validateChannelId('invalid space')).toBe(false) // contains space
      expect(validateChannelId('invalid@char')).toBe(false) // invalid character
    })
  })

  describe('validateUserId', () => {
    it('should return true for valid user IDs', () => {
      expect(validateUserId('user123')).toBe(true)
      expect(validateUserId('john-doe')).toBe(true)
      expect(validateUserId('Jane_Smith')).toBe(true)
    })

    it('should return false for invalid user IDs', () => {
      expect(validateUserId('a')).toBe(false) // too short
      expect(validateUserId('A'.repeat(51))).toBe(false) // too long
      expect(validateUserId('invalid space')).toBe(false) // contains space
      expect(validateUserId('invalid@char')).toBe(false) // invalid character
    })
  })
})