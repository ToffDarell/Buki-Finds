'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser } from '@/lib/useAuth'
import { useIsClient } from '@/lib/useIsClient'
import { ProfileDropdown } from '@/app/components/ProfileMenu'
import { BrowseIcon, HeartIcon, ListingsIcon, PlusIcon, UserIcon } from '@/app/components/icons'

function Mark() {
  return (
    <Image
      src="/BUKI.png"
      alt="BukiMart"
      width={160}
      height={80}
      priority
      className="h-10 w-auto object-contain transition-transform hover:scale-[1.02] sm:h-11"
    />
  )
}

function NavLink({ href, icon: Icon, children }) {
  const active = usePathname() === href
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`relative inline-flex items-center gap-1.5 py-1 text-sm font-medium text-white transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:rounded-full ${
        active ? 'after:bg-white' : 'after:bg-transparent hover:after:bg-white/50'
      }`}
    >
      <Icon className="h-4 w-4" />
      {children}
    </Link>
  )
}

export default function Navbar() {
  const { user, loading } = useUser()
  const mounted = useIsClient()

  return (
    <header className="bg-primary shadow-xs [&_:focus-visible]:outline-white">
      <nav className="mx-auto flex max-w-7xl items-center gap-8 px-4 py-2.5 sm:px-6 md:py-3">
        {/* Signed-in students already know the site: the logo takes them to the listings.
            The landing page stays open to everyone at "/". */}
        <Link
          href={mounted && user ? '/browse' : '/'}
          className="flex items-center text-white"
          aria-label={mounted && user ? 'BukiMart, browse listings' : 'BukiMart home'}
        >
          <Mark />
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <NavLink href="/browse" icon={BrowseIcon}>Browse</NavLink>
          {mounted && user && <NavLink href="/saved" icon={HeartIcon}>Saved</NavLink>}
          {mounted && user && <NavLink href="/my-listings" icon={ListingsIcon}>My Listings</NavLink>}
        </div>

        <div className="ml-auto hidden items-center gap-4 md:flex">
          <Link
            href="/post"
            className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-sm font-bold text-white shadow-xs transition-colors hover:bg-accent-hover"
          >
            <PlusIcon className="h-4 w-4" />
            Post Item
          </Link>
          {!mounted || loading ? (
            <span className="inline-block h-8 w-16" />
          ) : user ? (
            <ProfileDropdown user={user} />
          ) : (
            <NavLink href="/login" icon={UserIcon}>Log in</NavLink>
          )}
        </div>
      </nav>
    </header>
  )
}
