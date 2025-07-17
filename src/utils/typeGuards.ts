import type { User, Channel, Message, Theme } from '../types'

// Type guard functions for runtime validation
export function isValidUser(obj: any): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.avatar === 'string' &&
    ['online', 'offline', 'away'].includes(obj.status) &&
    (obj.email === undefined || typeof obj.email === 'string')
  )
}

export function isValidChannel(obj: any): obj is Channel {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.description === 'string' &&
    ['public', 'private'].includes(obj.type) &&
    obj.createdAt instanceof Date &&
    typeof obj.memberCount === 'number'
  )
}

export function isValidMessage(obj: any): obj is Message {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.channelId === 'string' &&
    typeof obj.userId === 'string' &&
    typeof obj.content === 'string' &&
    obj.timestamp instanceof Date &&
    ['text', 'system'].includes(obj.type) &&
    (obj.editedAt === undefined || obj.editedAt instanceof Date)
  )
}

export function isValidTheme(value: any): value is Theme {
  return ['light', 'dark', 'system'].includes(value)
}

// Validation functions for data integrity
export function validateMessageContent(content: string): boolean {
  return content.trim().length > 0 && content.length <= 2000
}

export function validateChannelId(id: string): boolean {
  return /^[a-z0-9-_]+$/.test(id) && id.length >= 2 && id.length <= 50
}

export function validateUserId(id: string): boolean {
  return /^[a-zA-Z0-9-_]+$/.test(id) && id.length >= 2 && id.length <= 50
}