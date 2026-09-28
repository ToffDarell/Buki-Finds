'use client'

import { useState, useSyncExternalStore } from 'react'
import { CloseIcon } from '@/app/components/icons'

// A one-time "What's new" note. Change WHATS_NEW_ID when there's a new update to announce;
// students who dismissed the last one will then see the new one.
const WHATS_NEW_ID = '2026-09-28'
const KEY = `bukifinds:whats-new-dismissed:${WHATS_NEW_ID}`

const ITEMS = [
  ['Brand filter', 'Add the brand when you post, and filter Browse by brand.'],
  ['Meet-up or delivery', 'Sellers can say if they ship. Use the Delivery filter to find items that can be sent to your town.'],
  ['Forms that fit your item', 'Food, services and electronics now ask for the details that matter, like quantity, rate per hour, or model.'],
  ['Shoes category', 'Sneakers, slides and other shoes now have their own category, separate from School Shoes.'],
  ['Notifications', 'Tap the bell to see who saved your listings and who reviewed you.'],
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
        <div className="flex items-start gap-3">
          <p className="min-w-0 flex-1 text-sm text-accent-hover">
            <span className="mr-1.5 inline-block rounded-sm bg-accent px-1.5 py-0.5 text-xs font-bold text-white">New</span>
            Brand filter, delivery option, a Shoes category and notifications.{' '}
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
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss what’s new"
            className="-mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-accent-hover transition-colors hover:bg-accent/10"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
        {open && (
          <ul id="whats-new-list" className="mt-2 grid gap-x-8 gap-y-1.5 pb-1 text-sm text-ink sm:grid-cols-2">
            {ITEMS.map(([title, body]) => (
              <li key={title}>
                <span className="font-semibold">{title}.</span> <span className="text-muted">{body}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
