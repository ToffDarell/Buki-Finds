'use client'

import { useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { CloseIcon, FlagIcon } from '@/app/components/icons'

const REASONS = [
  ['scam', 'Looks like a scam'],
  ['wrong_item', 'Wrong or misleading item'],
  ['inappropriate', 'Inappropriate content'],
  ['other', 'Something else'],
]

// "Report listing": files a row in the reports table, which only the project owner can read
// (Supabase dashboard > Table Editor > reports). Signed-out students are sent to log in first.
export default function ReportDialog({ listingId, user }) {
  const dialogRef = useRef(null)
  const router = useRouter()
  const pathname = usePathname()
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [state, setState] = useState({ sending: false, done: false, error: '' })

  function open() {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`)
      return
    }
    dialogRef.current?.showModal()
  }

  function close() {
    dialogRef.current?.close()
  }

  async function submit(e) {
    e.preventDefault()
    setState({ sending: true, done: false, error: '' })
    const { error } = await supabase
      .from('reports')
      .insert({ listing_id: listingId, reason, details: details.trim() || null })
    if (error && error.code !== '23505') {
      setState({ sending: false, done: false, error: error.message })
      return
    }
    // 23505 = already reported by this student; treat it as done.
    setState({ sending: false, done: true, error: '' })
  }

  return (
    <>
      <button onClick={open} className="inline-flex items-center gap-1.5 text-sm font-medium text-muted underline-offset-2 hover:text-ink hover:underline">
        <FlagIcon className="h-4 w-4" />
        Report listing
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="report-title"
        onClick={(e) => e.target === dialogRef.current && close()}
        className="m-auto w-[min(28rem,calc(100%-2rem))] rounded-[12px] border border-line bg-white p-0 text-ink shadow-card-lift backdrop:bg-ink/40"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h2 id="report-title" className="text-base font-semibold">Report this listing</h2>
          <button onClick={close} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-surface hover:text-ink">
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {state.done ? (
          <div className="px-5 py-6">
            <p className="text-[15px] font-semibold">Thanks, we got your report.</p>
            <p className="mt-1 text-sm text-muted">The Buki-Finds team will take a look. You won&rsquo;t see a reply here.</p>
            <button onClick={close} className="mt-5 min-h-11 w-full rounded-md bg-primary text-[15px] font-semibold text-white hover:bg-primary-hover">
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-4 px-5 py-5">
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1 text-sm font-semibold">What&rsquo;s wrong?</legend>
              {REASONS.map(([value, label]) => (
                <label
                  key={value}
                  className={`flex min-h-11 cursor-pointer items-center gap-2.5 rounded-md border px-3 text-[15px] transition-colors ${
                    reason === value ? 'border-primary bg-primary-soft' : 'border-line hover:border-muted/60'
                  }`}
                >
                  <input type="radio" name="reason" value={value} checked={reason === value} onChange={() => setReason(value)} required className="accent-primary" />
                  {label}
                </label>
              ))}
            </fieldset>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold">
                Details <span className="font-normal text-muted">optional</span>
              </span>
              <textarea
                rows={3}
                maxLength={500}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Anything that helps us check it"
                className="rounded-sm border border-line px-3 py-2.5 text-[15px] placeholder:text-muted focus:border-primary focus:outline-none"
              />
            </label>
            {state.error && (
              <p role="alert" className="rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                {state.error}
              </p>
            )}
            <button
              type="submit"
              disabled={state.sending || !reason}
              className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-md bg-primary text-[15px] font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
            >
              <FlagIcon className="h-4 w-4" />
              {state.sending ? 'Sending…' : 'Send Report'}
            </button>
          </form>
        )}
      </dialog>
    </>
  )
}
