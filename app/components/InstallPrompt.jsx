'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import { CloseIcon } from '@/app/components/icons'

// "Install BukiFinds" on Android (Chrome's beforeinstallprompt) and a one-time "Add to Home Screen"
// tip on iPhone/iPad, which has no install prompt. Neither shows inside the installed app.
const DISMISSED_KEY = 'bukifinds:install-dismissed'
const IOS_TIP_KEY = 'bukifinds:ios-install-tip-seen'

function readFlag(key) {
  try {
    return localStorage.getItem(key) === '1'
  } catch {
    return false
  }
}
function saveFlag(key) {
  try {
    localStorage.setItem(key, '1')
  } catch {
    // storage blocked: the banner may show again next visit
  }
}

function isInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
}

// iPhone or iPad (iPadOS says it's a Mac with a touch screen). In-app browsers (Facebook,
// Messenger, Instagram) can't add to the home screen, so no tip there.
function isIOS() {
  const ua = navigator.userAgent
  const apple = /iPhone|iPad|iPod/.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1)
  return apple && !/FBAN|FBAV|FB_IAB|Instagram/.test(ua)
}

// Worked out once per page load and marked as seen straight away, so the tip shows on one visit
// only and doesn't vanish mid-visit when something re-renders.
let iosTip = null
function readIosTip() {
  if (iosTip === null) {
    iosTip = isIOS() && !isInstalled() && !readFlag(IOS_TIP_KEY)
    if (iosTip) saveFlag(IOS_TIP_KEY)
  }
  return iosTip
}
function readAndroidDismissed() {
  return readFlag(DISMISSED_KEY) || isInstalled()
}
const subscribe = () => () => {}

function Banner({ children, onDismiss, label }) {
  return (
    <div className="border-b border-primary/20 bg-primary-soft">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2 sm:px-6">
        {children}
        <button
          type="button"
          onClick={onDismiss}
          aria-label={label}
          className="-mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-primary transition-colors hover:bg-primary/10"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default function InstallPrompt() {
  // Server render and first paint: nothing, so nothing flashes for people who closed it.
  const androidDismissed = useSyncExternalStore(subscribe, readAndroidDismissed, () => true)
  const showIosTip = useSyncExternalStore(subscribe, readIosTip, () => false)
  const [installEvent, setInstallEvent] = useState(null)
  const [closed, setClosed] = useState(false)

  useEffect(() => {
    function onPrompt(e) {
      // Phones only, and not after "no thanks": then Chrome's own install option stays as it was.
      if (!/Android/i.test(navigator.userAgent) || readFlag(DISMISSED_KEY)) return
      e.preventDefault()
      setInstallEvent(e)
    }
    function onInstalled() {
      setInstallEvent(null)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (closed) return null

  function dismiss() {
    setClosed(true)
    if (installEvent) saveFlag(DISMISSED_KEY)
  }

  async function install() {
    installEvent.prompt()
    const { outcome } = await installEvent.userChoice
    // Installed, or said no in Chrome's dialog: either way, don't ask again.
    saveFlag(DISMISSED_KEY)
    setInstallEvent(null)
    if (outcome !== 'accepted') setClosed(true)
  }

  if (installEvent && !androidDismissed) {
    return (
      <Banner onDismiss={dismiss} label="Dismiss install banner">
        <p className="min-w-0 flex-1 text-sm text-primary">Open BukiFinds from your home screen, like an app.</p>
        <button
          type="button"
          onClick={install}
          className="min-h-9 shrink-0 rounded-md bg-primary px-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          Install BukiFinds
        </button>
      </Banner>
    )
  }

  if (showIosTip) {
    return (
      <Banner onDismiss={dismiss} label="Dismiss install tip">
        <p className="min-w-0 flex-1 text-sm text-primary">
          <span className="font-semibold">Install BukiFinds:</span> tap Share, then Add to Home Screen.
        </p>
      </Banner>
    )
  }

  return null
}
