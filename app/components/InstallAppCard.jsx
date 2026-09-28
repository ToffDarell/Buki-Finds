'use client'

import { useState, useSyncExternalStore } from 'react'
import { DownloadIcon } from '@/app/components/icons'
import { getInstallEvent, installPlatform, promptInstall, subscribeInstall } from '@/lib/install'

const subscribe = () => () => {}

// Landing page "Get the app" card. Always there when the phone or computer can install BukiFinds,
// even after the install strip was closed. Hidden inside the installed app and in browsers that
// can't install (then there's nothing useful to tap).
export default function InstallAppCard({ className = '' }) {
  const platform = useSyncExternalStore(subscribe, installPlatform, () => 'installed')
  const installEvent = useSyncExternalStore(subscribeInstall, getInstallEvent, () => null)
  const [showSteps, setShowSteps] = useState(false)

  if (platform === 'installed') return null
  if (platform === 'other' && !installEvent) return null

  const ios = platform === 'ios'
  const onClick = ios ? () => setShowSteps((v) => !v) : () => promptInstall()

  return (
    <section aria-labelledby="install-heading" className={className}>
      <div className="overflow-hidden rounded-[10px] border border-line bg-white shadow-card">
        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:gap-6 sm:p-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icons/icon-192.png"
            alt=""
            width={72}
            height={72}
            className="h-16 w-16 shrink-0 rounded-2xl shadow-card sm:h-[72px] sm:w-[72px]"
          />
          <div className="min-w-0 flex-1">
            <h2 id="install-heading" className="card-type text-xl font-extrabold leading-tight text-ink sm:text-2xl">
              Get the BukiFinds app
            </h2>
            <p className="mt-1.5 max-w-[52ch] text-[15px] leading-relaxed text-muted">
              No more searching for the website or looking for the link. BukiFinds sits on your home screen and opens like any
              other app. Free, and no app store needed.
            </p>
          </div>
          <button
            type="button"
            onClick={onClick}
            aria-expanded={ios ? showSteps : undefined}
            aria-controls={ios ? 'install-steps' : undefined}
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-6 text-[15px] font-semibold text-white shadow-card transition-colors hover:bg-primary-hover"
          >
            <DownloadIcon className="h-5 w-5" />
            Install Now
          </button>
        </div>
        {ios && showSteps && (
          <ol id="install-steps" className="grid gap-3 border-t border-line bg-surface px-5 py-4 text-sm text-ink sm:grid-cols-2 sm:px-6">
            {[
              <>Tap <span className="font-semibold">Share</span> at the bottom of Safari (the square with an arrow).</>,
              <>Choose <span className="font-semibold">Add to Home Screen</span>, then tap Add.</>,
            ].map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="card-type tabular flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-extrabold text-white">
                  {i + 1}
                </span>
                <span className="pt-1">{step}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  )
}
