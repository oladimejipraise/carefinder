import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { marked } from 'marked'
import { JSDOM } from 'jsdom'
import DOMPurify from 'dompurify'
import { createClient } from '@/lib/supabase/server'
import ReviewsSection from '@/components/hospital/ReviewsSection'
import Logo from '@/components/ui/Logo'

export const revalidate = 60

const window = new JSDOM('').window
const purify = DOMPurify(window as unknown as Window)

const SPECIALTY_COLORS: Record<string, string> = {
  emergency:    'bg-red-50 text-red-700 border-red-100',
  maternity:    'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100',
  dental:       'bg-blue-50 text-blue-700 border-blue-100',
  pediatric:    'bg-purple-50 text-purple-700 border-purple-100',
  surgical:     'bg-teal-50 text-teal-700 border-teal-100',
  cardiology:   'bg-orange-50 text-orange-700 border-orange-100',
  oncology:     'bg-violet-50 text-violet-700 border-violet-100',
  orthopedic:   'bg-amber-50 text-amber-700 border-amber-100',
  ophthalmology:'bg-cyan-50 text-cyan-700 border-cyan-100',
  general:      'bg-gray-50 text-gray-600 border-gray-200',
}

const SPECIALTY_IMAGES: Record<string, string> = {
  emergency:  'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800&h=400&fit=crop',
  maternity:  'https://images.unsplash.com/photo-1531983412531-1f49a365ffed?w=800&h=400&fit=crop',
  dental:     'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=800&h=400&fit=crop',
  pediatric:  'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=400&fit=crop',
  surgical:   'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=800&h=400&fit=crop',
  cardiology: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=800&h=400&fit=crop',
  oncology:   'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&h=400&fit=crop',
  general:    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=400&fit=crop',
}

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&h=400&fit=crop'

async function getHospital(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('hospitals')
    .select('*, hospital_images(*), reviews(*)')
    .eq('id', id)
    .single()
  if (error || !data) return null
  return data
}

type Props = {
  params: Promise<{ id: string }>
}

