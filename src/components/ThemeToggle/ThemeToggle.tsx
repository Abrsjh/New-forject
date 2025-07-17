import React, { useMemo, useCallback } from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useAppStore } from '../../stores/useAppStore'
import type { Theme } from '../../types'

const ThemeToggle: React.FC = React.memo(() => {
  const { theme, toggleTheme } = useAppStore()

  // Memoize the theme icon to prevent unnecessary re-renders
  const themeIcon = useMemo(() => {
    switch (theme) {
      case 'light':
        return <Sun className="w-5 h-5" data-testid="sun-icon" aria-hidden="true" />
      case 'dark':
        return <Moon className="w-5 h-5" data-testid="moon-icon" aria-hidden="true" />
      case 'system':
        return <Monitor className="w-5 h-5" data-testid="monitor-icon" aria-hidden="true" />
      default:
        return <Sun className="w-5 h-5" data-testid="sun-icon" aria-hidden="true" />
    }
  }, [theme])

  // Memoize the next theme calculation
  const nextTheme = useMemo((): Theme => {
    switch (theme) {
      case 'light':
        return 'dark'
      case 'dark':
        return 'system'
      case 'system':
        return 'light'
      default:
        return 'dark'
    }
  }, [theme])

  // Memoize accessibility text
  const accessibilityText = useMemo(() => {
    return `Switch to ${nextTheme} theme`
  }, [nextTheme])

  // Memoize event handlers to prevent unnecessary re-renders of child components
  const handleToggle = useCallback(() => {
    toggleTheme()
  }, [toggleTheme])

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleToggle()
    }
  }, [handleToggle])

  return (
    <button
      data-testid="theme-toggle"
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
      aria-label={accessibilityText}
      title={accessibilityText}
      tabIndex={0}
      type="button"
    >
      {themeIcon}
    </button>
  )
})

export default ThemeToggle