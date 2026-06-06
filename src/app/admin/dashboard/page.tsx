import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/admin/AdminSidebar'

async function getStats() {
  const supabase = await createClient()

  const [hospitals, reviews] = await Promise.all([
    supabase.from('hospitals').select('id', { count: 'exact', head: true }),
    supabase.from('reviews').select('id', { count: 'exact', head: true }),
  ])

  return {
    hospitalCount: hospitals.count ?? 0,
    reviewCount:   reviews.count ?? 0,
  }
}

async function getRecentHospitals() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('hospitals')
    .select('id, name, city, ownership, created_at')
    .order('created_at', { ascending: false })
    .limit(5)
  return data ?? []
}

export default async function AdminDashboardPage() {
  const [stats, recent] = await Promise.all([
    getStats(),
    getRecentHospitals(),
  ])

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-brand-900">
              Dashboard
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Manage hospital listings and reviews
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

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: 'Total Hospitals',
              value: stats.hospitalCount,
              change: '+12%',
              icon: '🏥',
            },
            {
              label: 'Total Reviews',
              value: stats.reviewCount,
              change: '+18%',
              icon: '⭐',
            },
            {
              label: 'Average Rating',
              value: '4.3',
              change: '+6%',
              icon: '📊',
            },
            {
              label: 'Cities Covered',
              value: '5',
              change: '+24%',
              icon: '📍',
            },
          ].map(stat => (
            <div key={stat.label}
                 className="bg-white border border-gray-100 rounded-2xl
                            p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xl">{stat.icon}</span>
                <span className="text-xs font-semibold text-brand-700
                                 bg-brand-50 px-2 py-0.5 rounded-full">
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-brand-900">
                {stat.value}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Recent hospitals table */}
        <div className="bg-white border border-gray-100 rounded-2xl
                        shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4
                          border-b border-gray-100">
            <h2 className="font-semibold text-brand-900">
              Recent Hospitals
            </h2>
            <Link
              href="/admin/hospitals"
              className="text-xs text-brand-700 font-medium
                         hover:text-brand-800 transition-colors"
            >
              View all
            </Link>
          </div>

          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50">
                {['Hospital Name', 'Location', 'Type',
                  'Date Added', 'Actions'].map(col => (
                  <th key={col}
                      className="px-6 py-3 text-left text-xs font-semibold
                                 text-gray-400 uppercase tracking-wider">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recent.map(h => (
                <tr key={h.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-brand-900">
                      {h.name}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">{h.city}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5
                                      py-0.5 rounded-full text-xs
                                      font-semibold ${
                      h.ownership === 'public'
                        ? 'bg-brand-50 text-brand-700'
                        : 'bg-purple-50 text-purple-700'
                    }`}>
                      {h.ownership}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">
                      {new Date(h.created_at).toLocaleDateString('en-NG', {
                        year:  'numeric',
                        month: 'short',
                        day:   'numeric',
                      })}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/hospitals/${h.id}/edit`}
                        className="text-xs text-brand-700 font-medium
                                   hover:text-brand-800 transition-colors"
                      >
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </main>
    </div>
  )
}