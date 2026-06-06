import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import RatingWidget from '@/components/hospital/RatingWidget'

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'user-1' } },
      }),
    },
    from: () => ({
      insert: vi.fn().mockReturnValue({
        error: null,
      }),
    }),
  }),
}))

describe('RatingWidget', () => {
  it('renders 5 star buttons', () => {
    render(
      <RatingWidget hospitalId="h1" onSubmitted={vi.fn()} />
    )
    const buttons = screen.getAllByRole('button').filter(
      b => b.querySelector('svg')
    )
    expect(buttons.length).toBeGreaterThanOrEqual(5)
  })

  it('shows rating label when star is selected', () => {
    render(
      <RatingWidget hospitalId="h1" onSubmitted={vi.fn()} />
    )
    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[4]) // click 5th star
    expect(screen.getByText('Excellent')).toBeInTheDocument()
  })

  it('submit button is disabled when no rating selected', () => {
    render(
      <RatingWidget hospitalId="h1" onSubmitted={vi.fn()} />
    )
    const submitBtn = screen.getByRole('button', {
      name: /submit review/i,
    })
    expect(submitBtn).toBeDisabled()
  })

  it('submit button is enabled after selecting a rating', () => {
    render(
      <RatingWidget hospitalId="h1" onSubmitted={vi.fn()} />
    )
    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[2]) // click 3rd star
    const submitBtn = screen.getByRole('button', {
      name: /submit review/i,
    })
    expect(submitBtn).not.toBeDisabled()
  })
})