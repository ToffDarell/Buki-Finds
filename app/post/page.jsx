'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/useAuth'
import ListingForm from '@/app/components/ListingForm'

export default function PostPage() {
  const router = useRouter()
  const { user, loading } = useUser()

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [loading, user, router])

  if (loading || !user) {
    return <main className="flex-1 p-6 text-muted">Loading…</main>
  }

  return (
    <main className="flex-1 bg-surface">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        <h1 className="card-type text-3xl font-bold leading-none text-ink sm:text-4xl">Sell an item</h1>
        <p className="mb-7 mt-2 text-sm text-muted">Takes about a minute. Students across Bukidnon will see it right away.</p>
        <ListingForm user={user} onSaved={(id) => router.push(`/item/${id}`)} />
      </div>
    </main>
  )
}
