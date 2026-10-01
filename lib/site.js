// Where the site lives and who answers privacy questions. Used by metadata, the sitemap,
// robots.txt and the Privacy Policy. Set NEXT_PUBLIC_SITE_URL in Vercel if the domain changes.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bukifinds.online').replace(/\/$/, '')
export const SITE_NAME = 'BukiFinds'
export const SITE_DESCRIPTION =
  'Buy, sell and swap pre-loved uniforms, school shoes, books, gadgets and student services with college students across Bukidnon, from BukSU and CMU to Valencia.'
// The navbar blue (bg-primary), for the installed app's title bar and splash screen. Phones read
// this from the manifest and the theme-color tag, which can't use CSS variables, so it's copied
// from --color-primary in app/globals.css. Change both together.
export const THEME_COLOR = '#00528a'
export const PRIVACY_EMAIL = 'topedarell13@gmail.com'
export const PRIVACY_UPDATED = 'October 1, 2026'

// The students who proposed BukiFinds as their entrepreneurship venture, in the order they gave.
// Names only for now: roles are still being confirmed with them.
export const VENTURE_PARTNERS = [
  'Frazen A. Maisog',
  'Shantara Nikka Kyle Juarez',
  'Thrisya Mae Y. Alia',
  'Britney Jean C. Alagenio',
  'Elvie Jane L. Jaducana',
]
export const VENTURE_PARTNERS_NOTE = 'BukiFinds was proposed by these students as their entrepreneurship venture.'
