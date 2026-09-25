'use client'

import { useState, useSyncExternalStore } from 'react'

// Supabase sends OAuth failures (Google/Facebook) back as ?error_description=...
// or #error_description=... on the redirect URL. Show them instead of failing silently.
function readAuthError() {
  const query = new URLSearchParams(window.location.search)
  const hash = new URLSearchParams(window.location.hash.slice(1))
  return query.get('error_description') || hash.get('error_description') || ''
}

const subscribe = () => () => {}

export default function AuthErrorBanner() {
  const urlError = useSyncExternalStore(subscribe, readAuthError, () => '')
  const [dismissed, setDismissed] = useState(false)

  if (!urlError || dismissed) return null

  function dismiss() {
    setDismissed(true)
    // Clean the error out of the address bar
    window.history.replaceState(null, '', window.location.pathname)
  }

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
