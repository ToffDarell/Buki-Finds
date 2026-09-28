'use client'

import { useState, useSyncExternalStore } from 'react'
import { CloseIcon, DownloadIcon } from '@/app/components/icons'
import { getInstallEvent, installPlatform, promptInstall, subscribeInstall } from '@/lib/install'

// A one-time "What's new" note on Browse. Change WHATS_NEW_ID when there's a new update to announce;
// students who dismissed the last one will then see the new one.
// This update: BukiFinds can be installed on phones. Hidden inside the installed app and in browsers
// that can't install it.
const WHATS_NEW_ID = '2026-09-29-install'
const KEY = `bukifinds:whats-new-dismissed:${WHATS_NEW_ID}`

function readDismissed() {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}
const subscribe = () => () => {}

export default function WhatsNewBanner() {
  // Server render and first paint: treat as dismissed, so the banner never flashes for people who closed it.
  const stored = useSyncExternalStore(subscribe, readDismissed, () => true)
  const platform = useSyncExternalStore(subscribe, installPlatform, () => 'installed')
  const installEvent = useSyncExternalStore(subscribeInstall, getInstallEvent, () => null)
  const [dismissed, setDismissed] = useState(false)
  const [showSteps, setShowSteps] = useState(false)

  if (stored || dismissed || platform === 'installed') return null
  if (platform === 'other' && !installEvent) return null
  const ios = platform === 'ios'

  function dismiss() {
    setDismissed(true)
    try {
      localStorage.setItem(KEY, '1')
    } catch {
      // storage blocked: it just shows again next visit
    }
  }

  async function install() {
    if (ios) {
      setShowSteps((v) => !v)
      return
    }
    await promptInstall()
    dismiss()
  }

  return (
    <div className="border-b border-accent/25 bg-accent-soft">
      <div className="mx-auto max-w-7xl px-4 py-2.5 sm:px-6">
        <div className="flex items-center gap-3">
          <p className="min-w-0 flex-1 text-sm text-accent-hover">
            <span className="mr-1.5 inline-block rounded-sm bg-accent px-1.5 py-0.5 text-xs font-bold text-white">New</span>
            <span className="font-semibold">Install BukiFinds on your phone.</span> It opens from your home screen, like an
            app.
          </p>
          <button
            type="button"
            onClick={install}
            aria-expanded={ios ? showSteps : undefined}
            aria-controls={ios ? 'whats-new-steps' : undefined}
            className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-md bg-accent px-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            <DownloadIcon className="h-4 w-4" />
            Install Now
          </button>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss what’s new"
            className="-mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-accent-hover transition-colors hover:bg-accent/10"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
        {ios && showSteps && (
          <p id="whats-new-steps" className="mt-2 pb-1 text-sm text-ink">
            Tap <span className="font-semibold">Share</span> at the bottom of Safari, then{' '}
            <span className="font-semibold">Add to Home Screen</span>.
          </p>
        )}
      </div>
    </div>
  )
}
