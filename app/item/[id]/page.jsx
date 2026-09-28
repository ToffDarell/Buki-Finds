'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/lib/useAuth'
import {
  IMAGE_BUCKET,
  LISTING_WITH_IMAGES,
  LISTING_TYPES,
  doneLabel,
  fallbackToFull,
  isReserved,
  dealLabel,
  dealMethods,
  offersDelivery,
  categoryFields,
  detailValue,
  DETAIL_FIELDS,
  isSwap,
  listingNumber,
  messengerUrl,
  instagramUrl,
  priceOrSwap,
  purgeDateLabel,
  sortedImages,
  formatSize,
} from '@/lib/listings'
import { imageStoragePaths, thumbUrl } from '@/lib/images'
import { freeLimitMessage, isFreeLimitError } from '@/lib/subscription'
import { fetchSellerRating, formatRating, reviewLink } from '@/lib/reviews'
import SaveButton from '@/app/components/SaveButton'
import ShareButton from '@/app/components/ShareButton'
import ReportDialog from '@/app/components/ReportDialog'
import useDialog from '@/app/components/useDialog'
import Stars from '@/app/components/Stars'
import {
  ArrowLeftIcon,
  CameraIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MailIcon,
  MessengerIcon,
  InstagramIcon,
  HeartIcon,
  PencilIcon,
  PinIcon,
  TruckIcon,
  StarIcon,
  TrashIcon,
  UndoIcon,
} from '@/app/components/icons'

// Owner of a sold listing: get a link to send the buyer on Messenger so they can leave one review.
function ReviewLinkPanel({ listing }) {
  const [state, setState] = useState({ link: '', error: '', busy: false })

  async function getLink() {
    setState({ link: '', error: '', busy: true })
    const { data, error } = await supabase.rpc('create_review_invite', { p_listing_id: listing.id })
    if (error) setState({ link: '', error: error.message, busy: false })
    else setState({ link: reviewLink(listing.id, data), error: '', busy: false })
  }

  return (
    <div className="rounded-md border border-line bg-surface px-3.5 py-3 sm:col-span-2">
      <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
        <StarIcon className="h-4 w-4 text-primary" />
        Get a review from your buyer
      </p>
      <p className="mt-1 text-xs leading-relaxed text-muted">
        Send this link to your buyer on Messenger. They can leave one review, and it shows on your seller profile.
      </p>
      {state.link ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input readOnly value={state.link} onFocus={(e) => e.target.select()} aria-label="Review link" className="min-w-0 flex-1 rounded-sm border border-line bg-white px-2.5 py-2 text-sm text-ink" />
          <ShareButton title="Review your BukiFinds seller" text={`How was buying "${listing.title}"? Leave a quick review:`} url={state.link} label="Send Link" />
        </div>
      ) : (
        <button
          onClick={getLink}
          disabled={state.busy}
          className="mt-3 inline-flex min-h-10 items-center gap-1.5 rounded-md bg-primary px-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-60"
        >
          {state.busy ? 'Getting link…' : 'Get Review Link'}
        </button>
      )}
      {state.error && <p role="alert" className="mt-2 text-sm text-red-700">{state.error}</p>}
    </div>
  )
}

