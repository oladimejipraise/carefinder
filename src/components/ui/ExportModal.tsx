'use client'

import { useState, useEffect } from 'react'
import type { ExportColumn, Hospital } from '@/types'
import { ALL_EXPORT_COLUMNS } from '@/types'
import { exportHospitalsCSV } from '@/lib/csv'

interface ExportModalProps {
  hospitals: Hospital[]
  searchContext?: string
  onClose: () => void
}

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

export default function ExportModal({
  hospitals,
  searchContext,
  onClose,
}: ExportModalProps) {
  const [selected, setSelected] = useState<ExportColumn[]>([
    'name', 'address', 'phone', 'specialties', 'ownership',
  ])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = 'auto' }
  }, [])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  function toggle(col: ExportColumn) {
    setSelected(prev =>
      prev.includes(col)
        ? prev.filter(c => c !== col)
        : [...prev, col]
    )
  }

  function selectAll() { setSelected([...ALL_EXPORT_COLUMNS]) }
  function clearAll()  { setSelected([]) }

  function handleExport() {
    if (selected.length === 0) return
    exportHospitalsCSV({ hospitals, columns: selected, searchContext })
    onClose()
  }

  const fileName = `carefinder-${
    searchContext?.toLowerCase().replace(/\s+/g, '-') || 'hospitals'
  }-${new Date().toISOString().split('T')[0]}.csv`

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50
                 flex items-center justify-center p-4"
    >
      <div
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl
                   w-full max-w-md"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6
                        border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="font-bold text-brand-900 dark:text-white
                           text-lg">
              Export CSV
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {hospitals.length} hospitals · select columns to include
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 flex items-center justify-center
                       rounded-lg hover:bg-gray-100
                       dark:hover:bg-gray-800 transition-colors
                       text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round"
                    strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-gray-500
                          dark:text-gray-400 uppercase tracking-wider">
              Columns
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={selectAll}
                className="text-xs font-medium text-brand-700
                           hover:text-brand-800 transition-colors"
              >
                Select all
              </button>
              <button
                onClick={clearAll}
                className="text-xs font-medium text-gray-400
                           hover:text-gray-600 transition-colors"
              >
                Clear all
              </button>
            </div>
          </div>

          {/* Column grid */}
          <div className="grid grid-cols-2 gap-2">
            {ALL_EXPORT_COLUMNS.map(col => {
              const isSelected = selected.includes(col)
              return (
                <label
                  key={col}
                  className={`flex items-center gap-2.5 p-3 rounded-xl
                              border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-brand-200 bg-brand-50 dark:bg-brand-900/20 dark:border-brand-700'
                      : 'border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggle(col)}
                    className="accent-brand-700 w-3.5 h-3.5"
                  />
                  <span className={`text-xs font-medium ${
                    isSelected
                      ? 'text-brand-700 dark:text-brand-400'
                      : 'text-gray-600 dark:text-gray-300'
                  }`}>
                    {COLUMN_LABELS[col]}
                  </span>
                </label>
              )
            })}
          </div>

          {/* File preview */}
          <div className="mt-5 rounded-xl border border-dashed
                          border-gray-200 dark:border-gray-700
                          bg-gray-50 dark:bg-gray-800 p-3">
            <p className="text-[11px] text-gray-400 mb-1">File name</p>
            <p className="text-xs font-medium text-gray-700
                          dark:text-gray-300 truncate">
              {fileName}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6
                        border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={onClose}
            className="text-sm text-gray-400 hover:text-gray-600
                       transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={selected.length === 0}
            className="flex items-center gap-2 bg-brand-700 text-white
                       font-semibold px-5 py-2.5 rounded-xl
                       hover:bg-brand-800 transition-colors text-sm
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4
                       4m0 0l-4-4m4 4V4" />
            </svg>
            Download CSV
          </button>
        </div>
      </div>
    </div>
  )
}