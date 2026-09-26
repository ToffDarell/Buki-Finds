'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ListingsIcon, LogOutIcon, PlusIcon, UserIcon } from '@/app/components/icons'

// The one place that signs a user out (navbar dropdown and phone sheet both use it).
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
  'flex min-h-12 w-full items-center gap-3 px-4 text-left text-[15px] text-ink transition-colors hover:bg-surface focus-visible:bg-surface focus-visible:outline-none'

// Shared contents: the signed-in student's ID-card header, then where they can go.
// `firstRef` receives the first link so the menu can take focus when it opens.
function ProfileMenuItems({ user, onChoose, firstRef }) {
  const logout = useLogout()
  return (
    <>
      <div className="relative bg-primary px-4 pb-3.5 pt-6">
        <span aria-hidden="true" className="absolute left-1/2 top-2 h-1.5 w-10 -translate-x-1/2 rounded-full bg-white shadow-[inset_0_1px_1px_rgb(6_36_63/0.35)]" />
        <p className="truncate text-base font-semibold leading-tight text-white">{displayName(user)}</p>
        {user?.email && <p className="mt-0.5 truncate text-sm text-on-primary-muted">{user.email}</p>}
      </div>
      <ul className="py-1.5">
        <li>
          <Link ref={firstRef} href="/my-listings" onClick={onChoose} className={row}>
            <ListingsIcon className="h-5 w-5 text-muted" />
            My Listings
          </Link>
        </li>
        <li>
          <Link href="/post" onClick={onChoose} className={row}>
            <PlusIcon className="h-5 w-5 text-accent" />
            Post Item
          </Link>
        </li>
        <li className="mt-1.5 border-t border-line pt-1.5">
          <button
            onClick={() => {
              onChoose()
              logout()
            }}
            className={row}
          >
            <LogOutIcon className="h-5 w-5 text-muted" />
            Log out
          </button>
        </li>
      </ul>
    </>
  )
}

// Desktop: a profile button in the navbar that drops the menu below it.
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
        className={`inline-flex items-center gap-1.5 rounded-md py-1.5 pl-1.5 pr-2.5 text-sm font-medium transition-colors ${
          open ? 'bg-white/15 text-white' : 'text-white hover:bg-white/10'
        }`}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15">
          <UserIcon className="h-4 w-4" />
        </span>
        <span className="max-w-32 truncate">{displayName(user).split(' ')[0]}</span>
      </button>
      {open && (
        <div
          ref={panelRef}
          id="profile-dropdown"
          className="menu-drop absolute right-0 top-full z-40 mt-2 w-64 overflow-hidden rounded-[12px] border border-line bg-white shadow-card-lift"
        >
          <ProfileMenuItems user={user} onChoose={() => setOpen(false)} firstRef={firstRef} />
        </div>
      )}
    </div>
  )
}

// Phone: the same menu as a bottom sheet, shaped like an ID card sliding up out of the tab bar.
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
      // Keep Tab inside the sheet while it is open.
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
      <div aria-hidden="true" onClick={onClose} className="backdrop-in absolute inset-0 bg-ink/40" />
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label="Profile"
        className="sheet-up absolute inset-x-0 bottom-0 overflow-hidden rounded-t-[16px] bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgb(6_36_63/0.1)]"
      >
        <ProfileMenuItems user={user} onChoose={onClose} firstRef={firstRef} />
        <div className="px-4 pb-3">
          <button
            onClick={onClose}
            className="min-h-12 w-full rounded-md border border-line text-[15px] font-semibold text-ink transition-colors hover:bg-surface"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
