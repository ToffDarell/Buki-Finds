export const CATEGORIES = [
  'Uniforms',
  'School Shoes',
  'Shoes',
  'Clothing',
  'Books',
  'School Supplies',
  'Electronics',
  'Food',
  'Services',
  'Bags & Accessories',
  'Phones & Gadgets',
  'Dorm & Home',
  'Beauty & Personal Care',
  'Sports & Hobbies',
  'Handmade & Crafts',
  'Other',
]

export const CONDITIONS = ['New', 'Like New', 'Used - Good', 'Used - Fair']

// ---- Category-specific form fields ------------------------------------------------------------
// Which fields each category shows. Columns that already exist (condition, size, brand,
// deal_methods, meetup_spot) are reused; only the extra fields in `details` are stored in the
// listings.details JSON (migration 006_category_details). category is plain text in the database,
// so a new category needs no migration: add it to CATEGORIES above and give it an entry here.
//   condition: 'required' | 'optional' | false     size / brand / deal: true | false
//   details:   keys of DETAIL_FIELDS shown for this category, in order
const CLOTHES = { condition: 'required', size: true, brand: true, deal: true, details: [] }
const GOODS = { condition: 'required', size: false, brand: true, deal: true, details: [] }
const GADGETS = { condition: 'required', size: false, brand: true, deal: true, details: ['model', 'included', 'issues'] }
export const CATEGORY_FIELDS = {
  Uniforms: CLOTHES,
  'School Shoes': CLOTHES,
  Shoes: CLOTHES, // sneakers, slides, boots: anything that isn't part of a uniform
  Clothing: CLOTHES,
  Books: { condition: 'required', size: false, brand: false, deal: true, details: [] },
  'School Supplies': { condition: 'required', size: false, brand: true, deal: true, details: [] },
  Electronics: GADGETS,
  Food: { condition: false, size: false, brand: false, deal: true, details: ['quantity', 'availability', 'schedule'] },
  Services: {
    condition: false,
    size: false,
    brand: false,
    deal: false,
    details: ['rate_unit', 'where', 'schedule'],
    priceLabel: 'Rate (₱)',
    meetupLabel: 'Location',
    meetupHint: 'Where you usually do this, if it matters. Buyers see this on the listing.',
  },
  'Bags & Accessories': GOODS,
  'Phones & Gadgets': GADGETS,
  'Dorm & Home': GOODS,
  'Beauty & Personal Care': { ...GOODS, details: ['expiry'], categoryHint: 'No medicines or supplements.' },
  'Sports & Hobbies': GOODS,
  'Handmade & Crafts': { condition: false, size: false, brand: false, deal: true, details: ['craft_availability'] },
  Other: {
    condition: 'optional',
    size: false,
    brand: true,
    deal: true,
    details: [],
    descriptionMin: 10,
    categoryHint:
      'Other: plants, tickets, collectibles, and anything that doesn’t fit the categories above.',
    descriptionHint: 'Say what it is and what condition it’s in, since this category has many kinds of items.',
  },
}

// Fields for a category. An empty or unknown category shows the full clothing form, as before.
export function categoryFields(category) {
  return CATEGORY_FIELDS[category] ?? CLOTHES
}

export const RATE_UNITS = { hour: 'per hour', session: 'per session', page: 'per page', project: 'per project', piece: 'per piece' }
const RATE_SHORT = { hour: 'hour', session: 'session', page: 'page', project: 'project', piece: 'piece' }
export const SERVICE_WHERE = { online: 'Online', campus: 'At campus', seller: 'At my place', home: 'Home service', flexible: 'Flexible' }
export const FOOD_AVAILABILITY = { ready: 'Ready now', preorder: 'Pre-order' }
export const CRAFT_AVAILABILITY = { ready: 'Ready now', made_to_order: 'Made to order' }

