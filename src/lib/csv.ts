import Papa from 'papaparse'
import type { Hospital, ExportColumn } from '@/types'

const COLUMN_LABELS: Record<ExportColumn, string> = {
  name:       'Hospital Name',
  address:    'Address',
  city:       'City',
  lga:        'LGA',
  phone:      'Phone',
  email:      'Email',
  specialties:'Specialties',
  ownership:  'Ownership',
  rating_avg: 'Rating',
}

function formatField(hospital: Hospital, col: ExportColumn): string {
  switch (col) {
    case 'specialties': return hospital.specialties.join(', ')
    case 'rating_avg':  return hospital.rating_avg != null
                          ? String(hospital.rating_avg) : ''
    default:            return String(hospital[col] ?? '')
  }
}

export function exportHospitalsCSV({
  hospitals,
  columns,
  searchContext,
}: {
  hospitals: Hospital[]
  columns: ExportColumn[]
  searchContext?: string
}): void {
  const headers = columns.map(c => COLUMN_LABELS[c])
  const rows = hospitals.map(h => columns.map(col => formatField(h, col)))

  const csv = Papa.unparse({ fields: headers, data: rows })

  const date = new Date().toISOString().split('T')[0]
  const context = searchContext
    ? `-${searchContext.toLowerCase().replace(/\s+/g, '-')}`
    : ''
  const filename = `hospitals${context}-${date}.csv`

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}