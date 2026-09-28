import { supabase } from '@/lib/supabase'

// { average, count } for a seller, from the public reviews table. average is null with no reviews.
export async function fetchSellerRating(sellerId) {
  const { data } = await supabase.from('reviews').select('rating').eq('seller_id', sellerId)
  const ratings = (data ?? []).map((r) => r.rating)
  if (ratings.length === 0) return { average: null, count: 0 }
  return { average: ratings.reduce((a, b) => a + b, 0) / ratings.length, count: ratings.length }
}

export function formatRating(average) {
  return average == null ? '' : average.toFixed(1)
}

// Where a buyer leaves a review. The token comes from create_review_invite().
export function reviewLink(listingId, token) {
  return `${window.location.origin}/review/${listingId}?t=${token}`
}

// Quick tags a buyer can tick when reviewing (migration 018). Keys are stored in reviews.tags.
export const REVIEW_TAGS = {
  as_described: 'Item as described',
  communication: 'Good communication',
  punctual: 'On time',
  fair_price: 'Fair price',
}