// The extra fields. `options` makes a select; everything else is a short text input.
// `required: false` fields show "optional"; `max` caps the saved text.
export const DETAIL_FIELDS = {
  model: { label: 'Model', required: false, max: 60, placeholder: 'e.g. fx-991ES Plus, Redmi Note 12' },
  included: { label: 'What’s included', required: true, max: 100, placeholder: 'e.g. charger, box, case', hint: 'Everything the buyer gets.' },
  issues: { label: 'Known issues', required: false, max: 300, notes: true, placeholder: 'e.g. small scratch on the back, battery lasts about 4 hours' },
  quantity: { label: 'Quantity per order', required: true, max: 60, placeholder: 'e.g. 10 pieces, 1 tub, 250 g' },
  availability: { label: 'Availability', required: true, options: FOOD_AVAILABILITY, default: 'ready' },
  schedule: { label: 'Days and time available', required: false, max: 100, placeholder: 'e.g. Mon to Fri, 4–7 PM' },
  expiry: { label: 'Expiry date', required: false, max: 40, placeholder: 'e.g. Dec 2027' },
  craft_availability: { label: 'Availability', required: true, options: CRAFT_AVAILABILITY, default: 'ready' },
  rate_unit: { label: 'Rate unit', required: true, options: RATE_UNITS, default: 'hour' },
  where: { label: 'Where', required: true, options: SERVICE_WHERE, default: 'flexible' },
}

// Keeps only the category's own detail fields: trimmed, capped, selects checked. Used by the form
// both while editing (category switches) and again right before saving.
export function cleanDetails(category, details) {
  const out = {}
  for (const key of categoryFields(category).details) {
    const field = DETAIL_FIELDS[key]
    const raw = details?.[key]
    if (field.options) {
      const value = raw in field.options ? raw : field.default
      if (value) out[key] = value
    } else {
      const value = String(raw ?? '').replace(/\s+/g, ' ').trim().slice(0, field.max)
      if (value) out[key] = value
    }
  }
  return out
}

// A problem with the category fields, in plain words, or '' when everything is fine.
export function categoryProblem({ category, condition, description, details }) {
  const fields = categoryFields(category)
  if (fields.condition === 'required' && !condition) return 'Choose the item’s condition.'
  if (fields.descriptionMin && (description ?? '').trim().length < fields.descriptionMin) {
    return `For ${category}, describe the item in at least ${fields.descriptionMin} characters.`
  }
  const clean = cleanDetails(category, details)
  for (const key of fields.details) {
    if (DETAIL_FIELDS[key].required && !clean[key]) return `Fill in “${DETAIL_FIELDS[key].label}”.`
  }
  return ''
}

// Display value of a detail field ("per hour", "Ready now", or the seller's text).
export function detailValue(key, value) {
  const options = DETAIL_FIELDS[key]?.options
  return options ? options[value] ?? '' : value ?? ''
}

// listings.listing_type. Swaps have no price; swap_for says what the seller wants in return.
export const LISTING_TYPES = { sell: 'For Sale', swap: 'For Swap' }

export function isSwap(listing) {
  return listing.listing_type === 'swap'
}

