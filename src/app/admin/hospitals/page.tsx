import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/admin/AdminSidebar'
import DeleteHospitalButton from '@/components/admin/DeleteHospitalButton'
import OwnershipBadge from '@/components/ui/OwnershipBadge'

async function getHospitals() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('hospitals')
    .select('id, name, city, lga, ownership, rating_avg, review_count, created_at')
    .order('created_at', { ascending: false })
  return data ?? []
}

export default async function AdminHospitalsPage() {
  const hospitals = await getHospitals()

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-brand-900 dark:text-white">
              Hospitals
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {hospitals.length} total listings
            </p>
          </div>
          <Link
            href="/admin/hospitals/new"
            className="flex items-center gap-2 bg-brand-700 text-white
                       font-semibold px-4 py-2.5 rounded-xl
                       hover:bg-brand-800 transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round"
                    strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Add Hospital
          </Link>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100
                        dark:border-gray-800 rounded-2xl shadow-sm
                        overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                {['Hospital Name', 'Location', 'Type',
                  'Rating', 'Actions'].map(col => (
                  <th key={col}
                      className="px-6 py-3 text-left text-xs font-semibold
                                 text-gray-400 uppercase tracking-wider">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {hospitals.map(h => (
                <tr key={h.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800
                               transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium
                                     text-brand-900 dark:text-white">
                      {h.name}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500
                                     dark:text-gray-400">
                      {h.lga}, {h.city}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <OwnershipBadge ownership={h.ownership} variant="soft" />
                  </td>
                  <td className="px-6 py-4">
                    {h.rating_avg ? (
                      <span className="text-sm font-semibold text-amber-500">
                        ★ {Number(h.rating_avg).toFixed(1)}
                        <span className="text-gray-400 font-normal ml-1">
                          ({h.review_count})
                        </span>
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">
                        No reviews
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/hospitals/${h.id}`}
                        className="text-xs text-gray-500 font-medium
                                   hover:text-brand-700 transition-colors"
                        target="_blank"
                      >
                        View
                      </Link>
                      <Link
                        href={`/admin/hospitals/${h.id}/edit`}
                        className="text-xs text-brand-700 font-medium
                                   hover:text-brand-800 transition-colors"
                      >
                        Edit
                      </Link>
                      <DeleteHospitalButton id={h.id} name={h.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {hospitals.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-400 text-sm">No hospitals yet.</p>
              <Link
                href="/admin/hospitals/new"
                className="text-brand-700 text-sm font-medium
                           hover:text-brand-800 mt-2 inline-block"
              >
                Add your first hospital →
              </Link>
            </div>
          )}
        </div>

      </main>
    </div>
  )
}