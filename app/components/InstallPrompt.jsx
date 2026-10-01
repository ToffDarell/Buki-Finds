'use client'

import { useState, useSyncExternalStore } from 'react'
import { usePathname } from 'next/navigation'
import { CloseIcon } from '@/app/components/icons'
import { getInstallEvent, isInstalled, isIOS, promptInstall, subscribeInstall } from '@/lib/install'

// "Install BukiFinds" strip on Android phones and a one-time "Add to Home Screen" tip on iPhone/iPad.
// Closing it hides the strip for good; the Install button on the landing page stays available.
// Neither shows inside the installed app.
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
// Android phones that haven't closed the strip. Desktop Chrome can install too, from the landing
// page button, but gets no strip.
function readAndroidBanner() {
  return /Android/i.test(navigator.userAgent) && !readFlag(DISMISSED_KEY) && !isInstalled()
}
const subscribe = () => () => {}

function Banner({ children, onDismiss, label }) {
  return (
    <div className="border-b border-primary/20 bg-primary-soft">
      <div className="mx-auto flex max-w-7xl items-start gap-3 px-4 py-2 sm:items-center sm:px-6">
        {/* Phones: message, then the button under it. Wider screens: one row. */}
        <div className="flex min-w-0 flex-1 flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">{children}</div>
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
  // Browse already carries the "What's new" strip (WhatsNewBanner), so no second strip there. The
  // iOS tip isn't even read on Browse, so it isn't used up there.
  const onBrowse = usePathname() === '/browse'
  const never = () => false
  // Server render and first paint: nothing, so nothing flashes for people who closed it.
  const androidBanner = useSyncExternalStore(subscribe, onBrowse ? never : readAndroidBanner, never)
  const showIosTip = useSyncExternalStore(subscribe, onBrowse ? never : readIosTip, never)
  const installEvent = useSyncExternalStore(subscribeInstall, getInstallEvent, () => null)
  const [closed, setClosed] = useState(false)

  if (closed) return null

  if (androidBanner && installEvent) {
    const dismiss = () => {
      saveFlag(DISMISSED_KEY)
      setClosed(true)
    }
    const install = async () => {
      // Installed, or said no in Chrome's dialog: either way, the strip doesn't ask again.
      await promptInstall()
      dismiss()
    }
    return (
      <Banner onDismiss={dismiss} label="Dismiss install banner">
        <p className="min-w-0 text-sm text-primary sm:flex-1">Open BukiFinds from your home screen, like an app.</p>
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
      <Banner onDismiss={() => setClosed(true)} label="Dismiss install tip">
        <p className="min-w-0 text-sm text-primary sm:flex-1">
          <span className="font-semibold">Install BukiFinds:</span> tap Share, then Add to Home Screen.
        </p>
      </Banner>
    )
  }

  return null
}
