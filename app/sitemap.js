import { supabase } from '@/lib/supabase'
import { BROWSE_STATUSES } from '@/lib/listings'
import { SITE_URL } from '@/lib/site'

// Rebuilt at most once an hour, so new listings reach search engines without a redeploy.
export const revalidate = 3600

export default async function sitemap() {
  const { data } = await supabase
    .from('listings')
    .select('id, seller_id, created_at')
    .in('status', BROWSE_STATUSES)
    .order('created_at', { ascending: false })
    .limit(5000)
  const listings = data ?? []

  // One entry per seller, dated by their newest listing.
  const sellers = new Map()
  for (const l of listings) if (!sellers.has(l.seller_id)) sellers.set(l.seller_id, l.created_at)

  return [
    { url: SITE_URL, lastModified: listings[0]?.created_at ?? new Date(), changeFrequency: 'hourly', priority: 1 },
    ...listings.map((l) => ({
      url: `${SITE_URL}/item/${l.id}`,
      lastModified: l.created_at,
      changeFrequency: 'daily',
      priority: 0.8,
    })),
    ...[...sellers].map(([id, lastModified]) => ({
      url: `${SITE_URL}/seller/${id}`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.5,
    })),
    { url: `${SITE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.2 },
  ]
}
