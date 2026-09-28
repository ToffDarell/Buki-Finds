'use client'

import Link from 'next/link'
import { categoryFields, coverImage, dealLabel, detailValue, fallbackToFull, formatSize, isSwap, priceOrSwap } from '@/lib/listings'
import { thumbUrl } from '@/lib/images'
import { schoolLocationLabel } from '@/lib/schools'
import { PinIcon, SwapIcon } from '@/app/components/icons'

// Drawn stand-ins for the photo on sample cards, in the app's stroke set at poster size.
const glyph = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }
const SAMPLE_ART = {
  Uniforms: (
    <svg viewBox="0 0 48 48" {...glyph}>
      <path d="M17 7 8 12l3 9 5-2v22h16V19l5 2 3-9-9-5c-1 3-4 5-7 5s-6-2-7-5Z" />
      <path d="M21 8.5 24 14l3-5.5M24 14v10" />
    </svg>
  ),
  'School Shoes': (
    <svg viewBox="0 0 48 48" {...glyph}>
      <path d="M6 31V17h9c1 4 5 6 10 7l12 3c4 1 5 3 5 6v2H6Z" />
      <path d="M6 35h36M17 20l2 3M21 21l2 3" />
    </svg>
  ),
  Books: (
    <svg viewBox="0 0 48 48" {...glyph}>
      <path d="M10 9h22a4 4 0 0 1 4 4v28H14a4 4 0 0 1-4-4Z" />
      <path d="M10 37a4 4 0 0 1 4-4h22M17 16h12M17 21h8" />
    </svg>
  ),
  Services: (
    <svg viewBox="0 0 48 48" {...glyph}>
      <rect x="9" y="10" width="30" height="21" rx="2" />
      <path d="M5 36h38M19 17l-4 4 4 4M29 17l4 4-4 4M25 15l-2 12" />
    </svg>
  ),
  Food: (
    <svg viewBox="0 0 48 48" {...glyph}>
      <path d="M8 24h32a16 14 0 0 1-32 0Z" />
      <path d="M17 18c0-3 3-3 3-6M24 18c0-3 3-3 3-6M31 18c0-3 3-3 3-6" />
    </svg>
  ),
}

SAMPLE_ART.Shoes = SAMPLE_ART['School Shoes']

function Photo({ listing }) {
  const photo = coverImage(listing)
  if (photo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={thumbUrl(photo)}
        onError={fallbackToFull(photo)}
        alt={listing.title}
        loading="lazy"
        className="id-photo h-full w-full object-cover"
      />
    )
  }
  return (
    <div className="flex h-full items-center justify-center text-primary/70">
      <span className="h-16 w-16">{SAMPLE_ART[listing.category] ?? SAMPLE_ART.Uniforms}</span>
    </div>
  )
}

// One ID card on its cord. Real listings open the item; samples open Browse on that category.
function HangingCard({ listing, index }) {
  const swap = isSwap(listing)
  const f = categoryFields(listing.category)
  // The card's first fact: size for clothes, condition for most goods, otherwise how or where it happens.
  const [factLabel, factValue] = f.size
    ? ['Size', formatSize(listing.size)]
    : f.condition
      ? ['Condition', listing.condition]
      : f.deal
        ? ['Deal', dealLabel(listing)]
        : ['Where', detailValue('where', listing.details?.where)]
  const where = schoolLocationLabel(listing.school)
  const href = listing.sample ? `/browse?category=${encodeURIComponent(listing.category)}` : `/item/${listing.id}`
  const label = `${listing.sample ? 'Sample listing: ' : ''}${listing.title}, ${swap ? 'for swap' : priceOrSwap(listing)}`

  return (
    <li className="rack-item" style={{ '--i': index }}>
      <span aria-hidden="true" className="rack-cord" />
      <Link
        href={href}
        aria-label={label}
        className="id-swing group relative flex w-full flex-col overflow-hidden rounded-[10px] border border-line bg-white shadow-card transition-[border-color,box-shadow] duration-300 hover:border-primary/30 hover:shadow-card-lift"
      >
        <div className="bg-primary px-3 pb-2 pt-2.5 text-center">
          <span aria-hidden="true" className="mx-auto block h-1.5 w-9 rounded-full bg-white shadow-[inset_0_1px_1px_rgb(6_36_63/0.35)]" />
          <span className="mt-1.5 block truncate text-[13px] font-medium text-on-primary-muted">{listing.category}</span>
        </div>
        <div className="relative m-2.5 mb-0 aspect-square overflow-hidden rounded-sm bg-surface ring-1 ring-line">
          <Photo listing={listing} />
          {listing.sample && (
            <span className="absolute left-2 top-2 rounded-sm bg-white/95 px-1.5 py-0.5 text-xs font-semibold text-muted shadow-card">
              Sample
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col px-3 pb-3 pt-2.5">
          {swap ? (
            <p className="card-type flex items-center gap-1 text-xl font-extrabold leading-none text-accent">
              <SwapIcon className="h-[0.9em] w-[0.9em]" strokeWidth="2.25" />
              Swap
            </p>
          ) : (
            <p className="card-type tabular text-xl font-extrabold leading-none text-primary">{priceOrSwap(listing)}</p>
          )}
          <p className="mt-1.5 line-clamp-2 text-sm font-semibold leading-snug text-ink">{listing.title}</p>
          {swap && listing.swap_for && <p className="mt-0.5 truncate text-xs text-muted">Wants {listing.swap_for}</p>}
          <dl className="mt-auto grid grid-cols-2 gap-x-2 border-t border-dashed border-line pt-2 text-xs">
            <div className="min-w-0">
              <dt className="text-muted">{factLabel}</dt>
              <dd className="truncate font-semibold text-ink">{factValue || '—'}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-muted">School</dt>
              <dd className="flex items-center gap-0.5 truncate font-semibold text-ink">
                <PinIcon className="h-3 w-3 shrink-0 text-accent" />
                <span className="truncate">{where.split(' • ')[0] || '—'}</span>
              </dd>
            </div>
          </dl>
        </div>
      </Link>
    </li>
  )
}

export default function LandingRack({ listings }) {
  const hasSamples = listings.some((l) => l.sample)
  return (
    <div className="relative">
      <div className="rack-scroll -mx-4 overflow-x-auto px-4 pb-6 sm:-mx-6 sm:px-6 lg:mx-0 lg:overflow-visible lg:px-0">
        <div className="relative min-w-max lg:min-w-0">
          {/* The rail every card hangs from. */}
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 rounded-full bg-ink/85 shadow-card" />
          <ul aria-label={hasSamples ? 'Example listings' : 'Newest listings'} className="rack flex items-start gap-3 pt-1.5 sm:gap-4 lg:grid lg:grid-cols-5 lg:gap-5">
            {listings.map((listing, i) => (
              <HangingCard key={listing.id} listing={listing} index={i} />
            ))}
          </ul>
        </div>
      </div>
      {hasSamples && (
        <p className="text-xs text-muted">
          Cards marked Sample are examples of what students list.{' '}
          <Link href="/browse" className="font-semibold text-primary hover:underline">See real listings</Link>
        </p>
      )}
    </div>
  )
}
