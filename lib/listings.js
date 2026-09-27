export const CATEGORIES = [
  'Uniforms',
  'School Shoes',
  'Clothing',
  'Books',
  'School Supplies',
  'Electronics',
  'Food',
  'Services',
  'Other',
]

export const CONDITIONS = ['New', 'Like New', 'Used - Good', 'Used - Fair']

// listings.listing_type. Swaps have no price; swap_for says what the seller wants in return.
export const LISTING_TYPES = { sell: 'For Sale', swap: 'For Swap' }

export function isSwap(listing) {
  return listing.listing_type === 'swap'
}

// The listing's big number: its price, or "For Swap".
export function priceOrSwap(listing) {
  if (isSwap(listing)) return LISTING_TYPES.swap
  return listing.price === '' || listing.price == null ? '₱—' : formatPrice(listing.price)
}

// "Sold" for sales, "Swapped" for swaps (both are status = 'sold' in the database).
export function doneLabel(listing) {
  return isSwap(listing) ? 'Swapped' : 'Sold'
}

// listings.status. Reserved = promised to a buyer; it stays on Browse so others know.
// Letter sizes read as capitals (a typed "l" looks like an I or a 1); number sizes stay as typed.
export function formatSize(size) {
  const s = size?.trim()
  if (!s) return ''
  return /^[a-z]{1,4}$/i.test(s) ? s.toUpperCase() : s
}

export const BROWSE_STATUSES = ['available', 'reserved']

export function isReserved(listing) {
  return listing.status === 'reserved'
}

// Sold listings are deleted (photos included) this many days after sold_at, by the
// purge-sold-listings Edge Function. Keep in sync with RETENTION_DAYS there.
export const PURGE_AFTER_DAYS = 7

// "Oct 2, 2026", or null if the listing isn't sold.
export function purgeDateLabel(listing) {
  if (listing.status !== 'sold' || !listing.sold_at) return null
  const date = new Date(new Date(listing.sold_at).getTime() + PURGE_AFTER_DAYS * 24 * 60 * 60 * 1000)
  return date.toLocaleDateString('en-PH', { dateStyle: 'medium' })
}

// Schools are free text (the app covers every school in Bukidnon), so there is no fixed list.
// Trim, collapse repeated spaces and cap the length so the same school is saved the same way.
export function normalizeSchool(text) {
  return (text ?? '').replace(/\s+/g, ' ').trim().slice(0, 100)
}

// PostgREST uses , ( ) as syntax inside filters and % _ * as wildcards, so strip them from user input.
export function cleanSearchText(text) {
  return (text ?? '').replace(/[%_*,()\\"]/g, ' ').replace(/\s+/g, ' ').trim()
}

export const MAX_IMAGES = 5
export const IMAGE_BUCKET = 'listing-images'

// Nested select used everywhere a listing is shown with its photos.
export const LISTING_WITH_IMAGES = '*, listing_images(id, image_url, sort_order)'

export function formatPrice(value) {
  return `₱${Number(value).toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

// Short, quotable listing number (first 6 chars of the id), e.g. "5DCEAB".
export function listingNumber(listing) {
  return String(listing.id ?? '').replace(/-/g, '').slice(0, 6).toUpperCase()
}

export function sortedImages(listing) {
  return [...(listing.listing_images ?? [])].sort((a, b) => a.sort_order - b.sort_order)
}

export function coverImage(listing) {
  return sortedImages(listing)[0]?.image_url ?? null
}

// <img> onError handler: if a thumbnail is missing (photos uploaded before thumbnails existed),
// swap in the full-size photo once.
export function fallbackToFull(fullUrl) {
  return (e) => {
    if (fullUrl && e.currentTarget.src !== fullUrl) e.currentTarget.src = fullUrl
  }
}

// Facebook paths that aren't a person. "share/…" links (from Facebook's Share profile button)
// hide the username behind a redirect, so the app can't turn them into a Messenger link.
const NOT_A_PROFILE = new Set(['share', 'sharer', 'sharer.php', 'groups', 'pages', 'watch', 'events', 'marketplace', 'story.php', 'permalink.php', 'photo', 'photo.php', 'reel', 'login', 'home.php'])

// Accepts a plain username ("juan.delacruz", "@juan.delacruz") or a full profile link
// ("https://www.facebook.com/juan.delacruz/", "facebook.com/profile.php?id=1000...",
// "facebook.com/people/Juan-Dela-Cruz/1000...", "https://m.me/juan.delacruz") and returns
// just the username/ID. Returns '' for blank input and null if it isn't a usable profile.
export function normalizeFacebookUsername(input) {
  let value = (input ?? '').trim()
  if (!value) return ''

  const profileId = value.match(/profile\.php\?(?:.*&)?id=(\d+)/)
  if (profileId) return profileId[1]

  // Strip protocol, www./m./web., the domain, then any query string or #fragment.
  value = value
    .replace(/^@/, '')
    .replace(/^(https?:\/\/)?(www\.|m\.|web\.|mbasic\.)?(facebook\.com|fb\.com|m\.me)(\/|$)/i, '')
    .split(/[?#]/)[0]
  const [first, second, third] = value.split('/').filter(Boolean)
  if (!first) return null

  // facebook.com/people/Juan-Dela-Cruz/100012345678901
  if (first.toLowerCase() === 'people') return /^\d+$/.test(third ?? '') ? third : null
  if (NOT_A_PROFILE.has(first.toLowerCase()) || second === 'posts') return null

  return /^[A-Za-z0-9.]{1,100}$/.test(first) ? first : null
}

// Cleans the stored value again, so listings saved before normalization (full URLs, "share")
// still get a working link, or no Messenger button at all instead of a broken one.
export function messengerUrl(stored) {
  const username = normalizeFacebookUsername(stored)
  return username ? `https://m.me/${encodeURIComponent(username)}` : null
}

// https://<project>.supabase.co/storage/v1/object/public/listing-images/<path> -> <path>
export function storagePathFromUrl(url) {
  const marker = `/object/public/${IMAGE_BUCKET}/`
  const i = url.indexOf(marker)
  return i === -1 ? null : decodeURIComponent(url.slice(i + marker.length))
}
