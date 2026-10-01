// BukiFinds service worker: caches static files only, so repeat visits load faster, and shows
// phone alerts (push notifications, at the bottom of this file).
//
// It answers ONLY same-site GET requests for:
//   /_next/static/...  JS, CSS and fonts. Their file names change on every deploy, so a cached
//                      copy can never be out of date.
//   /icons/...         the app icons (served from cache, refreshed in the background).
// Everything else (pages, logged-in pages, /api, Supabase, listing photos, listing data) is not
// touched at all and goes to the network exactly as without a service worker, so a sold item can
// never show as available from a cache.

const CACHE = 'bukifinds-static-v1'
const MAX_ENTRIES = 200

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  )
})

function isImmutable(url) {
  return url.pathname.startsWith('/_next/static/')
}
function isIcon(url) {
  return url.pathname.startsWith('/icons/')
}

// Oldest entries go first once the cache holds more than MAX_ENTRIES files (old deploys pile up).
async function trim(cache) {
  const keys = await cache.keys()
  await Promise.all(keys.slice(0, Math.max(0, keys.length - MAX_ENTRIES)).map((key) => cache.delete(key)))
}

async function saveCopy(request, response) {
  if (!response.ok || response.type !== 'basic') return
  const cache = await caches.open(CACHE)
  await cache.put(request, response)
  await trim(cache)
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (!isImmutable(url) && !isIcon(url)) return

  event.respondWith(
    caches.match(request).then((cached) => {
      const fresh = fetch(request).then((response) => {
        event.waitUntil(saveCopy(request, response.clone()))
        return response
      })
      if (cached) {
        // Icons: refresh in the background so a replaced icon shows up on the next visit.
        if (isIcon(url)) event.waitUntil(fresh.catch(() => {}))
        return cached
      }
      return fresh
    })
  )
})

// Phone alerts (migration 019). /api/push sends { title, body, url, tag }. The tag makes a newer
// alert about the same listing replace the older one instead of stacking.
self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch {
    data = { body: event.data ? event.data.text() : '' }
  }
  event.waitUntil(
    self.registration.showNotification(data.title || 'BukiFinds', {
      body: data.body || 'You have a new notification.',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: data.tag,
      data: { url: data.url || '/notifications' },
    })
  )
})

// Tapping an alert opens its page, reusing a BukiFinds tab or the installed app if one is open.
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const target = new URL(event.notification.data?.url || '/notifications', self.location.origin).href
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
      const open = windows.find((w) => new URL(w.url).origin === self.location.origin)
      if (open) return open.focus().then((w) => (w && 'navigate' in w ? w.navigate(target) : w))
      return self.clients.openWindow(target)
    })
  )
})
