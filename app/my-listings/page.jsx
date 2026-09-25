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
  formatPrice,
  listingNumber,
  fallbackToFull,
  sortedImages,
} from '@/lib/listings'
import { imageStoragePaths, thumbUrl } from '@/lib/images'
import { CameraIcon, CheckIcon, PencilIcon, PlusIcon, TrashIcon, UndoIcon } from '@/app/components/icons'

function StatusStamp({ status }) {
  return status === 'sold' ? (
    <span className="rounded-sm bg-ink px-2 py-0.5 text-xs font-semibold text-white">
      Sold
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-sm border border-primary/25 bg-primary-soft px-2 py-0.5 text-xs font-semibold text-primary">
      <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
      Available
    </span>
  )
}

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'available', label: 'Available' },
  { id: 'sold', label: 'Sold' },
]

const action =
  'inline-flex items-center gap-1.5 rounded-sm px-2 py-1.5 text-sm font-medium transition-colors disabled:opacity-50'

export default function MyListingsPage() {
  const router = useRouter()
  const { user, loading: userLoading } = useUser()
  const [result, setResult] = useState({ loaded: false, listings: [], error: '' })
  const [tab, setTab] = useState('all')
  const [busyId, setBusyId] = useState(null)

  useEffect(() => {
    if (!userLoading && !user) router.replace('/login')
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

  async function toggleSold(listing) {
    setBusyId(listing.id)
    const status = listing.status === 'sold' ? 'available' : 'sold'
    const { error } = await supabase.from('listings').update({ status }).eq('id', listing.id)
    if (error) alert(`Couldn’t update the listing: ${error.message}`)
    else
      setResult((prev) => ({
        ...prev,
        listings: prev.listings.map((l) => (l.id === listing.id ? { ...l, status } : l)),
      }))
    setBusyId(null)
  }

  async function handleDelete(listing) {
    if (!confirm(`Delete “${listing.title}”? This can’t be undone.`)) return
    setBusyId(listing.id)
    const { error } = await supabase.from('listings').delete().eq('id', listing.id)
    if (error) {
      alert(`Couldn’t delete the listing: ${error.message}`)
      setBusyId(null)
      return
    }
    const paths = imageStoragePaths(sortedImages(listing).map((img) => img.image_url))
    if (paths.length) await supabase.storage.from(IMAGE_BUCKET).remove(paths)
    setResult((prev) => ({ ...prev, listings: prev.listings.filter((l) => l.id !== listing.id) }))
    setBusyId(null)
  }

  if (userLoading || !user || !result.loaded) {
    return <main className="flex-1 p-6 text-muted">Loading…</main>
  }

  const { listings, error } = result
  const counts = {
    all: listings.length,
    available: listings.filter((l) => l.status === 'available').length,
    sold: listings.filter((l) => l.status === 'sold').length,
  }
  const shown = tab === 'all' ? listings : listings.filter((l) => l.status === tab)

  return (
    <main className="flex-1 bg-surface">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="card-type text-3xl font-bold leading-none text-ink sm:text-4xl">My Listings</h1>
          <Link
            href="/post"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            <PlusIcon className="h-4 w-4" />
            Post Item
          </Link>
        </div>

        {listings.length > 0 && (
          <div className="mt-6 flex gap-6 border-b border-line" role="tablist" aria-label="Filter by status">
            {TABS.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={`-mb-px border-b-[3px] pb-2.5 text-sm font-medium transition-colors ${
                  tab === t.id ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-ink'
                }`}
              >
                {t.label} <span className="tabular text-muted">{counts[t.id]}</span>
              </button>
            ))}
          </div>
        )}

        {error && <p className="mt-6 text-red-700">Couldn’t load your listings: {error}</p>}

        {!error && listings.length === 0 && (
          <div className="mt-8 flex flex-col items-center rounded-[10px] border border-dashed border-line bg-white px-6 py-14 text-center">
            <p className="card-type text-2xl font-bold text-ink">You haven’t posted anything yet.</p>
            <p className="mt-1 max-w-sm text-sm text-muted">Old uniform, shoes you’ve outgrown, last sem’s books? Someone on campus needs them.</p>
            <Link href="/post" className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover">
              Post your first item
            </Link>
          </div>
        )}

        {listings.length > 0 && shown.length === 0 && (
          <p className="mt-8 text-center text-sm text-muted">No {tab} listings.</p>
        )}

        <ul className="mt-5 flex flex-col gap-3">
          {shown.map((listing) => {
            const cover = coverImage(listing)
            const sold = listing.status === 'sold'
            const busy = busyId === listing.id
            return (
              <li
                key={listing.id}
                className="flex overflow-hidden rounded-[10px] border border-line bg-white shadow-card"
              >
                <Link
                  href={`/item/${listing.id}`}
                  className="m-3 h-20 w-20 shrink-0 overflow-hidden rounded-sm bg-surface ring-1 ring-line sm:h-24 sm:w-24"
                >
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thumbUrl(cover)} onError={fallbackToFull(cover)} alt="" className={`h-full w-full object-cover ${sold ? 'grayscale' : ''}`} />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted">
                      <CameraIcon className="h-6 w-6" />
                    </div>
                  )}
                </Link>

                <div className="flex min-w-0 flex-1 flex-col py-3 pr-3">
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                    <StatusStamp status={listing.status} />
                    <span className="font-mono text-xs text-muted">No. {listingNumber(listing)}</span>
                  </div>
                  <Link href={`/item/${listing.id}`} className="mt-1 truncate font-medium text-ink hover:underline">
                    {listing.title}
                  </Link>
                  <p className={`card-type tabular text-xl font-bold leading-tight ${sold ? 'text-muted' : 'text-primary'}`}>
                    {formatPrice(listing.price)}
                  </p>

                  <div className="-ml-2 mt-auto flex flex-wrap gap-x-1 pt-1.5">
                    <Link href={`/item/${listing.id}/edit`} className={`${action} text-primary hover:bg-primary-soft`}>
                      <PencilIcon className="h-4 w-4" />
                      Edit
                    </Link>
                    <button onClick={() => toggleSold(listing)} disabled={busy} className={`${action} text-ink hover:bg-surface`}>
                      {sold ? <UndoIcon className="h-4 w-4" /> : <CheckIcon className="h-4 w-4" />}
                      {sold ? 'Mark as Available' : 'Mark as Sold'}
                    </button>
                    <button onClick={() => handleDelete(listing)} disabled={busy} className={`${action} text-red-700 hover:bg-red-50`}>
                      <TrashIcon className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </main>
  )
}
