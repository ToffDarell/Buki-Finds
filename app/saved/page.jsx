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
        // Deleted listings disappear from saved on their own (on delete cascade).
        const listings = (data ?? []).map((row) => row.listings).filter(Boolean)
        setResult({ loaded: true, listings, error: error?.message ?? '' })
      })
    return () => {
      cancelled = true
    }
  }, [user])

  // Unsaving from this page removes the card straight away.
  const shown = result.listings.filter((l) => savedIds.has(l.id))

  return (
    <main className="flex-1 bg-surface">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 md:py-8">
        <h1 className="card-type text-3xl font-bold leading-none text-ink sm:text-4xl">Saved</h1>
        <p className="mt-2 text-sm text-muted">Listings you tapped the heart on. Only you can see this list.</p>

        {result.error && (
          <p role="alert" className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            Couldn’t load your saved listings: {result.error}
          </p>
        )}

        {result.loaded && !result.error && shown.length === 0 ? (
          <div className="rise-in mt-6 flex flex-col items-center rounded-[12px] border border-line bg-white px-6 py-12 text-center shadow-card">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-primary">
              <HeartIcon className="h-7 w-7" />
            </span>
            <h2 className="card-type mt-4 text-2xl font-extrabold text-ink">Nothing saved yet.</h2>
            <p className="mt-2 max-w-sm text-sm text-muted">Tap the heart on any listing to keep it here while you compare sizes and prices.</p>
            <Link href="/" className="mt-6 inline-flex min-h-11 items-center rounded-md bg-primary px-5 text-[15px] font-semibold text-white hover:bg-primary-hover">
              Browse Listings
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-x-4 md:gap-y-6 lg:grid-cols-4">
            {!result.loaded
              ? Array.from({ length: 4 }, (_, i) => <ListingCardSkeleton key={i} index={i} />)
              : shown.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
          </div>
        )}
      </div>
    </main>
  )
}