function Gallery({ images, title, sold }) {
  const [index, setIndex] = useState(0)
  const touchStartX = useRef(null)

  if (images.length === 0) {
    return (
      <div className="flex h-28 items-center justify-center gap-2 rounded-[10px] border border-dashed border-line bg-white text-muted md:aspect-square md:h-auto md:flex-col">
        <CameraIcon className="h-6 w-6 md:h-8 md:w-8" />
        <span className="text-sm">The seller didn’t add photos</span>
      </div>
    )
  }

  const go = (delta) => setIndex((i) => (i + delta + images.length) % images.length)
  const arrow =
    'absolute top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-ink shadow-card-lift transition hover:bg-white'

  return (
    <div className="flex flex-col gap-3">
      <div
        className="relative aspect-square touch-pan-y overflow-hidden rounded-[10px] border border-line bg-white p-2.5 shadow-card"
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX
        }}
        onTouchEnd={(e) => {
          if (touchStartX.current === null) return
          const dx = e.changedTouches[0].clientX - touchStartX.current
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1)
          touchStartX.current = null
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') go(-1)
          if (e.key === 'ArrowRight') go(1)
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[index].image_url}
          alt={`${title}, photo ${index + 1} of ${images.length}`}
          className={`h-full w-full rounded-sm bg-surface object-contain ring-1 ring-line ${sold ? 'grayscale' : ''}`}
        />
        {images.length > 1 && (
          <>
            <button onClick={() => go(-1)} className={`${arrow} left-3`} aria-label="Previous photo">
              <ChevronLeftIcon />
            </button>
            <button onClick={() => go(1)} className={`${arrow} right-3`} aria-label="Next photo">
              <ChevronRightIcon />
            </button>
            <span className="tabular absolute bottom-3 right-3 rounded-full bg-ink/75 px-2.5 py-0.5 text-xs font-medium text-white">
              {index + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setIndex(i)}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-md ring-2 ring-offset-2 transition sm:h-20 sm:w-20 ${
                i === index ? 'ring-primary' : 'ring-transparent opacity-70 hover:opacity-100'
              }`}
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === index}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={thumbUrl(img.image_url)} onError={fallbackToFull(img.image_url)} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// The label/value pairs shown in the item's details grid, in order. Category extras come from
// listings.details; the long "Known issues" note is shown separately below the grid.
function itemFacts(listing) {
  const f = categoryFields(listing.category)
  const facts = []
  if (f.condition) facts.push(['Condition', listing.condition])
  if (f.size) facts.push(['Size', formatSize(listing.size)])
  if (f.brand) facts.push(['Brand', listing.brand])
  for (const key of f.details) {
    if (key === 'issues' || key === 'rate_unit') continue // issues: own box; rate unit: shown with the price
    const label = key === 'schedule' ? 'Available' : DETAIL_FIELDS[key].label
    facts.push([label, detailValue(key, listing.details?.[key])])
  }
  if (f.deal) facts.push(['Deal', dealLabel(listing)])
  facts.push(['University', listing.school])
  facts.push(['Posted', new Date(listing.created_at).toLocaleDateString('en-PH', { dateStyle: 'medium' })])
  return facts
}

function Field({ label, value }) {
  return (
    <div className="border-line px-3.5 py-2.5 odd:border-r nth-[n+3]:border-t">
      <dt className="text-xs font-medium text-muted">{label}</dt>
      <dd className="mt-0.5 text-base font-semibold leading-snug text-ink">{value || '—'}</dd>
    </div>
  )
}

// Browsing is open to everyone; contacting a seller needs an account. Signed-out visitors get a
// login button that brings them straight back to this item afterwards.
function ContactAction({ listing, number, compact = false, signedOut = false }) {
  const size = compact ? 'px-4 py-2.5 text-sm' : 'w-full px-4 py-3'
  if (signedOut) {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(`/item/${listing.id}`)}`}
        className={`flex items-center justify-center gap-2 rounded-md bg-primary font-semibold text-white transition-colors hover:bg-primary-hover ${size}`}
      >
        <MessengerIcon />
        <span>{compact ? 'Log in to Message' : 'Log in to Message Seller'}</span>
      </Link>
    )
  }
  const messenger = messengerUrl(listing.seller_facebook_username)
  const instagram = instagramUrl(listing.seller_instagram_username)
  const filled = `flex items-center justify-center gap-2 rounded-md bg-primary font-semibold text-white transition-colors hover:bg-primary-hover ${size}`

  // Main button: Messenger, else Instagram, else email.
  let primary = null
  if (messenger) {
    primary = (
      <a href={messenger} target="_blank" rel="noopener noreferrer" className={filled}>
        <MessengerIcon />
        {/* Small phones and the tablet column are too narrow for the full label; the Messenger icon already says where it goes. */}
        <span>
          Message Seller
          {!compact && <span className="hidden sm:inline md:hidden lg:inline"> on Messenger</span>}
        </span>
      </a>
    )
  } else if (instagram) {
    primary = (
      <a href={instagram} target="_blank" rel="noopener noreferrer" className={filled}>
        <InstagramIcon />
        <span>
          Message Seller
          {!compact && <span className="hidden sm:inline md:hidden lg:inline"> on Instagram</span>}
        </span>
      </a>
    )
  } else if (listing.seller_email) {
    primary = (
      <a href={`mailto:${listing.seller_email}?subject=${encodeURIComponent(`BukiFinds No. ${number}: ${listing.title}`)}`} className={filled}>
        <MailIcon />
        Email Seller
      </a>
    )
  }
  if (!primary || !(messenger && instagram)) return primary

  // Sellers with both get Instagram as a second, quieter button (icon-only in the phone bar).
  return compact ? (
    <div className="flex shrink-0 gap-2">
      {primary}
      <a
        href={instagram}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Message Seller on Instagram"
        className="flex w-11 items-center justify-center rounded-md border border-line bg-white text-primary transition-colors hover:bg-surface"
      >
        <InstagramIcon />
      </a>
    </div>
  ) : (
    <div className="flex flex-col gap-2">
      {primary}
      <a
        href={instagram}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full items-center justify-center gap-2 rounded-md border border-line bg-white px-4 py-3 font-semibold text-primary transition-colors hover:bg-surface"
      >
        <InstagramIcon />
        Message on Instagram
      </a>
    </div>
  )
}

