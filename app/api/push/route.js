import webpush from 'web-push'
import { createClient } from '@supabase/supabase-js'
import { PRIVACY_EMAIL, SITE_NAME } from '@/lib/site'

// Delivers one notification to every device its student turned notifications on for.
// Called by the database (push_notification() in migration 019) right after a notification is
// written, with { id } and the shared secret. Server-only settings, all set in Vercel:
//   PUSH_WEBHOOK_SECRET            same value as the push_webhook_secret Vault secret
//   SUPABASE_SERVICE_ROLE_KEY      Supabase > Project Settings > API (never expose to the browser)
//   NEXT_PUBLIC_VAPID_PUBLIC_KEY   VAPID key pair, made once with: npx web-push generate-vapid-keys
//   VAPID_PRIVATE_KEY
//   VAPID_SUBJECT                  optional; defaults to mailto:PRIVACY_EMAIL

// What the phone shows for each kind of notification. Kept short: lock screens cut long text.
function message(n) {
  const item = n.listing_title || 'your listing'
  switch (n.type) {
    case 'saved':
      return { title: 'Someone saved your item', body: `${n.actor_name} saved ${item}.`, url: n.listing_id ? `/item/${n.listing_id}` : '/notifications' }
    case 'review':
      return { title: `New ${n.rating}-star review`, body: `${n.actor_name} reviewed you${n.listing_title ? ` for ${n.listing_title}` : ''}.`, url: '/notifications' }
    case 'price_drop':
      return { title: 'Price drop on an item you saved', body: `${item}: ${n.detail ?? 'now cheaper'}`, url: n.listing_id ? `/item/${n.listing_id}` : '/saved' }
    case 'stale':
      return { title: 'Is it still available?', body: `Tap to confirm ${item} is still there, or mark it as sold.`, url: n.listing_id ? `/item/${n.listing_id}` : '/my-listings' }
    default:
      return { title: SITE_NAME, body: 'You have a new notification.', url: '/notifications' }
  }
}

export async function POST(request) {
  const secret = process.env.PUSH_WEBHOOK_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return Response.json({ error: 'Not allowed.' }, { status: 401 })
  }
  const { NEXT_PUBLIC_SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: serviceKey } = process.env
  const { NEXT_PUBLIC_VAPID_PUBLIC_KEY: publicKey, VAPID_PRIVATE_KEY: privateKey } = process.env
  if (!url || !serviceKey || !publicKey || !privateKey) {
    return Response.json({ error: 'Push isn’t set up on the server.' }, { status: 500 })
  }

  let id
  try {
    ;({ id } = await request.json())
  } catch {
    return Response.json({ error: 'Bad request.' }, { status: 400 })
  }
  if (typeof id !== 'string') return Response.json({ error: 'Bad request.' }, { status: 400 })

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } })
  const { data: n } = await admin
    .from('notifications')
    .select('id, user_id, type, listing_id, listing_title, actor_name, rating, detail')
    .eq('id', id)
    .maybeSingle()
  if (!n) return Response.json({ sent: 0 })

  const { data: devices } = await admin.from('push_subscriptions').select('id, endpoint, p256dh, auth').eq('user_id', n.user_id)
  if (!devices?.length) return Response.json({ sent: 0 })

  webpush.setVapidDetails(process.env.VAPID_SUBJECT || `mailto:${PRIVACY_EMAIL}`, publicKey, privateKey)
  const payload = JSON.stringify({ ...message(n), tag: `${n.type}-${n.listing_id ?? n.id}` })

  let sent = 0
  const gone = []
  await Promise.all(
    devices.map(async (d) => {
      try {
        await webpush.sendNotification({ endpoint: d.endpoint, keys: { p256dh: d.p256dh, auth: d.auth } }, payload, { TTL: 60 * 60 * 24 })
        sent++
      } catch (err) {
        // 404/410: the browser dropped this subscription (app uninstalled, permission removed).
        if (err?.statusCode === 404 || err?.statusCode === 410) gone.push(d.id)
      }
    })
  )
  if (gone.length) await admin.from('push_subscriptions').delete().in('id', gone)
  return Response.json({ sent })
}
