'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser } from '@/lib/useAuth'
import { fetchNotifications, fetchUnreadCount, markAllRead } from '@/lib/notifications'
import NotificationItem from '@/app/components/NotificationItem'
import { BellIcon } from '@/app/components/icons'

const bellClass =
  'relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-white transition-colors hover:bg-white/10'

function Badge({ count }) {
  if (!count) return null
  return (
    <span className="absolute right-1 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold leading-none text-white ring-2 ring-primary">
      {count > 99 ? '99+' : count}
    </span>
  )
}

// Bell with the unread count. `dropdown` (desktop): clicking opens a panel of recent notifications,
// like Carousell's Updates. Without it (phones): the bell links to the full Notifications page.
// The count re-checks when the page changes, when the student comes back to the tab, and every minute.
export default function NotificationBell({ dropdown = false }) {
  const pathname = usePathname()
  const { user } = useUser()
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)
  const [list, setList] = useState({ loaded: false, notifications: [], error: '' })
  const buttonRef = useRef(null)
  const panelRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    const refresh = () => fetchUnreadCount().then((n) => !cancelled && setUnread(n))
    refresh()
    const timer = setInterval(refresh, 60_000)
    const onFocus = () => document.visibilityState === 'visible' && refresh()
    document.addEventListener('visibilitychange', onFocus)
    return () => {
      cancelled = true
      clearInterval(timer)
      document.removeEventListener('visibilitychange', onFocus)
    }
  }, [pathname])

  // Close on a click outside the panel, or Escape.
  useEffect(() => {
    if (!open) return
    function onPointerDown(e) {
      if (!panelRef.current?.contains(e.target) && !buttonRef.current?.contains(e.target)) setOpen(false)
    }
    function onKeyDown(e) {
      if (e.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  // Opening loads the latest and marks them read; rows keep their highlight while the panel is open.
  async function toggle() {
    if (open) return setOpen(false)
    setOpen(true)
    const res = await fetchNotifications(12)
    setList({ loaded: true, ...res })
    if (res.notifications.some((n) => !n.read_at)) {
      markAllRead()
      setUnread(0)
    }
  }

  const label = unread ? `Notifications, ${unread} unread` : 'Notifications'

  if (!dropdown) {
    return (
      <Link
        href="/notifications"
        aria-label={label}
        title={label}
        aria-current={pathname === '/notifications' ? 'page' : undefined}
        className={bellClass}
      >
        <BellIcon className="h-5 w-5" />
        <Badge count={unread} />
      </Link>
    )
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        aria-label={label}
        title={label}
        aria-expanded={open}
        aria-controls="notifications-panel"
        className={`${bellClass} ${open ? 'bg-white/15' : ''}`}
      >
        <BellIcon className="h-5 w-5" />
        <Badge count={unread} />
      </button>

      {open && (
        <div
          ref={panelRef}
          id="notifications-panel"
          className="menu-drop absolute right-0 top-full z-40 mt-2 w-[26rem] overflow-hidden rounded-2xl border border-line bg-white shadow-lg"
        >
          <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
            <p className="text-base font-bold text-ink">Notifications</p>
            <Link href="/notifications" onClick={() => setOpen(false)} className="text-sm font-semibold text-primary hover:underline">
              See all
            </Link>
          </div>

          <div className="max-h-[min(32rem,70vh)] overflow-y-auto">
            {!list.loaded ? (
              <ul aria-hidden="true">
                {Array.from({ length: 3 }, (_, i) => (
                  <li key={i} className="flex animate-pulse items-center gap-3 px-5 py-4">
                    <span className="h-11 w-11 rounded-full bg-surface" />
                    <span className="h-3 flex-1 rounded bg-surface" />
                  </li>
                ))}
              </ul>
            ) : list.error ? (
              <p className="px-5 py-6 text-sm text-red-700">Couldn’t load notifications. Try again in a moment.</p>
            ) : list.notifications.length === 0 ? (
              <div className="flex flex-col items-center px-6 py-10 text-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-soft text-primary">
                  <BellIcon className="h-5 w-5" />
                </span>
                <p className="mt-3 text-sm font-semibold text-ink">No notifications yet</p>
                <p className="mt-1 text-xs text-muted">Saves and reviews on your listings will show up here.</p>
              </div>
            ) : (
              <ul className="divide-y divide-line">
                {list.notifications.map((n) => (
                  <NotificationItem key={n.id} n={n} userId={user?.id} onNavigate={() => setOpen(false)} />
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
