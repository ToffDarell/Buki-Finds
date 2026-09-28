'use client'

import { useUser } from '@/lib/useAuth'
import { VENTURE_PARTNERS, VENTURE_PARTNERS_NOTE } from '@/lib/site'

// The venture partners credit, shown on the landing page to visitors who aren't logged in.
// While the session is still loading it renders nothing, so logged-in students never see it flash.
export default function VenturePartners() {
  const { user, loading } = useUser()
  if (loading || user) return null

  return (
    <div>
      <p className="text-xs font-medium text-muted">Venture partners</p>
      <p className="mt-1 max-w-[52ch] text-sm text-muted">{VENTURE_PARTNERS_NOTE}</p>
      <ul className="mt-3 space-y-1.5 text-sm font-semibold text-ink">
        {VENTURE_PARTNERS.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
    </div>
  )
}
