'use client'

import { useEffect } from 'react'

// Registers public/sw.js (static files only; see that file). Production only, so `next dev`
// never serves an old build from the cache.
export default function RegisterServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return
    navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' }).catch(() => {
      // Not supported or blocked: the site works the same without it.
    })
  }, [])
  return null
}
