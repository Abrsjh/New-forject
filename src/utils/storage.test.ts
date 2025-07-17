import { describe, it, expect, beforeEach, vi } from 'vitest'
import { StorageManager, STORAGE_KEYS } from './storage'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

// Mock window.matchMedia
const matchMediaMock = vi.fn()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
})

Object.defineProperty(window, 'matchMedia', {
  value: matchMediaMock,
  writable: true
})

describe('StorageManager', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
    localStorageMock.removeItem.mockClear()
    matchMediaMock.mockClear()
  })

  describe('Theme management', () => {
    it('should get theme from localStorage', () => {
      localStorageMock.getItem.mockReturnValue('dark')
      
      const theme = StorageManager.getTheme()
      
      expect(localStorageMock.getItem).toHaveBeenCalledWith(STORAGE_KEYS.THEME)
      expect(theme).toBe('dark')
    })

    it('should return default theme when localStorage is empty', () => {
      localStorageMock.getItem.mockReturnValue(null)
      
      const theme = StorageManager.getTheme()
      
      expect(theme).toBe('light')
    })

    it('should return default theme for invalid stored value', () => {
      localStorageMock.getItem.mockReturnValue('invalid-theme')
      
      const theme = StorageManager.getTheme()
      
      expect(theme).toBe('light')
    })

    it('should save theme to localStorage', () => {
      StorageManager.setTheme('dark')
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(STORAGE_KEYS.THEME, 'dark')
    })

    it('should handle localStorage errors when getting theme', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage error')
      })
      
      const theme = StorageManager.getTheme()
      
      expect(theme).toBe('light') // Should fallback to default
    })

    it('should handle localStorage errors when setting theme', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('localStorage error')
      })
      
      expect(() => StorageManager.setTheme('dark')).not.toThrow()
    })
  })

  describe('Settings management', () => {
    it('should get settings from localStorage', () => {
      const mockSettings = { sidebarOpen: false, lastActiveChannel: 'tech' }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockSettings))
      
      const settings = StorageManager.getSettings()
      
      expect(localStorageMock.getItem).toHaveBeenCalledWith(STORAGE_KEYS.SETTINGS)
      expect(settings).toEqual(mockSettings)
    })

    it('should return empty object when localStorage is empty', () => {
      localStorageMock.getItem.mockReturnValue(null)
      
      const settings = StorageManager.getSettings()
      
      expect(settings).toEqual({})
    })

    it('should handle invalid JSON in localStorage', () => {
      localStorageMock.getItem.mockReturnValue('invalid json')
      
      const settings = StorageManager.getSettings()
      
      expect(settings).toEqual({})
    })

    it('should save settings to localStorage', () => {
      const existingSettings = { sidebarOpen: true }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingSettings))
      
      const newSettings = { lastActiveChannel: 'tech' }
      StorageManager.setSettings(newSettings)
      
      const expectedSettings = { ...existingSettings, ...newSettings }
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.SETTINGS,
        JSON.stringify(expectedSettings)
      )
    })

    it('should handle localStorage errors when getting settings', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage error')
      })
      
      const settings = StorageManager.getSettings()
      
      expect(settings).toEqual({})
    })

    it('should handle localStorage errors when setting settings', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('localStorage error')
      })
      
      expect(() => StorageManager.setSettings({ sidebarOpen: false })).not.toThrow()
    })
  })

  describe('Storage availability', () => {
    it('should handle unavailable localStorage gracefully', () => {
      // Mock localStorage to throw on access
      Object.defineProperty(window, 'localStorage', {
        value: {
          setItem: () => { throw new Error('localStorage not available') },
          getItem: () => { throw new Error('localStorage not available') },
          removeItem: () => { throw new Error('localStorage not available') }
        },
        writable: true
      })
      
      expect(() => StorageManager.getTheme()).not.toThrow()
      expect(() => StorageManager.setTheme('dark')).not.toThrow()
      expect(() => StorageManager.getSettings()).not.toThrow()
      expect(() => StorageManager.setSettings({})).not.toThrow()
      
      expect(StorageManager.getTheme()).toBe('light')
      expect(StorageManager.getSettings()).toEqual({})
    })
  })

  describe('System theme detection', () => {
    it('should detect dark system theme', () => {
      matchMediaMock.mockReturnValue({ matches: true })
      
      const systemTheme = StorageManager.getSystemTheme()
      
      expect(matchMediaMock).toHaveBeenCalledWith('(prefers-color-scheme: dark)')
      expect(systemTheme).toBe('dark')
    })

    it('should detect light system theme', () => {
      matchMediaMock.mockReturnValue({ matches: false })
      
      const systemTheme = StorageManager.getSystemTheme()
      
      expect(systemTheme).toBe('light')
    })

    it('should fallback to light when matchMedia is not available', () => {
      Object.defineProperty(window, 'matchMedia', {
        value: undefined,
        writable: true
      })
      
      const systemTheme = StorageManager.getSystemTheme()
      
      expect(systemTheme).toBe('light')
    })
  })

  describe('Theme resolution', () => {
    it('should resolve system theme to actual theme', () => {
      matchMediaMock.mockReturnValue({ matches: true })
      
      const resolved = StorageManager.getResolvedTheme('system')
      
      expect(resolved).toBe('dark')
    })

    it('should return theme as-is for non-system themes', () => {
      expect(StorageManager.getResolvedTheme('light')).toBe('light')
      expect(StorageManager.getResolvedTheme('dark')).toBe('dark')
    })
  })

  describe('Clear functionality', () => {
    it('should clear all storage', () => {
      StorageManager.clearAll()
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.THEME)
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.SETTINGS)
    })

    it('should handle errors when clearing storage', () => {
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('localStorage error')
      })
      
      expect(() => StorageManager.clearAll()).not.toThrow()
    })
  })
})