'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { BROWSE_STATUSES, LISTING_WITH_IMAGES } from '@/lib/listings'
import { formatRating } from '@/lib/reviews'
import { avatarUrl, displayName } from '@/lib/avatar'
import { useUser } from '@/lib/useAuth'
import Avatar from '@/app/components/Avatar'
import AvatarEditor from '@/app/components/AvatarEditor'
import EditProfileButton from '@/app/components/EditProfileButton'
import { userSchool } from '@/lib/profile'
import ListingCard, { ListingCardSkeleton } from '@/app/components/ListingCard'
import Stars from '@/app/components/Stars'
import { ArrowLeftIcon, StarIcon } from '@/app/components/icons'

const monthYear = (iso) => new Date(iso).toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })
const shortDate = (iso) => new Date(iso).toLocaleDateString('en-PH', { dateStyle: 'medium' })

function ReviewItem({ review }) {
  return (
    <li className="border-t border-line py-4 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <Stars rating={review.rating} className="h-4 w-4" />
        <span className="text-sm font-semibold text-ink">{review.reviewer_name?.split(' ')[0] || 'A buyer'}</span>
        <span className="text-xs text-muted">· {shortDate(review.created_at)}</span>
      </div>
      {review.comment && <p className="mt-1.5 max-w-[65ch] whitespace-pre-line text-[15px] leading-relaxed text-ink">{review.comment}</p>}
      {review.listing_title && <p className="mt-1 text-xs text-muted">Bought: {review.listing_title}</p>}
    </li>
  )
}

// Name, photo and university (migration 013). Falls back to just the photo (012), then to nothing,
// so the page still works before the migrations are run.
async function fetchSellerProfile(id) {
  const { data, error } = await supabase.rpc('seller_profile', { seller: id })
  if (!error) return data?.[0] ?? null
  const avatar = await supabase.rpc('seller_avatar', { seller: id })
  return avatar.data ? { avatar_url: avatar.data } : null
}

