import Link from 'next/link'
import { coverImage, fallbackToFull, formatPrice, listingNumber } from '@/lib/listings'
import { thumbUrl } from '@/lib/images'
import { CameraIcon } from '@/app/components/icons'

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

// A listing drawn as a vertical lanyard ID: strip with slot punch, framed photo,
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

  return (
    <>
      <div className="relative bg-primary px-3 pb-2 pt-4">
        <span aria-hidden="true" className="absolute left-1/2 top-1.5 h-1.5 w-9 -translate-x-1/2 rounded-full bg-white shadow-[inset_0_1px_1px_rgb(15_29_69/0.35)]" />
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-sm font-semibold text-white">
            {listing.category || 'Category'}
          </span>
          {number && <span className="hidden shrink-0 font-mono text-xs text-on-primary-muted sm:inline">No. {number}</span>}
        </div>
      </div>

      <div className="px-2.5 pt-2.5">
        <div className="relative aspect-square overflow-hidden rounded-sm bg-surface ring-1 ring-line">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview ? photo : thumbUrl(photo)}
              onError={preview ? undefined : fallbackToFull(photo)}
              alt={listing.title || 'Listing photo'}
              className={`h-full w-full object-cover ${sold ? 'grayscale' : ''}`}
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
              Sold
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col px-3 pb-3 pt-2">
        <p className={`card-type tabular text-2xl font-bold leading-none ${sold ? 'text-muted line-through decoration-2' : 'text-primary'}`}>
          {listing.price === '' || listing.price == null ? '₱—' : formatPrice(listing.price)}
        </p>
        <h3 className="mt-1.5 line-clamp-2 min-h-[2.8em] text-[15px] leading-snug text-ink">
          {listing.title || 'Your item title'}
        </h3>
        {fields.length > 0 && (
          <dl className="mt-auto flex gap-3 border-t border-dashed border-line pt-2">
            {fields.map((f) => (
              <Field key={f.label} {...f} />
            ))}
          </dl>
        )}
        {/* On phones the strip only has room for the category, so the No. moves down here. */}
        {number && (
          <p className={`font-mono text-xs text-muted sm:hidden ${fields.length > 0 ? 'mt-1.5' : 'mt-auto border-t border-dashed border-line pt-2'}`}>
            No. {number}
          </p>
        )}
      </div>
    </>
  )
}

const shell = 'flex flex-col overflow-hidden rounded-[10px] border border-line bg-white shadow-card'

export default function ListingCard({ listing }) {
  return (
    <Link
      href={`/item/${listing.id}`}
      className={`${shell} id-swing hover:shadow-card-lift focus-visible:shadow-card-lift`}
      aria-label={`${listing.title}, ${formatPrice(listing.price)}${listing.size ? `, size ${listing.size}` : ''}${listing.status === 'sold' ? ', sold' : ''}`}
    >
      <ListingIdCard listing={listing} />
    </Link>
  )
}

export function ListingCardPreview({ listing, cover }) {
  return (
    <div className={shell}>
      <ListingIdCard listing={listing} cover={cover} preview />
    </div>
  )
}

export function ListingCardSkeleton() {
  return (
    <div className={`${shell} animate-pulse`} aria-hidden="true">
      <div className="h-[42px] bg-primary/80" />
      <div className="px-2.5 pt-2.5">
        <div className="aspect-square rounded-sm bg-line/70" />
      </div>
      <div className="flex flex-col gap-2 px-3 pb-3 pt-3">
        <div className="h-6 w-20 rounded bg-line" />
        <div className="h-3.5 w-full rounded bg-line/70" />
        <div className="h-3.5 w-2/3 rounded bg-line/70" />
      </div>
    </div>
  )
}
