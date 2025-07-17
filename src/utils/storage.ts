import type { Theme, StorageData } from '../types'
import { isValidTheme } from './typeGuards'

// Storage keys
export const STORAGE_KEYS = {
  THEME: 'openboard-theme',
  SETTINGS: 'openboard-settings'
} as const

// Safe localStorage wrapper with error handling
export class StorageManager {
  private static isStorageAvailable(): boolean {
    try {
      const test = '__storage_test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  }

  static getTheme(): Theme {
    if (!this.isStorageAvailable()) {
      return 'light'
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.THEME)
      if (stored && isValidTheme(stored)) {
        return stored
      }
    } catch (error) {
      console.warn('Failed to read theme from localStorage:', error)
    }

    return 'light'
  }

  static setTheme(theme: Theme): void {
    if (!this.isStorageAvailable()) {
      return
    }

    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme)
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error)
    }
  }

  static getSettings(): Partial<StorageData> {
    if (!this.isStorageAvailable()) {
      return {}
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS)
      if (stored) {
        const parsed = JSON.parse(stored)
        return typeof parsed === 'object' && parsed !== null ? parsed : {}
      }
    } catch (error) {
      console.warn('Failed to read settings from localStorage:', error)
    }

    return {}
  }

  static setSettings(settings: Partial<StorageData>): void {
    if (!this.isStorageAvailable()) {
      return
    }

    try {
      const current = this.getSettings()
      const updated = { ...current, ...settings }
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated))
    } catch (error) {
      console.warn('Failed to save settings to localStorage:', error)
    }
  }

  static clearAll(): void {
    if (!this.isStorageAvailable()) {
      return
    }

    try {
      localStorage.removeItem(STORAGE_KEYS.THEME)
      localStorage.removeItem(STORAGE_KEYS.SETTINGS)
    } catch (error) {
      console.warn('Failed to clear localStorage:', error)
    }
  }

  // System theme detection
  static getSystemTheme(): 'light' | 'dark' {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  }

  // Resolved theme (handles 'system' preference)
  static getResolvedTheme(theme: Theme): 'light' | 'dark' {
    if (theme === 'system') {
      return this.getSystemTheme()
    }
    return theme
  }
}