// The listing's big number: its price, or "For Swap".
// Services show their rate unit: "₱150 / hour".
export function priceOrSwap(listing) {
  if (isSwap(listing)) return LISTING_TYPES.swap
  if (listing.price === '' || listing.price == null) return '₱—'
  const unit = listing.category === 'Services' ? RATE_SHORT[listing.details?.rate_unit] : null
  return unit ? `${formatPrice(listing.price)} / ${unit}` : formatPrice(listing.price)
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

// "nike" and "NIKE" become "Nike" so the Brand filter groups them; a seller's own mixed casing
// ("H&M", "iPhone") is kept as typed.
export const MAX_BRAND_LENGTH = 40
export function formatBrand(text) {
  const s = (text ?? '').replace(/\s+/g, ' ').trim().slice(0, MAX_BRAND_LENGTH)
  if (!s) return ''
  if (s === s.toLowerCase() || s === s.toUpperCase()) {
    return s.toLowerCase().replace(/(^|[\s-])(\p{L})/gu, (_, sep, ch) => sep + ch.toUpperCase())
  }
  return s
}

// How an item can change hands. Listings from before deal methods existed are meet-up only.
export const DEAL_METHODS = { meetup: 'Meet-up', delivery: 'Delivery' }
export function dealMethods(listing) {
  return listing?.deal_methods?.length ? listing.deal_methods : ['meetup']
}
export function offersDelivery(listing) {
  return dealMethods(listing).includes('delivery')
}
// "Meet-up", "Delivery" or "Meet-up or delivery"
export function dealLabel(listing) {
  const methods = dealMethods(listing)
  if (methods.includes('meetup') && methods.includes('delivery')) return 'Meet-up or delivery'
  return DEAL_METHODS[methods[0]] ?? 'Meet-up'
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
// "facebook.com/people/Juan-Dela-Cruz/1000...") or a Messenger link ("https://m.me/juan.delacruz",
// "messenger.com/t/juan.delacruz") and returns
// just the username/ID. Returns '' for blank input and null if it isn't a usable profile.
export function normalizeFacebookUsername(input) {
  let value = (input ?? '').trim()
  if (!value) return ''

  const profileId = value.match(/profile\.php\?(?:.*&)?id=(\d+)/)
  if (profileId) return profileId[1]

  // Messenger chat links: messenger.com/t/juan.delacruz or messenger.com/t/100012345678901
  const chat = value.match(/^(?:https?:\/\/)?(?:www\.)?messenger\.com\/t\/([A-Za-z0-9.]{1,100})\/?(?:[?#].*)?$/i)
  if (chat) return chat[1]

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

// Turns what a seller pasted into their username. A bare username is cleaned right here; any
// link goes to our server (app/api/social-username/route.js), because the links phones copy
// often carry a code instead of the name (facebook.com/share/…, m.me/<code>, instagram.com/share/…)
// and only following them reveals the account. Returns '' for blank, null if it isn't a profile.
export async function resolveSocialUsername(platform, input) {
  const normalize = platform === 'instagram' ? normalizeInstagramUsername : normalizeFacebookUsername
  const raw = (input ?? '').trim()
  const local = normalize(raw)
  if (!raw || /^@?[A-Za-z0-9._]+$/.test(raw)) return local
  try {
    const res = await fetch('/api/social-username', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ platform, link: raw }),
    })
    if (res.ok) {
      const { username } = await res.json()
      return username ? normalize(username) : null
    }
    if (res.status === 502) return null // a code link we couldn't check: don't guess
  } catch {
    // offline: fall back to reading the link itself
  }
  return local
}

// Cleans the stored value again, so listings saved before normalization (full URLs, "share")
// still get a working link, or no Messenger button at all instead of a broken one.
export function messengerUrl(stored) {
  const username = normalizeFacebookUsername(stored)
  return username ? `https://m.me/${encodeURIComponent(username)}` : null
}

// Instagram paths that aren't a person (posts, reels, stories, DMs...).
const IG_NOT_A_PROFILE = new Set(['p', 'reel', 'reels', 'stories', 'explore', 'direct', 'accounts', 'tv', 'share', 's', 'about', 'legal', 'developer', 'web'])

// Accepts "juan.delacruz", "@juan.delacruz", "https://www.instagram.com/juan.delacruz/",
// the app's "Copy profile URL" link ("instagram.com/juan.delacruz?igsh=..."), instagr.am links
// and DM links ("ig.me/m/juan.delacruz"). Returns the lowercase username, '' for blank input,
// and null if it isn't a profile. Instagram usernames are letters, numbers, . and _ (max 30).
export function normalizeInstagramUsername(input) {
  const value = (input ?? '').trim()
  if (!value) return ''

  let parts = value
    .replace(/^@/, '')
    .replace(/^(https?:\/\/)?(www\.|m\.)?(instagram\.com|instagr\.am|ig\.me)(\/|$)/i, '')
    .split(/[?#]/)[0]
    .split('/')
    .filter(Boolean)
  // DM links: ig.me/m/<name> and the instagram.com/m/<name> it redirects to.
  if (parts[0] === 'm' && parts.length > 1) parts = parts.slice(1)
  const [first] = parts
  if (!first || IG_NOT_A_PROFILE.has(first.toLowerCase())) return null

  return /^[A-Za-z0-9._]{1,30}$/.test(first) ? first.toLowerCase() : null
}

// Opens a DM with the seller in the Instagram app (or instagram.com without the app).
export function instagramUrl(stored) {
  const username = normalizeInstagramUsername(stored)
  return username ? `https://ig.me/m/${username}` : null
}

// https://<project>.supabase.co/storage/v1/object/public/listing-images/<path> -> <path>
export function storagePathFromUrl(url) {
  const marker = `/object/public/${IMAGE_BUCKET}/`
  const i = url.indexOf(marker)
  return i === -1 ? null : decodeURIComponent(url.slice(i + marker.length))
}
