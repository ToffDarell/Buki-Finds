'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { HeartIcon, ListingsIcon, LogOutIcon, PlusIcon, UserIcon } from '@/app/components/icons'

export function useLogout() {
  const router = useRouter()
  return async () => {
    await supabase.auth.signOut()
    router.push('/')
  }
}

function displayName(user) {
  return user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Student'
}

const row =
  'flex min-h-11 w-full items-center gap-3 px-4 text-left text-sm font-medium text-ink transition-colors hover:bg-surface focus-visible:bg-surface focus-visible:outline-none'

function ProfileMenuItems({ user, onChoose, firstRef }) {
  const logout = useLogout()
  const initial = (displayName(user)[0] || 'U').toUpperCase()
  // Native modal dialog: sits above the menu, traps focus and closes on Escape by itself.
  const confirmRef = useRef(null)
  const [loggingOut, setLoggingOut] = useState(false)

  async function confirmLogout() {
    setLoggingOut(true)
    await logout()
    confirmRef.current?.close()
    onChoose()
  }

  return (
    <>
      <div className="flex items-center gap-3 bg-primary p-4 text-white">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/20 text-base font-bold text-white shadow-xs backdrop-blur-xs">
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold leading-tight">{displayName(user)}</p>
          {user?.email && <p className="mt-0.5 truncate text-xs text-on-primary-muted">{user.email}</p>}
        </div>
      </div>
      <ul className="py-2">
        <li>
          <Link ref={firstRef} href="/my-listings" onClick={onChoose} className={row}>
            <ListingsIcon className="h-4 w-4 text-muted" />
            My Listings
          </Link>
        </li>
        <li>
          <Link href="/saved" onClick={onChoose} className={row}>
            <HeartIcon className="h-4 w-4 text-muted" />
            Saved
          </Link>
        </li>
        <li>
          <Link href={`/seller/${user.id}`} onClick={onChoose} className={row}>
            <UserIcon className="h-4 w-4 text-muted" />
            My Profile &amp; Reviews
          </Link>
        </li>
        <li>
          <Link href="/post" onClick={onChoose} className={row}>
            <PlusIcon className="h-4 w-4 text-accent" />
            Post Item
          </Link>
        </li>
        <li className="mt-1 border-t border-line pt-1">
          <button onClick={() => confirmRef.current?.showModal()} aria-haspopup="dialog" className={`${row} text-red-600 hover:bg-red-50`}>
            <LogOutIcon className="h-4 w-4 text-red-500" />
            Log out
          </button>
        </li>
      </ul>

      <dialog
        ref={confirmRef}
        aria-labelledby="logout-title"
        aria-describedby="logout-body"
        onClick={(e) => e.target === confirmRef.current && !loggingOut && confirmRef.current.close()}
        className="m-auto w-[min(22rem,calc(100%-2rem))] rounded-2xl border border-line bg-white p-0 text-ink shadow-card-lift backdrop:bg-ink/40"
      >
        <div className="p-5">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600">
            <LogOutIcon className="h-5 w-5" />
          </span>
          <h2 id="logout-title" className="mt-3 text-lg font-bold">Log out of Buki-Finds?</h2>
          <p id="logout-body" className="mt-1 text-sm text-muted">
            You’ll need to log in again to post items, message sellers, and see your saved listings.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <button
              autoFocus
              onClick={() => confirmRef.current?.close()}
              disabled={loggingOut}
              className="min-h-11 rounded-md border border-line bg-white text-sm font-semibold text-ink transition-colors hover:bg-surface disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              onClick={confirmLogout}
              disabled={loggingOut}
              className="min-h-11 rounded-md bg-red-600 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
            >
              {loggingOut ? 'Logging out…' : 'Log Out'}
            </button>
          </div>
        </div>
      </dialog>
    </>
  )
}

// Desktop: profile button in navbar with dropdown
export function ProfileDropdown({ user }) {
  const [open, setOpen] = useState(false)
  const buttonRef = useRef(null)
  const panelRef = useRef(null)
  const firstRef = useRef(null)

  useEffect(() => {
    if (!open) return
    firstRef.current?.focus()
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

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="profile-dropdown"
        aria-label={`${displayName(user)}, profile menu`}
        className={`inline-flex items-center gap-2 rounded-xl py-1 pl-1.5 pr-2.5 text-sm font-semibold transition-colors ${
          open ? 'bg-white/20 text-white' : 'text-white hover:bg-white/10'
        }`}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white shadow-xs">
          {(displayName(user)[0] || 'U').toUpperCase()}
        </span>
        <span className="max-w-32 truncate">{displayName(user).split(' ')[0]}</span>
      </button>
      {open && (
        <div
          ref={panelRef}
          id="profile-dropdown"
          className="menu-drop absolute right-0 top-full z-40 mt-2 w-64 overflow-hidden rounded-2xl border border-line bg-white shadow-lg"
        >
          <ProfileMenuItems user={user} onChoose={() => setOpen(false)} firstRef={firstRef} />
        </div>
      )}
    </div>
  )
}

// Mobile: bottom sheet
export function ProfileSheet({ user, open, onClose }) {
  const sheetRef = useRef(null)
  const firstRef = useRef(null)

  useEffect(() => {
    if (!open) return
    firstRef.current?.focus()
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab' && sheetRef.current) {
        const items = sheetRef.current.querySelectorAll('a[href], button')
        const first = items[0]
        const last = items[items.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = overflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-40 md:hidden">
      <div aria-hidden="true" onClick={onClose} className="backdrop-in absolute inset-0 bg-ink/40 backdrop-blur-xs" />
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label="Profile"
        className="sheet-up absolute inset-x-0 bottom-0 overflow-hidden rounded-t-2xl bg-white pb-[env(safe-area-inset-bottom)] shadow-2xl"
      >
        <ProfileMenuItems user={user} onChoose={onClose} firstRef={firstRef} />
        <div className="px-4 pb-4 pt-1">
          <button
            onClick={onClose}
            className="min-h-11 w-full rounded-xl border border-line text-sm font-semibold text-ink transition-colors hover:bg-surface"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