export default function ItemPage() {
  const [dialog, { confirm, alert: showAlert }] = useDialog()
  const { id } = useParams()
  const router = useRouter()
  const { user, loading: userLoading } = useUser()
  const [result, setResult] = useState({ loaded: false, listing: null, error: '' })
  const [busy, setBusy] = useState(false)
  const [rating, setRating] = useState({ average: null, count: 0 })
  const [saveCount, setSaveCount] = useState(null)

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

  const listing = result.listing
  const sellerId = listing?.seller_id

  useEffect(() => {
    if (!sellerId) return
    let cancelled = false
    fetchSellerRating(sellerId).then((r) => !cancelled && setRating(r))
    return () => {
      cancelled = true
    }
  }, [sellerId])

  // The count is kept by a database trigger; re-read it after a save or unsave.
  async function refreshSaveCount() {
    const { data } = await supabase.from('listings').select('save_count').eq('id', id).maybeSingle()
    if (data) setSaveCount(data.save_count)
  }

  async function setStatus(status) {
    setBusy(true)
    const { data, error } = await supabase
      .from('listings')
      .update({ status })
      .eq('id', listing.id)
      .select(LISTING_WITH_IMAGES)
      .single()
    if (error) showAlert({ title: 'Couldn’t update the listing', body: isFreeLimitError(error.message) ? freeLimitMessage(error.message) : error.message })
    else setResult((prev) => ({ ...prev, listing: data }))
    setBusy(false)
  }

  async function handleDelete() {
    const ok = await confirm({
      title: `Delete “${listing.title}”?`,
      body: 'This removes the listing and its photos. This can’t be undone.',
      action: 'Delete',
    })
    if (!ok) return
    setBusy(true)
    // listing_images rows go with ON DELETE CASCADE; the files in storage are removed separately.
    const { error } = await supabase.from('listings').delete().eq('id', listing.id)
    if (error) {
      showAlert({ title: 'Couldn’t delete the listing', body: error.message })
      setBusy(false)
      return
    }
    const paths = imageStoragePaths(sortedImages(listing).map((img) => img.image_url))
    if (paths.length) await supabase.storage.from(IMAGE_BUCKET).remove(paths)
    router.push('/my-listings')
  }

  if (!result.loaded) {
    return (
      <main className="mx-auto grid w-full max-w-7xl flex-1 animate-pulse gap-8 px-4 py-8 sm:px-6 md:grid-cols-[1.1fr_0.9fr]" aria-busy="true">
        <div className="aspect-square rounded-[10px] bg-surface" />
        <div className="h-96 rounded-xl bg-surface" />
      </main>
    )
  }
  if (result.error) {
    return (
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6">
        <p className="text-red-700">Couldn’t load this listing: {result.error}</p>
      </main>
    )
  }
  if (!listing) {
    return (
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-start gap-3 px-4 py-16 sm:px-6">
        <p className="card-type text-3xl font-bold text-ink">This listing is gone.</p>
        <p className="text-muted">The seller may have deleted it.</p>
        <Link href="/browse" className="font-semibold text-primary hover:underline">Browse other items</Link>
      </main>
    )
  }

  const isOwner = user?.id === listing.seller_id
  const isSold = listing.status === 'sold'
  const reserved = isReserved(listing)
  const saves = saveCount ?? listing.save_count ?? 0
  const swap = isSwap(listing)
  const purgeDate = purgeDateLabel(listing)
  const number = listingNumber(listing)
  const hasContact = Boolean(messengerUrl(listing.seller_facebook_username) || instagramUrl(listing.seller_instagram_username) || listing.seller_email)
  const showMobileBar = !isOwner && !isSold && hasContact
  const signedOut = !userLoading && !user

  return (
    <main className={`w-full flex-1 bg-surface ${showMobileBar ? 'pb-28 md:pb-10' : 'pb-10'}`}>
      {dialog}
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
      <Link href="/browse" className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
        <ArrowLeftIcon className="h-4 w-4" />
        Back to browse
      </Link>

      <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-start md:gap-6 lg:gap-8">
        <Gallery images={sortedImages(listing)} title={listing.title} sold={isSold} />

        <article className="overflow-hidden rounded-xl border border-line bg-white shadow-card md:sticky md:top-6">
          <div className="relative bg-primary px-5 pb-3 pt-6">
            <span aria-hidden="true" className="absolute left-1/2 top-2.5 h-2 w-14 -translate-x-1/2 rounded-full bg-white shadow-[inset_0_1px_2px_rgb(6_36_63/0.35)]" />
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm font-semibold text-white">{listing.category}</span>
              <span className="font-mono text-xs text-on-primary-muted">No. {number}</span>
            </div>
          </div>

          <div className="p-5">
            <span
              className={`inline-block rounded-sm px-2 py-0.5 text-xs font-bold uppercase tracking-[0.12em] ${
                swap ? 'bg-accent text-white' : 'border border-primary/25 bg-primary-soft text-primary'
              }`}
            >
              {LISTING_TYPES[swap ? 'swap' : 'sell']}
            </span>
            <h1 className="mt-2 text-xl font-semibold leading-snug text-ink sm:text-2xl">{listing.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <p
                className={`card-type tabular font-bold leading-none ${swap ? 'text-4xl' : 'text-5xl md:text-4xl lg:text-5xl'} ${
                  isSold ? 'text-muted line-through decoration-[3px]' : swap ? 'text-accent' : 'text-primary'
                }`}
              >
                {priceOrSwap(listing)}
              </p>
              {isSold && (
                <span className="rounded-sm bg-ink px-2 py-0.5 text-sm font-bold uppercase tracking-[0.15em] text-white">
                  {doneLabel(listing)}
                </span>
              )}
              {reserved && (
                <span className="rounded-full border border-primary/25 bg-primary-soft px-2.5 py-0.5 text-sm font-semibold text-primary">Reserved</span>
              )}
            </div>
            {reserved && !isOwner && (
              <p className="mt-2 text-sm text-muted">The seller has promised this to someone. You can still message them in case it falls through.</p>
            )}

            {swap && (
              <div className="mt-4 rounded-md border border-accent/25 bg-accent-soft px-3.5 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-accent-hover">Looking for in return</p>
                <p className="mt-1 whitespace-pre-line text-[15px] leading-relaxed text-ink">
                  {listing.swap_for || 'Open to offers. Message the seller with what you can trade.'}
                </p>
              </div>
            )}

            {/* Only the fields this listing's category uses (see CATEGORY_FIELDS in lib/listings.js). */}
            <dl className="mt-5 grid grid-cols-2 rounded-md border border-line">
              {itemFacts(listing).map(([label, value]) => (
                <Field key={label} label={label} value={value} />
              ))}
            </dl>

            {listing.details?.issues && categoryFields(listing.category).details.includes('issues') && (
              <p className="mt-3 rounded-md border border-line px-3.5 py-2.5 text-[15px] text-ink">
                <span className="text-xs font-medium text-muted">Known issues</span>
                <span className="block whitespace-pre-line font-semibold">{listing.details.issues}</span>
              </p>
            )}

            {offersDelivery(listing) && listing.delivery_note && (
              <p className="mt-3 flex items-start gap-2 rounded-md border border-line px-3.5 py-2.5 text-[15px] text-ink">
                <TruckIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>
                  <span className="text-xs font-medium text-muted">Delivery</span>
                  <span className="block font-semibold">{listing.delivery_note}</span>
                </span>
              </p>
            )}

            {listing.meetup_spot && dealMethods(listing).includes('meetup') && (
              <p className="mt-3 flex items-start gap-2 rounded-md border border-line px-3.5 py-2.5 text-[15px] text-ink">
                <PinIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>
                  <span className="text-xs font-medium text-muted">{categoryFields(listing.category).meetupLabel ?? 'Meet-up spot'}</span>
                  <span className="block font-semibold">{listing.meetup_spot}</span>
                </span>
              </p>
            )}

            {listing.description && (
              <p className="mt-5 max-w-[65ch] whitespace-pre-line text-[15px] leading-relaxed text-ink">{listing.description}</p>
            )}

            <div className="mt-6 border-t border-dashed border-line pt-5">
              <div className="flex items-baseline justify-between gap-3">
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
                  <span>
                    Listed by{' '}
                    <Link href={`/seller/${listing.seller_id}`} className="font-semibold text-ink underline-offset-2 hover:text-primary hover:underline">
                      {listing.seller_name || 'a student'}
                    </Link>
                  </span>
                  {rating.count > 0 && (
                    <Link href={`/seller/${listing.seller_id}#reviews`} className="inline-flex items-center gap-1 hover:underline">
                      <Stars rating={rating.average} className="h-3.5 w-3.5" />
                      <span className="tabular font-semibold text-ink">{formatRating(rating.average)}</span>
                      <span>({rating.count})</span>
                    </Link>
                  )}
                </p>
              </div>

              {isOwner ? (
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <Link
                    href={`/item/${listing.id}/edit`}
                    className="inline-flex items-center justify-center gap-1.5 rounded-md border border-line bg-white px-3 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-surface"
                  >
                    <PencilIcon className="h-4 w-4" />
                    Edit
                  </Link>
                  {listing.status === 'available' && (
                    <button
                      onClick={() => setStatus('reserved')}
                      disabled={busy}
                      className="inline-flex items-center justify-center gap-1.5 rounded-md border border-line bg-white px-3 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-surface disabled:opacity-60"
                    >
                      Mark as Reserved
                    </button>
                  )}
                  {listing.status !== 'available' && (
                    <button
                      onClick={() => setStatus('available')}
                      disabled={busy}
                      className="inline-flex items-center justify-center gap-1.5 rounded-md border border-line bg-white px-3 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-surface disabled:opacity-60"
                    >
                      <UndoIcon className="h-4 w-4" />
                      Mark as Available
                    </button>
                  )}
                  {!isSold && (
                    <button
                      onClick={() => setStatus('sold')}
                      disabled={busy}
                      className="inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-60"
                    >
                      <CheckIcon className="h-4 w-4" />
                      {`Mark as ${doneLabel(listing)}`}
                    </button>
                  )}
                  <button
                    onClick={handleDelete}
                    disabled={busy}
                    className="inline-flex items-center justify-center gap-1.5 rounded-md border border-red-200 bg-white px-3 py-2.5 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50 disabled:opacity-60"
                  >
                    <TrashIcon className="h-4 w-4" />
                    Delete Listing
                  </button>
                  {isSold && <ReviewLinkPanel listing={listing} />}
                  {purgeDate && (
                    <p className="text-xs text-muted sm:col-span-2">
                      This listing and its photos will be deleted automatically on{' '}
                      <span className="font-semibold text-ink">{purgeDate}</span>. Mark it as available to keep it.
                    </p>
                  )}
                </div>
              ) : isSold ? (
                <p className="mt-3 text-sm text-muted">This item has been {doneLabel(listing).toLowerCase()}.</p>
              ) : hasContact ? (
                <div className="mt-4">
                  <ContactAction listing={listing} number={number} signedOut={signedOut} />
                  <p className="mt-2 text-center text-xs text-muted">
                    Mention <span className="font-mono font-semibold text-ink">No. {number}</span> so the seller knows which item.
                  </p>
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted">The seller hasn’t shared a way to contact them.</p>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-2">
                {!isOwner && <SaveButton listingId={listing.id} variant="inline" count={saves} onToggled={refreshSaveCount} />}
                {isOwner && saves > 0 && (
                  <span className="inline-flex min-h-10 items-center gap-1.5 text-sm text-muted">
                    <HeartIcon className="h-4 w-4 text-primary" fill="currentColor" />
                    <span>
                      <span className="tabular font-semibold text-ink">{saves}</span> {saves === 1 ? 'person' : 'people'} saved this
                    </span>
                  </span>
                )}
                <ShareButton title={listing.title} text={`${listing.title} · ${priceOrSwap(listing)} on BukiFinds`} />
                {!isOwner && (
                  <span className="ml-auto">
                    <ReportDialog listingId={listing.id} user={user} />
                  </span>
                )}
              </div>
            </div>
          </div>
        </article>
      </div>
      </div>

      {showMobileBar && (
        <div className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-white px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-4px_12px_rgb(6_36_63/0.06)] md:hidden">
          <div className="mx-auto flex max-w-7xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="card-type tabular text-2xl font-bold leading-none text-primary">{priceOrSwap(listing)}</p>
              <p className="truncate text-xs text-muted">No. {number} · {listing.title}</p>
            </div>
            <ContactAction listing={listing} number={number} compact signedOut={signedOut} />
          </div>
        </div>
      )}
    </main>
  )
}