export default async function HospitalDetailPage({ params }: Props) {
  const resolvedParams = await params
  const hospital = await getHospital(resolvedParams.id)
  if (!hospital) notFound()

  const approvedReviews = (hospital.reviews ?? []).filter(
    (r: { status: string }) => r.status === 'approved'
  )

  const primarySpecialty = hospital.specialties?.[0]?.toLowerCase() ?? 'general'
  const imageUrl = hospital.image_url
    ?? SPECIALTY_IMAGES[primarySpecialty]
    ?? DEFAULT_IMAGE

  const descriptionHtml = hospital.description_md
    ? purify.sanitize(marked(hospital.description_md) as string)
    : null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

      {/* Navbar */}
      <header className="bg-white dark:bg-gray-900 border-b
                         border-gray-100 dark:border-gray-800
                         sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center
                        justify-between">
          <Logo />
          <Link href="/search"
                className="flex items-center gap-2 text-sm text-gray-500
                           dark:text-gray-400 hover:text-brand-900
                           dark:hover:text-white transition-colors
                           font-medium">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round"
                    strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to results
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Hero card */}
            <div className="bg-white dark:bg-gray-800 border
                            border-gray-100 dark:border-gray-700
                            rounded-2xl overflow-hidden shadow-sm">

              {/* Image */}
              <div className="relative h-56 overflow-hidden">
                <Image
                  src={imageUrl}
                  alt={hospital.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 66vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t
                                from-black/30 to-transparent" />
                <div className="absolute top-4 right-4 flex items-center
                                gap-1.5 bg-white/90 backdrop-blur-sm
                                rounded-full px-3 py-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-xs font-semibold text-green-700">
                    Open now
                  </span>
                </div>
                <div className={`absolute top-4 left-4 rounded-full px-3
                                 py-1 text-xs font-bold text-white ${
                  hospital.ownership === 'public'
                    ? 'bg-brand-700'
                    : 'bg-blue-600'
                }`}>
                  {hospital.ownership === 'public' ? 'Public' : 'Private'}
                </div>
              </div>

              {/* Info */}
              <div className="p-6">
                <div className="flex items-start justify-between
                                gap-4 mb-2">
                  <h1 className="text-2xl font-bold text-brand-900
                                 dark:text-white">
                    {hospital.name}
                  </h1>
                  {hospital.rating_avg && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className="flex">
                        {[1,2,3,4,5].map(star => (
                          <svg key={star}
                               className={`w-4 h-4 ${
                                 star <= Math.round(hospital.rating_avg)
                                   ? 'text-amber-400 fill-amber-400'
                                   : 'text-gray-200 fill-gray-200'
                               }`}
                               viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921
                                     1.902 0l1.07 3.292a1 1 0 00.95.69
                                     h3.462c.969 0 1.371 1.24.588 1.81
                                     l-2.8 2.034a1 1 0 00-.364 1.118
                                     l1.07 3.292c.3.921-.755 1.688-1.54
                                     1.118l-2.8-2.034a1 1 0 00-1.175 0
                                     l-2.8 2.034c-.784.57-1.838-.197
                                     -1.539-1.118l1.07-3.292a1 1 0
                                     00-.364-1.118L2.98 8.72c-.783-.57
                                     -.38-1.81.588-1.81h3.461a1 1 0
                                     00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm font-bold
                                       text-brand-900 dark:text-white">
                        {Number(hospital.rating_avg).toFixed(1)}
                      </span>
                      <span className="text-sm text-gray-400">
                        ({hospital.review_count} reviews)
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4
                                text-sm text-gray-500 dark:text-gray-400
                                mb-4">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-brand-700" fill="none"
                         viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998
                               0 01-2.827 0l-4.244-4.243a8 8 0
                               1111.314 0z" />
                    </svg>
                    {hospital.address}, {hospital.lga}, {hospital.city}
                  </span>
                  {hospital.phone && (
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-brand-700" fill="none"
                           viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684
                                 l1.498 4.493a1 1 0 01-.502 1.21l-2.257
                                 1.13a11.042 11.042 0 005.516 5.516l1.13
                                 -2.257a1 1 0 011.21-.502l4.493 1.498a1
                                 1 0 01.684.949V19a2 2 0 01-2 2h-1
                                 C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {hospital.phone}
                    </span>
                  )}
                  {hospital.email && (
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-brand-700" fill="none"
                           viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5
                                 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2
                                 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {hospital.email}
                    </span>
                  )}
                </div>

                {hospital.specialties?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {hospital.specialties.map((s: string) => (
                      <span key={s}
                            className={`px-3 py-1 rounded-full text-xs
                                        font-semibold capitalize border ${
                              SPECIALTY_COLORS[s.toLowerCase()]
                                ?? 'bg-brand-50 text-brand-700 border-brand-100'
                            }`}>
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* About */}
            {descriptionHtml && (
              <div className="bg-white dark:bg-gray-800 border
                              border-gray-100 dark:border-gray-700
                              rounded-2xl p-6 shadow-sm">
                <h2 className="text-base font-bold text-brand-900
                               dark:text-white mb-4">
                  About
                </h2>
                <div
                  className="prose prose-sm max-w-none
                             text-gray-600 dark:text-gray-400
                             prose-headings:text-brand-900
                             dark:prose-headings:text-white
                             prose-a:text-brand-700"
                  dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                />
              </div>
            )}

            {/* Visiting Hours */}
            <div className="bg-white dark:bg-gray-800 border
                            border-gray-100 dark:border-gray-700
                            rounded-2xl p-6 shadow-sm">
              <h2 className="text-base font-bold text-brand-900
                             dark:text-white mb-4">
                Visiting Hours
              </h2>
              <div className="space-y-2">
                {hospital.visiting_hours ? (
                  hospital.visiting_hours
                    .split('\n')
                    .filter((l: string) => l.trim())
                    .map((line: string, i: number) => {
                      const [day, ...rest] = line.split(':')
                      return (
                        <div key={i}
                             className="flex items-center justify-between
                                        py-2 border-b border-gray-50
                                        dark:border-gray-700 last:border-0">
                          <span className="text-sm text-gray-500
                                           dark:text-gray-400">
                            {day}
                          </span>
                          <span className="text-sm font-medium
                                           text-brand-900 dark:text-white">
                            {rest.join(':').trim()}
                          </span>
                        </div>
                      )
                    })
                ) : (
                  <>
                    {[
                      { day: 'Monday - Friday', hours: '8:00 AM - 8:00 PM' },
                      { day: 'Saturday',        hours: '8:00 AM - 4:00 PM' },
                      { day: 'Sunday',          hours: '10:00 AM - 2:00 PM' },
                    ].map(({ day, hours }) => (
                      <div key={day}
                           className="flex items-center justify-between
                                      py-2 border-b border-gray-50
                                      dark:border-gray-700 last:border-0">
                        <span className="text-sm text-gray-500
                                         dark:text-gray-400">
                          {day}
                        </span>
                        <span className="text-sm font-medium
                                         text-brand-900 dark:text-white">
                          {hours}
                        </span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* Reviews */}
            <ReviewsSection
              hospitalId={hospital.id}
              initialReviews={approvedReviews}
              reviewCount={hospital.review_count}
            />
          </div>

          {/* Right column */}
          <div className="space-y-4">

            {/* Actions */}
            <div className="bg-white dark:bg-gray-800 border
                            border-gray-100 dark:border-gray-700
                            rounded-2xl p-5 shadow-sm space-y-3">
              <a href={`tel:${hospital.phone}`}
                 className="w-full flex items-center justify-center gap-2
                            bg-brand-700 text-white font-semibold py-3
                            rounded-xl hover:bg-brand-800 transition-colors
                            text-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                     stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498
                           4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042
                           11.042 0 005.516 5.516l1.13-2.257a1 1 0
                           011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2
                           2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call Hospital
              </a>

              <a href={`https://www.google.com/maps/search/${
                        encodeURIComponent(
                          `${hospital.name} ${hospital.address} ${hospital.city}`
                        )}`}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="w-full flex items-center justify-center gap-2
                            border border-gray-200 dark:border-gray-600
                            text-gray-700 dark:text-gray-300 font-semibold
                            py-3 rounded-xl hover:bg-gray-50
                            dark:hover:bg-gray-700 transition-colors
                            text-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                     stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1
                           1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10
                           l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0
                           00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Get Directions
              </a>

              <button
                className="w-full flex items-center justify-center gap-2
                           border border-gray-200 dark:border-gray-600
                           text-gray-700 dark:text-gray-300 font-semibold
                           py-3 rounded-xl hover:bg-gray-50
                           dark:hover:bg-gray-700 transition-colors
                           text-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                     stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0
                           -.482-.114-.938-.316-1.342m0 2.684a3 3 0
                           110-2.684m0 2.684l6.632 3.316m-6.632-6
                           l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3
                           0 00-5.367 2.684zm0 9.316a3 3 0 105.368
                           2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share Hospital
              </button>
            </div>

            {/* Quick info */}
            <div className="bg-white dark:bg-gray-800 border
                            border-gray-100 dark:border-gray-700
                            rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-brand-900
                             dark:text-white mb-4">
                Quick Info
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500
                                   dark:text-gray-400">Type</span>
                  <span className={`text-xs font-semibold px-2 py-0.5
                                    rounded-full ${
                    hospital.ownership === 'public'
                      ? 'bg-brand-50 text-brand-700'
                      : 'bg-blue-50 text-blue-700'
                  }`}>
                    {hospital.ownership === 'public' ? 'Public' : 'Private'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500
                                   dark:text-gray-400">City</span>
                  <span className="text-xs font-semibold text-brand-900
                                   dark:text-white">
                    {hospital.city}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500
                                   dark:text-gray-400">LGA</span>
                  <span className="text-xs font-semibold text-brand-900
                                   dark:text-white">
                    {hospital.lga}
                  </span>
                </div>
                {hospital.rating_avg && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Rating</span>
                    <span className="text-xs font-semibold text-amber-500">
                      ★ {Number(hospital.rating_avg).toFixed(1)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Reviews</span>
                  <span className="text-xs font-medium text-brand-900
                                   dark:text-white">
                    {hospital.review_count}
                  </span>
                </div>
              </div>
            </div>

            {/* Emergency */}
            <div className="bg-red-50 dark:bg-red-900/20 border
                            border-red-100 dark:border-red-800
                            rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-red-500 rounded-full
                                animate-pulse" />
                <span className="text-xs font-bold text-red-700
                                 dark:text-red-400">
                  Emergency?
                </span>
              </div>
              <p className="text-xs text-red-500 dark:text-red-400 mb-3">
                Call the hospital directly or dial emergency services.
              </p>
              <a href="tel:112"
                 className="block w-full text-center bg-red-600
                            text-white text-xs font-bold py-2 rounded-lg
                            hover:bg-red-700 transition-colors">
                Call 112 (Emergency)
              </a>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}