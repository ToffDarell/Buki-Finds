'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/lib/useAuth'
import { LISTING_WITH_IMAGES } from '@/lib/listings'
import ListingForm from '@/app/components/ListingForm'
import { ArrowLeftIcon } from '@/app/components/icons'

export default function EditListingPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user, loading: userLoading } = useUser()
  const [result, setResult] = useState({ loaded: false, listing: null, error: '' })

  useEffect(() => {
    if (!userLoading && !user) router.replace('/login')
  }, [userLoading, user, router])

  useEffect(() => {
    let cancelled = false
    supabase
      .from('listings')
      .select(LISTING_WITH_IMAGES)
      .eq('id', id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!cancelled) setResult({ loaded: true, listing: data, error: error?.message ?? '' })
      })
    return () => {
      cancelled = true
    }
  }, [id])

  if (userLoading || !user || !result.loaded) {
    return <main className="flex-1 p-6 text-muted">Loading…</main>
  }
  if (result.error) return <main className="flex-1 p-6 text-red-600">Error: {result.error}</main>

  // RLS blocks the save anyway; this just avoids showing the form to non-owners.
  if (!result.listing || result.listing.seller_id !== user.id) {
    return (
      <main className="flex-1 p-6">
        <p className="card-type text-2xl font-bold text-ink">You can only edit your own listings.</p>
        <Link href="/my-listings" className="text-primary hover:underline">Go to My Listings</Link>
      </main>
    )
  }

  return (
    <main className="flex-1 bg-surface">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        <Link href={`/item/${id}`} className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
          <ArrowLeftIcon className="h-4 w-4" />
          Back to listing
        </Link>
        <h1 className="card-type mb-7 text-3xl font-bold leading-none text-ink sm:text-4xl">Edit listing</h1>
        <ListingForm user={user} listing={result.listing} onSaved={() => router.push(`/item/${id}`)} />
      </div>
    </main>
  )
}
