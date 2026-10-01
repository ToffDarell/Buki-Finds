// Phone and computer notifications (migration 019). The browser gives us a push subscription;
// we store it so /api/push can deliver new notifications even when BukiFinds is closed.
// iPhone and iPad only allow this once BukiFinds is installed to the Home Screen (iOS 16.4+).
import { supabase } from '@/lib/supabase'
import { isInstalled, isIOS } from '@/lib/install'

const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

// 'unsupported' | 'needs-install' (iPhone in Safari) | 'blocked' | 'off' | 'on'
export async function pushStatus() {
  if (typeof window === 'undefined' || !PUBLIC_KEY) return 'unsupported' // not set up on this deploy
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
    return isIOS() && !isInstalled() ? 'needs-install' : 'unsupported'
  }
  if (Notification.permission === 'denied') return 'blocked'
  const reg = await navigator.serviceWorker.getRegistration()
  const sub = await reg?.pushManager.getSubscription()
  return sub ? 'on' : 'off'
}

// The VAPID public key comes as base64url; the browser wants raw bytes.
function keyBytes(base64url) {
  const base64 = (base64url + '='.repeat((4 - (base64url.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/')
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
}

export async function enablePush() {
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return { ok: false, status: permission === 'denied' ? 'blocked' : 'off' }
  // The service worker registers on page load in production only (see ServiceWorker.jsx), so
  // `next dev` never serves old code from its cache. Make sure it's there before subscribing.
  let reg = await navigator.serviceWorker.getRegistration()
  if (!reg) {
    if (process.env.NODE_ENV !== 'production') return { ok: false, status: 'off', error: 'Notifications only work on the live site, not in next dev.' }
    reg = await navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' })
  }
  await navigator.serviceWorker.ready
  const sub = (await reg.pushManager.getSubscription()) || (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(PUBLIC_KEY) }))
  const { endpoint, keys } = sub.toJSON()
  const { error } = await supabase.rpc('save_push_subscription', { p_endpoint: endpoint, p_p256dh: keys.p256dh, p_auth: keys.auth })
  if (error) return { ok: false, status: 'off', error: error.message }
  return { ok: true, status: 'on' }
}

// Turns this device off for the signed-in student. Also called on log out, so the next person who
// signs in on a shared phone doesn't get the previous student's alerts.
export async function disablePush() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return
  try {
    const reg = await navigator.serviceWorker.getRegistration()
    const sub = await reg?.pushManager.getSubscription()
    if (!sub) return
    await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
    await sub.unsubscribe()
  } catch {
    // Nothing to undo, or the browser refused: the server drops dead subscriptions on its own.
  }
}
