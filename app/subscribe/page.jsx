'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/lib/useAuth'
import { MAX_RAW_IMAGE_BYTES, MAX_UNCOMPRESSED_BYTES, prepareImage } from '@/lib/images'
import {
  FREE_ACTIVE_LISTINGS,
  PAYMENT_METHODS,
  PROOF_BUCKET,
  SUBSCRIPTION_PRICE,
  fetchSubscription,
  subscriptionLabel,
} from '@/lib/subscription'
import { CameraIcon, CheckIcon, CloseIcon } from '@/app/components/icons'

const STATUS_STYLES = {
  active: 'border-accent/25 bg-accent-soft text-accent-hover',
  pending: 'border-primary/25 bg-primary-soft text-primary',
  rejected: 'border-red-200 bg-red-50 text-red-700',
  expired: 'border-line bg-surface text-muted',
  none: 'border-line bg-surface text-muted',
}

function StatusCard({ sub }) {
  const notes = {
    active: 'You can post as many listings as you like.',
    pending: 'We got your payment screenshot and will review it soon. You’ll see “Active” here once it’s approved.',
    rejected: 'We couldn’t confirm that payment. Check the amount and account you sent it to, then send a new screenshot below.',
    expired: `You’re back to ${FREE_ACTIVE_LISTINGS} active listings. Renew below to post more.`,
    none: `Free accounts can have ${FREE_ACTIVE_LISTINGS} active listings at a time. Subscribe to post more.`,
  }
  return (
    <section className="rounded-2xl border border-line bg-white p-5 shadow-card">
      <p className="text-sm font-semibold text-ink">Your subscription</p>
      <p className={`mt-2 inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${STATUS_STYLES[sub.state]}`}>
        {subscriptionLabel(sub)}
      </p>
      <p className="mt-2 text-sm text-muted">{notes[sub.state]}</p>
      {sub.state === 'active' && sub.pending && (
        <p className="mt-1 text-sm text-muted">A renewal payment is also waiting for review.</p>
      )}
    </section>
  )
}

