'use client'

import { useState } from 'react'
import type { Hospital } from '@/types'

interface EmailShareModalProps {
  hospitals: Hospital[]
  onClose: () => void
}

export default function EmailShareModal({
  hospitals,
  onClose,
}: EmailShareModalProps) {
  const [email, setEmail] = useState('')
  const [senderName, setSenderName] = useState('')
  const [selected, setSelected] = useState<string[]>(
    hospitals.slice(0, 5).map(h => h.id)
  )
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggleHospital(id: string) {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : prev.length >= 20
          ? prev
          : [...prev, id]
    )
  }

  async function handleSend() {
    if (!email || selected.length === 0) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/share', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to:          email,
          hospitalIds: selected,
          senderName:  senderName || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Failed to send email')
        return
      }

      setSent(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50
                 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl
                   w-full max-w-md max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >

        {/* Header */}
        <div className="flex items-center justify-between p-6
                        border-b border-gray-100 dark:border-gray-800
                        shrink-0">
          <div>
            <h2 className="font-bold text-brand-900 dark:text-white">
              Share via Email
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Send a curated hospital list to anyone
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center
                       rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800
                       transition-colors text-gray-400"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round"
                    strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {sent ? (
          <div className="flex-1 flex flex-col items-center justify-center
                          p-8 text-center">
            <div className="w-16 h-16 bg-brand-50 rounded-full flex
                            items-center justify-center mb-4">
              <svg className="w-8 h-8 text-brand-700" fill="none"
                   viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round"
                      strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-semibold text-brand-900 dark:text-white mb-1">
              Email sent!
            </p>
            <p className="text-sm text-gray-400 mb-6">
              Hospital list sent to {email}
            </p>
            <button
              onClick={onClose}
              className="bg-brand-700 text-white font-semibold px-6
                         py-2.5 rounded-xl hover:bg-brand-800
                         transition-colors text-sm"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">

              {error && (
                <div className="bg-red-50 border border-red-100
                                rounded-xl px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold
                                  text-gray-600 dark:text-gray-300 mb-1.5">
                  Recipient email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="friend@example.com"
                  className="w-full border border-gray-200
                             dark:border-gray-700 dark:bg-gray-800
                             dark:text-white rounded-xl px-3 py-2.5
                             text-sm focus:outline-none focus:ring-2
                             focus:ring-brand-700 focus:border-transparent
                             placeholder:text-gray-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold
                                  text-gray-600 dark:text-gray-300 mb-1.5">
                  Your name (optional)
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={e => setSenderName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full border border-gray-200
                             dark:border-gray-700 dark:bg-gray-800
                             dark:text-white rounded-xl px-3 py-2.5
                             text-sm focus:outline-none focus:ring-2
                             focus:ring-brand-700 focus:border-transparent
                             placeholder:text-gray-300"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold
                                    text-gray-600 dark:text-gray-300">
                    Select hospitals
                  </label>
                  <span className="text-xs text-gray-400">
                    {selected.length} / 20 selected
                  </span>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {hospitals.map(h => (
                    <label
                      key={h.id}
                      className={`flex items-center gap-3 p-3
                                  rounded-xl border cursor-pointer
                                  transition-colors ${
                        selected.includes(h.id)
                          ? 'border-brand-200 bg-brand-50 dark:bg-brand-900/20 dark:border-brand-700'
                          : 'border-gray-100 dark:border-gray-700 hover:border-gray-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected.includes(h.id)}
                        onChange={() => toggleHospital(h.id)}
                        className="accent-brand-700 w-3.5 h-3.5 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className={`text-xs font-medium truncate ${
                          selected.includes(h.id)
                            ? 'text-brand-700'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {h.name}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {h.lga}, {h.city}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6
                            border-t border-gray-100 dark:border-gray-800
                            shrink-0">
              <button
                onClick={onClose}
                className="text-sm text-gray-400 hover:text-gray-600
                           transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={loading || !email || selected.length === 0}
                className="flex items-center gap-2 bg-brand-700
                           text-white font-semibold px-5 py-2.5
                           rounded-xl hover:bg-brand-800
                           transition-colors text-sm disabled:opacity-50
                           disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none"
                         viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12"
                              r="10" stroke="currentColor"
                              strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373
                               0 12h4z" />
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none"
                         viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5
                               19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2
                               0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Send Email
                  </>
                )}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  )
}