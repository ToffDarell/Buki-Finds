import Link from 'next/link'
import { coverImage, doneLabel, fallbackToFull, isReserved, isSwap, listingNumber, priceOrSwap } from '@/lib/listings'
import { thumbUrl } from '@/lib/images'
import SaveButton from '@/app/components/SaveButton'
import { CameraIcon, SwapIcon } from '@/app/components/icons'

function Field({ label, value, wide }) {
  return (
    <div className={`min-w-0 ${wide ? 'flex-1' : 'shrink-0'}`}>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="truncate text-sm font-semibold leading-snug text-ink" title={value}>
        {value}
      </dd>
    </div>
  )
}

// Compact on phones (Carousell-style feed), the full ID-card number from tablet up.
// Sized so a five-digit price still fits the narrowest column at every breakpoint.
const bigNumber = 'card-type tabular text-lg font-extrabold leading-none md:text-2xl xl:text-[1.75rem]'

// The card's one big number: the price, or a drawn Swap mark for swaps (words in the price slot read as a price).
function BigNumber({ listing, sold }) {
  // Swaps wear the logo green: the one place on a card the accent appears.
  const tone = sold ? 'text-muted' : 'text-accent'
  if (isSwap(listing)) {
    return (
      <p className={`${bigNumber} ${tone} flex items-center gap-1.5`}>
        <SwapIcon className="h-[0.9em] w-[0.9em] shrink-0" strokeWidth="2.25" />
        Swap
      </p>
    )
  }
  return <p className={`${bigNumber} ${sold ? 'text-muted line-through decoration-2' : 'text-primary'}`}>{priceOrSwap(listing)}</p>
}

// Phones (below md): a compact feed card, as the owner asked: full-bleed square photo, bold price,
// one-line title, and one tiny muted line of size, school or condition.
// Tablet and up: the vertical lanyard ID: strip with slot punch, framed photo,
// the price as the card's big number, then labeled fields.
// `preview` renders it without a link (used by the live preview on the post form).
export function ListingIdCard({ listing, cover, preview = false }) {
  const photo = cover === undefined ? coverImage(listing) : cover
  const sold = listing.status === 'sold'
  const number = listingNumber(listing)
  const fields = [
    listing.size && { label: 'Size', value: listing.size },
    listing.school && { label: 'School', value: listing.school, wide: true },
    !listing.size && !listing.school && listing.condition && { label: 'Condition', value: listing.condition, wide: true },
  ].filter(Boolean)
  const meta = [listing.size && `Size ${listing.size}`, listing.school || listing.condition].filter(Boolean).join(' · ')

  return (
    <>
      {/* The strip is the lanyard band, kept quiet so the price is the loudest thing on the card. */}
      <div className="relative hidden bg-primary px-3 pb-1.5 pt-3.5 md:block">
        <span aria-hidden="true" className="absolute left-1/2 top-1.5 h-1.5 w-9 -translate-x-1/2 rounded-full bg-white shadow-[inset_0_1px_1px_rgb(6_36_63/0.35)]" />
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-[13px] font-medium text-on-primary-muted">{listing.category || 'Category'}</span>
          {number && <span className="shrink-0 font-mono text-xs text-on-primary-muted">No. {number}</span>}
        </div>
      </div>

      <div className="md:px-2.5 md:pt-2.5">
        <div className="relative aspect-square overflow-hidden bg-surface md:rounded-sm md:ring-1 md:ring-line">
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
          {isReserved(listing) && (
            <span className="absolute bottom-2 left-2 rounded-full bg-white/95 px-2.5 py-0.5 text-xs font-semibold text-primary shadow-card">
              Reserved
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col px-2.5 pb-2.5 pt-2 md:px-3 md:pb-3 md:pt-3">
        <BigNumber listing={listing} sold={sold} />
        <h3 className="mt-1 truncate text-sm leading-snug text-ink md:mt-2 md:line-clamp-2 md:min-h-[2.75em] md:whitespace-normal md:text-[15px]">
          {listing.title || 'Your item title'}
        </h3>
        {isSwap(listing) && (
          <p className="mt-1 hidden truncate text-xs text-muted md:block" title={listing.swap_for || undefined}>
            <span className="font-semibold text-ink">Wants</span> {listing.swap_for || 'open to offers'}
          </p>
        )}
        {fields.length > 0 && (
          <dl className="mt-auto hidden gap-3 border-t border-dashed border-line pt-2.5 md:flex">
            {fields.map((f) => (
              <Field key={f.label} {...f} />
            ))}
          </dl>
        )}
        {meta && <p className="mt-auto truncate pt-1 text-xs text-muted md:hidden" title={meta}>{meta}</p>}
      </div>
    </>
  )
}

const shell = 'flex flex-col overflow-hidden rounded-lg border border-line bg-white md:rounded-[10px] md:shadow-card'

// The heart sits beside the link, not inside it (a button inside a link is invalid and confuses
// screen readers), so the wrapper carries the swing and both move together.
export default function ListingCard({ listing }) {
  const status = listing.status === 'sold' ? `, ${doneLabel(listing).toLowerCase()}` : isReserved(listing) ? ', reserved' : ''
  return (
    <div className="id-swing group relative">
      <Link
        href={`/item/${listing.id}`}
        className={`${shell} h-full group-hover:border-primary/25 group-hover:shadow-card-lift group-focus-within:shadow-card-lift group-active:shadow-card`}
        aria-label={`${listing.title}, ${isSwap(listing) ? 'for swap' : priceOrSwap(listing)}${listing.size ? `, size ${listing.size}` : ''}${status}`}
      >
        <ListingIdCard listing={listing} />
      </Link>
      <SaveButton listingId={listing.id} className="absolute right-2 top-2 md:right-5 md:top-[3.6rem]" />
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

// A blank ID card hanging on its lanyard: the strip and punch are real, the rest waits for ink.
export function ListingCardSkeleton({ index = 0 }) {
  return (
    <div className={`${shell} id-sway`} style={{ '--i': index }} aria-hidden="true">
      <div className="relative hidden h-[37px] bg-primary/85 md:block">
        <span className="absolute left-1/2 top-1.5 h-1.5 w-9 -translate-x-1/2 rounded-full bg-white" />
      </div>
      <div className="md:px-2.5 md:pt-2.5">
        <div className="flex aspect-square items-center justify-center bg-surface md:rounded-sm md:ring-1 md:ring-line">
          <CameraIcon className="h-7 w-7 text-line" />
        </div>
      </div>
      <div className="flex animate-pulse flex-col gap-2 px-2.5 pb-2.5 pt-2.5 md:px-3 md:pb-3 md:pt-3">
        <div className="h-5 w-16 rounded-sm bg-primary/15 md:h-6 md:w-20" />
        <div className="mt-1 h-3.5 w-full rounded-sm bg-line" />
        <div className="hidden h-3.5 w-2/3 rounded-sm bg-line md:block" />
        <div className="md:mt-2 md:border-t md:border-dashed md:border-line md:pt-2.5">
          <div className="h-3 w-1/2 rounded-sm bg-line/80" />
        </div>
      </div>
    </div>
  )
}
