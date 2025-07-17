import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import NotFound from './NotFound'

describe('NotFound Component', () => {
  it('should render 404 message', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    )

    expect(screen.getByTestId('not-found-page')).toBeInTheDocument()
    expect(screen.getByText('404')).toBeInTheDocument()
    expect(screen.getByText(/page not found/i)).toBeInTheDocument()
  })

  it('should render channel-specific 404 message', () => {
    render(
      <MemoryRouter>
        <NotFound type="channel" />
      </MemoryRouter>
    )

    expect(screen.getByText(/channel not found/i)).toBeInTheDocument()
  })

  it('should provide link back to general channel', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    )

    const link = screen.getByRole('link', { name: /go to general/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/channel/general')
  })

  it('should have proper semantic structure', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    )

    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('should be accessible with proper ARIA labels', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    )

    expect(screen.getByLabelText(/error page/i)).toBeInTheDocument()
  })
})