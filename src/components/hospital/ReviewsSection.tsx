'use client'

import { useState } from 'react'
import RatingWidget from './RatingWidget'

interface Review {
  id: string
  rating: number
  text: string | null
  created_at: string
}

interface ReviewsSectionProps {
  hospitalId: string
  initialReviews: Review[]
  reviewCount: number
}

export default function ReviewsSection({
  hospitalId,
  initialReviews,
  reviewCount,
}: ReviewsSectionProps) {
  const [submitted, setSubmitted] = useState(false)

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
      <h2 className="text-base font-bold text-brand-900 mb-6">
        Reviews
        {reviewCount > 0 && (
          <span className="ml-2 text-gray-400 font-normal">
            ({reviewCount})
          </span>
        )}
      </h2>

      {initialReviews.length > 0 ? (
        <div className="space-y-4 mb-8">
          {initialReviews.map(review => (
            <div key={review.id}
                 className="border-b border-gray-50 pb-4 last:border-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 bg-brand-100 rounded-full flex
                                items-center justify-center text-xs
                                font-bold text-brand-700">
                  U
                </div>
                <div className="flex">
                  {[1,2,3,4,5].map(star => (
                    <svg key={star}
                         className={`w-3 h-3 ${
                           star <= review.rating
                             ? 'text-amber-400 fill-amber-400'
                             : 'text-gray-200 fill-gray-200'
                         }`}
                         viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07
                               3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24
                               .588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07
                               3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1
                               1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197
                               -1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98
                               8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0
                               00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(review.created_at).toLocaleDateString('en-NG', {
                    year: 'numeric', month: 'short', day: 'numeric',
                  })}
                </span>
              </div>
              {review.text && (
                <p className="text-sm text-gray-600 ml-9">{review.text}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 mb-6">
          <p className="text-gray-400 text-sm">No reviews yet. Be the first!</p>
        </div>
      )}

      {submitted ? (
        <div className="border-t border-gray-50 pt-6 text-center">
          <div className="w-12 h-12 bg-brand-50 rounded-full flex
                          items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-brand-700" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round"
                    strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-brand-900 mb-1">
            Review submitted!
          </p>
          <p className="text-xs text-gray-400">
            Pending moderation — will appear shortly.
          </p>
        </div>
      ) : (
        <div className="border-t border-gray-50 pt-6">
          <h3 className="text-sm font-bold text-brand-900 mb-4">
            Write a review
          </h3>
          <RatingWidget
            hospitalId={hospitalId}
            onSubmitted={() => setSubmitted(true)}
          />
        </div>
      )}
    </div>
  )
}
