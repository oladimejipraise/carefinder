'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface RatingWidgetProps {
  hospitalId: string
  onSubmitted: () => void
}

export default function RatingWidget({
  hospitalId,
  onSubmitted,
}: RatingWidgetProps) {
  const [rating, setRating]   = useState(0)
  const [hovered, setHovered] = useState(0)
  const [text, setText]       = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  async function handleSubmit() {
    if (rating === 0) {
      setError('Please select a star rating first.')
      return
    }
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError('You need to be signed in to leave a review.')
        setLoading(false)
        return
      }

      const { error: insertError } = await supabase
        .from('reviews')
        .insert({
          hospital_id: hospitalId,
          user_id:     user.id,
          rating,
          text:        text.trim() || null,
          status:      'pending',
        })

      if (insertError) {
        if (insertError.code === '23505') {
          setError('You have already reviewed this hospital.')
        } else {
          setError(insertError.message)
        }
        return
      }

      onSubmitted()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const labels = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent']

  return (
    <div className="space-y-4">

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-100
                        dark:border-red-800 rounded-xl px-4 py-3 text-sm
                        text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Stars */}
      <div>
        <p className="text-xs font-semibold text-gray-500
                      dark:text-gray-400 mb-3">
          Your rating
        </p>
        <div className="flex items-center gap-2">
          {[1,2,3,4,5].map(star => (
            <button
              key={star}
              type="button"
              onClick={() => {
                setRating(star)
                setError(null)
              }}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="p-1 transition-transform hover:scale-125
                         active:scale-110"
            >
              <svg
                className={`w-8 h-8 transition-colors ${
                  star <= (hovered || rating)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-gray-300 fill-gray-300 dark:text-gray-600 dark:fill-gray-600'
                }`}
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07
                         3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24
                         .588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07
                         3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1
                         1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197
                         -1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118
                         L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1
                         1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}

          {(hovered || rating) > 0 && (
            <span className="text-sm font-medium text-amber-500 ml-1">
              {labels[hovered || rating]}
            </span>
          )}
        </div>
      </div>

      {/* Review text */}
      <div>
        <label className="block text-xs font-semibold text-gray-500
                          dark:text-gray-400 mb-1.5">
          Review (optional)
        </label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={3}
          maxLength={1000}
          placeholder="Share your experience with this hospital..."
          className="w-full border border-gray-200 dark:border-gray-700
                     dark:bg-gray-800 dark:text-white rounded-xl px-3
                     py-2.5 text-sm focus:outline-none focus:ring-2
                     focus:ring-brand-700 focus:border-transparent
                     placeholder:text-gray-300 dark:placeholder:text-gray-600
                     resize-none"
        />
        <p className="text-xs text-gray-300 dark:text-gray-600
                      text-right mt-1">
          {text.length}/1000
        </p>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading || rating === 0}
        className="w-full bg-brand-700 text-white font-semibold py-3
                   rounded-xl hover:bg-brand-800 transition-colors
                   text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Submitting...' : 'Submit review'}
      </button>

      <p className="text-xs text-gray-400 dark:text-gray-600 text-center">
        Reviews are moderated before appearing publicly.
      </p>
    </div>
  )
}