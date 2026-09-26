'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/lib/useAuth'
import { useSavedIds } from '@/lib/useSaved'
import { LISTING_WITH_IMAGES } from '@/lib/listings'
import ListingCard, { ListingCardSkeleton } from '@/app/components/ListingCard'
import { HeartIcon } from '@/app/components/icons'

export default function SavedPage() {
  const router = useRouter()
  const { user, loading: userLoading } = useUser()
  const savedIds = useSavedIds()
  const [result, setResult] = useState({ loaded: false, listings: [], error: '' })

  useEffect(() => {
    if (!userLoading && !user) router.replace('/login?next=/saved')
  }, [userLoading, user, router])

  useEffect(() => {
    if (!user) return
    let cancelled = false
    supabase
      .from('saved_listings')
      .select(`created_at, listings(${LISTING_WITH_IMAGES})`)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return
        const listings = (data ?? []).map((row) => row.listings).filter(Boolean)
        setResult({ loaded: true, listings, error: error?.message ?? '' })
      })
    return () => {
      cancelled = true
    }
  }, [user])

  const shown = result.listings.filter((l) => savedIds.has(l.id))
  const isLoading = userLoading || !result.loaded

  return (
    <main className="flex-1 bg-surface py-6 sm:py-8">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">Saved Items</h1>
          <p className="mt-1 text-xs text-muted sm:text-sm">Listings you tapped the heart on.</p>
        </div>

        {result.error && (
          <p role="alert" className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            Couldn’t load saved listings: {result.error}
          </p>
        )}

        {isLoading ? (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <ListingCardSkeleton key={i} index={i} />
            ))}
          </div>
        ) : shown.length === 0 ? (
          <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-line bg-white p-8 text-center shadow-xs sm:p-12">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-primary shadow-xs">
              <HeartIcon className="h-7 w-7" />
            </span>
            <h2 className="mt-4 text-xl font-bold text-ink sm:text-2xl">Nothing saved yet</h2>
            <p className="mt-1.5 max-w-sm text-xs text-muted sm:text-sm">
              Tap the heart on any listing while browsing to easily compare prices, sizes, and meet-up spots.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-xs transition-colors hover:bg-primary-hover"
            >
              Browse Listings
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {shown.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
