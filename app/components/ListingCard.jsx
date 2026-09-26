import Link from 'next/link'
import { coverImage, doneLabel, fallbackToFull, isReserved, isSwap, listingNumber, priceOrSwap } from '@/lib/listings'
import { thumbUrl } from '@/lib/images'
import SaveButton from '@/app/components/SaveButton'
import { CameraIcon, SwapIcon, PinIcon } from '@/app/components/icons'

// Clean, prominent price or swap tag
function PriceDisplay({ listing, sold }) {
  if (isSwap(listing)) {
    return (
      <span className={`inline-flex items-center gap-1 text-sm sm:text-base font-bold ${sold ? 'text-muted line-through' : 'text-accent'}`}>
        <SwapIcon className="h-4 w-4 shrink-0" strokeWidth="2.25" />
        Swap
      </span>
    )
  }

  return (
    <span className={`tabular text-base sm:text-lg font-bold tracking-tight ${sold ? 'text-muted line-through' : 'text-primary'}`}>
      {priceOrSwap(listing)}
    </span>
  )
}

// Clean, simple, modern card inner contents
export function ListingIdCard({ listing, cover, preview = false }) {
  const photo = cover === undefined ? coverImage(listing) : cover
  const sold = listing.status === 'sold'
  const reserved = isReserved(listing)
  const swap = isSwap(listing)

  return (
    <div className="flex h-full flex-col">
      {/* Photo Container */}
      <div className="relative aspect-square w-full overflow-hidden rounded-t-xl bg-surface sm:rounded-t-2xl">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview ? photo : thumbUrl(photo)}
            onError={preview ? undefined : fallbackToFull(photo)}
            alt={listing.title || 'Listing photo'}
            className={`h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 ${
              sold ? 'grayscale' : ''
            }`}
            loading={preview ? undefined : 'lazy'}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1.5 text-muted">
            <CameraIcon className="h-7 w-7 text-muted/40" />
            <span className="text-xs font-medium">No photo</span>
          </div>
        )}

        {/* Category Pill Tag (top-left) */}
        {listing.category && (
          <div className="absolute left-2.5 top-2.5">
            <span className="inline-flex items-center rounded-full bg-white/95 px-2.5 py-0.5 text-[11px] font-medium text-ink shadow-xs backdrop-blur-xs">
              {listing.category}
            </span>
          </div>
        )}

        {/* Status Overlays */}
        {sold && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/75 backdrop-blur-[2px]">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider text-ink shadow-md">
              {doneLabel(listing)}
            </span>
          </div>
        )}
        {!sold && reserved && (
          <div className="absolute bottom-2.5 left-2.5">
            <span className="rounded-full bg-amber-500/95 px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-xs">
              Reserved
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col p-3 sm:p-3.5">
        {/* Price & Condition */}
        <div className="flex items-center justify-between gap-2">
          <PriceDisplay listing={listing} sold={sold} />
          {listing.condition && (
            <span className="shrink-0 text-[11px] font-medium text-muted">
              {listing.condition}
            </span>
          )}
        </div>

        {/* Title */}
        <h3
          className="mt-1 line-clamp-2 text-sm sm:text-[15px] font-medium leading-snug text-ink transition-colors group-hover:text-primary"
          title={listing.title}
        >
          {listing.title || 'Untitled listing'}
        </h3>

        {/* Wants for swap */}
        {swap && listing.swap_for && (
          <p className="mt-1 line-clamp-1 text-xs text-muted" title={listing.swap_for}>
            <span className="font-semibold text-ink">Wants:</span> {listing.swap_for}
          </p>
        )}

        {/* Bottom Metadata: School & Size */}
        <div className="mt-auto flex items-center justify-between gap-1.5 pt-2.5 text-xs text-muted">
          {listing.school ? (
            <span
              className="flex min-w-0 items-center gap-1 truncate text-xs text-muted transition-colors hover:text-ink"
              title={listing.school}
            >
              <PinIcon className="h-3.5 w-3.5 shrink-0 text-primary/70" />
              <span className="truncate">{listing.school}</span>
            </span>
          ) : (
            <span className="text-[11px] text-muted/50">Any school</span>
          )}

          {listing.size && (
            <span className="shrink-0 rounded-md border border-line bg-surface px-1.5 py-0.5 text-[11px] font-semibold text-ink">
              {listing.size}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

const cardShell =
  'group relative flex h-full flex-col overflow-hidden rounded-xl border border-line bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg focus-within:ring-2 focus-within:ring-primary sm:rounded-2xl'

export default function ListingCard({ listing }) {
  const status = listing.status === 'sold' ? `, ${doneLabel(listing).toLowerCase()}` : isReserved(listing) ? ', reserved' : ''

  return (
    <div className="id-swing group relative h-full">
      <Link
        href={`/item/${listing.id}`}
        className={cardShell}
        aria-label={`${listing.title}, ${isSwap(listing) ? 'for swap' : priceOrSwap(listing)}${listing.size ? `, size ${listing.size}` : ''}${status}`}
      >
        <ListingIdCard listing={listing} />
      </Link>
      <SaveButton
        listingId={listing.id}
        className="absolute right-2.5 top-2.5 z-10 !h-8 !w-8 !bg-white/90 !text-ink shadow-xs backdrop-blur-xs transition-transform hover:!scale-110 hover:!bg-white active:!scale-95"
      />
    </div>
  )
}

export function ListingCardPreview({ listing, cover }) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white shadow-xs sm:rounded-2xl">
      <ListingIdCard listing={listing} cover={cover} preview />
    </div>
  )
}

// Clean loading skeleton mirroring the new card
export function ListingCardSkeleton({ index = 0 }) {
  return (
    <div
      className="flex flex-col overflow-hidden rounded-xl border border-line bg-white shadow-xs animate-pulse sm:rounded-2xl"
      style={{ animationDelay: `${index * 80}ms` }}
      aria-hidden="true"
    >
      <div className="flex aspect-square w-full items-center justify-center bg-surface">
        <CameraIcon className="h-7 w-7 text-line" />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-3.5">
        <div className="flex items-center justify-between">
          <div className="h-5 w-20 rounded bg-slate-200" />
          <div className="h-3 w-12 rounded bg-slate-100" />
        </div>
        <div className="h-4 w-full rounded bg-slate-200" />
        <div className="h-4 w-2/3 rounded bg-slate-100" />
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="h-3 w-24 rounded bg-slate-150" />
          <div className="h-4 w-8 rounded bg-slate-150" />
        </div>
      </div>
    </div>
  )
}
