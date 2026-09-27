import { facebookShareCode, normalizeFacebookUsername } from '@/lib/listings'

// The Facebook app's "Copy link" gives facebook.com/share/<code>/, which hides the username.
// Browsers can't follow it (Facebook blocks cross-site requests), but Facebook answers a plain
// server request with a redirect to the real profile, e.g. facebook.com/toffdarell?rdid=...
// Only facebook.com/share/ links are fetched, so this can't be used to reach other sites.
export async function POST(request) {
  const { link } = await request.json().catch(() => ({}))
  const code = facebookShareCode(link)
  if (!code) return Response.json({ error: 'Not a Facebook share link.' }, { status: 400 })

  for (const agent of ['curl/8.0', 'facebookexternalhit/1.1']) {
    try {
      const res = await fetch(`https://www.facebook.com/share/${code}/`, {
        redirect: 'manual',
        headers: { 'user-agent': agent },
        signal: AbortSignal.timeout(8000),
        cache: 'no-store',
      })
      const username = normalizeFacebookUsername(res.headers.get('location') || '')
      if (username) return Response.json({ username })
    } catch {
      // try the next user agent
    }
  }
  return Response.json({ error: 'Couldn’t read that share link.' }, { status: 422 })
}
