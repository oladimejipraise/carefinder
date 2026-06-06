import { describe, it, expect } from 'vitest'
import { HospitalFormSchema, ReviewFormSchema } from '@/lib/schemas'

describe('HospitalFormSchema', () => {
  const valid = {
    name:       'Lagos General Hospital',
    address:    '1 Marina Road, Lagos Island',
    city:       'Lagos',
    lga:        'Lagos Island',
    phone:      '+23480123456789',
    email:      'info@lgh.ng',
    specialties: ['emergency'],
    ownership:  'public' as const,
    lat:        6.5244,
    lng:        3.3792,
  }

  it('accepts a valid hospital form', () => {
    expect(HospitalFormSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects a non-Nigerian phone number', () => {
    const result = HospitalFormSchema.safeParse({
      ...valid,
      phone: '07012345678',
    })
    expect(result.success).toBe(false)
  })

  it('rejects phone without +234 prefix', () => {
    const result = HospitalFormSchema.safeParse({
      ...valid,
      phone: '08012345678',
    })
    expect(result.success).toBe(false)
  })

  it('rejects latitude outside Nigeria bounds', () => {
    const result = HospitalFormSchema.safeParse({
      ...valid,
      lat: 51.5074,  // London
    })
    expect(result.success).toBe(false)
  })

  it('rejects longitude outside Nigeria bounds', () => {
    const result = HospitalFormSchema.safeParse({
      ...valid,
      lng: -0.1278,  // London
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty specialties array', () => {
    const result = HospitalFormSchema.safeParse({
      ...valid,
      specialties: [],
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing required name', () => {
    const result = HospitalFormSchema.safeParse({
      ...valid,
      name: '',
    })
    expect(result.success).toBe(false)
  })
})

describe('ReviewFormSchema', () => {
  it('accepts valid rating and text', () => {
    const result = ReviewFormSchema.safeParse({ rating: 4, text: 'Great!' })
    expect(result.success).toBe(true)
  })

  it('accepts rating without text', () => {
    const result = ReviewFormSchema.safeParse({ rating: 3 })
    expect(result.success).toBe(true)
  })

  it('rejects rating below 1', () => {
    const result = ReviewFormSchema.safeParse({ rating: 0 })
    expect(result.success).toBe(false)
  })

  it('rejects rating above 5', () => {
    const result = ReviewFormSchema.safeParse({ rating: 6 })
    expect(result.success).toBe(false)
  })

  it('rejects text over 1000 characters', () => {
    const result = ReviewFormSchema.safeParse({
      rating: 4,
      text:   'a'.repeat(1001),
    })
    expect(result.success).toBe(false)
  })
})