'use client'

import { useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { SITE_URL } from '@/lib/site'
import { formatPrice, instagramUrl, isSwap, messengerUrl, priceOrSwap } from '@/lib/listings'
import { CheckIcon, CloseIcon, InstagramIcon, MailIcon, MessengerIcon } from '@/app/components/icons'

// "Make an Offer" / "Offer a Trade": writes the first message for the buyer, copies it, and opens
// the seller's Messenger or Instagram (or an email with it filled in). Nothing is saved: the
// conversation and the deal stay between the two students, as everywhere else on BukiFinds.
// Messenger and Instagram links can't pre-fill the chat box, so the message goes to the clipboard.

// Asking price, about 10% off and about 20% off, rounded to ₱5 so they read like real offers.
function offerChips(price) {
  const round5 = (v) => Math.max(5, Math.round(v / 5) * 5)
  return [...new Set([price, round5(price * 0.9), round5(price * 0.8)])].filter((v) => v <= price)
}

export function offerMessage(listing, number, { mode, offer, trade, when }) {
  const link = `${SITE_URL}/item/${listing.id}`
  const item = `your ${listing.title} (No. ${number}) on BukiFinds`
  if (mode === 'available') return `Hi! Is ${item} still available?\n${link}`

  const spot = listing.meetup_spot?.trim()
  const time = when.trim()
  const meet = spot && time ? `I can meet at ${spot}, ${time}.` : spot ? `Can we meet at ${spot}?` : time ? `I’m free to meet ${time}.` : ''

  let ask
  if (isSwap(listing)) {
    ask = trade.trim() ? `I can trade ${trade.trim()}.` : 'What would you like in return?'
  } else {
    const asking = Number(listing.price)
    const amount = priceOrSwap({ ...listing, price: offer })
    ask = Number(offer) >= asking ? `I can pay the asking price of ${amount}.` : `Would you take ${amount}?`
  }
  return [`Hi! I’m interested in ${item}. ${ask}${meet ? ` ${meet}` : ''}`, link].join('\n')
}

export default function OfferDialog({ listing, number, user }) {
  const dialogRef = useRef(null)
  const router = useRouter()
  const pathname = usePathname()
  const swap = isSwap(listing)
  const asking = Number(listing.price) || 0
  const canOffer = swap || asking > 0
  const [mode, setMode] = useState(canOffer ? 'offer' : 'available')
  const [offer, setOffer] = useState(asking ? String(asking) : '')
  const [trade, setTrade] = useState('')
  const [when, setWhen] = useState('')
  const [copied, setCopied] = useState('')

  const messenger = messengerUrl(listing.seller_facebook_username)
  const instagram = instagramUrl(listing.seller_instagram_username)
  const offerValid = mode !== 'offer' || swap || Number(offer) > 0
  const message = offerMessage(listing, number, { mode, offer: Number(offer) || asking, trade, when })

  function open() {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`)
      return
    }
    setCopied('')
    dialogRef.current?.showModal()
  }
  const close = () => dialogRef.current?.close()

  // Runs inside the tap on the link, so the copy finishes and the app still opens.
  function copy(app) {
    navigator.clipboard?.writeText(message).then(
      () => setCopied(app),
      () => setCopied('')
    )
  }

  const chip = (active) =>
    `inline-flex min-h-10 items-center rounded-full border px-3.5 text-sm font-medium transition-colors ${
      active ? 'border-primary bg-primary-soft text-primary' : 'border-line bg-white text-ink hover:border-muted/60'
    }`
  const appButton = 'flex min-h-12 w-full items-center justify-center gap-2 rounded-md px-4 text-[15px] font-semibold transition-colors'

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="flex w-full items-center justify-center gap-2 rounded-md border border-primary/30 bg-white px-4 py-3 font-semibold text-primary transition-colors hover:bg-primary-soft"
      >
        {swap ? 'Offer a Trade' : canOffer ? 'Make an Offer' : 'Ask if Available'}
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="offer-title"
        onClick={(e) => e.target === dialogRef.current && close()}
        className="m-auto w-[min(30rem,calc(100%-2rem))] rounded-[12px] border border-line bg-white p-0 text-ink shadow-card-lift backdrop:bg-ink/40"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h2 id="offer-title" className="text-base font-semibold">
            {swap ? 'Offer a trade' : 'Message the seller'}
          </h2>
          <button onClick={close} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-surface hover:text-ink">
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-4 px-5 py-5">
          {canOffer && (
            <div className="flex gap-2" role="radiogroup" aria-label="What to send">
              <button type="button" role="radio" aria-checked={mode === 'offer'} onClick={() => setMode('offer')} className={chip(mode === 'offer')}>
                {swap ? 'Offer a trade' : 'Make an offer'}
              </button>
              <button type="button" role="radio" aria-checked={mode === 'available'} onClick={() => setMode('available')} className={chip(mode === 'available')}>
                Is it still available?
              </button>
            </div>
          )}

          {mode === 'offer' && !swap && (
            <div className="flex flex-col gap-2">
              <label htmlFor="offer-amount" className="text-sm font-semibold">
                Your offer <span className="font-normal text-muted">asking {priceOrSwap(listing)}</span>
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[15px] text-muted">₱</span>
                <input
                  id="offer-amount"
                  type="number"
                  inputMode="decimal"
                  min="1"
                  step="any"
                  value={offer}
                  onChange={(e) => setOffer(e.target.value)}
                  className="tabular w-full rounded-sm border border-line py-2.5 pl-7 pr-3 text-[15px] focus:border-primary focus:outline-none"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {offerChips(asking).map((v) => (
                  <button key={v} type="button" onClick={() => setOffer(String(v))} className={chip(Number(offer) === v)}>
                    <span className="tabular">{formatPrice(v)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === 'offer' && swap && (
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold">What can you trade?</span>
              <input
                maxLength={120}
                value={trade}
                onChange={(e) => setTrade(e.target.value)}
                placeholder={listing.swap_for ? `They want: ${listing.swap_for}` : 'e.g. my Physics 1 book'}
                className="rounded-sm border border-line px-3 py-2.5 text-[15px] placeholder:text-muted focus:border-primary focus:outline-none"
              />
            </label>
          )}

          {mode === 'offer' && (
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold">
                When can you meet? <span className="font-normal text-muted">optional</span>
              </span>
              <input
                maxLength={60}
                value={when}
                onChange={(e) => setWhen(e.target.value)}
                placeholder="e.g. tomorrow after class"
                className="rounded-sm border border-line px-3 py-2.5 text-[15px] placeholder:text-muted focus:border-primary focus:outline-none"
              />
            </label>
          )}

          <div>
            <p className="text-sm font-semibold">Your message</p>
            <p className="mt-1.5 whitespace-pre-line break-words rounded-md border border-line bg-surface px-3.5 py-3 text-sm leading-relaxed text-ink">{message}</p>
          </div>

          {copied ? (
            <p role="status" className="flex items-start gap-2 rounded-md border border-accent/25 bg-accent-soft px-3.5 py-2.5 text-sm text-accent-hover">
              <CheckIcon className="mt-0.5 h-4 w-4 shrink-0" />
              Message copied. Paste it in the chat with the seller.
            </p>
          ) : null}

          <div className="flex flex-col gap-2">
            {messenger && (
              <a
                href={offerValid ? messenger : undefined}
                target="_blank"
                rel="noopener noreferrer"
                aria-disabled={!offerValid}
                onClick={() => offerValid && copy('messenger')}
                className={`${appButton} bg-primary text-white hover:bg-primary-hover aria-disabled:pointer-events-none aria-disabled:opacity-50`}
              >
                <MessengerIcon />
                Copy &amp; Open Messenger
              </a>
            )}
            {instagram && (
              <a
                href={offerValid ? instagram : undefined}
                target="_blank"
                rel="noopener noreferrer"
                aria-disabled={!offerValid}
                onClick={() => offerValid && copy('instagram')}
                className={`${appButton} ${messenger ? 'border border-line bg-white text-primary hover:bg-surface' : 'bg-primary text-white hover:bg-primary-hover'} aria-disabled:pointer-events-none aria-disabled:opacity-50`}
              >
                <InstagramIcon />
                Copy &amp; Open Instagram
              </a>
            )}
            {!messenger && !instagram && listing.seller_email && (
              <a
                href={
                  offerValid
                    ? `mailto:${listing.seller_email}?subject=${encodeURIComponent(`BukiFinds No. ${number}: ${listing.title}`)}&body=${encodeURIComponent(message)}`
                    : undefined
                }
                aria-disabled={!offerValid}
                className={`${appButton} bg-primary text-white hover:bg-primary-hover aria-disabled:pointer-events-none aria-disabled:opacity-50`}
              >
                <MailIcon />
                Email Seller
              </a>
            )}
          </div>
        </div>
      </dialog>
    </>
  )
}
