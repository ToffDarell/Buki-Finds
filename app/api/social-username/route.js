import { normalizeFacebookUsername, normalizeInstagramUsername } from '@/lib/listings'

// Turns whatever link a seller copied into their username, on any phone:
//   Facebook app / FB Lite:  facebook.com/share/1LmyGgyssq/  -> redirects to facebook.com/toffdarell
//   Messenger / Messenger Lite: m.me/<name or code>           -> redirects to messenger.com/t/<id>
//   fb.me/…, profile.php?id=…                                 -> redirect to facebook.com/<username>
//   Instagram: instagram.com/<name>?igsh=…, /share/…, ig.me/…, instagr.am/…
// Browsers can't follow these (the sites block cross-site requests), so the server does it,
// one redirect at a time, and never leaves the platform's own domains.

const HOSTS = {
  facebook: /(^|\.)(facebook\.com|fb\.com|fb\.me|m\.me|messenger\.com)$/i,
  instagram: /(^|\.)(instagram\.com|instagr\.am|ig\.me)$/i,
}
const NORMALIZE = { facebook: normalizeFacebookUsername, instagram: normalizeInstagramUsername }
const MAX_HOPS = 5

function toUrl(link) {
  try {
    const url = new URL(/^https?:\/\//i.test(link) ? link : `https://${link}`)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url : null
  } catch {
    return null
  }
}

// Links whose path is a code rather than a username: only trust what the redirect says.
function isCodeLink(platform, url) {
  const host = url.hostname.toLowerCase()
  if (/^\/share\//i.test(url.pathname)) return true
  return platform === 'facebook' && /(^|\.)(m\.me|fb\.me)$/.test(host)
}

async function follow(platform, start) {
  const normalize = NORMALIZE[platform]
  let current = start
  for (let hop = 0; hop < MAX_HOPS; hop++) {
    const res = await fetch(current, {
      redirect: 'manual',
      headers: { 'user-agent': 'curl/8.0', accept: 'text/html' },
      signal: AbortSignal.timeout(6000),
      cache: 'no-store',
    })
    const location = res.headers.get('location')

    if (!location) {
      // Instagram profile pages name the account in their metadata, whatever link led there.
      if (platform === 'instagram' && res.ok) {
        const html = (await res.text()).slice(0, 400_000)
        const ogUrl = html.match(/<meta[^>]+property="og:url"[^>]+content="([^"]+)"/i)?.[1]
        const username = ogUrl && normalize(ogUrl)
        if (username) return { username }
      }
      return { username: null }
    }

    const next = new URL(location, current)
    // m.me/<name or code> -> messenger.com/t/<numeric id>; an unknown code lands on messenger.com/.
    if (platform === 'facebook' && /(^|\.)messenger\.com$/i.test(next.hostname)) {
      const id = next.pathname.match(/^\/t\/([A-Za-z0-9.]{1,100})\/?$/)?.[1]
      if (id) return { username: id }
      // Home page = unknown name/code. (A login page just means Messenger wants a session.)
      return { username: null, definite: next.pathname === '/' }
    }
    if (/^\/(login|accounts\/login)/i.test(next.pathname)) return { username: null }

    const username = normalize(next.href)
    if (username) return { username }
    if (!HOSTS[platform].test(next.hostname)) return { username: null }
    current = next
  }
  return { username: null }
}

export async function POST(request) {
  const { platform, link } = await request.json().catch(() => ({}))
  const normalize = NORMALIZE[platform]
  const url = normalize && typeof link === 'string' && link.length <= 500 ? toUrl(link.trim()) : null
  if (!url || !HOSTS[platform].test(url.hostname)) {
    return Response.json({ error: 'Not a Facebook, Messenger or Instagram link.' }, { status: 400 })
  }

  const code = isCodeLink(platform, url)
  try {
    const found = await follow(platform, url)
    if (found.username) return Response.json({ username: found.username })
    // The site said this code/name leads nowhere (e.g. m.me/<unknown> -> messenger.com home).
    if (found.definite || code) return Response.json({ username: null })
  } catch {
    // Facebook or Instagram didn't answer; the link's own path is the best we have.
    if (code) return Response.json({ error: 'Couldn’t reach Facebook or Instagram.' }, { status: 502 })
  }
  return Response.json({ username: normalize(link) || null })
}
