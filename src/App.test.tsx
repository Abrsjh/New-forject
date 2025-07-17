import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'
import { useAppStore } from './stores/useAppStore'

// Mock the store
vi.mock('./stores/useAppStore')

const mockUseAppStore = vi.mocked(useAppStore)

describe('App Component', () => {
  const mockStore = {
    channels: [
      { id: 'general', name: 'General', description: 'General discussion', type: 'public', createdAt: new Date(), memberCount: 5 },
      { id: 'tech', name: 'Tech Talk', description: 'Technical discussions', type: 'public', createdAt: new Date(), memberCount: 3 }
    ],
    activeChannelId: 'general',
    theme: 'light' as const,
    sidebarOpen: true,
    isLoading: false,
    error: null,
    initializeStore: vi.fn(),
    loadMockData: vi.fn(),
    setActiveChannel: vi.fn(),
    getFilteredChannels: vi.fn(() => []),
    getChannelMessages: vi.fn(() => [])
  }

  beforeEach(() => {
    mockUseAppStore.mockReturnValue(mockStore as any)
    vi.clearAllMocks()
  })

  describe('Routing', () => {
    it('should redirect from root to first channel', async () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(window.location.pathname).toBe('/channel/general')
      })
    })

    it('should render channel route correctly', () => {
      render(
        <MemoryRouter initialEntries={['/channel/general']}>
          <App />
        </MemoryRouter>
      )

      expect(screen.getByTestId('app-layout')).toBeInTheDocument()
    })

    it('should handle invalid channel routes with 404', () => {
      render(
        <MemoryRouter initialEntries={['/channel/non-existent']}>
          <App />
        </MemoryRouter>
      )

      expect(screen.getByTestId('not-found-page')).toBeInTheDocument()
      expect(screen.getByText(/channel not found/i)).toBeInTheDocument()
    })

    it('should handle completely invalid routes with 404', () => {
      render(
        <MemoryRouter initialEntries={['/invalid-route']}>
          <App />
        </MemoryRouter>
      )

      expect(screen.getByTestId('not-found-page')).toBeInTheDocument()
    })
  })

  describe('Theme Integration', () => {
    it('should apply light theme class to document', () => {
      mockUseAppStore.mockReturnValue({
        ...mockStore,
        theme: 'light'
      } as any)

      render(
        <MemoryRouter initialEntries={['/channel/general']}>
          <App />
        </MemoryRouter>
      )

      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })

    it('should apply dark theme class to document', () => {
      mockUseAppStore.mockReturnValue({
        ...mockStore,
        theme: 'dark'
      } as any)

      render(
        <MemoryRouter initialEntries={['/channel/general']}>
          <App />
        </MemoryRouter>
      )

      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('should handle system theme preference', () => {
      // Mock matchMedia for system theme
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-color-scheme: dark)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      })

      mockUseAppStore.mockReturnValue({
        ...mockStore,
        theme: 'system'
      } as any)

      render(
        <MemoryRouter initialEntries={['/channel/general']}>
          <App />
        </MemoryRouter>
      )

      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })
  })

  describe('Store Initialization', () => {
    it('should initialize store on mount', () => {
      render(
        <MemoryRouter initialEntries={['/channel/general']}>
          <App />
        </MemoryRouter>
      )

      expect(mockStore.initializeStore).toHaveBeenCalled()
    })

    it('should load mock data on mount', () => {
      render(
        <MemoryRouter initialEntries={['/channel/general']}>
          <App />
        </MemoryRouter>
      )

      expect(mockStore.loadMockData).toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('should display error message when store has error', () => {
      mockUseAppStore.mockReturnValue({
        ...mockStore,
        error: 'Test error message'
      } as any)

      render(
        <MemoryRouter initialEntries={['/channel/general']}>
          <App />
        </MemoryRouter>
      )

      expect(screen.getByText('Test error message')).toBeInTheDocument()
    })

    it('should display loading state', () => {
      mockUseAppStore.mockReturnValue({
        ...mockStore,
        isLoading: true
      } as any)

      render(
        <MemoryRouter initialEntries={['/channel/general']}>
          <App />
        </MemoryRouter>
      )

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })
  })

  describe('Channel Navigation', () => {
    it('should set active channel when route changes', () => {
      render(
        <MemoryRouter initialEntries={['/channel/tech']}>
          <App />
        </MemoryRouter>
      )

      expect(mockStore.setActiveChannel).toHaveBeenCalledWith('tech')
    })

    it('should validate channel exists before setting as active', () => {
      render(
        <MemoryRouter initialEntries={['/channel/non-existent']}>
          <App />
        </MemoryRouter>
      )

      expect(mockStore.setActiveChannel).not.toHaveBeenCalled()
    })
  })
})