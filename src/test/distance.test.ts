import { describe, it, expect } from 'vitest'

function haversineKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

describe('haversineKm', () => {
  it('returns 0 for identical coordinates', () => {
    expect(haversineKm(6.5244, 3.3792, 6.5244, 3.3792)).toBeCloseTo(0, 5)
  })

  it('calculates Lagos to Abuja — result is over 400km', () => {
    // Lagos: 6.5244°N 3.3792°E  |  Abuja: 9.0765°N 7.3986°E
    const dist = haversineKm(6.5244, 3.3792, 9.0765, 7.3986)
    expect(dist).toBeGreaterThan(400)
    expect(dist).toBeLessThan(600)
  })

  it('is symmetric — A to B equals B to A', () => {
    const ab = haversineKm(6.5244, 3.3792, 9.0765, 7.3986)
    const ba = haversineKm(9.0765, 7.3986, 6.5244, 3.3792)
    expect(ab).toBeCloseTo(ba, 10)
  })

  it('nearby point is within 10km radius', () => {
    const lagsLat = 6.5244
    const lagsLng = 3.3792
    const nearbyLat = 6.5694
    const dist = haversineKm(lagsLat, lagsLng, nearbyLat, lagsLng)
    expect(dist).toBeLessThan(10)
  })
})