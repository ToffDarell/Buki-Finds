'use client'

import { useEffect, useState } from 'react'
import { disablePush, enablePush, pushStatus } from '@/lib/push'
import { BellIcon } from '@/app/components/icons'

// "Get alerts on this phone" card on the Notifications page.
export default function PushToggle() {
  const [status, setStatus] = useState(null) // null while checking
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    pushStatus().then((s) => !cancelled && setStatus(s))
    return () => {
      cancelled = true
    }
  }, [])

  if (!status || status === 'unsupported') return null

  async function turnOn() {
    setBusy(true)
    setError('')
    try {
      const res = await enablePush()
      setStatus(res.status)
      if (res.error) setError(res.error)
    } catch {
      setError('Couldn’t turn on notifications on this device. Try again.')
    }
    setBusy(false)
  }

  async function turnOff() {
    setBusy(true)
    await disablePush()
    setStatus('off')
    setBusy(false)
  }

  const text = {
    'needs-install': 'On iPhone, install BukiFinds first: tap Share in Safari, then Add to Home Screen. Open it from your Home Screen and turn alerts on here.',
    blocked: 'Notifications are blocked for BukiFinds. Allow them in your browser or phone settings, then come back.',
    off: 'Get an alert on this device when someone saves your item, reviews you, or an item you saved gets cheaper.',
    on: 'Alerts are on for this device.',
  }[status]

  return (
    <section className="mt-5 flex flex-col gap-3 rounded-[10px] border border-line bg-white p-4 shadow-card sm:flex-row sm:items-center sm:p-5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
        <BellIcon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">Alerts on this device</p>
        <p className="mt-0.5 text-sm leading-relaxed text-muted">{text}</p>
        {error && <p role="alert" className="mt-1 text-sm text-red-700">{error}</p>}
      </div>
      {status === 'off' && (
        <button
          onClick={turnOn}
          disabled={busy}
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-60"
        >
          {busy ? 'Turning on…' : 'Turn On Alerts'}
        </button>
      )}
      {status === 'on' && (
        <button
          onClick={turnOff}
          disabled={busy}
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-md border border-line bg-white px-4 text-sm font-semibold text-ink transition-colors hover:bg-surface disabled:opacity-60"
        >
          Turn Off
        </button>
      )}
    </section>
  )
}
