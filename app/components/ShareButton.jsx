'use client'

import { useState } from 'react'
import { CheckIcon, ShareIcon } from '@/app/components/icons'

// Phones get the native share sheet (Messenger, Facebook groups, etc.); everything else copies the link.
export default function ShareButton({ title, text, url, label = 'Share', className = '' }) {
  const [copied, setCopied] = useState(false)

  async function onClick() {
    const link = url || window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: link })
        return
      } catch (err) {
        if (err?.name === 'AbortError') return // the student closed the share sheet
      }
    }
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copy this link:', link)
    }
  }

  return (
    <button
      onClick={onClick}
      className={`inline-flex min-h-10 items-center gap-1.5 rounded-md border border-line bg-white px-3 text-sm font-semibold text-ink transition-colors hover:bg-surface ${className}`}
    >
      {copied ? <CheckIcon className="h-4 w-4 text-accent" /> : <ShareIcon className="h-4 w-4" />}
      <span aria-live="polite">{copied ? 'Link copied' : label}</span>
    </button>
  )
}
