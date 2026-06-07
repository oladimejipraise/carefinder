'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { createClient } from '@/lib/supabase/client'

export default function HomePage() {
  const router = useRouter()
  const [query, setQuery]         = useState('')
  const [user, setUser]           = useState<{ email: string } | null>(null)
  const [isAdmin, setIsAdmin]     = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({ email: data.user.email ?? '' })
        setIsAdmin(data.user.app_metadata?.role === 'admin')
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setUser(session?.user ? { email: session.user.email ?? '' } : null)
        setIsAdmin(session?.user?.app_metadata?.role === 'admin')
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    router.push(query.trim() ? `/search?q=${query.trim()}` : '/search')
  }

  function scrollToFeatures() {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen flex flex-col">

      {/* ── 1. HERO ── */}
      <section
        className="relative flex flex-col min-h-screen overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, #051515 0%, #0c3333 40%, #1b6b6a 70%, #2a9090 100%)',
        }}
      >
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px,
            rgba(255,255,255,0.4) 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }} />

        {/* Navbar */}
        <header className="relative z-40 border-b border-white/5">
          <div className="w-full px-8 h-16 flex items-center justify-between">

            {/* Logo */}
            <span className="font-bold text-lg text-white tracking-tight
                             shrink-0">
              Care<span style={{ color: '#99d6d5' }}>finder</span>
            </span>

            {/* Nav links — centered, desktop only */}
            <nav className="hidden md:flex items-center gap-8 absolute
                            left-1/2 -translate-x-1/2">
              <button
                onClick={scrollToFeatures}
                className="text-sm text-white/70 hover:text-white
                           transition-colors font-medium"
              >
                About
              </button>
              <Link href="/admin/login"
                    className="text-sm text-white/70 hover:text-white
                               transition-colors font-medium">
                Admin
              </Link>
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-3 shrink-0">
              <ThemeToggle />

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenu(v => !v)}
                className="md:hidden flex items-center justify-center
                           w-8 h-8 text-white/70 hover:text-white
                           transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"
                     stroke="currentColor">
                  {mobileMenu ? (
                    <path strokeLinecap="round" strokeLinejoin="round"
                          strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round"
                          strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>

              {/* Desktop right actions */}
              {user ? (
                <div className="hidden md:flex items-center gap-2">
                  {isAdmin && (
                    <Link href="/admin/dashboard"
                          className="text-sm font-medium border
                                     border-white/20 text-white/80
                                     hover:text-white hover:bg-white/10
                                     px-3 py-1.5 rounded-lg transition-colors">
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="text-sm text-white/70 hover:text-white
                               transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-3">
                  <Link href="/login"
                        className="text-sm text-white/70 hover:text-white
                                   font-medium transition-colors">
                    Log in
                  </Link>
                  <Link href="/search"
                        className="text-sm font-semibold px-4 py-2
                                   rounded-lg bg-white hover:bg-gray-50
                                   transition-colors"
                        style={{ color: '#0c3333' }}>
                    Find Hospitals
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu dropdown */}
          {mobileMenu && (
            <div className="md:hidden border-t border-white/10
                            px-4 py-3 space-y-1"
                 style={{ background: 'rgba(0,0,0,0.3)' }}>
              <button
                onClick={() => { scrollToFeatures(); setMobileMenu(false) }}
                className="block w-full text-left px-3 py-2.5 rounded-xl
                           text-sm font-medium text-white/70 hover:text-white
                           hover:bg-white/10 transition-colors"
              >
                About
              </button>
              <Link href="/admin/login"
                    onClick={() => setMobileMenu(false)}
                    className="block px-3 py-2.5 rounded-xl text-sm
                               font-medium text-white/70 hover:text-white
                               hover:bg-white/10 transition-colors">
                Admin
              </Link>
              {!user ? (
                <>
                  <Link href="/login"
                        onClick={() => setMobileMenu(false)}
                        className="block px-3 py-2.5 rounded-xl text-sm
                                   font-medium text-white/70 hover:text-white
                                   hover:bg-white/10 transition-colors">
                    Log in
                  </Link>
                  <Link href="/search"
                        onClick={() => setMobileMenu(false)}
                        className="block px-3 py-2.5 rounded-xl text-sm
                                   font-bold text-white bg-white/10
                                   hover:bg-white/20 transition-colors">
                    Find Hospitals
                  </Link>
                </>
              ) : (
                <>
                  {isAdmin && (
                    <Link href="/admin/dashboard"
                          onClick={() => setMobileMenu(false)}
                          className="block px-3 py-2.5 rounded-xl text-sm
                                     font-medium text-white/70 hover:text-white
                                     hover:bg-white/10 transition-colors">
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => { handleSignOut(); setMobileMenu(false) }}
                    className="block w-full text-left px-3 py-2.5 rounded-xl
                               text-sm font-medium text-white/70 hover:text-white
                               hover:bg-white/10 transition-colors"
                  >
                    Sign out
                  </button>
                </>
              )}
            </div>
          )}
        </header>

        {/* Hero content */}
        <div className="relative flex-1 flex flex-col items-center
                        justify-center px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-5xl sm:text-6xl font-bold text-white
                           leading-tight mb-4">
              Find the right hospital<br />
              <span style={{ color: '#5dd4d0' }}>near you</span>
            </h1>
            <p className="text-base mb-10 max-w-md mx-auto"
               style={{ color: 'rgba(255,255,255,0.6)' }}>
              Search hospitals across Nigeria by specialty, location,
              and ownership. Free for everyone.
            </p>

            {/* Search */}
            <form onSubmit={handleSearch}
                  className="w-full max-w-lg mx-auto mb-8">
              <div className="flex gap-2 rounded-2xl p-2" style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}>
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Hospital name, city, or LGA..."
                  className="flex-1 text-sm bg-transparent px-3 py-2
                             focus:outline-none placeholder:text-white/40"
                  style={{ color: 'white' }}
                />
                <button type="submit"
                        className="text-white text-sm font-semibold px-6
                                   py-2.5 rounded-xl hover:opacity-90
                                   transition-opacity"
                        style={{ background: '#155554' }}>
                  Search
                </button>
              </div>
            </form>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/search"
                    className="inline-flex items-center justify-center
                               bg-white font-semibold px-8 py-3.5
                               rounded-xl hover:bg-gray-50 transition-colors
                               text-sm"
                    style={{ color: '#0c3333' }}>
                Find Hospitals
              </Link>
              {!user && (
                <Link href="/login"
                      className="inline-flex items-center justify-center
                                 text-white text-sm font-medium px-8
                                 py-3.5 rounded-xl hover:bg-white/10
                                 transition-colors"
                      style={{ border: '1px solid rgba(255,255,255,0.3)' }}>
                  Log in to save favourites
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. HOW IT WORKS ── */}
      <section className="py-24 px-6" style={{ background: '#0f2020' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-16">
            How it works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12">
            {[
              {
                number: '1',
                title:  'Search',
                desc:   'Find hospitals by name, city, LGA, or specialty.',
              },
              {
                number: '2',
                title:  'Compare',
                desc:   'View ratings, specialties, and ownership details.',
              },
              {
                number: '3',
                title:  'Visit',
                desc:   'Call directly, get directions, or share the list.',
              },
            ].map(step => (
              <div key={step.number} className="text-center">
                <div className="w-10 h-10 rounded-full flex items-center
                                justify-center text-white font-bold text-sm
                                mx-auto mb-4"
                     style={{ background: '#1b6b6a' }}>
                  {step.number}
                </div>
                <h3 className="font-semibold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed"
                   style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. WHAT YOU CAN DO ── */}
      <section
        id="features"
        className="py-24 px-6"
        style={{ background: '#0d1117' }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3"
               style={{ color: '#3a9e9d' }}>
              What you can do
            </p>
            <h2 className="text-3xl font-bold text-white">
              Everything you need to find care
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: 'Search & Filter',
                desc:  'Find hospitals by name, city, LGA, specialty, or ownership type.',
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"
                       stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                ),
              },
              {
                title: 'Map View',
                desc:  'See hospitals on an interactive map with radius-based search.',
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"
                       stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0
                             01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
              },
              {
                title: 'Export CSV',
                desc:  'Download hospital lists as CSV with your chosen columns.',
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"
                       stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4
                             4m0 0l-4-4m4 4V4" />
                  </svg>
                ),
              },
              {
                title: 'Share Results',
                desc:  'Copy a link or email a curated hospital list to anyone.',
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"
                       stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482
                             -.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0
                             2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3
                             0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3
                             3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                ),
              },
              {
                title: 'Ratings & Reviews',
                desc:  'Read and leave reviews to help others find quality care.',
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"
                       stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519
                             4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24
                             .588 1.81l-3.976 2.888a1 1 0 00-.363 1.118
                             l1.518 4.674c.3.922-.755 1.688-1.538 1.118
                             l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888
                             c-.783.57-1.838-.197-1.538-1.118l1.518-4.674
                             a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57
                             -.38-1.81.588-1.81h4.914a1 1 0 00.951-.69
                             l1.519-4.674z" />
                  </svg>
                ),
              },
              {
                title: 'Visiting Hours',
                desc:  'Check opening times and contact details before you go.',
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"
                       stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
              {
                title: 'Verified Data',
                desc:  'Entries created and moderated by trusted administrators.',
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"
                       stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0
                             0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02
                             12.02 0 003 9c0 5.591 3.824 10.29 9 11.622
                             5.176-1.332 9-6.03 9-11.622 0-1.042-.133
                             -2.052-.382-3.016z" />
                  </svg>
                ),
              },
              {
                title: 'Get Directions',
                desc:  'One tap to open Google Maps directions to any hospital.',
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"
                       stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                ),
              },
            ].map(card => (
              <div key={card.title}
                   className="rounded-2xl p-6"
                   style={{
                     background: 'rgba(255,255,255,0.04)',
                     border: '1px solid rgba(255,255,255,0.08)',
                   }}>
                <div className="w-10 h-10 rounded-xl flex items-center
                                justify-center mb-5"
                     style={{
                       background: 'rgba(58,158,157,0.15)',
                       color: '#3a9e9d',
                     }}>
                  {card.icon}
                </div>
                <h3 className="font-bold text-white mb-2 text-sm">
                  {card.title}
                </h3>
                <p className="text-sm leading-relaxed"
                   style={{ color: 'rgba(255,255,255,0.45)' }}>
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. BROWSE BY SPECIALTY ── */}
      <section className="py-20 px-6" style={{ background: '#112828' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-10">
            Browse by specialty
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              'Emergency', 'Maternity', 'Pediatric', 'Dental',
              'Cardiology', 'Surgical', 'Oncology', 'General',
            ].map(s => (
              <Link key={s}
                    href={`/search?specialty=${s.toLowerCase()}`}
                    className="text-center px-4 py-4 rounded-xl text-sm
                               font-medium transition-all hover:opacity-80"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.7)',
                    }}>
                {s}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. CTA ── */}
      <section id="about" className="py-24 px-6 text-center"
               style={{ background: '#0c3333' }}>
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to find a hospital?
          </h2>
          <p className="text-sm mb-8"
             style={{ color: 'rgba(255,255,255,0.5)' }}>
            Free, fast, and available across Nigeria.
          </p>
          <Link href="/search"
                className="inline-flex items-center justify-center
                           text-white font-semibold px-8 py-4 rounded-xl
                           hover:opacity-90 transition-opacity text-sm"
                style={{ background: '#1b6b6a' }}>
            Search Hospitals
          </Link>
        </div>
      </section>

      {/* ── 6. FOOTER ── */}
      <footer className="py-10 px-8" style={{ background: '#0a2828' }}>
        <div className="w-full flex items-center justify-between">
          <span className="font-semibold text-white text-sm">
            Carefinder
          </span>
          <p className="text-xs"
             style={{ color: 'rgba(255,255,255,0.25)' }}>
            © 2026 Carefinder
          </p>
        </div>
      </footer>

    </div>
  )
}