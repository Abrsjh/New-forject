import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useAppStore } from '../../stores/useAppStore'

// Mock the store
vi.mock('../../stores/useAppStore')
const mockUseAppStore = vi.mocked(useAppStore)

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...(actual as any),
    useNavigate: () => mockNavigate,
  }
})

describe('Sidebar Component', () => {
  const mockSetActiveChannel = vi.fn()
  const mockSetSearchQuery = vi.fn()
  const mockToggleSidebar = vi.fn()
  
  const mockChannels = [
    { id: 'general', name: 'General', description: 'General discussion', type: 'public', createdAt: new Date(), memberCount: 5 },
    { id: 'tech', name: 'Tech Talk', description: 'Technical discussions', type: 'public', createdAt: new Date(), memberCount: 3 },
    { id: 'random', name: 'Random', description: 'Off-topic chat', type: 'public', createdAt: new Date(), memberCount: 4 },
    { id: 'private-project', name: 'Private Project', description: 'Secret project', type: 'private', createdAt: new Date(), memberCount: 2 }
  ]

  const mockStore = {
    channels: mockChannels,
    activeChannelId: 'general',
    searchQuery: '',
    sidebarOpen: true,
    setActiveChannel: mockSetActiveChannel,
    setSearchQuery: mockSetSearchQuery,
    toggleSidebar: mockToggleSidebar,
    getFilteredChannels: vi.fn(() => mockChannels)
  }

  beforeEach(() => {
    mockUseAppStore.mockReturnValue(mockStore as any)
    mockNavigate.mockClear()
    vi.clearAllMocks()
  })

  describe('Channel List Display', () => {
    it('should render all channels', () => {
      render(
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>
      )

      expect(screen.getByText('General')).toBeInTheDocument()
      expect(screen.getByText('Tech Talk')).toBeInTheDocument()
      expect(screen.getByText('Random')).toBeInTheDocument()
      expect(screen.getByText('Private Project')).toBeInTheDocument()
    })

    it('should display channel icons based on type', () => {
      render(
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>
      )

      // Public channels should have Hash icon
      const publicChannels = screen.getAllByTestId('channel-icon-public')
      expect(publicChannels).toHaveLength(3)

      // Private channels should have Lock icon
      const privateChannels = screen.getAllByTestId('channel-icon-private')
      expect(privateChannels).toHaveLength(1)
    })

    it('should highlight active channel', () => {
      render(
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>
      )

      const activeChannel = screen.getByTestId('channel-item-general')
      expect(activeChannel).toHaveClass('bg-blue-100', 'dark:bg-blue-900')
    })

    it('should display member count for each channel', () => {
      render(
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>
      )

      expect(screen.getByText('5 members')).toBeInTheDocument()
      expect(screen.getByText('3 members')).toBeInTheDocument()
      expect(screen.getByText('4 members')).toBeInTheDocument()
      expect(screen.getByText('2 members')).toBeInTheDocument()
    })
  })

  describe('Basic Search Functionality', () => {
    it('should render search input', () => {
      render(
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>
      )

      const searchInput = screen.getByPlaceholderText('Search channels...')
      expect(searchInput).toBeInTheDocument()
      expect(searchInput).toHaveAttribute('type', 'text')
    })

    it('should update search query when typing', async () => {
      const user = userEvent.setup()
      
      render(
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>
      )

      const searchInput = screen.getByPlaceholderText('Search channels...')
      await user.type(searchInput, 'tech')

      expect(mockStore.setSearchQuery).toHaveBeenCalledWith('tech')
    })

    it('should display filtered channels based on search', () => {
      const filteredChannels = [mockChannels[1]] // Only tech channel
      mockUseAppStore.mockReturnValue({
        ...mockStore,
        searchQuery: 'tech',
        getFilteredChannels: vi.fn(() => filteredChannels)
      } as any)

      render(
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>
      )

      expect(screen.getByText('Tech Talk')).toBeInTheDocument()
      expect(screen.queryByText('General')).not.toBeInTheDocument()
    })

    it('should show no results message when search yields no matches', () => {
      mockUseAppStore.mockReturnValue({
        ...mockStore,
        searchQuery: 'nonexistent',
        getFilteredChannels: vi.fn(() => [])
      } as any)

      render(
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>
      )

      expect(screen.getByText('No channels found')).toBeInTheDocument()
      expect(screen.getByText('Try adjusting your search terms')).toBeInTheDocument()
    })

    it('should clear search when clear button is clicked', async () => {
      const user = userEvent.setup()
      mockUseAppStore.mockReturnValue({
        ...mockStore,
        searchQuery: 'tech'
      } as any)

      render(
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>
      )

      const clearButton = screen.getByLabelText('Clear search')
      await user.click(clearButton)

      expect(mockStore.setSearchQuery).toHaveBeenCalledWith('')
    })
  })

  describe('Channel Navigation', () => {
    it('should navigate to channel when clicked', async () => {
      const user = userEvent.setup()
      
      render(
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>
      )

      const techChannel = screen.getByTestId('channel-item-tech')
      await user.click(techChannel)

      expect(mockNavigate).toHaveBeenCalledWith('/channel/tech')
      expect(mockStore.setActiveChannel).toHaveBeenCalledWith('tech')
    })

    it('should handle keyboard navigation with Enter key', async () => {
      const user = userEvent.setup()
      
      render(
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>
      )

      const techChannel = screen.getByTestId('channel-item-tech')
      techChannel.focus()
      await user.keyboard('{Enter}')

      expect(mockNavigate).toHaveBeenCalledWith('/channel/tech')
    })

    it('should handle keyboard navigation with Space key', async () => {
      const user = userEvent.setup()
      
      render(
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>
      )

      const techChannel = screen.getByTestId('channel-item-tech')
      techChannel.focus()
      await user.keyboard(' ')

      expect(mockNavigate).toHaveBeenCalledWith('/channel/tech')
    })
  })

  describe('Mobile Responsiveness', () => {
    it('should show mobile toggle button', () => {
      render(
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>
      )

      const toggleButton = screen.getByLabelText('Toggle sidebar')
      expect(toggleButton).toBeInTheDocument()
    })

    it('should toggle sidebar when mobile button is clicked', async () => {
      const user = userEvent.setup()
      
      render(
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>
      )

      const toggleButton = screen.getByLabelText('Toggle sidebar')
      await user.click(toggleButton)

      expect(mockStore.toggleSidebar).toHaveBeenCalled()
    })

    it('should have proper responsive classes', () => {
      render(
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>
      )

      const sidebar = screen.getByTestId('sidebar-container')
      expect(sidebar).toHaveClass('h-full', 'flex', 'flex-col')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>
      )

      expect(screen.getByLabelText('Channel list')).toBeInTheDocument()
      expect(screen.getByLabelText('Search channels')).toBeInTheDocument()
    })

    it('should support keyboard navigation between channels', () => {
      render(
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>
      )

      const channels = screen.getAllByRole('button', { name: /channel/i })
      channels.forEach(channel => {
        expect(channel).toHaveAttribute('tabIndex', '0')
      })
    })

    it('should announce active channel to screen readers', () => {
      render(
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>
      )

      const activeChannel = screen.getByTestId('channel-item-general')
      expect(activeChannel).toHaveAttribute('aria-current', 'page')
    })
  })

  describe('Empty State', () => {
    it('should show empty state when no channels exist', () => {
      mockUseAppStore.mockReturnValue({
        ...mockStore,
        channels: [],
        getFilteredChannels: vi.fn(() => [])
      } as any)

      render(
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>
      )

      expect(screen.getByText('No channels available')).toBeInTheDocument()
    })
  })

  describe('Advanced Search Features', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      mockUseAppStore.mockReturnValue({
        channels: mockChannels,
        activeChannelId: 'general',
        searchQuery: '',
        sidebarOpen: true,
        setActiveChannel: mockSetActiveChannel,
        setSearchQuery: mockSetSearchQuery,
        toggleSidebar: mockToggleSidebar,
        getFilteredChannels: vi.fn().mockReturnValue(mockChannels),
        // Add other required store properties
        messages: {},
        theme: 'light',
        isLoading: false,
        error: null,
        addMessage: vi.fn(),
        toggleTheme: vi.fn(),
        clearError: vi.fn(),
        getChannelMessages: vi.fn()
      } as any)
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should debounce search input', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<Sidebar />)
      
      const searchInput = screen.getByPlaceholderText('Search channels...')
      
      // Type rapidly
      await user.type(searchInput, 'test')
      
      // Should not have called setSearchQuery yet
      expect(mockSetSearchQuery).not.toHaveBeenCalled()
      
      // Advance timers to trigger debounce
      vi.advanceTimersByTime(300)
      
      // Should now have called setSearchQuery
      expect(mockSetSearchQuery).toHaveBeenCalledWith('test')
    })

    it('should clear search with Escape key', async () => {
      const user = userEvent.setup()
      mockUseAppStore.mockReturnValue({
        channels: mockChannels,
        activeChannelId: 'general',
        searchQuery: 'test query',
        sidebarOpen: true,
        setActiveChannel: mockSetActiveChannel,
        setSearchQuery: mockSetSearchQuery,
        toggleSidebar: mockToggleSidebar,
        getFilteredChannels: vi.fn().mockReturnValue(mockChannels),
        // Add other required store properties
        messages: {},
        theme: 'light',
        isLoading: false,
        error: null,
        addMessage: vi.fn(),
        toggleTheme: vi.fn(),
        clearError: vi.fn(),
        getChannelMessages: vi.fn()
      } as any)

      render(<Sidebar />)
      
      const searchInput = screen.getByPlaceholderText('Search channels...')
      
      // Press Escape key
      await user.type(searchInput, '{Escape}')
      
      expect(mockSetSearchQuery).toHaveBeenCalledWith('')
    })

    it('should focus search with Ctrl+K shortcut', async () => {
      const user = userEvent.setup()
      render(<Sidebar />)
      
      const searchInput = screen.getByPlaceholderText('Search channels...')
      
      // Press Ctrl+K
      await user.keyboard('{Control>}k{/Control}')
      
      expect(searchInput).toHaveFocus()
    })

    it('should highlight search terms in channel names', () => {
      mockUseAppStore.mockReturnValue({
        channels: mockChannels,
        activeChannelId: 'general',
        searchQuery: 'gen',
        sidebarOpen: true,
        setActiveChannel: mockSetActiveChannel,
        setSearchQuery: mockSetSearchQuery,
        toggleSidebar: mockToggleSidebar,
        getFilteredChannels: vi.fn().mockReturnValue([mockChannels[0]]), // Only general channel
        // Add other required store properties
        messages: {},
        theme: 'light',
        isLoading: false,
        error: null,
        addMessage: vi.fn(),
        toggleTheme: vi.fn(),
        clearError: vi.fn(),
        getChannelMessages: vi.fn()
      } as any)

      render(<Sidebar />)
      
      // Should highlight the search term in channel name
      const channelItem = screen.getByTestId('channel-item-general')
      expect(channelItem.innerHTML).toContain('<mark class="bg-yellow-200 dark:bg-yellow-800">gen</mark>')
    })

    it('should show search results count', () => {
      const filteredChannels = [mockChannels[0]] // Only one result
      mockUseAppStore.mockReturnValue({
        channels: mockChannels,
        activeChannelId: 'general',
        searchQuery: 'general',
        sidebarOpen: true,
        setActiveChannel: mockSetActiveChannel,
        setSearchQuery: mockSetSearchQuery,
        toggleSidebar: mockToggleSidebar,
        getFilteredChannels: vi.fn().mockReturnValue(filteredChannels),
        // Add other required store properties
        messages: {},
        theme: 'light',
        isLoading: false,
        error: null,
        addMessage: vi.fn(),
        toggleTheme: vi.fn(),
        clearError: vi.fn(),
        getChannelMessages: vi.fn()
      } as any)

      render(<Sidebar />)
      
      expect(screen.getByTestId('search-results-count')).toBeInTheDocument()
      expect(screen.getByText('1 result')).toBeInTheDocument()
    })

    it('should show plural results count', () => {
      mockUseAppStore.mockReturnValue({
        channels: mockChannels,
        activeChannelId: 'general',
        searchQuery: 'ch',
        sidebarOpen: true,
        setActiveChannel: mockSetActiveChannel,
        setSearchQuery: mockSetSearchQuery,
        toggleSidebar: mockToggleSidebar,
        getFilteredChannels: vi.fn().mockReturnValue(mockChannels), // All channels match
        // Add other required store properties
        messages: {},
        theme: 'light',
        isLoading: false,
        error: null,
        addMessage: vi.fn(),
        toggleTheme: vi.fn(),
        clearError: vi.fn(),
        getChannelMessages: vi.fn()
      } as any)

      render(<Sidebar />)
      
      expect(screen.getByText('3 results')).toBeInTheDocument()
    })

    it('should navigate search results with arrow keys', async () => {
      const user = userEvent.setup()
      render(<Sidebar />)
      
      const searchInput = screen.getByPlaceholderText('Search channels...')
      
      // Focus search input
      searchInput.focus()
      
      // Press arrow down to navigate results
      await user.keyboard('{ArrowDown}')
      
      // First channel should be highlighted/focused
      const firstChannel = screen.getByTestId('channel-item-general')
      expect(firstChannel).toHaveFocus()
    })

    it('should select channel with Enter key when navigating', async () => {
      const user = userEvent.setup()
      render(<Sidebar />)
      
      const searchInput = screen.getByPlaceholderText('Search channels...')
      searchInput.focus()
      
      // Navigate to first result and press Enter
      await user.keyboard('{ArrowDown}{Enter}')
      
      expect(mockSetActiveChannel).toHaveBeenCalledWith('general')
    })

    it('should show keyboard shortcuts hint', () => {
      render(<Sidebar />)
      
      expect(screen.getByTestId('search-shortcuts-hint')).toBeInTheDocument()
      expect(screen.getByText(/Ctrl\+K to focus, Esc to clear/)).toBeInTheDocument()
    })
  })
})