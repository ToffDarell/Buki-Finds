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
