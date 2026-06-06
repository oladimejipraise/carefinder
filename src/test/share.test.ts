import { describe, it, expect, vi, beforeEach } from 'vitest'
import { buildShareUrl, copyToClipboard } from '@/lib/share'

describe('buildShareUrl', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://carefinder.ng')
  })

  it('builds a URL with no params', () => {
    const url = buildShareUrl(new URLSearchParams())
    expect(url).toBe('https://carefinder.ng/search')
  })

  it('builds a URL with query param', () => {
    const params = new URLSearchParams({ q: 'Lagos' })
    const url = buildShareUrl(params)
    expect(url).toBe('https://carefinder.ng/search?q=Lagos')
  })

  it('builds a URL with multiple params', () => {
    const params = new URLSearchParams({
      q:         'Lagos',
      specialty: 'maternity',
      ownership: 'public',
    })
    const url = buildShareUrl(params)
    expect(url).toContain('q=Lagos')
    expect(url).toContain('specialty=maternity')
    expect(url).toContain('ownership=public')
  })

  it('round-trips filter params correctly', () => {
    const params = new URLSearchParams({
      q:      'Abuja',
      radius: '10',
      lat:    '9.0765',
      lng:    '7.3986',
    })
    const url = buildShareUrl(params)
    const parsed = new URL(url)
    expect(parsed.searchParams.get('q')).toBe('Abuja')
    expect(parsed.searchParams.get('radius')).toBe('10')
    expect(parsed.searchParams.get('lat')).toBe('9.0765')
  })
})

describe('copyToClipboard', () => {
  it('calls navigator.clipboard.writeText and returns true', async () => {
    const writeMock = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, {
      clipboard: { writeText: writeMock },
    })

    const result = await copyToClipboard('https://carefinder.ng/search')
    expect(writeMock).toHaveBeenCalledWith('https://carefinder.ng/search')
    expect(result).toBe(true)
  })

  it('returns false when clipboard API throws', async () => {

    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockRejectedValue(new Error('denied')),
      },
    })

    document.execCommand = vi.fn().mockReturnValue(false)

    const result = await copyToClipboard('https://carefinder.ng/search')
    expect(result).toBe(false)
  })
})