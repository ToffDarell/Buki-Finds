import Link from 'next/link'
import { coverImage, doneLabel, fallbackToFull, formatSize, isReserved, isSwap, priceOrSwap } from '@/lib/listings'
import { thumbUrl } from '@/lib/images'
import SaveButton from '@/app/components/SaveButton'
import { schoolLocationLabel } from '@/lib/schools'
import { CameraIcon, PinIcon, SwapIcon } from '@/app/components/icons'

// Price in brand green, as in the team's Buki-Finds prototype; swaps get a drawn Swap mark
// (words in the price slot would read as a price).
function BigNumber({ listing, sold }) {
  if (isSwap(listing)) {
    return (
      <p className={`card-type flex items-center gap-1 text-lg font-extrabold leading-none ${sold ? 'text-muted' : 'text-accent'}`}>
        <SwapIcon className="h-[0.9em] w-[0.9em] shrink-0" strokeWidth="2.25" />
        Swap
      </p>
    )
  }
  return (
    <p className={`card-type tabular text-lg font-extrabold leading-none sm:text-xl ${sold ? 'text-muted line-through decoration-2' : 'text-accent'}`}>
      {priceOrSwap(listing)}
    </p>
  )
}

// Photo-first card following the team's Buki-Finds prototype: bold title, green price, then
// "CMU • Musuan, Maramag" and a quiet size/condition line. `preview` renders it without a link.
export function ListingIdCard({ listing, cover, preview = false }) {
  const photo = cover === undefined ? coverImage(listing) : cover
  const sold = listing.status === 'sold'
  const location = schoolLocationLabel(listing.school)
  const size = formatSize(listing.size)
  const details = [size && `Size ${size}`, listing.condition].filter(Boolean).join(' · ')

  return (
    <>
      <div className="relative aspect-square overflow-hidden bg-surface">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview ? photo : thumbUrl(photo)}
            onError={preview ? undefined : fallbackToFull(photo)}
            alt={listing.title || 'Listing photo'}
            className={`id-photo h-full w-full object-cover ${sold ? 'grayscale' : ''}`}
            loading={preview ? undefined : 'lazy'}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-muted">
            <CameraIcon className="h-6 w-6" />
            <span className="text-xs">No photo</span>
          </div>
        )}
        {sold && (
          <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 bg-ink/85 py-1 text-center text-sm font-bold uppercase tracking-[0.2em] text-white">
            {doneLabel(listing)}
          </span>
        )}
        {!sold && isReserved(listing) && (
          <span className="absolute bottom-2 left-2 rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold text-primary shadow-card">
            Reserved
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-3.5 pb-3.5 pt-3">
        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-ink sm:text-[15px]" title={listing.title}>
          {listing.title || 'Your item title'}
        </h3>
        <div className="mt-1.5">
          <BigNumber listing={listing} sold={sold} />
        </div>
        {isSwap(listing) && listing.swap_for && (
          <p className="mt-1 truncate text-xs text-muted" title={listing.swap_for}>
            <span className="font-semibold text-ink">Wants</span> {listing.swap_for}
          </p>
        )}
        <div className="mt-auto pt-2">
          {location && (
            <p className="flex items-center gap-1 text-xs text-muted" title={listing.school}>
              <PinIcon className="h-3.5 w-3.5 shrink-0 text-accent" />
              <span className="truncate">{location}</span>
            </p>
          )}
          {details && <p className="mt-0.5 truncate text-xs text-muted">{details}</p>}
        </div>
      </div>
    </>
  )
}

const shell = 'flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-card'

// The heart sits beside the link, not inside it (a button inside a link is invalid and confuses
// screen readers), so the wrapper carries the hover and both move together.
export default function ListingCard({ listing }) {
  const status = listing.status === 'sold' ? `, ${doneLabel(listing).toLowerCase()}` : isReserved(listing) ? ', reserved' : ''
  return (
    <div className="id-swing group relative h-full">
      <Link
        href={`/item/${listing.id}`}
        className={`${shell} transition-[border-color,box-shadow] duration-300 group-hover:border-primary/30 group-hover:shadow-card-lift`}
        aria-label={`${listing.title}, ${isSwap(listing) ? 'for swap' : priceOrSwap(listing)}${listing.size ? `, size ${size}` : ''}${status}`}
      >
        <ListingIdCard listing={listing} />
      </Link>
      <SaveButton listingId={listing.id} className="absolute right-2 top-2" />
    </div>
  )
}

export function ListingCardPreview({ listing, cover }) {
  return (
    <div className={shell}>
      <ListingIdCard listing={listing} cover={cover} preview />
    </div>
  )
}

// Same shape as the card, in palette tokens, pulsing while listings load.
export function ListingCardSkeleton({ index = 0 }) {
  return (
    <div className={`${shell} animate-pulse`} style={{ animationDelay: `${index * 80}ms` }} aria-hidden="true">
      <div className="flex aspect-square items-center justify-center bg-surface">
        <CameraIcon className="h-7 w-7 text-line" />
      </div>
      <div className="flex flex-col gap-2 px-3 pb-3 pt-2.5">
        <div className="h-5 w-16 rounded-sm bg-primary/15" />
        <div className="h-3.5 w-full rounded-sm bg-line" />
        <div className="h-3 w-2/3 rounded-sm bg-line/70" />
      </div>
    </div>
  )
}
