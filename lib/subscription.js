import { supabase } from '@/lib/supabase'

// ---- Where students send the fee. QR images live in public/; width/height are the image's real size. ----
export const PAYMENT_METHODS = [
  {
    id: 'gcash',
    label: 'GCash',
    numberLabel: 'GCash number',
    number: '0992 479 1154',
    name: 'TO*F DA***L V.',
    qr: { src: '/gcashqr.jpg', width: 1080, height: 2066 },
  },
  {
    id: 'gotyme',
    label: 'GoTyme',
    numberLabel: 'GoTyme account',
    number: '•••• 2821',
    name: 'TOFF DARELL VERGARA',
    qr: { src: '/gotymeqr.jpg', width: 888, height: 1300 },
  },
]
// ----------------------------------------------------------------------------------------------------------

export const SUBSCRIPTION_PRICE = 20
export const FREE_ACTIVE_LISTINGS = 3 // must match enforce_free_listing_limit() in migrations_011
export const PROOF_BUCKET = 'payment-proofs'

const dateLabel = (iso) => new Date(iso).toLocaleDateString('en-PH', { dateStyle: 'medium' })

// The student's subscription state from their own rows (RLS only returns their own):
//   { state: 'active', until }   approved and not expired
//   { state: 'pending', since }  waiting for review
//   { state: 'rejected' }        latest request was rejected
//   { state: 'expired', until }  had one, it ended
//   { state: 'none' }            never subscribed
export async function fetchSubscription() {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('status, submitted_at, expires_at')
    .order('submitted_at', { ascending: false })
  if (error) return { state: 'none', error: error.message }

  const rows = data ?? []
  const now = Date.now()
  const active = rows
    .filter((r) => r.status === 'approved' && r.expires_at && new Date(r.expires_at).getTime() > now)
    .sort((a, b) => new Date(b.expires_at) - new Date(a.expires_at))[0]
  const pending = rows.find((r) => r.status === 'pending')

  if (active) return { state: 'active', until: active.expires_at, pending: Boolean(pending) }
  if (pending) return { state: 'pending', since: pending.submitted_at }
  if (rows[0]?.status === 'rejected') return { state: 'rejected' }
  const ended = rows.find((r) => r.status === 'approved')
  if (ended) return { state: 'expired', until: ended.expires_at }
  return { state: 'none' }
}

export function subscriptionLabel(sub) {
  switch (sub?.state) {
    case 'active':
      return `Active until ${dateLabel(sub.until)}`
    case 'pending':
      return 'Pending review'
    case 'rejected':
      return 'Payment not approved'
    case 'expired':
      return `Expired ${dateLabel(sub.until)}`
    default:
      return 'Not subscribed'
  }
}

// The database refuses a 4th active listing with a message starting "FREE_LIMIT:".
export function isFreeLimitError(message) {
  return typeof message === 'string' && message.includes('FREE_LIMIT')
}

export function freeLimitMessage(message) {
  return message.replace(/^.*FREE_LIMIT:\s*/, '')
}

// How many of the student's listings count against the free limit right now.
export async function countActiveListings(userId) {
  const { count } = await supabase
    .from('listings')
    .select('id', { count: 'exact', head: true })
    .eq('seller_id', userId)
    .in('status', ['available', 'reserved'])
  return count ?? 0
}
