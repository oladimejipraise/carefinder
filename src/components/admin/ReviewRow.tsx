import { revalidatePath } from 'next/cache'
import type { ReviewWithHospital } from '@/app/admin/reviews/page'

interface ReviewRowProps {
  review: ReviewWithHospital
}

export default function ReviewRow({ review }: ReviewRowProps) {

  async function updateStatus(status: 'approved' | 'hidden') {
    'use server'
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('reviews')
      .update({ status })
      .eq('id', review.id)

    if (error) {
      console.error('Failed to update review:', error)
      return
    }

    revalidatePath('/admin/reviews')
    revalidatePath('/search')
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100
                    dark:border-gray-800 rounded-2xl p-5 shadow-sm
                    flex items-start justify-between gap-4">

      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex">
            {[1,2,3,4,5].map(star => (
              <svg key={star}
                   className={`w-3.5 h-3.5 ${
                     star <= review.rating
                       ? 'text-amber-400 fill-amber-400'
                       : 'text-gray-200 fill-gray-200 dark:text-gray-600 dark:fill-gray-600'
                   }`}
                   viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07
                         3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24
                         .588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07
                         3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1
                         1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197
                         -1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118
                         L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1
                         1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>

          <span className="text-xs font-medium text-brand-900
                           dark:text-white">
            {review.hospitals?.name ?? 'Unknown hospital'}
          </span>

          <span className="text-xs text-gray-400">
            {new Date(review.created_at).toLocaleDateString('en-NG', {
              year:  'numeric',
              month: 'short',
              day:   'numeric',
            })}
          </span>
        </div>

        {review.text && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {review.text}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Status badge */}
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
          review.status === 'approved'
            ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400'
            : review.status === 'pending'
              ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
              : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
        }`}>
          {review.status}
        </span>

        {/* Approve button */}
        {review.status !== 'approved' && (
          <form action={updateStatus.bind(null, 'approved')}>
            <button
              type="submit"
              className="px-3 py-1 rounded-full bg-brand-50
                         dark:bg-brand-900/30 text-brand-700
                         dark:text-brand-400 text-xs font-semibold
                         hover:bg-brand-100 dark:hover:bg-brand-900/50
                         transition-colors"
            >
              Approve
            </button>
          </form>
        )}

        {/* Hide button */}
        {review.status !== 'hidden' && (
          <form action={updateStatus.bind(null, 'hidden')}>
            <button
              type="submit"
              className="px-3 py-1 rounded-full bg-red-50
                         dark:bg-red-900/20 text-red-600
                         dark:text-red-400 text-xs font-semibold
                         hover:bg-red-100 dark:hover:bg-red-900/30
                         transition-colors"
            >
              Hide
            </button>
          </form>
        )}
      </div>
    </div>
  )
}