'use client'

import { useCallback, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser } from '@/lib/useAuth'
import { ProfileSheet } from '@/app/components/ProfileMenu'
import { BrowseIcon, ListingsIcon, PlusIcon, UserIcon } from '@/app/components/icons'

// The item page has its own bottom bar (price + Message Seller), so the tabs step aside there.
const ITEM_DETAIL = /^\/item\/[^/]+$/

// Active is marked twice: navy semibold text and a 3px navy bar on the top edge (color alone isn't enough).
const tabClass = (active) =>
  `relative flex min-h-14 flex-col items-center justify-center gap-1 text-xs transition-colors ${
    active
      ? 'font-semibold text-primary before:absolute before:inset-x-5 before:top-0 before:h-[3px] before:rounded-b-full before:bg-primary'
      : 'font-medium text-muted'
  }`

function Tab({ href, icon: Icon, label, active }) {
  return (
    <Link href={href} aria-current={active ? 'page' : undefined} className={tabClass(active)}>
      <Icon className="h-6 w-6 transition-transform motion-safe:active:scale-90" />
      {label}
    </Link>
  )
}

// Phone-only tab bar in the Carousell pattern. No chat tab: students contact sellers on Messenger.
export default function BottomNav() {
  const pathname = usePathname()
  const { user, loading } = useUser()
  const [sheetOpen, setSheetOpen] = useState(false)
  const profileRef = useRef(null)

  const closeSheet = useCallback(() => {
    setSheetOpen(false)
    profileRef.current?.focus()
  }, [])

  if (ITEM_DETAIL.test(pathname)) return null
  const posting = pathname === '/post'

  return (
    <>
      {/* Keeps the last row of content (and form submit buttons) clear of the fixed bar. */}
      <div aria-hidden="true" className="h-[calc(4rem+env(safe-area-inset-bottom))] shrink-0 md:hidden" />

      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_12px_rgb(6_36_63/0.06)] md:hidden"
      >
        <div className="mx-auto grid max-w-lg grid-cols-4">
          <Tab href="/" icon={BrowseIcon} label="Browse" active={pathname === '/'} />
          <Tab href="/my-listings" icon={ListingsIcon} label="My Listings" active={pathname === '/my-listings'} />

          {/* Post Item: the same green button, plus icon and wording as the desktop navbar, sized to sit in the bar. */}
          <Link href="/post" aria-current={posting ? 'page' : undefined} className={tabClass(posting)}>
            <span className="flex h-7 w-9 items-center justify-center rounded-md bg-accent text-white transition-transform motion-safe:active:scale-90">
              <PlusIcon className="h-5 w-5" strokeWidth="2.25" />
            </span>
            Post Item
          </Link>

          {loading ? (
            // Same size, not interactive, while the session loads: no jump and no wrong route.
            <span aria-hidden="true" className={`${tabClass(false)} opacity-60`}>
              <UserIcon className="h-6 w-6" />
              Profile
            </span>
          ) : user ? (
            <button
              ref={profileRef}
              onClick={() => setSheetOpen(true)}
              aria-expanded={sheetOpen}
              aria-haspopup="dialog"
              className={tabClass(sheetOpen)}
            >
              <UserIcon className="h-6 w-6 transition-transform motion-safe:active:scale-90" />
              Profile
            </button>
          ) : (
            <Tab href="/login" icon={UserIcon} label="Profile" active={pathname === '/login'} />
          )}
        </div>
      </nav>

      {user && <ProfileSheet user={user} open={sheetOpen} onClose={closeSheet} />}
    </>
  )
}
