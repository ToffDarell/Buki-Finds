'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/lib/useAuth'
import {
  IMAGE_BUCKET,
  LISTING_WITH_IMAGES,
  coverImage,
  doneLabel,
  listingNumber,
  fallbackToFull,
  priceOrSwap,
  purgeDateLabel,
  sortedImages,
  staleState,
} from '@/lib/listings'
import { imageStoragePaths, thumbUrl } from '@/lib/images'
import { freeLimitMessage, isFreeLimitError } from '@/lib/subscription'
import useDialog from '@/app/components/useDialog'
import { CameraIcon, CheckIcon, PencilIcon, PlusIcon, TrashIcon, UndoIcon } from '@/app/components/icons'

function StatusStamp({ listing }) {
  if (listing.status === 'reserved') {
    return (
      <span className="rounded-full border border-primary/25 bg-primary-soft px-2.5 py-0.5 text-xs font-semibold text-primary">
        Reserved
      </span>
    )
  }
  return listing.status === 'sold' ? (
    <span className="rounded-full bg-ink px-2.5 py-0.5 text-xs font-semibold text-white">
      {doneLabel(listing)}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent-hover">
      <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
      Available
    </span>
  )
}

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'available', label: 'Available' },
  { id: 'reserved', label: 'Reserved' },
  { id: 'sold', label: 'Sold' },
]

const action =
  'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50'

function ListingRowSkeleton() {
  return (
    <div className="flex animate-pulse overflow-hidden rounded-xl border border-line bg-white p-3 shadow-xs">
      <div className="h-20 w-20 shrink-0 rounded-lg bg-surface sm:h-24 sm:w-24" />
      <div className="ml-3 flex flex-1 flex-col gap-2 py-1">
        <div className="h-4 w-24 rounded bg-line" />
        <div className="h-5 w-3/4 rounded bg-line/80" />
        <div className="h-4 w-16 rounded bg-primary/15" />
        <div className="mt-auto flex gap-2">
          <div className="h-6 w-14 rounded bg-surface" />
          <div className="h-6 w-24 rounded bg-surface" />
        </div>
      </div>
    </div>
  )
}

