import { SITE_URL } from '@/lib/site'

// Public pages (browse, items, seller profiles, privacy) are crawlable; account pages and the
// API aren't useful in search results.
export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/login', '/post', '/saved', '/my-listings', '/subscribe', '/review/', '/item/*/edit'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
