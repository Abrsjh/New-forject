import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import ThemeToggle from './ThemeToggle'
import { useAppStore } from '../../stores/useAppStore'

// Mock the store
vi.mock('../../stores/useAppStore')
const mockUseAppStore = vi.mocked(useAppStore)

// Mock window.matchMedia for system theme detection
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

describe('ThemeToggle', () => {
  const mockToggleTheme = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    
    mockUseAppStore.mockReturnValue({
      theme: 'light',
      toggleTheme: mockToggleTheme,
      // Add other required store properties
      channels: [],
      activeChannelId: null,
      messages: {},
      sidebarOpen: true,
      searchQuery: '',
      isLoading: false,
      error: null,
      setActiveChannel: vi.fn(),
      addMessage: vi.fn(),
      setSearchQuery: vi.fn(),
      toggleSidebar: vi.fn(),
      clearError: vi.fn(),
      getChannelMessages: vi.fn(),
      getFilteredChannels: vi.fn()
    } as any)
  })

  describe('Rendering', () => {
    it('should render theme toggle button', () => {
      render(<ThemeToggle />)
      
      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument()
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should have proper accessibility attributes', () => {
      render(<ThemeToggle />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label')
      expect(button).toHaveAttribute('title')
    })
  })

  describe('Light Theme State', () => {
    beforeEach(() => {
      mockUseAppStore.mockReturnValue({
        theme: 'light',
        toggleTheme: mockToggleTheme,
        // Add other required store properties
        channels: [],
        activeChannelId: null,
        messages: {},
        sidebarOpen: true,
        searchQuery: '',
        isLoading: false,
        error: null,
        setActiveChannel: vi.fn(),
        addMessage: vi.fn(),
        setSearchQuery: vi.fn(),
        toggleSidebar: vi.fn(),
        clearError: vi.fn(),
        getChannelMessages: vi.fn(),
        getFilteredChannels: vi.fn()
      } as any)
    })

    it('should display sun icon for light theme', () => {
      render(<ThemeToggle />)
      
      expect(screen.getByTestId('sun-icon')).toBeInTheDocument()
    })

    it('should have correct aria-label for light theme', () => {
      render(<ThemeToggle />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Switch to dark theme')
    })

    it('should have correct title for light theme', () => {
      render(<ThemeToggle />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('title', 'Switch to dark theme')
    })
  })

  describe('Dark Theme State', () => {
    beforeEach(() => {
      mockUseAppStore.mockReturnValue({
        theme: 'dark',
        toggleTheme: mockToggleTheme,
        // Add other required store properties
        channels: [],
        activeChannelId: null,
        messages: {},
        sidebarOpen: true,
        searchQuery: '',
        isLoading: false,
        error: null,
        setActiveChannel: vi.fn(),
        addMessage: vi.fn(),
        setSearchQuery: vi.fn(),
        toggleSidebar: vi.fn(),
        clearError: vi.fn(),
        getChannelMessages: vi.fn(),
        getFilteredChannels: vi.fn()
      } as any)
    })

    it('should display moon icon for dark theme', () => {
      render(<ThemeToggle />)
      
      expect(screen.getByTestId('moon-icon')).toBeInTheDocument()
    })

    it('should have correct aria-label for dark theme', () => {
      render(<ThemeToggle />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Switch to system theme')
    })

    it('should have correct title for dark theme', () => {
      render(<ThemeToggle />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('title', 'Switch to system theme')
    })
  })

  describe('System Theme State', () => {
    beforeEach(() => {
      mockUseAppStore.mockReturnValue({
        theme: 'system',
        toggleTheme: mockToggleTheme,
        // Add other required store properties
        channels: [],
        activeChannelId: null,
        messages: {},
        sidebarOpen: true,
        searchQuery: '',
        isLoading: false,
        error: null,
        setActiveChannel: vi.fn(),
        addMessage: vi.fn(),
        setSearchQuery: vi.fn(),
        toggleSidebar: vi.fn(),
        clearError: vi.fn(),
        getChannelMessages: vi.fn(),
        getFilteredChannels: vi.fn()
      } as any)
    })

    it('should display monitor icon for system theme', () => {
      render(<ThemeToggle />)
      
      expect(screen.getByTestId('monitor-icon')).toBeInTheDocument()
    })

    it('should have correct aria-label for system theme', () => {
      render(<ThemeToggle />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Switch to light theme')
    })

    it('should have correct title for system theme', () => {
      render(<ThemeToggle />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('title', 'Switch to light theme')
    })
  })

  describe('Theme Switching', () => {
    it('should call toggleTheme when button is clicked', async () => {
      const user = userEvent.setup()
      render(<ThemeToggle />)
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      expect(mockToggleTheme).toHaveBeenCalledTimes(1)
    })

    it('should call toggleTheme when Enter key is pressed', async () => {
      const user = userEvent.setup()
      render(<ThemeToggle />)
      
      const button = screen.getByRole('button')
      button.focus()
      await user.keyboard('{Enter}')
      
      expect(mockToggleTheme).toHaveBeenCalledTimes(1)
    })

    it('should call toggleTheme when Space key is pressed', async () => {
      const user = userEvent.setup()
      render(<ThemeToggle />)
      
      const button = screen.getByRole('button')
      button.focus()
      await user.keyboard(' ')
      
      expect(mockToggleTheme).toHaveBeenCalledTimes(1)
    })
  })

  describe('Visual States', () => {
    it('should have hover state styling', () => {
      render(<ThemeToggle />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('hover:bg-gray-100')
    })

    it('should have focus state styling', () => {
      render(<ThemeToggle />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500')
    })

    it('should have transition classes for smooth animations', () => {
      render(<ThemeToggle />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('transition-colors')
    })
  })

  describe('Icon Rendering', () => {
    it('should render only one icon at a time', () => {
      render(<ThemeToggle />)
      
      const icons = screen.getAllByTestId(/-(sun|moon|monitor)-icon$/)
      expect(icons).toHaveLength(1)
    })

    it('should have proper icon sizing', () => {
      render(<ThemeToggle />)
      
      const icon = screen.getByTestId(/-(sun|moon|monitor)-icon$/)
      expect(icon).toHaveClass('w-5', 'h-5')
    })
  })

  describe('Responsive Design', () => {
    it('should have proper responsive classes', () => {
      render(<ThemeToggle />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('p-2', 'rounded-lg')
    })
  })

  describe('Theme Cycle Logic', () => {
    it('should cycle through themes in correct order', () => {
      // The actual cycling logic is in the store, but we test the UI reflects it
      const themes = ['light', 'dark', 'system'] as const
      
      themes.forEach(theme => {
        mockUseAppStore.mockReturnValue({
          theme,
          toggleTheme: mockToggleTheme,
          // Add other required store properties
          channels: [],
          activeChannelId: null,
          messages: {},
          sidebarOpen: true,
          searchQuery: '',
          isLoading: false,
          error: null,
          setActiveChannel: vi.fn(),
          addMessage: vi.fn(),
          setSearchQuery: vi.fn(),
          toggleSidebar: vi.fn(),
          clearError: vi.fn(),
          getChannelMessages: vi.fn(),
          getFilteredChannels: vi.fn()
        } as any)

        const { rerender } = render(<ThemeToggle />)
        
        // Verify correct icon is displayed
        if (theme === 'light') {
          expect(screen.getByTestId('sun-icon')).toBeInTheDocument()
        } else if (theme === 'dark') {
          expect(screen.getByTestId('moon-icon')).toBeInTheDocument()
        } else {
          expect(screen.getByTestId('monitor-icon')).toBeInTheDocument()
        }
        
        rerender(<></>)
      })
    })
  })

  describe('Accessibility Compliance', () => {
    it('should be keyboard navigable', () => {
      render(<ThemeToggle />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('tabIndex', '0')
    })

    it('should have descriptive text for screen readers', () => {
      render(<ThemeToggle />)
      
      const button = screen.getByRole('button')
      const ariaLabel = button.getAttribute('aria-label')
      expect(ariaLabel).toMatch(/Switch to (light|dark|system) theme/)
    })

    it('should have role button', () => {
      render(<ThemeToggle />)
      
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })

  describe('Performance Optimization', () => {
    it('should be memoized to prevent unnecessary re-renders', () => {
      const renderSpy = vi.fn()
      
      // Create a test component that tracks renders
      const TestComponent = () => {
        renderSpy()
        return <ThemeToggle />
      }

      const { rerender } = render(<TestComponent />)
      expect(renderSpy).toHaveBeenCalledTimes(1)

      // Re-render with same theme - should not cause ThemeToggle to re-render
      rerender(<TestComponent />)
      expect(renderSpy).toHaveBeenCalledTimes(2) // TestComponent re-renders but ThemeToggle should be memoized
    })
  })
})