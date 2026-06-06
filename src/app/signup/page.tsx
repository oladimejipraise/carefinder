'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [success, setSuccess]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex
                      items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 bg-brand-50 dark:bg-brand-900/30
                          rounded-full flex items-center justify-center
                          mx-auto mb-4">
            <svg className="w-8 h-8 text-brand-700" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round"
                    strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white
                         mb-2">
            Check your email
          </h2>
          <p className="text-sm text-gray-400 mb-6">
            We sent a confirmation link to{' '}
            <span className="font-medium text-gray-600 dark:text-gray-300">
              {email}
            </span>.
            Click it to activate your account.
          </p>
          <Link href="/login"
                className="inline-flex items-center gap-2 bg-brand-700
                           text-white font-semibold px-6 py-2.5
                           rounded-xl hover:bg-brand-800 transition-colors
                           text-sm">
            Go to login
          </Link>
        </div>
      </div>
    )
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
            Create an account
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Join Carefinder to leave reviews and save hospitals
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
              <label className="block text-xs font-semibold text-gray-600
                                dark:text-gray-400 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="At least 6 characters"
                className="w-full border border-gray-200 dark:border-gray-700
                           dark:bg-gray-800 dark:text-white rounded-xl
                           px-3 py-2.5 text-sm focus:outline-none
                           focus:ring-2 focus:ring-brand-700
                           focus:border-transparent
                           placeholder:text-gray-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600
                                dark:text-gray-400 mb-1.5">
                Confirm password
              </label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
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
                  Creating account...
                </span>
              ) : 'Create account'}
            </button>

          </form>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          Already have an account?{' '}
          <Link href="/login"
                className="text-brand-700 font-semibold
                           hover:text-brand-800 transition-colors">
            Sign in
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