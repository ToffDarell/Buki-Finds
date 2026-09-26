'use client'

import { usePathname, useRouter } from 'next/navigation'
import { toggleSaved, useSavedIds } from '@/lib/useSaved'
import { HeartIcon } from '@/app/components/icons'

// Heart toggle for a listing. Signed-out students are sent to log in and brought back here.
// `overlay` sits on a card photo; `inline` is a labeled button for the item page, with an
// optional public save count. onToggled runs after the database has the change.
export default function SaveButton({ listingId, variant = 'overlay', count, onToggled, className = '' }) {
  const saved = useSavedIds().has(listingId)
  const router = useRouter()
  const pathname = usePathname()

  async function onClick(e) {
    e.preventDefault()
    e.stopPropagation()
    const ok = await toggleSaved(listingId)
    if (!ok) router.push(`/login?next=${encodeURIComponent(pathname)}`)
    else onToggled?.()
  }

  const label = saved ? 'Remove from saved' : 'Save listing'

  if (variant === 'inline') {
    return (
      <button
        onClick={onClick}
        aria-pressed={saved}
        className={`inline-flex min-h-10 items-center gap-1.5 rounded-md border px-3 text-sm font-semibold transition-colors ${
          saved ? 'border-primary/30 bg-primary-soft text-primary' : 'border-line bg-white text-ink hover:bg-surface'
        } ${className}`}
      >
        <HeartIcon className="h-4 w-4" fill={saved ? 'currentColor' : 'none'} />
        {saved ? 'Saved' : 'Save'}
        {count > 0 && (
          <span className="tabular ml-0.5 border-l border-current/25 pl-2 font-medium">
            {count}
            <span className="sr-only"> saved</span>
          </span>
        )}
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      aria-pressed={saved}
      aria-label={label}
      title={label}
      className={`flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-card transition-transform motion-safe:active:scale-90 ${
        saved ? 'text-primary' : 'text-ink'
      } ${className}`}
    >
      <HeartIcon className="h-5 w-5" fill={saved ? 'currentColor' : 'none'} />
    </button>
  )
}
