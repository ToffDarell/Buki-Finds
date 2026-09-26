'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser } from '@/lib/useAuth'
import { ProfileDropdown } from '@/app/components/ProfileMenu'
import { BrowseIcon, HeartIcon, ListingsIcon, PlusIcon, UserIcon } from '@/app/components/icons'

// The official Buki-Finds logo: a round mark on white, so it sits in a white circle on the blue strip.
function Mark() {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white">
      <Image src="/LOGO%20BUKIFINDS.jpg" alt="" width={36} height={36} priority className="h-9 w-9 object-cover" />
    </span>
  )
}

// Same glyphs as the phone tab bar, so a place looks the same on every device.
function NavLink({ href, icon: Icon, children }) {
  const active = usePathname() === href
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      // Faded white is too low-contrast on the green bar, so links stay full white and the
      // active one is marked by its underline (hover previews a fainter one).
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

  return (
    // The top bar wears the logo green (owner's choice). Focus rings go white so they show on it.
    <header className="bg-accent [&_:focus-visible]:outline-white">
      {/* Phones show only the wordmark here; the bottom tab bar carries navigation and Post Item. */}
      <nav className="mx-auto flex max-w-7xl items-center gap-8 px-4 py-2.5 sm:px-6 md:py-3">
        <Link href="/" className="flex items-center gap-2.5 text-white" aria-label="Buki-Finds home">
          <Mark />
          <span className="card-type text-lg font-bold">Buki-Finds</span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <NavLink href="/" icon={BrowseIcon}>Browse</NavLink>
          {user && <NavLink href="/saved" icon={HeartIcon}>Saved</NavLink>}
          {user && <NavLink href="/my-listings" icon={ListingsIcon}>My Listings</NavLink>}
        </div>

        <div className="ml-auto hidden items-center gap-4 md:flex">
          <Link
            href="/post"
            className="inline-flex items-center gap-1.5 rounded-md bg-white px-3.5 py-2 text-sm font-semibold text-accent transition-colors hover:bg-accent-soft"
          >
            <PlusIcon className="h-4 w-4" />
            Post Item
          </Link>
          {!loading && (user ? <ProfileDropdown user={user} /> : <NavLink href="/login" icon={UserIcon}>Log in</NavLink>)}
        </div>
      </nav>
    </header>
  )
}
