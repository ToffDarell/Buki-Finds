'use client'

import { useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { useUser } from '@/lib/useAuth'

// Supabase sends OAuth failures (Google) back as ?error_description=...
// or #error_description=... on the redirect URL. Show them instead of failing silently.
function readAuthError() {
  const query = new URLSearchParams(window.location.search)
  const hash = new URLSearchParams(window.location.hash.slice(1))
  return query.get('error_description') || hash.get('error_description') || ''
}

// A ?code= the Supabase client couldn't redeem: the sign-up confirmation email was opened in a
// different browser than the one that signed up (PKCE codes only work where they started).
// The email is confirmed by then; the student just needs to log in.
function readLeftoverCode() {
  return new URLSearchParams(window.location.search).has('code')
}

const subscribe = () => () => {}

function clearUrl() {
  window.history.replaceState(null, '', window.location.pathname)
}

export default function AuthErrorBanner() {
  const urlError = useSyncExternalStore(subscribe, readAuthError, () => '')
  const leftoverCode = useSyncExternalStore(subscribe, readLeftoverCode, () => false)
  const { user, loading } = useUser()
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  function dismiss() {
    setDismissed(true)
    clearUrl()
  }

  if (urlError) {
    return (
      <div className="border-b border-red-200 bg-red-50">
        <div className="mx-auto flex max-w-7xl items-start justify-between gap-4 px-4 py-2 text-sm text-red-700">
          <p>Login failed: {urlError}</p>
          <button onClick={dismiss} className="font-medium hover:underline">
            Dismiss
          </button>
        </div>
      </div>
    )
  }

  // Wait until the client has tried the code: a redeemed code signs the student in.
  if (leftoverCode && !loading && !user) {
    return (
      <div className="border-b border-primary/20 bg-primary-soft">
        <div className="mx-auto flex max-w-7xl items-start justify-between gap-4 px-4 py-2 text-sm text-primary">
          <p>
            Your email is confirmed.{' '}
            <Link href="/login" onClick={clearUrl} className="font-semibold underline">
              Log in to continue
            </Link>
          </p>
          <button onClick={dismiss} className="font-medium hover:underline">
            Dismiss
          </button>
        </div>
      </div>
    )
  }

  return null
}