export default function SellerPage() {
  const { id } = useParams()
  const { user } = useUser()
  const [result, setResult] = useState({ loaded: false, listings: [], reviews: [], profile: null, error: '' })

  useEffect(() => {
    let cancelled = false
    Promise.all([
      supabase.from('listings').select(LISTING_WITH_IMAGES).eq('seller_id', id).order('created_at', { ascending: false }),
      supabase.from('reviews').select('id, rating, comment, reviewer_name, listing_title, created_at').eq('seller_id', id).order('created_at', { ascending: false }),
      fetchSellerProfile(id),
    ]).then(([listings, reviews, profile]) => {
      if (cancelled) return
      setResult({
        loaded: true,
        listings: listings.data ?? [],
        reviews: reviews.data ?? [],
        profile,
        error: listings.error?.message || reviews.error?.message || '',
      })
    })
    return () => {
      cancelled = true
    }
  }, [id])

  const { loaded, listings, reviews, profile, error } = result
  const isMe = user?.id === id
  const active = listings.filter((l) => BROWSE_STATUSES.includes(l.status))
  const soldCount = listings.filter((l) => l.status === 'sold').length
  const name = isMe ? displayName(user) : profile?.full_name || listings[0]?.seller_name || 'Student seller'
  // The university set on the profile; otherwise the ones their listings mention.
  const school = isMe ? userSchool(user) : profile?.school
  const schools = school ? [school] : [...new Set(listings.map((l) => l.school).filter(Boolean))]
  const since = [...listings, ...reviews].map((x) => x.created_at).sort()[0]
  const average = reviews.length ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : null

  if (loaded && !error && !isMe && listings.length === 0 && reviews.length === 0) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-start gap-3 px-4 py-16 sm:px-6">
        <p className="card-type text-3xl font-bold text-ink">No listings here yet.</p>
        <p className="text-muted">This seller hasn’t posted anything, or their listings have ended.</p>
        <Link href="/browse" className="font-semibold text-primary hover:underline">Browse other items</Link>
      </main>
    )
  }

  return (
    <main className="flex-1 bg-surface">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
        <Link href="/browse" className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
          <ArrowLeftIcon className="h-4 w-4" />
          Back to browse
        </Link>

        {error && (
          <p role="alert" className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            Couldn’t load this seller: {error}
          </p>
        )}

        {/* The seller's profile card. */}
        <section className={`overflow-hidden rounded-2xl border border-line bg-white shadow-xs ${loaded ? '' : 'animate-pulse'}`}>
          <div className="flex items-center gap-4 bg-primary p-5 sm:p-6 text-white">
            {isMe ? (
              <AvatarEditor user={user} src={avatarUrl(user)} name={name} className="h-16 w-16 text-xl" />
            ) : (
              <Avatar src={profile?.avatar_url} name={name} className="h-14 w-14 text-xl" />
            )}
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-xl font-extrabold text-white sm:text-2xl">{loaded ? name : 'Student Seller'}</h1>
              {schools.length > 0 && <p className="mt-1 truncate text-xs text-on-primary-muted sm:text-sm">{schools.join(' · ')}</p>}
            </div>
            {isMe && <EditProfileButton user={user} />}
          </div>
          <dl className="grid grid-cols-2 sm:grid-cols-4">
            <div className="border-b border-r border-line px-5 py-3 sm:border-b-0">
              <dt className="text-xs font-medium text-muted">Rating</dt>
              <dd className="mt-0.5 flex items-center gap-1.5 text-base font-semibold text-ink">
                {average == null ? (
                  <span className="text-muted">No reviews yet</span>
                ) : (
                  <>
                    <StarIcon className="h-4 w-4 text-primary" fill="currentColor" />
                    <span className="tabular">{formatRating(average)}</span>
                    <span className="text-sm font-normal text-muted">({reviews.length})</span>
                  </>
                )}
              </dd>
            </div>
            <div className="border-b border-line px-5 py-3 sm:border-b-0 sm:border-r">
              <dt className="text-xs font-medium text-muted">Listed now</dt>
              <dd className="tabular mt-0.5 text-base font-semibold text-ink">{active.length}</dd>
            </div>
            <div className="border-r border-line px-5 py-3">
              <dt className="text-xs font-medium text-muted">Sold or swapped</dt>
              <dd className="tabular mt-0.5 text-base font-semibold text-ink">{soldCount}</dd>
            </div>
            <div className="px-5 py-3">
              <dt className="text-xs font-medium text-muted">On BukiMart since</dt>
              <dd className="mt-0.5 text-base font-semibold text-ink">{since ? monthYear(since) : '—'}</dd>
            </div>
          </dl>
        </section>

        <section className="mt-8" aria-labelledby="listings-heading">
          <h2 id="listings-heading" className="card-type text-xl font-bold text-ink">Listings</h2>
          {loaded && active.length === 0 ? (
            <p className="mt-2 text-sm text-muted">Nothing listed right now.</p>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-x-4 md:gap-y-6 lg:grid-cols-4">
              {!loaded
                ? Array.from({ length: 4 }, (_, i) => <ListingCardSkeleton key={i} index={i} />)
                : active.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
            </div>
          )}
        </section>

        <section id="reviews" className="mt-10 scroll-mt-20" aria-labelledby="reviews-heading">
          <h2 id="reviews-heading" className="card-type text-xl font-bold text-ink">Reviews</h2>
          <div className="mt-4 rounded-[10px] border border-line bg-white p-5 shadow-card">
            {reviews.length === 0 ? (
              <p className="text-sm text-muted">
                No reviews yet. Buyers can review this seller through a link the seller sends after a sale.
              </p>
            ) : (
              <ul>
                {reviews.map((r) => (
                  <ReviewItem key={r.id} review={r} />
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
