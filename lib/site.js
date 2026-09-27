// Where the site lives and who answers privacy questions. Used by metadata, the sitemap,
// robots.txt and the Privacy Policy. Set NEXT_PUBLIC_SITE_URL in Vercel if the domain changes.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://buki-find.vercel.app').replace(/\/$/, '')
export const SITE_NAME = 'Buki-Finds'
export const SITE_DESCRIPTION =
  'Buy, sell and swap pre-loved uniforms, school shoes, books and school supplies with college students across Bukidnon: BukSU, CMU and more.'
export const PRIVACY_EMAIL = 'topedarell13@gmail.com'
export const PRIVACY_UPDATED = 'September 27, 2026'
