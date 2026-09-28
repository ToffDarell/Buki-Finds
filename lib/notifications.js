// Notifications for the signed-in student (migration 016). The database creates them, e.g. when
// someone saves your listing (016) or reviews you (017); the app only reads them and marks them read.
import { supabase } from '@/lib/supabase'

export async function fetchUnreadCount() {
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .is('read_at', null)
  return error ? 0 : count ?? 0
}

export async function fetchNotifications(limit = 50) {
  const { data, error } = await supabase
    .from('notifications')
    .select('id, type, listing_id, listing_title, actor_id, actor_name, actor_avatar, rating, detail, created_at, read_at')
    .order('created_at', { ascending: false })
    .limit(limit)
  return { notifications: data ?? [], error: error?.message ?? '' }
}

export async function markAllRead() {
  await supabase.from('notifications').update({ read_at: new Date().toISOString() }).is('read_at', null)
}

// "just now", "5 minutes ago", "3 hours ago", "2 days ago", then a date.
export function timeAgo(iso) {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000)
  const ago = (n, unit) => `${n} ${unit}${n === 1 ? '' : 's'} ago`
  if (s < 60) return 'just now'
  if (s < 3600) return ago(Math.floor(s / 60), 'minute')
  if (s < 86400) return ago(Math.floor(s / 3600), 'hour')
  if (s < 7 * 86400) return ago(Math.floor(s / 86400), 'day')
  return new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
}
