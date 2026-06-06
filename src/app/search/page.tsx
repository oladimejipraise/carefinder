'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import Navbar from '@/components/ui/Navbar'
import FilterPanel from '@/components/search/FilterPanel'
import HospitalCard from '@/components/hospital/HospitalCard'
import ExportModal from '@/components/ui/ExportModal'
import EmailShareModal from '@/components/ui/EmailShareModal'
import Toast from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'
import { copyToClipboard, buildShareUrl } from '@/lib/share'
import type { FilterState, Hospital } from '@/types'
import { DEFAULT_FILTERS } from '@/types'

const ITEMS_PER_PAGE = 12

const HospitalMap = dynamic(
  () => import('@/components/map/HospitalMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-brand-50 rounded-2xl
                      flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-brand-700
                          border-t-transparent rounded-full
                          animate-spin mx-auto mb-2" />
          <p className="text-xs text-brand-700 font-medium">
            Loading map...
          </p>
        </div>
      </div>
    ),
  }
)

export default function SearchPage() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  const [hospitals, setHospitals]           = useState<Hospital[]>([])
  const [loading, setLoading]               = useState(false)
  const [searched, setSearched]             = useState(false)
  const [showExport, setShowExport]         = useState(false)
  const [showEmailShare, setShowEmailShare] = useState(false)
  const [showMap, setShowMap]               = useState(false)
  const [selectedId, setSelectedId]         = useState<string | null>(null)
  const [currentPage, setCurrentPage]       = useState(1)
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)

  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTERS,
    query:      searchParams.get('q') ?? '',
    specialties: searchParams.get('specialty')
      ? [searchParams.get('specialty') as import('@/types').Specialty]
      : [],
  })

  const totalPages       = Math.ceil(hospitals.length / ITEMS_PER_PAGE)
  const paginatedHospitals = hospitals.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const runSearch = useCallback(async (f: FilterState) => {
    setLoading(true)
    setSearched(true)
    setCurrentPage(1)

    try {
      const supabase = createClient()
      let results: Hospital[] = []

      if (f.radius && f.lat !== null && f.lng !== null) {
        const { data, error } = await supabase.rpc(
          'hospitals_within_radius',
          { lat: f.lat, lng: f.lng, radius_m: f.radius * 1000 }
        )
        if (error) throw error
        results = (data ?? []) as Hospital[]

        if (f.query) {
          const q = f.query.toLowerCase()
          results = results.filter(h =>
            h.name.toLowerCase().includes(q) ||
            h.city.toLowerCase().includes(q) ||
            h.lga.toLowerCase().includes(q)
          )
        }
        if (f.specialties.length > 0) {
          results = results.filter(h =>
            f.specialties.every(s => h.specialties.includes(s))
          )
        }
        if (f.ownership) {
          results = results.filter(h => h.ownership === f.ownership)
        }

      } else {
        let q = supabase.from('hospitals').select('*')

        if (f.query) {
          q = q.or(
            `name.ilike.%${f.query}%,city.ilike.%${f.query}%,lga.ilike.%${f.query}%`
          )
        }
        if (f.specialties.length > 0) {
          q = q.contains('specialties', f.specialties)
        }
        if (f.ownership) {
          q = q.eq('ownership', f.ownership)
        }

        q = q.order('name')

        const { data, error } = await q
        if (error) throw error
        results = (data ?? []) as Hospital[]
      }

      setHospitals(results)

      const params = new URLSearchParams()
      if (f.query) params.set('q', f.query)
      if (f.specialties.length) params.set('specialty', f.specialties.join(','))
      if (f.ownership) params.set('ownership', f.ownership)
      if (f.radius) params.set('radius', String(f.radius))
      if (f.lat !== null) params.set('lat', String(f.lat))
      if (f.lng !== null) params.set('lng', String(f.lng))
      router.replace(`/search?${params.toString()}`, { scroll: false })

    } catch (err) {
      const msg = err instanceof Error ? err.message : JSON.stringify(err)
      console.error('Search error:', msg)
      setToast({ message: 'Search failed. Please try again.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    runSearch(filters)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleFilterChange(next: FilterState) {
    setFilters(next)
  }

  function handleSearchButton(overrideFilters?: FilterState) {
    runSearch(overrideFilters ?? filters)
  }

  async function handleShare() {
    const params = new URLSearchParams()
    if (filters.query) params.set('q', filters.query)
    if (filters.specialties.length) {
      params.set('specialty', filters.specialties.join(','))
    }
    if (filters.ownership) params.set('ownership', filters.ownership)
    const url = buildShareUrl(params)
    const success = await copyToClipboard(url)
    setToast(
      success
        ? { message: 'Link copied to clipboard!', type: 'success' }
        : { message: 'Failed to copy link', type: 'error' }
    )
  }

  function handleMarkerClick(id: string) {
    setSelectedId(id)
    const el = document.getElementById(`hospital-card-${id}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  function handlePageChange(page: number) {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const ResultsHeader = (
    <div className="flex items-center justify-between mb-4">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
        {loading ? (
          'Searching...'
        ) : (
          <>
            <span className="font-bold text-gray-900 dark:text-white">
              {hospitals.length}
            </span>
            {` hospital${hospitals.length !== 1 ? 's' : ''} found`}
            {filters.radius && filters.lat !== null && (
              <span className="text-gray-400 font-normal ml-1">
                within {filters.radius} km
              </span>
            )}
          </>
        )}
      </p>

      <div className="flex items-center gap-2">
        {searched && hospitals.length > 0 && !showMap && (
          <select className="text-xs border border-gray-200
                             dark:border-gray-700 dark:bg-gray-800
                             dark:text-white rounded-lg px-3 py-1.5
                             text-gray-600 bg-white focus:outline-none
                             focus:ring-2 focus:ring-brand-700">
            <option>Sort by: Nearest</option>
            <option>Sort by: Rating</option>
            <option>Sort by: Name</option>
          </select>
        )}

        <button
          onClick={() => setShowMap(v => !v)}
          className={`flex items-center gap-1.5 text-xs font-medium
                      px-3 py-1.5 rounded-lg border transition-colors ${
            showMap
              ? 'bg-brand-50 border-brand-200 text-brand-700'
              : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
               stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0
                     011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1
                     1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0
                     13V4m0 0L9 7" />
          </svg>
          {showMap ? 'Hide map' : 'Show map'}
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 border border-gray-200
                     dark:border-gray-700 text-gray-600 dark:text-gray-400
                     text-xs font-medium px-3 py-1.5 rounded-lg
                     hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
               stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114
                     -.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632
                     3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3
                     3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3
                     0 00-5.368-2.684z" />
          </svg>
          Copy link
        </button>

        {hospitals.length > 0 && (
          <button
            onClick={() => setShowEmailShare(true)}
            className="flex items-center gap-1.5 border border-gray-200
                       dark:border-gray-700 text-gray-600 dark:text-gray-400
                       text-xs font-medium px-3 py-1.5 rounded-lg
                       hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0
                       002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Email list
          </button>
        )}

        {hospitals.length > 0 && (
          <button
            onClick={() => setShowExport(true)}
            className="flex items-center gap-1.5 bg-brand-700 text-white
                       text-xs font-medium px-3 py-1.5 rounded-lg
                       hover:bg-brand-800 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0
                       0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
        )}
      </div>
    </div>
  )

  const Skeletons = (
    <div className={`grid gap-4 ${
      showMap ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
    }`}>
      {Array.from({ length: showMap ? 4 : 6 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-900 border
                                border-gray-100 dark:border-gray-800
                                rounded-2xl overflow-hidden animate-pulse">
          <div className="h-32 bg-gray-100 dark:bg-gray-800" />
          <div className="p-4 space-y-2">
            <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
            <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )

  const EmptyState = (
    <div className="text-center py-20">
      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full
                      flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-gray-300" fill="none"
             viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <p className="text-gray-400 text-sm font-medium">No hospitals found</p>
      <p className="text-gray-300 text-xs mt-1">
        Try a different search or clear your filters
      </p>
    </div>
  )

  const Pagination = (
    <div className="flex items-center justify-between mt-8 pt-6
                    border-t border-gray-200 dark:border-gray-700">
      <p className="text-xs text-gray-400">
        Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
        {Math.min(currentPage * ITEMS_PER_PAGE, hospitals.length)}
        {' '}of {hospitals.length} hospitals
      </p>

      <div className="flex items-center gap-1">
        {/* Previous */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-1 px-3 py-1.5 text-xs
                     font-medium rounded-lg border transition-colors
                     disabled:opacity-40 disabled:cursor-not-allowed
                     border-gray-200 dark:border-gray-700
                     text-gray-600 dark:text-gray-400
                     hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24"
               stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Prev
        </button>

        {/* Page numbers */}
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(page =>
            page === 1 ||
            page === totalPages ||
            Math.abs(page - currentPage) <= 1
          )
          .reduce((acc: (number | string)[], page, idx, arr) => {
            if (idx > 0 && (page as number) - (arr[idx - 1] as number) > 1) {
              acc.push('...')
            }
            acc.push(page)
            return acc
          }, [])
          .map((page, idx) =>
            page === '...' ? (
              <span key={`dots-${idx}`}
                    className="px-2 text-xs text-gray-400">
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => handlePageChange(page as number)}
                className={`w-8 h-8 text-xs font-medium rounded-lg
                            border transition-colors ${
                  currentPage === page
                    ? 'bg-brand-700 border-brand-700 text-white'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {page}
              </button>
            )
          )
        }

        {/* Next */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1 px-3 py-1.5 text-xs
                     font-medium rounded-lg border transition-colors
                     disabled:opacity-40 disabled:cursor-not-allowed
                     border-gray-200 dark:border-gray-700
                     text-gray-600 dark:text-gray-400
                     hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          Next
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24"
               stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F8FAF8] dark:bg-gray-950">
      <Navbar />

      {/* Mobile search */}
      <div className="md:hidden bg-white dark:bg-gray-900 border-b
                      border-gray-100 dark:border-gray-800 px-4 py-3">
        <input
          type="search"
          placeholder="Search hospitals, city or LGA..."
          value={filters.query}
          onChange={e => setFilters(f => ({ ...f, query: e.target.value }))}
          onKeyDown={e => { if (e.key === 'Enter') runSearch(filters) }}
          className="w-full border border-gray-200 dark:border-gray-700
                     dark:bg-gray-800 dark:text-white rounded-xl px-4
                     py-2.5 text-sm focus:outline-none focus:ring-2
                     focus:ring-brand-700 placeholder:text-gray-300"
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-6">

          {/* Sidebar */}
          <aside className="w-64 shrink-0">
            <div className="bg-white dark:bg-gray-900 border
                            border-gray-200/60 dark:border-gray-800
                            rounded-2xl shadow-sm p-5 sticky top-20
                            space-y-5">
              <div>
                <h2 className="font-semibold text-brand-900
                               dark:text-white text-sm mb-3">
                  Search Hospitals
                </h2>
                <input
                  type="search"
                  placeholder="Search by name, city, or LGA..."
                  value={filters.query}
                  onChange={e =>
                    setFilters(f => ({ ...f, query: e.target.value }))
                  }
                  onKeyDown={e => {
                    if (e.key === 'Enter') runSearch(filters)
                  }}
                  className="w-full border border-gray-200
                             dark:border-gray-700 dark:bg-gray-800
                             dark:text-white rounded-lg px-3 py-2 text-sm
                             focus:outline-none focus:ring-2
                             focus:ring-brand-700 focus:border-transparent
                             placeholder:text-gray-300"
                />
              </div>

              <FilterPanel
                filters={filters}
                onChange={handleFilterChange}
                onSearch={handleSearchButton}
              />
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 min-w-0">
            {ResultsHeader}

            {showMap ? (
              <div className="flex gap-4"
                   style={{ height: 'calc(100vh - 180px)' }}>
                <div className="w-80 shrink-0 overflow-y-auto space-y-3 pr-1">
                  {loading && Skeletons}
                  {!loading && searched && hospitals.length === 0 && EmptyState}
                  {!loading && hospitals.map(h => (
                    <div
                      key={h.id}
                      id={`hospital-card-${h.id}`}
                      onClick={() => setSelectedId(h.id)}
                      className={`rounded-2xl transition-all cursor-pointer ${
                        selectedId === h.id
                          ? 'ring-2 ring-brand-700 ring-offset-1'
                          : ''
                      }`}
                    >
                      <HospitalCard hospital={h} />
                    </div>
                  ))}
                </div>
                <div className="flex-1 min-w-0">
                  <HospitalMap
                    hospitals={hospitals}
                    selectedId={selectedId}
                    onMarkerClick={handleMarkerClick}
                  />
                </div>
              </div>
            ) : (
              <>
                {loading && Skeletons}

                {!loading && searched && hospitals.length === 0 && EmptyState}

                {!loading && !searched && (
                  <div className="text-center py-20">
                    <div className="w-16 h-16 bg-brand-50 rounded-full
                                    flex items-center justify-center
                                    mx-auto mb-4">
                      <svg className="w-8 h-8 text-brand-700" fill="none"
                           viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <p className="text-brand-900 dark:text-white text-sm
                                  font-medium">
                      Find a hospital
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      Search by name, city, or LGA to get started
                    </p>
                  </div>
                )}

                {!loading && hospitals.length > 0 && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2
                                    lg:grid-cols-3 gap-4">
                      {paginatedHospitals.map(h => (
                        <HospitalCard key={h.id} hospital={h} />
                      ))}
                    </div>
                    {totalPages > 1 && Pagination}
                  </>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {showExport && (
        <ExportModal
          hospitals={hospitals}
          searchContext={filters.query}
          onClose={() => setShowExport(false)}
        />
      )}

      {showEmailShare && (
        <EmailShareModal
          hospitals={hospitals}
          onClose={() => setShowEmailShare(false)}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}