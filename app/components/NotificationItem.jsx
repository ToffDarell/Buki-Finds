'use client'

import Link from 'next/link'
import { timeAgo } from '@/lib/notifications'
import Avatar from '@/app/components/Avatar'
import Stars from '@/app/components/Stars'
import { HIDE_AFTER_DAYS, STALE_AFTER_DAYS } from '@/lib/listings'
import { ClockIcon, HeartIcon, PriceDownIcon, StarIcon } from '@/app/components/icons'

// One notification. "saved": someone saved your listing. "review": a buyer reviewed you.
// "price_drop": an item you saved got cheaper. "stale": BukiFinds asks if your item is still available.
export default function NotificationItem({ n, userId, onNavigate }) {
  const unread = !n.read_at
  const review = n.type === 'review'
  const badge = {
    saved: ['text-red-500', <HeartIcon key="i" className="h-3 w-3" fill="currentColor" strokeWidth="2" />],
    review: ['text-amber-500', <StarIcon key="i" className="h-3 w-3" fill="currentColor" strokeWidth="2" />],
    price_drop: ['text-primary', <PriceDownIcon key="i" className="h-3 w-3" strokeWidth="2.5" />],
    stale: ['text-primary', <ClockIcon key="i" className="h-3 w-3" strokeWidth="2.25" />],
  }[n.type] ?? ['text-primary', null]
  const who = n.actor_id ? (
    <Link onClick={onNavigate} href={`/seller/${n.actor_id}`} className="font-semibold hover:underline">
      {n.actor_name}
    </Link>
  ) : (
    <span className="font-semibold">{n.actor_name}</span>
  )
  const item = n.listing_id ? (
    <Link onClick={onNavigate} href={`/item/${n.listing_id}`} className="font-semibold text-primary hover:underline">
      {n.listing_title}
    </Link>
  ) : (
    <span className="font-semibold">{n.listing_title}</span>
  )

  return (
    <li className={`flex items-start gap-3 px-4 py-3.5 sm:px-5 ${unread ? 'bg-primary-soft/60' : 'bg-white'}`}>
      <div className="relative shrink-0">
        {n.actor_id ? (
          <Link onClick={onNavigate} href={`/seller/${n.actor_id}`} aria-label={`${n.actor_name}'s profile`}>
            <Avatar src={n.actor_avatar} name={n.actor_name} bg="bg-primary" className="h-11 w-11 text-base" />
          </Link>
        ) : (
          <Avatar src={n.actor_avatar} name={n.actor_name} bg="bg-primary" className="h-11 w-11 text-base" />
        )}
        <span className={`absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-card ${badge[0]}`}>
          {badge[1]}
        </span>
      </div>
      <div className="min-w-0 flex-1 text-[15px] leading-snug text-ink">
        {review ? (
          <>
            <p>
              {who} left you a {n.rating}-star review{n.listing_title ? <> for {item}</> : null}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <Stars rating={n.rating} className="h-3.5 w-3.5" />
              <Link onClick={onNavigate} href={`/seller/${userId}#reviews`} className="text-xs font-semibold text-primary hover:underline">
                See your reviews
              </Link>
            </div>
            {n.detail && <p className="mt-1 line-clamp-2 text-sm text-muted">“{n.detail}”</p>}
          </>
        ) : n.type === 'price_drop' ? (
          <>
            <p>
              {who} dropped the price of {item}
            </p>
            {n.detail && <p className="tabular mt-1 text-sm font-semibold text-primary">{n.detail}</p>}
          </>
        ) : n.type === 'stale' ? (
          <>
            <p>Is your {item} still available?</p>
            <p className="mt-1 text-sm text-muted">
              It’s been {STALE_AFTER_DAYS} days. Open it and tap Still Available, or it leaves Browse after {HIDE_AFTER_DAYS} days.
            </p>
          </>
        ) : (
          <p>
            {who} saved your {item}
          </p>
        )}
        <p className="mt-0.5 text-xs text-muted">{timeAgo(n.created_at)}</p>
      </div>
      {unread && <span aria-label="Unread" className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-accent" />}
    </li>
  )
}

