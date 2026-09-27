'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/useAuth'
import { takeRememberedNext } from '@/lib/afterLogin'

// Finishes a Google login that started from /login?next=...: once the student is
// signed in, send them on to where they were headed (e.g. a review link). Renders nothing.
export default function AfterLoginRedirect() {
  const { user } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!user) return
    const next = takeRememberedNext()
    if (next) router.replace(next)
  }, [user, router])

  return null
}
