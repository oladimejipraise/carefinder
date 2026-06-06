'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { createClient } from '@/lib/supabase/client'

export default function InviteAdminPage() {
  const router   = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [success, setSuccess]   = useState(false)

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        setError('You must be logged in as admin')
        return
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/invite-admin`,
        {
          method:  'POST',
          headers: {
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ email, password }),
        }
      )

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Failed to create admin')
        return
      }

      setSuccess(true)
      setEmail('')
      setPassword('')

    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-brand-900 dark:text-white mb-2">
            Invite Admin
          </h1>
          <p className="text-sm text-gray-400 mb-8">
            Create a new admin account. Only existing admins can do this.
          </p>

          {success && (
            <div className="bg-brand-50 dark:bg-brand-900/20 border
                            border-brand-200 dark:border-brand-700
                            rounded-xl px-4 py-3 text-sm text-brand-700
                            dark:text-brand-400 mb-6">
              Admin account created successfully!
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border
                            border-red-100 dark:border-red-800 rounded-xl
                            px-4 py-3 text-sm text-red-600
                            dark:text-red-400 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleInvite}
                className="bg-white dark:bg-gray-900 border border-gray-100
                           dark:border-gray-800 rounded-2xl p-6 space-y-4
                           shadow-sm">
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
                placeholder="newadmin@example.com"
                className="w-full border border-gray-200 dark:border-gray-700
                           dark:bg-gray-800 dark:text-white rounded-xl px-3
                           py-2.5 text-sm focus:outline-none focus:ring-2
                           focus:ring-brand-700 placeholder:text-gray-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600
                                dark:text-gray-400 mb-1.5">
                Temporary password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="Min 6 characters"
                className="w-full border border-gray-200 dark:border-gray-700
                           dark:bg-gray-800 dark:text-white rounded-xl px-3
                           py-2.5 text-sm focus:outline-none focus:ring-2
                           focus:ring-brand-700 placeholder:text-gray-300"
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
              {loading ? 'Creating...' : 'Create Admin Account'}
            </button>
          </form>

          <button
            onClick={() => router.back()}
            className="mt-4 text-sm text-gray-400 hover:text-gray-600
                       transition-colors w-full text-center"
          >
            ← Back
          </button>
        </div>
      </main>
    </div>
  )
}