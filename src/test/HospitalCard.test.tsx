import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import HospitalCard from '@/components/hospital/HospitalCard'
import type { Hospital } from '@/types'

const mockHospital: Hospital = {
  id:             'h1',
  name:           'Lagos General Hospital',
  city:           'Lagos',
  lga:            'Lagos Island',
  address:        '1 Marina Road',
  phone:          '+2348012345678',
  email:          null,
  specialties:    ['emergency', 'maternity'],
  ownership:      'public',
  description_md: null,
  visiting_hours: null,
  rating_avg:     4.2,
  review_count:   12,
  lat: 6.5, lng: 3.4, image_url: null, created_at:     '2025-01-01T00:00:00Z',
}

describe('HospitalCard', () => {
  it('renders hospital name', () => {
    render(<HospitalCard hospital={mockHospital} />)
    expect(screen.getByText('Lagos General Hospital')).toBeInTheDocument()
  })

  it('renders location', () => {
    render(<HospitalCard hospital={mockHospital} />)
    expect(screen.getByText(/Lagos Island, Lagos/)).toBeInTheDocument()
  })

  it('renders specialties', () => {
    render(<HospitalCard hospital={mockHospital} />)
    expect(screen.getByText('emergency')).toBeInTheDocument()
    expect(screen.getByText('maternity')).toBeInTheDocument()
  })

  it('renders rating when provided', () => {
    render(<HospitalCard hospital={mockHospital} />)
    expect(screen.getByText('4.2')).toBeInTheDocument()
    expect(screen.getByText('(12)')).toBeInTheDocument()
  })

  it('renders no reviews text when rating is null', () => {
    render(<HospitalCard hospital={{ ...mockHospital, rating_avg: null }} />)
    expect(screen.getByText(/No ratings yet/i)).toBeInTheDocument()
  })

  it('renders distance when provided', () => {
    render(<HospitalCard hospital={mockHospital} distance={2.5} />)
    expect(screen.getByText(/2\.5 km/)).toBeInTheDocument()
  })

  it('renders public ownership badge', () => {
    render(<HospitalCard hospital={mockHospital} />)
    expect(screen.getByText('Public')).toBeInTheDocument()
  })

  it('renders private ownership badge', () => {
    render(<HospitalCard hospital={{ ...mockHospital, ownership: 'private' }} />)
    expect(screen.getByText('Private')).toBeInTheDocument()
  })

  it('links to the correct hospital detail page', () => {
    render(<HospitalCard hospital={mockHospital} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/hospitals/h1')
  })
})