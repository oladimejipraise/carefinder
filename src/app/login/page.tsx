'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    router.push('/search')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex
                    items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2
                                    justify-center mb-4">
            <div className="w-10 h-10 bg-brand-700 rounded-xl flex
                            items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none"
                   viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0
                         01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </Link>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Welcome back
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Sign in to your Carefinder account
          </p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100
                        dark:border-gray-800 rounded-2xl shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border
                              border-red-100 dark:border-red-800
                              rounded-xl px-4 py-3 text-sm text-red-600
                              dark:text-red-400">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-600
                                dark:text-gray-400 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full border border-gray-200 dark:border-gray-700
                           dark:bg-gray-800 dark:text-white rounded-xl
                           px-3 py-2.5 text-sm focus:outline-none
                           focus:ring-2 focus:ring-brand-700
                           focus:border-transparent
                           placeholder:text-gray-300"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-600
                                  dark:text-gray-400">
                  Password
                </label>
                <Link href="/forgot-password"
                      className="text-xs text-brand-700 hover:text-brand-800
                                 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full border border-gray-200 dark:border-gray-700
                           dark:bg-gray-800 dark:text-white rounded-xl
                           px-3 py-2.5 text-sm focus:outline-none
                           focus:ring-2 focus:ring-brand-700
                           focus:border-transparent
                           placeholder:text-gray-300"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-700 text-white font-semibold
                         py-2.5 rounded-xl hover:bg-brand-800
                         transition-colors text-sm disabled:opacity-50
                         disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none"
                       viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12"
                            r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign in'}
            </button>

          </form>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/signup"
                className="text-brand-700 font-semibold
                           hover:text-brand-800 transition-colors">
            Sign up
          </Link>
        </p>

        <p className="text-center text-xs text-gray-300
                      dark:text-gray-600 mt-3">
          <Link href="/"
                className="hover:text-gray-500 transition-colors">
            ← Back to home
          </Link>
        </p>

      </div>
    </div>
  )
}