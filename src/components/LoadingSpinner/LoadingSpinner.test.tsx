import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import LoadingSpinner from './LoadingSpinner'

describe('LoadingSpinner Component', () => {
  it('should render loading spinner', () => {
    render(<LoadingSpinner />)

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('should render custom message when provided', () => {
    render(<LoadingSpinner message="Loading channels..." />)

    expect(screen.getByText('Loading channels...')).toBeInTheDocument()
  })

  it('should have proper accessibility attributes', () => {
    render(<LoadingSpinner />)

    const spinner = screen.getByTestId('loading-spinner')
    expect(spinner).toHaveAttribute('role', 'status')
    expect(spinner).toHaveAttribute('aria-live', 'polite')
  })

  it('should have spinning animation class', () => {
    render(<LoadingSpinner />)

    const spinnerIcon = screen.getByTestId('loading-spinner').querySelector('svg')
    expect(spinnerIcon).toHaveClass('animate-spin')
  })

  it('should be centered by default', () => {
    render(<LoadingSpinner />)

    const container = screen.getByTestId('loading-spinner')
    expect(container).toHaveClass('flex', 'items-center', 'justify-center')
  })
})