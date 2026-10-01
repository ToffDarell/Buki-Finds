'use client'

import { useState } from 'react'
import { SITE_URL } from '@/lib/site'
import { categoryFields, dealLabel, dealMethods, formatSize, isSwap, priceOrSwap } from '@/lib/listings'
import { schoolLocationLabel } from '@/lib/schools'
import { CheckIcon, CopyIcon } from '@/app/components/icons'

// A ready-to-paste post for Facebook groups, e.g.
//   FOR SALE: PE uniform set
//   ₱350 · Size M · Like New
//   BukSU • Malaybalay · Meet-up at BukSU main gate
//   Message me on BukiFinds: https://www.bukifinds.online/item/…
// Plain text only: no emoji or formatting that some phones paste as boxes.
export function facebookPostText(listing) {
  const swap = isSwap(listing)
  const f = categoryFields(listing.category)
  const facts = [
    !swap && priceOrSwap(listing),
    f.size && formatSize(listing.size) && `Size ${formatSize(listing.size)}`,
    f.condition && listing.condition,
  ].filter(Boolean)
  const meetup = dealMethods(listing).includes('meetup') && listing.meetup_spot ? `Meet-up at ${listing.meetup_spot}` : null
  const deal = meetup && dealMethods(listing).includes('delivery') ? `${meetup}, or delivery` : meetup || dealLabel(listing)
  const where = [schoolLocationLabel(listing.school), deal].filter(Boolean).join(' · ')

  return [
    `${swap ? 'FOR SWAP' : 'FOR SALE'}: ${listing.title}`,
    facts.length ? facts.join(' · ') : null,
    swap && listing.swap_for ? `Looking for: ${listing.swap_for}` : null,
    where || null,
    '',
    `Message me on BukiFinds: ${SITE_URL}/item/${listing.id}`,
  ]
    .filter((line) => line !== null)
    .join('\n')
}

export default function CopyPostButton({ listing, className = '' }) {
  const [copied, setCopied] = useState(false)

  async function onClick() {
    const text = facebookPostText(listing)
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      window.prompt('Copy this post:', text)
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-10 items-center gap-1.5 rounded-md border border-line bg-white px-3 text-sm font-semibold text-ink transition-colors hover:bg-surface ${className}`}
    >
      {copied ? <CheckIcon className="h-4 w-4 text-accent" /> : <CopyIcon className="h-4 w-4" />}
      <span aria-live="polite">{copied ? 'Post copied' : 'Copy Facebook Post'}</span>
    </button>
  )
}
