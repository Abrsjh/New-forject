import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Layout from './Layout'
import { useAppStore } from '../../stores/useAppStore'

// Mock the store
vi.mock('../../stores/useAppStore')
const mockUseAppStore = vi.mocked(useAppStore)

// Mock child components
vi.mock('../Sidebar/Sidebar', () => ({
  default: () => <div data-testid="sidebar">Sidebar</div>
}))

vi.mock('../MessageView/MessageView', () => ({
  default: () => <div data-testid="message-view">MessageView</div>
}))

vi.mock('../ThemeToggle/ThemeToggle', () => ({
  default: () => <div data-testid="theme-toggle">ThemeToggle</div>
}))

describe('Layout Component', () => {
  const mockStore = {
    sidebarOpen: true,
    toggleSidebar: vi.fn(),
    theme: 'light' as const
  }

  beforeEach(() => {
    mockUseAppStore.mockReturnValue(mockStore as any)
    vi.clearAllMocks()
  })

  it('should render main layout structure', () => {
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    )

    expect(screen.getByTestId('app-layout')).toBeInTheDocument()
    expect(screen.getByTestId('sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('message-view')).toBeInTheDocument()
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument()
  })

  it('should apply correct CSS classes for two-column layout', () => {
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    )

    const layout = screen.getByTestId('app-layout')
    expect(layout).toHaveClass('flex', 'h-screen')
  })

  it('should show sidebar when sidebarOpen is true', () => {
    mockUseAppStore.mockReturnValue({
      ...mockStore,
      sidebarOpen: true
    } as any)

    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    )

    const sidebar = screen.getByTestId('sidebar')
    expect(sidebar).toBeVisible()
  })

  it('should hide sidebar on mobile when sidebarOpen is false', () => {
    mockUseAppStore.mockReturnValue({
      ...mockStore,
      sidebarOpen: false
    } as any)

    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    )

    const sidebarContainer = screen.getByTestId('sidebar').parentElement
    expect(sidebarContainer).toHaveClass('hidden', 'md:block')
  })

  it('should have proper semantic HTML structure', () => {
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    )

    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('complementary')).toBeInTheDocument() // sidebar
  })

  it('should be responsive with proper breakpoint classes', () => {
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    )

    const layout = screen.getByTestId('app-layout')
    expect(layout).toHaveClass('flex-col', 'md:flex-row')
  })

  it('should have proper ARIA labels for accessibility', () => {
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    )

    expect(screen.getByLabelText('Main content area')).toBeInTheDocument()
    expect(screen.getByLabelText('Channel sidebar')).toBeInTheDocument()
  })
})