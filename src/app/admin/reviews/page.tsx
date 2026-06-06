import AdminSidebar from '@/components/admin/AdminSidebar'
import ReviewRow from '@/components/admin/ReviewRow'
import { createAdminClient } from '@/lib/supabase/admin'

export type ReviewWithHospital = {
  id: string
  rating: number
  text: string | null
  status: 'pending' | 'approved' | 'hidden'
  created_at: string
  hospitals: {
    name: string
  } | null
}

async function getReviews(): Promise<ReviewWithHospital[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('reviews')
    .select('*, hospitals(name)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch reviews:', error)
    return []
  }

  return (data ?? []) as ReviewWithHospital[]
}

export default async function AdminReviewsPage() {
  const reviews = await getReviews()

  const grouped = reviews.reduce(
    (acc, review) => {
      acc[review.status].push(review)
      return acc
    },
    {
      pending:  [] as ReviewWithHospital[],
      approved: [] as ReviewWithHospital[],
      hidden:   [] as ReviewWithHospital[],
    }
  )

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-brand-900 dark:text-white">
            Reviews
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {grouped.pending.length} pending ·{' '}
            {grouped.approved.length} approved ·{' '}
            {grouped.hidden.length} hidden
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-900 rounded-2xl
                          border border-gray-100 dark:border-gray-800
                          p-5 shadow-sm">
            <p className="text-xs text-gray-400 uppercase tracking-wider">
              Pending
            </p>
            <p className="text-2xl font-bold text-amber-600 mt-1">
              {grouped.pending.length}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl
                          border border-gray-100 dark:border-gray-800
                          p-5 shadow-sm">
            <p className="text-xs text-gray-400 uppercase tracking-wider">
              Approved
            </p>
            <p className="text-2xl font-bold text-brand-700 mt-1">
              {grouped.approved.length}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl
                          border border-gray-100 dark:border-gray-800
                          p-5 shadow-sm">
            <p className="text-xs text-gray-400 uppercase tracking-wider">
              Hidden
            </p>
            <p className="text-2xl font-bold text-gray-500 mt-1">
              {grouped.hidden.length}
            </p>
          </div>
        </div>

        {/* Pending */}
        {grouped.pending.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-semibold text-gray-500 uppercase
                           tracking-wider mb-3">
              Pending ({grouped.pending.length})
            </h2>
            <div className="space-y-3">
              {grouped.pending.map(review => (
                <ReviewRow key={review.id} review={review} />
              ))}
            </div>
          </section>
        )}

        {/* Approved */}
        {grouped.approved.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-semibold text-gray-500 uppercase
                           tracking-wider mb-3">
              Approved ({grouped.approved.length})
            </h2>
            <div className="space-y-3">
              {grouped.approved.map(review => (
                <ReviewRow key={review.id} review={review} />
              ))}
            </div>
          </section>
        )}

        {/* Hidden */}
        {grouped.hidden.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase
                           tracking-wider mb-3">
              Hidden ({grouped.hidden.length})
            </h2>
            <div className="space-y-3">
              {grouped.hidden.map(review => (
                <ReviewRow key={review.id} review={review} />
              ))}
            </div>
          </section>
        )}

        {reviews.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-sm">No reviews yet.</p>
          </div>
        )}
      </main>
    </div>
  )
}