export default function MyListingsPage() {
  const router = useRouter()
  const { user, loading: userLoading } = useUser()
  const [result, setResult] = useState({ loaded: false, listings: [], error: '' })
  const [tab, setTab] = useState('all')
  const [busyId, setBusyId] = useState(null)
  const [dialog, { confirm, alert: showAlert }] = useDialog()

  useEffect(() => {
    if (!userLoading && !user) router.replace('/login?next=/my-listings')
  }, [userLoading, user, router])

  useEffect(() => {
    if (!user) return
    let cancelled = false
    supabase
      .from('listings')
      .select(LISTING_WITH_IMAGES)
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!cancelled) setResult({ loaded: true, listings: data ?? [], error: error?.message ?? '' })
      })
    return () => {
      cancelled = true
    }
  }, [user])

  async function setStatus(listing, status) {
    setBusyId(listing.id)
    const { data, error } = await supabase
      .from('listings')
      .update({ status })
      .eq('id', listing.id)
      .select('status, sold_at')
      .single()
    if (error) showAlert({ title: 'Couldn’t update the listing', body: isFreeLimitError(error.message) ? freeLimitMessage(error.message) : error.message })
    else
      setResult((prev) => ({
        ...prev,
        listings: prev.listings.map((l) => (l.id === listing.id ? { ...l, ...data } : l)),
      }))
    setBusyId(null)
  }

  // "Still available?": the database stamps the time itself (migration 019).
  async function confirmAvailable(listing) {
    setBusyId(listing.id)
    const { data, error } = await supabase
      .from('listings')
      .update({ confirmed_at: new Date().toISOString() })
      .eq('id', listing.id)
      .select('confirmed_at')
      .single()
    if (error) showAlert({ title: 'Couldn’t update the listing', body: error.message })
    else
      setResult((prev) => ({
        ...prev,
        listings: prev.listings.map((l) => (l.id === listing.id ? { ...l, ...data } : l)),
      }))
    setBusyId(null)
  }

  async function handleDelete(listing) {
    const ok = await confirm({
      title: `Delete “${listing.title}”?`,
      body: 'This removes the listing and its photos. This can’t be undone.',
      action: 'Delete',
    })
    if (!ok) return
    setBusyId(listing.id)
    const { error } = await supabase.from('listings').delete().eq('id', listing.id)
    if (error) {
      showAlert({ title: 'Couldn’t delete the listing', body: error.message })
      setBusyId(null)
      return
    }
    const paths = imageStoragePaths(sortedImages(listing).map((img) => img.image_url))
    if (paths.length) await supabase.storage.from(IMAGE_BUCKET).remove(paths)
    setResult((prev) => ({ ...prev, listings: prev.listings.filter((l) => l.id !== listing.id) }))
    setBusyId(null)
  }

  const isLoading = userLoading || !result.loaded
  const { listings, error } = result
  const counts = {
    all: listings.length,
    available: listings.filter((l) => l.status === 'available').length,
    reserved: listings.filter((l) => l.status === 'reserved').length,
    sold: listings.filter((l) => l.status === 'sold').length,
  }
  const shown = tab === 'all' ? listings : listings.filter((l) => l.status === tab)

  return (
    <main className="flex-1 bg-surface py-6 sm:py-8">
      {dialog}
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">My Listings</h1>
            <p className="mt-1 text-xs text-muted sm:text-sm">Manage items you are selling or swapping.</p>
          </div>
          <Link
            href="/post"
            className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-white shadow-xs transition-colors hover:bg-accent-hover"
          >
            <PlusIcon className="h-4 w-4" />
            Post Item
          </Link>
        </div>

        {/* Tab switcher */}
        <div className="mt-6 flex gap-2 overflow-x-auto border-b border-line pb-px [scrollbar-width:none]">
          {TABS.map((t) => {
            const active = tab === t.id
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.id)}
                className={`-mb-px shrink-0 border-b-2 px-3.5 pb-2.5 text-sm font-semibold transition-all ${
                  active ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-ink'
                }`}
              >
                {t.label} {!isLoading && <span className="tabular ml-1 text-xs text-muted">({counts[t.id]})</span>}
              </button>
            )
          })}
        </div>

        {error && <p className="mt-6 text-sm text-red-600">Couldn’t load listings: {error}</p>}

        {isLoading ? (
          <div className="mt-5 flex flex-col gap-3">
            <ListingRowSkeleton />
            <ListingRowSkeleton />
            <ListingRowSkeleton />
          </div>
        ) : listings.length === 0 ? (
          <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-line bg-white p-8 text-center shadow-xs sm:p-12">
            <p className="text-xl font-bold text-ink">You haven’t posted anything yet.</p>
            <p className="mt-1.5 max-w-sm text-xs text-muted sm:text-sm">
              Old uniforms, textbooks, shoes, or electronics? Someone on campus needs them.
            </p>
            <Link
              href="/post"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-accent-hover"
            >
              <PlusIcon className="h-4 w-4" />
              Post your first item
            </Link>
          </div>
        ) : shown.length === 0 ? (
          <div className="mt-8 rounded-xl border border-line bg-white p-8 text-center text-sm text-muted shadow-xs">
            No {tab} listings found.
          </div>
        ) : (
          <ul className="mt-5 flex flex-col gap-3">
            {shown.map((listing) => {
              const cover = coverImage(listing)
              const sold = listing.status === 'sold'
              const busy = busyId === listing.id
              const stale = staleState(listing)
              return (
                <li
                  key={listing.id}
                  className="flex overflow-hidden rounded-xl border border-line bg-white p-3 shadow-xs transition-all hover:border-primary/30 hover:shadow-md"
                >
                  <Link
                    href={`/item/${listing.id}`}
                    className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-surface ring-1 ring-line sm:h-24 sm:w-24"
                  >
                    {cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={thumbUrl(cover)}
                        onError={fallbackToFull(cover)}
                        alt=""
                        className={`h-full w-full object-cover ${sold ? 'grayscale' : ''}`}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted">
                        <CameraIcon className="h-6 w-6 text-muted/50" />
                      </div>
                    )}
                  </Link>

                  <div className="ml-3 flex min-w-0 flex-1 flex-col py-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusStamp listing={listing} />
                      <span className="font-mono text-xs text-muted">No. {listingNumber(listing)}</span>
                    </div>

                    <Link
                      href={`/item/${listing.id}`}
                      className="mt-1 truncate text-sm font-semibold text-ink transition-colors hover:text-primary sm:text-base"
                    >
                      {listing.title}
                    </Link>

                    <p className={`tabular text-base font-bold sm:text-lg ${sold ? 'text-muted' : 'text-primary'}`}>
                      {priceOrSwap(listing)}
                    </p>

                    {purgeDateLabel(listing) && (
                      <p className="text-xs text-muted">Deletes automatically on {purgeDateLabel(listing)}</p>
                    )}

                    {stale && (
                      <p className={`text-xs ${stale === 'hidden' ? 'font-semibold text-ink' : 'text-muted'}`}>
                        {stale === 'hidden' ? 'Hidden from Browse. Still have it? Tap Still Available.' : 'Still have this? Let buyers know.'}
                      </p>
                    )}

                    <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
                      {stale && (
                        <button
                          onClick={() => confirmAvailable(listing)}
                          disabled={busy}
                          className={`${action} bg-primary text-white hover:bg-primary-hover`}
                        >
                          <CheckIcon className="h-3.5 w-3.5" />
                          Still Available
                        </button>
                      )}

                      <Link
                        href={`/item/${listing.id}/edit`}
                        className={`${action} text-primary hover:bg-primary-soft`}
                      >
                        <PencilIcon className="h-3.5 w-3.5" />
                        Edit
                      </Link>

                      {listing.status === 'available' && (
                        <button
                          onClick={() => setStatus(listing, 'reserved')}
                          disabled={busy}
                          className={`${action} text-ink hover:bg-surface`}
                        >
                          Mark as Reserved
                        </button>
                      )}

                      {listing.status !== 'available' && (
                        <button
                          onClick={() => setStatus(listing, 'available')}
                          disabled={busy}
                          className={`${action} text-ink hover:bg-surface`}
                        >
                          <UndoIcon className="h-3.5 w-3.5" />
                          Mark as Available
                        </button>
                      )}

                      {!sold && (
                        <button
                          onClick={() => setStatus(listing, 'sold')}
                          disabled={busy}
                          className={`${action} text-ink hover:bg-surface`}
                        >
                          <CheckIcon className="h-3.5 w-3.5" />
                          {`Mark as ${doneLabel(listing)}`}
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(listing)}
                        disabled={busy}
                        className={`${action} text-red-600 hover:bg-red-50`}
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </main>
  )
}
