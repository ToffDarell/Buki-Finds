'use client'

import { useCallback, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser } from '@/lib/useAuth'
import { useIsClient } from '@/lib/useIsClient'
import { ProfileSheet } from '@/app/components/ProfileMenu'
import Avatar from '@/app/components/Avatar'
import { avatarUrl, displayName } from '@/lib/avatar'
import { BrowseIcon, HeartIcon, ListingsIcon, PlusIcon, UserIcon } from '@/app/components/icons'

const ITEM_DETAIL = /^\/item\/[^/]+$/

const tabClass = (active) =>
  `relative flex min-h-14 flex-col items-center justify-center gap-1 text-xs transition-colors ${
    active
      ? 'font-bold text-primary before:absolute before:inset-x-4 before:top-0 before:h-[3px] before:rounded-b-full before:bg-primary'
      : 'font-medium text-muted hover:text-ink'
  }`

function Tab({ href, icon: Icon, label, active }) {
  return (
    <Link href={href} aria-current={active ? 'page' : undefined} className={tabClass(active)}>
      <Icon className="h-5 w-5 transition-transform motion-safe:active:scale-90" />
      <span>{label}</span>
    </Link>
  )
}

export default function BottomNav() {
  const pathname = usePathname()
  const { user, loading } = useUser()
  const [sheetOpen, setSheetOpen] = useState(false)
  const mounted = useIsClient()
  const profileRef = useRef(null)

  const closeSheet = useCallback(() => {
    setSheetOpen(false)
    profileRef.current?.focus()
  }, [])

  if (ITEM_DETAIL.test(pathname)) return null
  const posting = pathname === '/post'

  return (
    <>
      <div aria-hidden="true" className="h-[calc(4rem+env(safe-area-inset-bottom))] shrink-0 md:hidden" />

      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgb(11_19_43/0.06)] backdrop-blur-md md:hidden"
      >
        <div className="mx-auto grid max-w-lg grid-cols-5">
          <Tab href="/" icon={BrowseIcon} label="Browse" active={pathname === '/'} />

          <Tab href="/saved" icon={HeartIcon} label="Saved" active={pathname === '/saved'} />

          <Link href="/post" aria-current={posting ? 'page' : undefined} className={tabClass(posting)}>
            <span className="flex h-7 w-9 items-center justify-center rounded-lg bg-accent text-white shadow-xs transition-transform motion-safe:active:scale-95">
              <PlusIcon className="h-5 w-5" strokeWidth="2.25" />
            </span>
            <span className="text-xs font-bold">Post</span>
          </Link>

          <Tab href="/my-listings" icon={ListingsIcon} label="Listings" active={pathname === '/my-listings'} />

          {!mounted || loading ? (
            <span aria-hidden="true" className={`${tabClass(false)} opacity-50`}>
              <UserIcon className="h-5 w-5" />
              <span>Profile</span>
            </span>
          ) : user ? (
            <button
              ref={profileRef}
              onClick={() => setSheetOpen(true)}
              aria-expanded={sheetOpen}
              aria-haspopup="dialog"
              className={tabClass(sheetOpen)}
            >
              {avatarUrl(user) ? (
                <Avatar src={avatarUrl(user)} name={displayName(user)} bg="bg-primary" className="h-6 w-6 text-[10px]" />
              ) : (
                <UserIcon className="h-5 w-5 transition-transform motion-safe:active:scale-90" />
              )}
              <span>Profile</span>
            </button>
          ) : (
            <Tab href="/login" icon={UserIcon} label="Log in" active={pathname === '/login'} />
          )}
        </div>
      </nav>

      {mounted && user && <ProfileSheet user={user} open={sheetOpen} onClose={closeSheet} />}
    </>
  )
}
