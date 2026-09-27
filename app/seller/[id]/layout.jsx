import { supabase } from '@/lib/supabase'
import { SITE_NAME } from '@/lib/site'

export async function generateMetadata({ params }) {
  const { id } = await params
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { title: 'Seller not found', robots: { index: false } }

  const [{ data: profile }, { data: listings }] = await Promise.all([
    supabase.rpc('seller_profile', { seller: id }),
    supabase.from('listings').select('seller_name, school').eq('seller_id', id).limit(20),
  ])
  const p = profile?.[0]
  const name = p?.full_name || listings?.[0]?.seller_name || 'Student seller'
  const school = p?.school || [...new Set((listings ?? []).map((l) => l.school).filter(Boolean))].join(', ')
  const description = `See ${name}’s listings${school ? ` from ${school}` : ''} and reviews on ${SITE_NAME}, the student marketplace in Bukidnon.`

  return {
    title: `${name} – seller profile`,
    description,
    alternates: { canonical: `/seller/${id}` },
    openGraph: {
      type: 'profile',
      url: `/seller/${id}`,
      title: `${name} on ${SITE_NAME}`,
      description,
      images: p?.avatar_url ? [p.avatar_url] : undefined,
    },
    // Sellers with nothing listed yet have an empty page: keep it out of search.
    robots: listings?.length ? undefined : { index: false, follow: true },
  }
}

export default function SellerLayout({ children }) {
  return children
}
