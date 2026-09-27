'use client'

// Where to go after logging in, from /login?next=/some/path. Only same-site paths are allowed,
// so a crafted link can't bounce someone to another website.
const KEY = 'buki:after-login'

export function nextPath() {
  const next = new URLSearchParams(window.location.search).get('next')
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/browse'
}

// Google returns to the site's home page (the address Supabase allows), so remember the
// destination before leaving and pick it up once the student is back and signed in.
export function rememberNext() {
  try {
    const next = nextPath()
    if (next !== '/') sessionStorage.setItem(KEY, next)
  } catch {
    // storage blocked: they land on the home page instead
  }
}

export function takeRememberedNext() {
  try {
    const next = sessionStorage.getItem(KEY)
    sessionStorage.removeItem(KEY)
    return next
  } catch {
    return null
  }
}
