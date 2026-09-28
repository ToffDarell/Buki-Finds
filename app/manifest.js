import { SITE_NAME, THEME_COLOR } from '@/lib/site'

// Makes BukiFinds installable ("Add to Home Screen" / "Install app"). Served at /manifest.webmanifest.
// The icons in public/icons are placeholders until the approved app icon is ready.
export default function manifest() {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: 'Buy, sell and swap pre-loved school stuff with college students across Bukidnon.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    theme_color: THEME_COLOR,
    background_color: THEME_COLOR,
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
