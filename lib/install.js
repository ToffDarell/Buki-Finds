'use client'

// "Install the app" support shared by the install banner and the landing page button.
// Chrome (Android, and desktop) fires beforeinstallprompt once per page load when BukiFinds can be
// installed. It's caught here, as soon as this file loads, so whichever button the student taps
// can open Chrome's install dialog. iPhones have no such event: they install from Share.

let installEvent = null
const listeners = new Set()
const emit = () => listeners.forEach((listener) => listener())

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    installEvent = e
    emit()
  })
  window.addEventListener('appinstalled', () => {
    installEvent = null
    emit()
  })
}

export function subscribeInstall(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

// The waiting install event, or null (not installable, already installed, or iPhone).
export function getInstallEvent() {
  return installEvent
}

// Opens Chrome's install dialog. Resolves to 'accepted', 'dismissed', or null if there's nothing to show.
// Each event works once; Chrome sends a new one on a later visit if they said no.
export async function promptInstall() {
  const e = installEvent
  if (!e) return null
  installEvent = null
  emit()
  e.prompt()
  const { outcome } = await e.userChoice
  return outcome
}

// Opened from the home screen icon.
export function isInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
}

// iPhone or iPad (iPadOS says it's a Mac with a touch screen). In-app browsers (Facebook,
// Messenger, Instagram) can't add to the home screen, so they don't count.
export function isIOS() {
  const ua = navigator.userAgent
  const apple = /iPhone|iPad|iPod/.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1)
  return apple && !/FBAN|FBAV|FB_IAB|Instagram/.test(ua)
}
