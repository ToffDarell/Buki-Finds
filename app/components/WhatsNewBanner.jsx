'use client'

import { useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { BellIcon, CloseIcon } from '@/app/components/icons'

// A one-time "What's new" note on Browse. Change WHATS_NEW_ID when there's a new update to announce;
// students who dismissed the last one will then see the new one.
// This update: Make an Offer, phone alerts and price drops, "Still available?", Facebook posts,
// and meet-up safety tips (migration 019).
const WHATS_NEW_ID = '2026-10-01-offers-alerts'
const KEY = `bukifinds:whats-new-dismissed:${WHATS_NEW_ID}`

const UPDATES = [
  ['Make an Offer', 'pick your price and we write the message, then open the seller’s Messenger or Instagram.'],
  ['Alerts on your phone', 'know right away when someone saves your item or an item you saved gets cheaper.'],
  ['Copy Facebook Post', 'sellers can paste their listing into any Facebook group in one tap.'],
  ['Fresh listings', 'sellers confirm every 30 days that an item is still available, or it leaves Browse.'],
]

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
  const [dismissed, setDismissed] = useState(false)
  const [open, setOpen] = useState(false)

  if (stored || dismissed) return null

  function dismiss() {
    setDismissed(true)
    try {
      localStorage.setItem(KEY, '1')
    } catch {
      // storage blocked: it just shows again next visit
    }
  }

  return (
    <div className="border-b border-accent/25 bg-accent-soft">
      <div className="mx-auto max-w-7xl px-4 py-2.5 sm:px-6">
        {/* Phones: the message on its own line, the buttons under it. Wider screens: one row. */}
        <div className="flex items-start gap-3 sm:items-center">
          <div className="flex min-w-0 flex-1 flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
            <p className="min-w-0 text-sm text-accent-hover sm:flex-1">
              <span className="mr-1.5 inline-block rounded-sm bg-accent px-1.5 py-0.5 text-xs font-bold text-white">New</span>
              <span className="font-semibold">Make an offer in one tap, and get price-drop alerts on your phone.</span>{' '}
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls="whats-new-list"
                className="font-semibold underline underline-offset-2 hover:no-underline"
              >
                {open ? 'Hide' : 'See what’s new'}
              </button>
            </p>
            <Link
              href="/notifications"
              onClick={dismiss}
              className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-md bg-accent px-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
            >
              <BellIcon className="h-4 w-4" />
              Turn On Alerts
            </Link>
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss what’s new"
            className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-accent-hover transition-colors hover:bg-accent/10 sm:mt-0"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
        {open && (
          <ul id="whats-new-list" className="mt-2.5 grid gap-1.5 pb-1 text-sm text-ink sm:grid-cols-2 sm:gap-x-6">
            {UPDATES.map(([name, text]) => (
              <li key={name} className="flex gap-2">
                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                <span>
                  <span className="font-semibold">{name}:</span> {text}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
