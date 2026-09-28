'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/useAuth'
import { fetchNotifications, markAllRead } from '@/lib/notifications'
import NotificationItem from '@/app/components/NotificationItem'
import { BellIcon } from '@/app/components/icons'

export default function NotificationsPage() {
  const router = useRouter()
  const { user, loading: userLoading } = useUser()
  const [result, setResult] = useState({ loaded: false, notifications: [], error: '' })

  useEffect(() => {
    if (!userLoading && !user) router.replace('/login?next=/notifications')
  }, [userLoading, user, router])

  // Load, then mark everything read. The rows keep their unread highlight until the next visit,
  // so the student can still see what was new.
  useEffect(() => {
    if (!user) return
    let cancelled = false
    fetchNotifications().then((res) => {
      if (cancelled) return
      setResult({ loaded: true, ...res })
      if (res.notifications.some((n) => !n.read_at)) markAllRead()
    })
    return () => {
      cancelled = true
    }
  }, [user])

  const { loaded, notifications, error } = result

  return (
    <main className="flex-1 bg-surface py-6 sm:py-8">
      <div className="mx-auto w-full max-w-2xl px-4 sm:px-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">Notifications</h1>
        <p className="mt-1 text-xs text-muted sm:text-sm">When students save your listings or review you, you’ll see it here.</p>

        {error && (
          <p role="alert" className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            Couldn’t load notifications: {error}
          </p>
        )}

        {!loaded || userLoading ? (
          <ul className="mt-6 divide-y divide-line overflow-hidden rounded-[10px] border border-line bg-white shadow-card" aria-hidden="true">
            {Array.from({ length: 4 }, (_, i) => (
              <li key={i} className="flex animate-pulse items-center gap-3 px-5 py-4">
                <span className="h-11 w-11 rounded-full bg-surface" />
                <span className="h-3 flex-1 rounded bg-surface" />
              </li>
            ))}
          </ul>
        ) : notifications.length === 0 && !error ? (
          <div className="mt-6 flex flex-col items-center rounded-[10px] border border-line bg-white px-6 py-12 text-center shadow-card">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
              <BellIcon className="h-6 w-6" />
            </span>
            <p className="mt-4 text-lg font-bold text-ink">No notifications yet</p>
            <p className="mt-1 max-w-[40ch] text-sm text-muted">
              When someone saves one of your listings or leaves you a review, you’ll see it here.
            </p>
            <Link href="/post" className="mt-5 text-sm font-semibold text-primary hover:underline">
              Post an item
            </Link>
          </div>
        ) : (
          <ul className="mt-6 divide-y divide-line overflow-hidden rounded-[10px] border border-line shadow-card">
            {notifications.map((n) => (
              <NotificationItem key={n.id} n={n} userId={user?.id} />
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
