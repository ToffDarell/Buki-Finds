import { cleanSearchText } from '@/lib/listings'

// Colleges and universities in Bukidnon with the short names students actually type.
// Searching any name or acronym finds listings saved under any of the others, so "CMU" and
// "Central Mindanao University" land on the same items. Add schools here as students use them:
// `name` is the full official name we store, `aliases` are acronyms and common short forms (the
// first one is what cards show), `town` is where the campus is, shown next to it on cards.
export const BUKIDNON_SCHOOLS = [
  { name: 'Bukidnon State University', aliases: ['BukSU', 'BSU'], town: 'Malaybalay' },
  { name: 'Central Mindanao University', aliases: ['CMU'], town: 'Musuan, Maramag' },
  { name: 'San Isidro College', aliases: ['SIC'], town: 'Malaybalay' },
  // STI has two campuses. Plain "STI" stays general (we can't tell which campus is meant);
  // searching "sti" finds all three. `short` is what cards show instead of the first alias.
  { name: 'STI College', aliases: ['STI'] },
  { name: 'STI College Malaybalay', aliases: ['STI Malaybalay'], short: 'STI', town: 'Malaybalay' },
  { name: 'STI College Valencia', aliases: ['STI Valencia'], short: 'STI', town: 'Valencia' },
  { name: 'Valencia Colleges', aliases: ['VCBI'], town: 'Valencia' },
  { name: 'Northern Bukidnon State College', aliases: ['NBSC'], town: 'Manolo Fortich' },
  { name: 'Mountain View College', aliases: ['MVC'], town: 'Valencia' },
  { name: 'Philippine College Foundation', aliases: ['PCF'], town: 'Valencia' },
  { name: 'Don Carlos Polytechnic College', aliases: ['DCPC'], town: 'Don Carlos' },
  { name: 'IBA College of Mindanao', aliases: ['ICM'], town: 'Valencia' },
]

const lower = (s) => s.toLowerCase()
const isWordLike = (term) => /^[a-z0-9]{2,6}$/i.test(term) // acronym-sized, no spaces

// The known schools a piece of text refers to: an exact acronym ("cmu"), part of a full name
// ("central mindanao"), or text that contains a full name or acronym ("cmu musuan").
export function matchSchools(text) {
  const q = lower(cleanSearchText(text))
  if (q.length < 2) return []
  return BUKIDNON_SCHOOLS.filter(({ name, aliases }) => {
    const n = lower(name)
    if (q.length >= 3 && n.includes(q)) return true
    if (q.includes(n)) return true
    return aliases.some((a) => {
      const al = lower(a)
      return al === q || new RegExp(`(^|[^a-z0-9])${al}([^a-z0-9]|$)`).test(q)
    })
  })
}

// When a seller types a known acronym or full name, store the official full name so listings
// group together. Anything else is kept exactly as typed.
export function canonicalSchool(text) {
  const q = lower((text ?? '').replace(/\s+/g, ' ').trim())
  if (!q) return text
  const hit = BUKIDNON_SCHOOLS.find(({ name, aliases }) => lower(name) === q || aliases.some((a) => lower(a) === q))
  return hit ? hit.name : text
}

// One PostgREST condition for a term in the `school` column. Acronyms match as whole words only,
// so "STI" doesn't hit "Christian" and "SIC" doesn't hit "Basic". The regex is quoted because
// ( ) | $ are reserved characters in PostgREST filter lists.
function schoolCondition(term) {
  const t = lower(term).replace(/[^a-z0-9 .-]/g, '').trim()
  if (!t) return null
  if (isWordLike(t)) return `school.imatch."(^|[^a-z0-9])${t}([^a-z0-9]|$)"`
  return `school.ilike.%${t}%`
}

// Conditions matching the typed text plus every name and acronym of the schools it refers to.
export function schoolConditions(text) {
  const cleaned = cleanSearchText(text)
  const terms = new Set([cleaned])
  for (const { name, aliases } of matchSchools(cleaned)) {
    terms.add(name)
    aliases.forEach((a) => terms.add(a))
  }
  return [...new Set([...terms].map(schoolCondition).filter(Boolean))]
}

// What a card shows for a school: "CMU • Musuan, Maramag" for known schools (acronym + town),
// otherwise the name exactly as the seller typed it.
export function schoolLocationLabel(school) {
  if (!school) return ''
  const hit = matchSchools(school).find(({ name, aliases }) =>
    [name, ...aliases].some((n) => n.toLowerCase() === school.trim().toLowerCase())
  )
  if (!hit) return school
  const short = hit.short ?? hit.aliases[0]
  return hit.town ? `${short} • ${hit.town}` : short
}