export default function SubscribePage() {
  const router = useRouter()
  const { user, loading } = useUser()
  const [sub, setSub] = useState(null)
  const [methodId, setMethodId] = useState(PAYMENT_METHODS[0].id)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [state, setState] = useState({ sending: false, error: '', done: false })
  const previewRef = useRef('')

  useEffect(() => {
    if (!loading && !user) router.replace('/login?next=/subscribe')
  }, [loading, user, router])

  useEffect(() => {
    if (!user) return
    let cancelled = false
    fetchSubscription().then((s) => !cancelled && setSub(s))
    return () => {
      cancelled = true
    }
  }, [user])

  // Free the preview blob when it changes or the page closes.
  useEffect(() => {
    previewRef.current = preview
  }, [preview])
  useEffect(() => () => previewRef.current && URL.revokeObjectURL(previewRef.current), [])

  function pickFile(picked) {
    setState((s) => ({ ...s, error: '' }))
    if (!picked) return
    if (!picked.type.startsWith('image/')) {
      setState((s) => ({ ...s, error: 'Please choose a screenshot image (JPG or PNG).' }))
      return
    }
    if (picked.size > MAX_RAW_IMAGE_BYTES) {
      setState((s) => ({ ...s, error: 'That image is over 25 MB. Take a normal screenshot instead.' }))
      return
    }
    if (preview) URL.revokeObjectURL(preview)
    setFile(picked)
    setPreview(URL.createObjectURL(picked))
  }

  function clearFile() {
    if (preview) URL.revokeObjectURL(preview)
    setFile(null)
    setPreview('')
  }

  async function submit(e) {
    e.preventDefault()
    if (!file) return
    setState({ sending: true, error: '', done: false })
    const bucket = supabase.storage.from(PROOF_BUCKET)
    let path = ''
    try {
      // Same in-browser shrink as listing photos; a receipt stays readable at 1200px.
      const prepared = await prepareImage(file)
      let body = prepared.full
      let ext = prepared.ext
      let contentType = prepared.contentType
      if (prepared.original) {
        if (file.size > MAX_UNCOMPRESSED_BYTES || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
          throw new Error('This image format can’t be read here. Please send a JPG or PNG screenshot.')
        }
        body = file
        ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
        contentType = file.type
      }
      path = `${user.id}/${crypto.randomUUID()}.${ext}`
      const { error: uploadError } = await bucket.upload(path, body, { contentType })
      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`)

      const { error: insertError } = await supabase.from('subscriptions').insert({ proof_image_url: path })
      if (insertError) {
        await bucket.remove([path])
        path = ''
        throw new Error(
          insertError.code === '23505'
            ? 'You already have a payment waiting for review. We’ll update your status soon.'
            : insertError.message
        )
      }
      clearFile()
      setState({ sending: false, error: '', done: true })
      setSub(await fetchSubscription())
    } catch (err) {
      setState({ sending: false, error: err.message, done: false })
    }
  }

  if (loading || !user || !sub) {
    return <main className="flex-1 bg-surface p-6 text-muted">Loading…</main>
  }

  const method = PAYMENT_METHODS.find((m) => m.id === methodId) ?? PAYMENT_METHODS[0]
  const waiting = sub.state === 'pending' || (sub.state === 'active' && sub.pending)

  return (
    <main className="flex-1 bg-surface">
      <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">Seller subscription</h1>
        <p className="mt-2 text-sm text-muted sm:text-base">
          ₱{SUBSCRIPTION_PRICE} a month for unlimited active listings. Free accounts can have {FREE_ACTIVE_LISTINGS} at a time.
        </p>

        <div className="mt-6 flex flex-col gap-5">
          <StatusCard sub={sub} />

          {state.done && (
            <p role="status" className="flex items-start gap-2 rounded-2xl border border-accent/25 bg-accent-soft p-4 text-sm text-accent-hover">
              <CheckIcon className="mt-0.5 h-4 w-4 shrink-0" />
              Sent! We’ll review your payment and update your status here.
            </p>
          )}

          {!waiting && (
            <form onSubmit={submit} className="rounded-2xl border border-line bg-white p-5 shadow-card">
              <ol className="flex flex-col gap-6">
                <li>
                  <p className="text-sm font-semibold text-ink">1. Send ₱{SUBSCRIPTION_PRICE} through GCash or GoTyme</p>
                  <div role="tablist" aria-label="Payment method" className="mt-3 grid grid-cols-2 gap-1 rounded-xl bg-surface p-1">
                    {PAYMENT_METHODS.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        role="tab"
                        aria-selected={m.id === method.id}
                        onClick={() => setMethodId(m.id)}
                        className={`rounded-lg py-2 text-sm font-semibold transition-colors ${
                          m.id === method.id ? 'bg-white text-primary shadow-xs' : 'text-muted hover:text-ink'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                    <Image
                      key={method.id}
                      src={method.qr.src}
                      alt={`${method.label} QR code`}
                      width={method.qr.width}
                      height={method.qr.height}
                      className="h-auto w-44 shrink-0 rounded-xl border border-line"
                    />
                    <dl className="grid w-full gap-2 text-sm">
                      <div className="rounded-xl border border-line px-3.5 py-2.5">
                        <dt className="text-xs text-muted">{method.numberLabel}</dt>
                        <dd className="tabular text-base font-bold text-ink">{method.number}</dd>
                      </div>
                      <div className="rounded-xl border border-line px-3.5 py-2.5">
                        <dt className="text-xs text-muted">Account name</dt>
                        <dd className="font-semibold text-ink">{method.name}</dd>
                      </div>
                      <div className="rounded-xl border border-line px-3.5 py-2.5">
                        <dt className="text-xs text-muted">Amount</dt>
                        <dd className="tabular font-bold text-accent">₱{SUBSCRIPTION_PRICE}.00</dd>
                      </div>
                    </dl>
                  </div>
                </li>

                <li>
                  <p className="text-sm font-semibold text-ink">2. Upload your payment receipt screenshot</p>
                  <p className="mt-1 text-xs text-muted">Make sure the amount, date and reference number are visible. Only you and the BukiMart team can see it.</p>
                  {preview ? (
                    <div className="relative mt-3 w-fit">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={preview} alt="Payment screenshot preview" className="max-h-72 rounded-xl border border-line object-contain" />
                      <button
                        type="button"
                        onClick={clearFile}
                        aria-label="Remove screenshot"
                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-ink/75 text-white hover:bg-ink"
                      >
                        <CloseIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="mt-3 flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-line bg-surface px-4 py-8 text-muted transition-colors focus-within:border-primary hover:border-primary hover:text-primary">
                      <CameraIcon className="h-6 w-6" />
                      <span className="text-sm font-medium">Choose screenshot</span>
                      <input type="file" accept="image/*" className="sr-only" onChange={(e) => pickFile(e.target.files?.[0])} />
                    </label>
                  )}
                </li>

                <li>
                  <p className="text-sm font-semibold text-ink">3. Submit for review</p>
                  {state.error && (
                    <p role="alert" className="mt-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800">
                      {state.error}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={!file || state.sending}
                    className="mt-3 w-full rounded-xl bg-accent py-3 text-sm font-bold text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
                  >
                    {state.sending ? 'Uploading…' : 'Submit for Review'}
                  </button>
                </li>
              </ol>
            </form>
          )}

          <Link href="/my-listings" className="text-sm font-semibold text-primary hover:underline">
            Back to My Listings
          </Link>
        </div>
      </div>
    </main>
  )
}
