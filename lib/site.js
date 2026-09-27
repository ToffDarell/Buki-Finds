// Where the site lives and who answers privacy questions. Used by metadata, the sitemap,
// robots.txt and the Privacy Policy. Set NEXT_PUBLIC_SITE_URL in Vercel if the domain changes.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bukimart.online').replace(/\/$/, '')
export const SITE_NAME = 'BukiMart'
export const SITE_DESCRIPTION =
  'Buy, sell and swap pre-loved uniforms, school shoes, books, gadgets and student services with college students across Bukidnon, from BukSU and CMU to Valencia.'
export const PRIVACY_EMAIL = 'topedarell13@gmail.com'
export const PRIVACY_UPDATED = 'September 27, 2026'
