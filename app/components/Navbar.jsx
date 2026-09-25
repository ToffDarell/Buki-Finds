'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/lib/useAuth'
import { PlusIcon } from '@/app/components/icons'

// Wordmark glyph: a lanyard ID with its slot punch.
function Mark() {
  return (
    <svg viewBox="0 0 24 30" aria-hidden="true" className="h-7 w-auto">
      <rect x="1" y="1" width="22" height="28" rx="3" fill="#fff" />
      <rect x="8" y="3.5" width="8" height="2" rx="1" fill="#1e3a8a" />
      <rect x="5" y="13" width="14" height="8" rx="1" fill="#1e3a8a" opacity=".18" />
      <rect x="5" y="23.5" width="9" height="2" rx="1" fill="#1e3a8a" />
    </svg>
  )
}

function NavLink({ href, children }) {
  const active = usePathname() === href
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`relative py-1 text-sm font-medium transition-colors ${
        active
          ? 'text-white after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-white'
          : 'text-on-primary-muted hover:text-white'
      }`}
    >
      {children}
    </Link>
  )
}

export default function Navbar() {
  const { user, loading } = useUser()
  const router = useRouter()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const links = (
    <>
      <NavLink href="/">Browse</NavLink>
      {user && <NavLink href="/my-listings">My Listings</NavLink>}
      {!loading &&
        (user ? (
          <button onClick={handleLogout} className="py-1 text-sm font-medium text-on-primary-muted transition-colors hover:text-white">
            Log out
          </button>
        ) : (
          <NavLink href="/login">Log in</NavLink>
        ))}
    </>
  )

  return (
    <header className="bg-primary">
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-8 gap-y-2 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 text-white" aria-label="Baligya Bukidnon home">
          <Mark />
          <span className="card-type text-lg font-bold">Baligya Bukidnon</span>
        </Link>

        <div className="hidden items-center gap-6 sm:flex">{links}</div>

        <Link
          href="/post"
          className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-white px-3.5 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary-soft"
        >
          <PlusIcon className="h-4 w-4" />
          Post Item
        </Link>

        <div className="flex w-full items-center gap-6 border-t border-white/10 pt-2 sm:hidden">{links}</div>
      </nav>
    </header>
  )
}
