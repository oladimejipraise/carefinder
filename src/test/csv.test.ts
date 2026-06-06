import { describe, it, expect, vi, afterEach } from 'vitest'
import { exportHospitalsCSV } from '@/lib/csv'
import type { Hospital, ExportColumn } from '@/types'

const mockHospital: Hospital = {
  id:             'h1',
  name:           'Lagos General Hospital',
  city:           'Lagos',
  lga:            'Lagos Island',
  address:        '1 Marina Road',
  phone:          '+2348012345678',
  email:          'info@lgh.ng',
  specialties:    ['emergency', 'maternity'],
  ownership:      'public',
  description_md: '# About\nLagos General.',
  visiting_hours: '8am - 8pm',
  rating_avg:     4.2,
  review_count:   12,
  created_at:     '2025-01-01T00:00:00Z',
}

function mockBlob() {
  const captured: { parts: BlobPart[] }[] = []

  class FakeBlob {
    parts: BlobPart[]
    constructor(parts: BlobPart[]) {
      this.parts = parts
      captured.push({ parts })
    }
  }

  vi.stubGlobal('Blob', FakeBlob)
  return captured
}

describe('exportHospitalsCSV', () => {
  afterEach(() => vi.restoreAllMocks())

  it('triggers a file download', () => {
    const clickMock = vi.fn()
    vi.spyOn(document, 'createElement').mockReturnValueOnce(
      { href: '', download: '', click: clickMock } as unknown as HTMLAnchorElement
    )
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

    exportHospitalsCSV({
      hospitals: [mockHospital],
      columns:   ['name', 'phone'],
    })

    expect(clickMock).toHaveBeenCalledOnce()
  })

  it('only includes selected columns', () => {
    const captured = mockBlob()
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    vi.spyOn(document, 'createElement').mockReturnValue(
      { href: '', download: '', click: vi.fn() } as unknown as HTMLAnchorElement
    )

    const columns: ExportColumn[] = ['name', 'city']
    exportHospitalsCSV({ hospitals: [mockHospital], columns })

    const csv = captured[0]?.parts?.[0] as string
    expect(csv).toContain('Hospital Name')
    expect(csv).toContain('City')
    expect(csv).not.toContain('Phone')
  })

  it('formats specialties as comma-separated string', () => {
    const captured = mockBlob()
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    vi.spyOn(document, 'createElement').mockReturnValue(
      { href: '', download: '', click: vi.fn() } as unknown as HTMLAnchorElement
    )

    exportHospitalsCSV({ hospitals: [mockHospital], columns: ['specialties'] })

    const csv = captured[0]?.parts?.[0] as string
    expect(csv).toContain('emergency, maternity')
  })

  it('includes search context in filename', () => {
    let filename = ''
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    vi.spyOn(document, 'createElement').mockReturnValue({
      href: '',
      set download(v: string) { filename = v },
      click: vi.fn(),
    } as unknown as HTMLAnchorElement)

    exportHospitalsCSV({
      hospitals:     [mockHospital],
      columns:       ['name'],
      searchContext: 'Lagos',
    })

    expect(filename).toMatch(/hospitals-lagos-\d{4}-\d{2}-\d{2}\.csv/)
  })
})