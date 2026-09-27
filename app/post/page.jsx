'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/useAuth'
import { FREE_ACTIVE_LISTINGS, SUBSCRIPTION_PRICE, countActiveListings, fetchSubscription } from '@/lib/subscription'
import ListingForm from '@/app/components/ListingForm'

export default function PostPage() {
  const router = useRouter()
  const { user, loading } = useUser()
  const [quota, setQuota] = useState(null) // { active, subscribed }

  useEffect(() => {
    if (!loading && !user) router.replace('/login?next=/post')
  }, [loading, user, router])

  // Check the free limit up front so nobody fills in a whole form only to be refused.
  // (The database enforces it too; this is just the friendly version.)
  useEffect(() => {
    if (!user) return
    let cancelled = false
    Promise.all([countActiveListings(user.id), fetchSubscription()]).then(([active, sub]) => {
      if (!cancelled) setQuota({ active, subscribed: sub.state === 'active' })
    })
    return () => {
      cancelled = true
    }
  }, [user])

  if (loading || !user || !quota) {
    return <main className="flex-1 p-6 text-muted">Loading…</main>
  }

  const atLimit = !quota.subscribed && quota.active >= FREE_ACTIVE_LISTINGS

  return (
    <main className="flex-1 bg-surface">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        <h1 className="card-type text-3xl font-bold leading-none text-ink sm:text-4xl">Sell or swap an item</h1>

        {atLimit ? (
          <section className="mt-6 max-w-xl rounded-2xl border border-line bg-white p-6 shadow-card">
            <h2 className="text-lg font-bold text-ink">You’ve used your {FREE_ACTIVE_LISTINGS} free listings</h2>
            <p className="mt-1.5 text-sm text-muted">
              Free accounts can have {FREE_ACTIVE_LISTINGS} active listings at a time. Subscribe for ₱{SUBSCRIPTION_PRICE}/month to post
              more, or mark an item as sold to free up a spot.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href="/subscribe" className="rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-accent-hover">
                Subscribe for ₱{SUBSCRIPTION_PRICE}/month
              </Link>
              <Link href="/my-listings" className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-surface">
                Go to My Listings
              </Link>
            </div>
          </section>
        ) : (
          <>
            <p className="mb-7 mt-2 text-sm text-muted">
              Takes about a minute. College students across Bukidnon will see it right away.
              {!quota.subscribed && (
                <>
                  {' '}
                  <span className="tabular font-semibold text-ink">
                    {quota.active} of {FREE_ACTIVE_LISTINGS}
                  </span>{' '}
                  free listings in use.
                </>
              )}
            </p>
            <ListingForm user={user} onSaved={(id) => router.push(`/item/${id}`)} />
          </>
        )}
      </div>
    </main>
  )
}
