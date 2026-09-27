import { supabase } from '@/lib/supabase'
import { LISTING_WITH_IMAGES, coverImage, formatPrice, isSwap } from '@/lib/listings'
import { SITE_NAME, SITE_URL } from '@/lib/site'

// The item page itself is a client component; this server layout gives each listing its own
// title, description, share preview and Product data for search engines.
async function getListing(id) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null
  const { data } = await supabase.from('listings').select(LISTING_WITH_IMAGES).eq('id', id).maybeSingle()
  return data
}

function summary(listing) {
  const offer = isSwap(listing) ? `For swap${listing.swap_for ? ` with ${listing.swap_for}` : ''}` : formatPrice(listing.price)
  const details = [offer, listing.condition, listing.size && `Size ${listing.size}`, listing.school].filter(Boolean).join(' · ')
  const text = listing.description
    ? `${details}. ${listing.description}`
    : `${details}. Pre-loved on ${SITE_NAME}, the student marketplace in Bukidnon.`
  return text.replace(/\s+/g, ' ').slice(0, 160)
}

export async function generateMetadata({ params }) {
  const { id } = await params
  const listing = await getListing(id)
  if (!listing) return { title: 'Listing not found', robots: { index: false } }

  const image = coverImage(listing)
  const title = `${listing.title}${isSwap(listing) ? ' (for swap)' : ` – ${formatPrice(listing.price)}`}`
  const description = summary(listing)
  return {
    title,
    description,
    alternates: { canonical: `/item/${listing.id}` },
    // Sold items stay reachable for a week, but shouldn't show up in search.
    robots: listing.status === 'sold' ? { index: false, follow: true } : undefined,
    openGraph: {
      type: 'website',
      url: `/item/${listing.id}`,
      title,
      description,
      images: image ? [{ url: image, alt: listing.title }] : undefined,
    },
    twitter: { card: image ? 'summary_large_image' : 'summary', title, description, images: image ? [image] : undefined },
  }
}

const CONDITION = {
  New: 'https://schema.org/NewCondition',
  'Like New': 'https://schema.org/UsedCondition',
  'Used - Good': 'https://schema.org/UsedCondition',
  'Used - Fair': 'https://schema.org/UsedCondition',
}

// Product structured data lets Google show the price and condition in search results.
function productJsonLd(listing) {
  if (!listing || isSwap(listing) || listing.price == null) return null
  const images = (listing.listing_images ?? []).map((i) => i.image_url)
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: listing.title,
    description: listing.description || undefined,
    image: images.length ? images : undefined,
    category: listing.category,
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/item/${listing.id}`,
      price: Number(listing.price),
      priceCurrency: 'PHP',
      availability: listing.status === 'sold' ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
      itemCondition: CONDITION[listing.condition],
      seller: { '@type': 'Person', name: listing.seller_name || 'Student seller' },
    },
  }
}

export default async function ItemLayout({ children, params }) {
  const { id } = await params
  const jsonLd = productJsonLd(await getListing(id))
  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          // Escape "<" so a listing title can't close the script tag.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
        />
      )}
      {children}
    </>
  )
}
