'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/lib/useAuth'
import { LISTING_WITH_IMAGES, coverImage, fallbackToFull } from '@/lib/listings'
import { thumbUrl } from '@/lib/images'
import { CameraIcon, StarIcon } from '@/app/components/icons'

const WORDS = ['', 'Bad', 'Not great', 'Okay', 'Good', 'Great']

const MESSAGES = {
  invalid: ['This review link isn’t valid.', 'Ask the seller to send you a fresh link from their listing.'],
  own: ['This is your own listing.', 'Send this link to your buyer on Messenger so they can review you.'],
  reviewed: ['This sale already has a review.', 'Each sale gets one review. Thanks for keeping BukiMart trustworthy.'],
  gone: ['This listing has ended.', 'Sold listings are removed after 7 days, and the review link goes with it.'],
}

function Notice({ kind, sellerId }) {
  const [title, body] = MESSAGES[kind]
  return (
    <div className="rounded-[12px] border border-line bg-white px-6 py-10 text-center shadow-card">
      <p className="card-type text-2xl font-bold text-ink">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted">{body}</p>
      <Link href={sellerId ? `/seller/${sellerId}` : '/'} className="mt-5 inline-block font-semibold text-primary hover:underline">
        {sellerId ? 'See the seller’s profile' : 'Browse listings'}
      </Link>
    </div>
  )
}

function ReviewForm() {
  const { id } = useParams()
  const router = useRouter()
  const { user, loading: userLoading } = useUser()
  const token = useSearchParams().get('t') || ''
  const [state, setState] = useState({ loaded: false, listing: null, status: '' })
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submit, setSubmit] = useState({ sending: false, done: false, error: '' })

  useEffect(() => {
    if (userLoading) return
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(`/review/${id}?t=${token}`)}`)
      return
    }
    let cancelled = false
    Promise.all([
      supabase.from('listings').select(LISTING_WITH_IMAGES).eq('id', id).maybeSingle(),
      token ? supabase.rpc('review_invite_status', { p_listing_id: id, p_token: token }) : Promise.resolve({ data: 'invalid' }),
    ]).then(([listing, status]) => {
      if (cancelled) return
      const kind = !listing.data ? 'gone' : status.error ? 'invalid' : status.data
      setState({ loaded: true, listing: listing.data, status: kind })
    })
    return () => {
      cancelled = true
    }
  }, [token, user, userLoading, id, router])

  async function onSubmit(e) {
    e.preventDefault()
    setSubmit({ sending: true, done: false, error: '' })
    const { error } = await supabase.rpc('submit_review', { p_listing_id: id, p_token: token, p_rating: rating, p_comment: comment })
    if (error) setSubmit({ sending: false, done: false, error: error.message })
    else setSubmit({ sending: false, done: true, error: '' })
  }

  const { listing } = state
  const photo = listing ? coverImage(listing) : null

  return (
    <main className="flex-1 bg-surface">
      <div className="mx-auto w-full max-w-lg px-4 py-8 sm:px-6">
        <h1 className="card-type text-3xl font-bold leading-none text-ink">Review your seller</h1>
        <p className="mt-2 text-sm text-muted">Your review shows on the seller’s profile and helps other students buy with confidence.</p>

        <div className="mt-6">
          {!state.loaded ? (
            <div className="h-72 animate-pulse rounded-[12px] bg-white shadow-card" aria-busy="true" />
          ) : state.status !== 'ok' ? (
            <Notice kind={state.status} sellerId={listing?.seller_id} />
          ) : submit.done ? (
            <div className="rise-in rounded-[12px] border border-line bg-white px-6 py-10 text-center shadow-card">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent">
                <StarIcon className="h-7 w-7" fill="currentColor" />
              </span>
              <p className="card-type mt-4 text-2xl font-bold text-ink">Thanks for the review!</p>
              <p className="mt-2 text-sm text-muted">It’s now on {listing.seller_name || 'the seller'}’s profile.</p>
              <Link href={`/seller/${listing.seller_id}#reviews`} className="mt-6 inline-flex min-h-11 items-center rounded-md bg-primary px-5 text-[15px] font-semibold text-white hover:bg-primary-hover">
                See the Review
              </Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="overflow-hidden rounded-[12px] border border-line bg-white shadow-card">
              <div className="flex items-center gap-3 border-b border-line p-4">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-sm bg-surface ring-1 ring-line">
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thumbUrl(photo)} onError={fallbackToFull(photo)} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted"><CameraIcon className="h-5 w-5" /></div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink">{listing.title}</p>
                  <p className="truncate text-sm text-muted">Sold by {listing.seller_name || 'a student'}</p>
                </div>
              </div>

              <div className="flex flex-col gap-5 p-5">
                <fieldset>
                  <legend className="text-sm font-semibold text-ink">How was it?</legend>
                  <div role="radiogroup" aria-label="Rating" className="mt-2 flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        role="radio"
                        aria-checked={rating === n}
                        aria-label={`${n} star${n > 1 ? 's' : ''}, ${WORDS[n]}`}
                        onClick={() => setRating(n)}
                        className="flex h-11 w-11 items-center justify-center rounded-md text-primary transition-transform hover:bg-primary-soft motion-safe:active:scale-90"
                      >
                        <StarIcon className={`h-8 w-8 ${n <= rating ? '' : 'text-line'}`} fill={n <= rating ? 'currentColor' : 'none'} />
                      </button>
                    ))}
                    <span className="ml-2 text-sm font-medium text-muted" aria-live="polite">{WORDS[rating]}</span>
                  </div>
                </fieldset>

                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-semibold text-ink">
                    Comment <span className="font-normal text-muted">optional</span>
                  </span>
                  <textarea
                    rows={4}
                    maxLength={500}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Was the item as described? Was the meet-up easy?"
                    className="rounded-sm border border-line px-3 py-2.5 text-[15px] placeholder:text-muted focus:border-primary focus:outline-none"
                  />
                </label>

                {submit.error && (
                  <p role="alert" className="rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{submit.error}</p>
                )}

                <button
                  type="submit"
                  disabled={!rating || submit.sending}
                  className="min-h-12 rounded-md bg-primary text-[15px] font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
                >
                  {submit.sending ? 'Sending…' : 'Post Review'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}

// useSearchParams needs a Suspense boundary so the rest of the page can render first.
export default function ReviewPage() {
  return (
    <Suspense fallback={<main className="flex-1 bg-surface" />}>
      <ReviewForm />
    </Suspense>
  )
}
