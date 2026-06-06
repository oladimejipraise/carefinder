import Link from 'next/link'
import Image from 'next/image'
import type { Hospital } from '@/types'
import OwnershipBadge from '@/components/ui/OwnershipBadge'

interface HospitalCardProps {
  hospital: Hospital
  distance?: number | null
}

const SPECIALTY_COLORS: Record<string, string> = {
  emergency:    'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
  maternity:    'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100 dark:bg-fuchsia-900/20 dark:text-fuchsia-400 dark:border-fuchsia-800',
  dental:       'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
  pediatric:    'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800',
  surgical:     'bg-brand-50 text-brand-700 border-brand-100 dark:bg-brand-900/20 dark:text-brand-400 dark:border-brand-800',
  cardiology:   'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800',
  oncology:     'bg-violet-50 text-violet-700 border-violet-100 dark:bg-violet-900/20 dark:text-violet-400 dark:border-violet-800',
  orthopedic:   'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
  ophthalmology:'bg-cyan-50 text-cyan-700 border-cyan-100 dark:bg-cyan-900/20 dark:text-cyan-400 dark:border-cyan-800',
  general:      'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
}

const SPECIALTY_IMAGES: Record<string, string> = {
  emergency:  'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=400&h=200&fit=crop',
  maternity:  'https://images.unsplash.com/photo-1531983412531-1f49a365ffed?w=400&h=200&fit=crop',
  dental:     'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=400&h=200&fit=crop',
  pediatric:  'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=200&fit=crop',
  surgical:   'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=400&h=200&fit=crop',
  cardiology: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=400&h=200&fit=crop',
  oncology:   'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&h=200&fit=crop',
  general:    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=200&fit=crop',
}

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400&h=200&fit=crop'
const DEFAULT_TAG   = 'bg-brand-50 text-brand-700 border-brand-100 dark:bg-brand-900/20 dark:text-brand-400 dark:border-brand-800'

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(star => (
        <svg key={star}
             className={`w-3 h-3 ${
               star <= Math.round(rating)
                 ? 'text-amber-400 fill-amber-400'
                 : 'text-gray-200 fill-gray-200 dark:text-gray-600 dark:fill-gray-600'
             }`}
             viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07
                   3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588
                   1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3
                   .921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0
                   00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539
                   -1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98
                   8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0
                   00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export default function HospitalCard({
  hospital,
  distance,
}: HospitalCardProps) {
  const primarySpecialty = hospital.specialties?.[0]?.toLowerCase() ?? 'general'
  const imageUrl = hospital.image_url
    ?? SPECIALTY_IMAGES[primarySpecialty]
    ?? DEFAULT_IMAGE

  return (
    <Link href={`/hospitals/${hospital.id}`}>
      <div className="bg-white dark:bg-gray-900 border border-gray-200
                      dark:border-gray-700 rounded-2xl overflow-hidden
                      hover:border-brand-300 dark:hover:border-brand-600
                      hover:shadow-xl hover:shadow-brand-500/10
                      hover:-translate-y-0.5 transition-all duration-200
                      cursor-pointer group h-full flex flex-col">

        {/* Image */}
        <div className="relative h-40 overflow-hidden">
          <Image
            src={imageUrl}
            alt={hospital.name}
            fill
            className="object-cover group-hover:scale-105
                       transition-transform duration-300"
            sizes="(max-width: 640px) 100vw,
                   (max-width: 1024px) 50vw,
                   33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t
                          from-black/40 to-transparent" />

          {/* Ownership badge */}
          <div className="absolute top-3 left-3">
            <OwnershipBadge ownership={hospital.ownership} variant="solid" />
          </div>

          {/* Distance badge */}
          {distance != null && (
            <div className="absolute top-3 right-3 bg-white/90
                            backdrop-blur-sm rounded-full px-2.5 py-1
                            text-xs font-bold text-brand-700">
              {distance.toFixed(1)} km
            </div>
          )}

          {/* City overlay */}
          <div className="absolute bottom-0 left-0 right-0 px-3 pb-2">
            <p className="text-white text-xs font-medium drop-shadow
                          line-clamp-1 opacity-80">
              {hospital.city}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">

          {/* Name */}
          <h3 className="font-semibold text-base text-brand-900
                         dark:text-white leading-snug mb-1
                         group-hover:text-brand-700
                         dark:group-hover:text-brand-400
                         transition-colors line-clamp-2">
            {hospital.name}
          </h3>

          {/* Location */}
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-3
                        flex items-center gap-1">
            <svg className="w-3 h-3 shrink-0 text-brand-700" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0
                       01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            {hospital.lga}, {hospital.city}
          </p>

          {/* Specialties */}
          {(hospital.specialties?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {hospital.specialties?.slice(0, 3).map(s => (
                <span key={s}
                      className={`px-2 py-0.5 rounded-md text-xs
                                  font-medium capitalize border ${
                        SPECIALTY_COLORS[s.toLowerCase()] ?? DEFAULT_TAG
                      }`}>
                  {s}
                </span>
              ))}
              {(hospital.specialties?.length ?? 0) > 3 && (
                <span className="px-2 py-0.5 text-xs text-gray-400
                                 font-medium">
                  +{(hospital.specialties?.length ?? 0) - 3}
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3
                          border-t border-gray-100 dark:border-gray-700
                          mt-auto">
            {hospital.rating_avg ? (
              <div className="flex items-center gap-1.5">
                <StarRating rating={hospital.rating_avg} />
                <span className="text-xs font-bold
                                 text-brand-900 dark:text-white">
                  {hospital.rating_avg.toFixed(1)}
                </span>
                <span className="text-xs text-gray-400">
                  ({hospital.review_count})
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-xs
                              text-gray-400 dark:text-gray-500">
                <span>⭐</span>
                <span>No ratings yet</span>
              </div>
            )}

            <svg className="w-4 h-4 text-gray-300 dark:text-gray-600
                            group-hover:text-brand-700
                            group-hover:translate-x-0.5 transition-all"
                 fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round"
                    strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  )
}