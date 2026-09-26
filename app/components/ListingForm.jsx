'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  CATEGORIES,
  CONDITIONS,
  IMAGE_BUCKET,
  MAX_IMAGES,
  normalizeFacebookUsername,
  normalizeSchool,
  sortedImages,
} from '@/lib/listings'
import { MAX_RAW_IMAGE_BYTES, MAX_UNCOMPRESSED_BYTES, imageStoragePaths, prepareImage } from '@/lib/images'
import { ListingCardPreview } from '@/app/components/ListingCard'
import SchoolInput from '@/app/components/SchoolInput'
import { CameraIcon, CloseIcon, MessengerIcon } from '@/app/components/icons'

const inputClass =
  'w-full rounded-sm border border-line bg-white px-3 py-2.5 text-[15px] text-ink transition-colors placeholder:text-muted hover:border-muted/60 focus:border-primary focus:outline-none'

const TYPE_OPTIONS = [
  ['sell', 'I want to Sell this', 'Set a price. Buyers pay you when you meet.'],
  ['swap', 'I want to Swap this', 'No price. Trade it for something you need.'],
]

function Field({ label, hint, optional, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-ink">
        {label}
        {optional && <span className="ml-1.5 font-normal text-muted">optional</span>}
      </span>
      {children}
      {hint && <span className="text-xs leading-relaxed text-muted">{hint}</span>}
    </label>
  )
}

function Section({ title, children }) {
  return (
    <section className="flex flex-col gap-4 border-t border-line pt-6 first:border-t-0 first:pt-0">
      <h2 className="card-type text-lg font-bold text-primary">{title}</h2>
      {children}
    </section>
  )
}

// Removes photos and their thumbnails from storage.
async function removeFromStorage(urls) {
  const paths = imageStoragePaths(urls)
  if (paths.length) await supabase.storage.from(IMAGE_BUCKET).remove(paths)
}

// Shrinks a photo in the browser and uploads it plus a thumbnail (<name>-thumb.<ext>).
// Returns the public URL of the full-size photo.
async function uploadPhoto(file, folder) {
  const bucket = supabase.storage.from(IMAGE_BUCKET)
  const base = `${folder}/${crypto.randomUUID()}`
  const prepared = await prepareImage(file)

  if (prepared.original) {
    // The browser couldn't read this format, so upload it unchanged (no thumbnail; cards fall back to it).
    if (file.size > MAX_UNCOMPRESSED_BYTES) {
      throw new Error(`"${file.name}" couldn't be resized in this browser and is over 5 MB. Try a JPG or PNG.`)
    }
    const ext = file.name.includes('.') ? file.name.split('.').pop().toLowerCase() : 'jpg'
    const path = `${base}.${ext}`
    const { error } = await bucket.upload(path, file, { contentType: file.type || undefined })
    if (error) throw new Error(`Photo upload failed: ${error.message}`)
    return bucket.getPublicUrl(path).data.publicUrl
  }

  const { full, thumb, ext, contentType } = prepared
  const path = `${base}.${ext}`
  const options = { contentType, cacheControl: '31536000' }
  const { error } = await bucket.upload(path, full, options)
  if (error) throw new Error(`Photo upload failed: ${error.message}`)
  const url = bucket.getPublicUrl(path).data.publicUrl
  const { error: thumbError } = await bucket.upload(`${base}-thumb.${ext}`, thumb, options)
  if (thumbError) {
    await bucket.remove([path])
    throw new Error(`Photo upload failed: ${thumbError.message}`)
  }
  return url
}

// Shared by /post (listing = undefined) and /item/[id]/edit (listing = existing row with listing_images).
// Calls onSaved(listingId) after everything is written.
export default function ListingForm({ user, listing, onSaved }) {
  const isEdit = Boolean(listing)
  const [title, setTitle] = useState(listing?.title ?? '')
  const [description, setDescription] = useState(listing?.description ?? '')
  const [listingType, setListingType] = useState(listing?.listing_type ?? 'sell')
  const [price, setPrice] = useState(listing?.price != null ? String(listing.price) : '')
  const [swapFor, setSwapFor] = useState(listing?.swap_for ?? '')
  const [category, setCategory] = useState(listing?.category ?? '')
  const [condition, setCondition] = useState(listing?.condition ?? '')
  const [size, setSize] = useState(listing?.size ?? '')
  const [school, setSchool] = useState(listing?.school ?? '')
  const [facebook, setFacebook] = useState(listing?.seller_facebook_username ?? '')
  const [images, setImages] = useState(() =>
    listing ? sortedImages(listing).map((img) => ({ key: img.id, id: img.id, url: img.image_url })) : []
  )
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  // Free the preview blob URLs when the form goes away.
  const imagesRef = useRef(images)
  useEffect(() => {
    imagesRef.current = images
  }, [images])
  useEffect(() => () => imagesRef.current.forEach((img) => img.file && URL.revokeObjectURL(img.url)), [])

  function addFiles(fileList) {
    setError('')
    const room = MAX_IMAGES - images.length
    const files = Array.from(fileList)
    const accepted = []
    for (const file of files.slice(0, room)) {
      if (!file.type.startsWith('image/')) {
        setError(`"${file.name}" is not an image.`)
      } else if (file.size > MAX_RAW_IMAGE_BYTES) {
        setError(`"${file.name}" is larger than 25 MB.`)
      } else {
        accepted.push({ key: crypto.randomUUID(), file, url: URL.createObjectURL(file) })
      }
    }
    if (files.length > room) setError(`You can add up to ${MAX_IMAGES} photos.`)
    setImages((prev) => [...prev, ...accepted])
  }

  function removeImage(key) {
    setImages((prev) => {
      const img = prev.find((i) => i.key === key)
      if (img?.file) URL.revokeObjectURL(img.url)
      return prev.filter((i) => i.key !== key)
    })
  }

  function makeCover(key) {
    setImages((prev) => [prev.find((i) => i.key === key), ...prev.filter((i) => i.key !== key)])
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const fbUsername = normalizeFacebookUsername(facebook)
    if (fbUsername === null) {
      setError('That Facebook username doesn’t look right. Use only the part after facebook.com/, e.g. juan.delacruz')
      return
    }
    if (!user.email && !fbUsername) {
      setError('Your account has no email address, so add your Facebook username so buyers can reach you.')
      return
    }

    setSaving(true)
    const listingId = listing?.id ?? crypto.randomUUID()
    const uploadedUrls = []

    try {
      // 1. Shrink and upload new photos first (in parallel) so a failed upload doesn't leave a
      //    half-saved listing. allSettled so every finished upload is known and can be cleaned up.
      const newUrls = new Map()
      const results = await Promise.allSettled(
        images
          .filter((i) => i.file)
          .map(async (img) => {
            const url = await uploadPhoto(img.file, `${user.id}/${listingId}`)
            uploadedUrls.push(url)
            newUrls.set(img.key, url)
          })
      )
      const failed = results.find((r) => r.status === 'rejected')
      if (failed) throw failed.reason

      // 2. Save the listing itself.
      const fields = {
        title: title.trim(),
        description: description.trim() || null,
        listing_type: listingType,
        // Swaps have no price; switching a listing to a swap clears it.
        price: listingType === 'swap' ? null : Number(price),
        swap_for: listingType === 'swap' ? swapFor.trim() || null : null,
        category,
        condition: condition || null,
        size: size.trim() || null,
        school: normalizeSchool(school) || null,
        seller_facebook_username: fbUsername || null,
      }

      if (isEdit) {
        const { error: updateError } = await supabase.from('listings').update(fields).eq('id', listingId)
        if (updateError) throw new Error(updateError.message)
      } else {
        const { error: insertError } = await supabase.from('listings').insert({
          id: listingId,
          seller_id: user.id,
          seller_email: user.email || null,
          seller_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
          ...fields,
        })
        if (insertError) throw new Error(insertError.message)
      }

      // 3. Sync listing_images: delete removed photos, re-number kept ones, insert new ones.
      if (isEdit) {
        const keptIds = new Set(images.filter((i) => i.id).map((i) => i.id))
        const removed = sortedImages(listing).filter((img) => !keptIds.has(img.id))
        if (removed.length) {
          const { error: deleteError } = await supabase
            .from('listing_images')
            .delete()
            .in('id', removed.map((img) => img.id))
          if (deleteError) throw new Error(deleteError.message)
          await removeFromStorage(removed.map((img) => img.image_url))
        }

        const original = new Map(listing.listing_images.map((img) => [img.id, img.sort_order]))
        for (const [index, img] of images.entries()) {
          if (img.id && original.get(img.id) !== index) {
            const { error: orderError } = await supabase.from('listing_images').update({ sort_order: index }).eq('id', img.id)
            if (orderError) throw new Error(orderError.message)
          }
        }
      }

      const rows = images
        .map((img, index) => ({ img, index }))
        .filter(({ img }) => img.file)
        .map(({ img, index }) => ({ listing_id: listingId, image_url: newUrls.get(img.key), sort_order: index }))
      if (rows.length) {
        const { error: imagesError } = await supabase.from('listing_images').insert(rows)
        if (imagesError) {
          if (!isEdit) await supabase.from('listings').delete().eq('id', listingId)
          throw new Error(imagesError.message)
        }
      }

      onSaved(listingId)
    } catch (err) {
      await removeFromStorage(uploadedUrls)
      setError(err.message)
      setSaving(false)
    }
  }


  const preview = {
    id: listing?.id,
    title: title.trim(),
    listing_type: listingType,
    swap_for: swapFor.trim(),
    price,
    category,
    condition,
    size: size.trim(),
    school: normalizeSchool(school),
    status: listing?.status ?? 'available',
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-10">
      <div className="flex flex-col gap-6 rounded-[10px] border border-line bg-white p-5 shadow-card sm:p-7">
        <Section title="Photos">
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5">
            {images.map((img, index) => (
              <div key={img.key} className="relative aspect-square overflow-hidden rounded-sm bg-surface ring-1 ring-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={`Photo ${index + 1}`} className="h-full w-full object-cover" />
                {index === 0 ? (
                  <span className="absolute inset-x-0 bottom-0 bg-primary py-0.5 text-center text-xs font-semibold text-white">
                    Cover
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => makeCover(img.key)}
                    className="absolute inset-x-0 bottom-0 bg-white/95 py-0.5 text-xs font-semibold text-primary hover:bg-white"
                  >
                    Make cover
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(img.key)}
                  className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-ink/75 text-white transition-colors hover:bg-ink"
                  aria-label={`Remove photo ${index + 1}`}
                >
                  <CloseIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
            {images.length < MAX_IMAGES && (
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-sm border-2 border-dashed border-line bg-surface text-muted transition-colors focus-within:border-primary focus-within:text-primary hover:border-primary hover:text-primary">
                <CameraIcon className="h-6 w-6" />
                <span className="text-xs font-medium">{images.length === 0 ? 'Add photos' : 'Add more'}</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={(e) => {
                    addFiles(e.target.files)
                    e.target.value = ''
                  }}
                />
              </label>
            )}
          </div>
          <p className="text-xs text-muted">
            Up to {MAX_IMAGES} photos. They’re resized automatically, so phone photos are fine. The first one is the cover.
          </p>
        </Section>

        <Section title="Sell or swap">
          <div role="radiogroup" aria-label="Listing type" className="grid gap-2.5 sm:grid-cols-2">
            {TYPE_OPTIONS.map(([value, label, hint]) => (
              <label
                key={value}
                className={`flex cursor-pointer gap-2.5 rounded-md border px-3.5 py-3 transition-colors focus-within:border-primary ${
                  listingType === value ? 'border-primary bg-primary-soft' : 'border-line hover:border-muted/60'
                }`}
              >
                <input
                  type="radio"
                  name="listing_type"
                  value={value}
                  checked={listingType === value}
                  onChange={() => setListingType(value)}
                  className="mt-0.5 accent-primary"
                />
                <span>
                  <span className="block text-[15px] font-semibold text-ink">{label}</span>
                  <span className="block text-xs text-muted">{hint}</span>
                </span>
              </label>
            ))}
          </div>
          {listingType === 'swap' && (
            <Field label="What I’m looking for in return" hint="Be specific so the right person messages you.">
              <textarea
                required
                rows={2}
                maxLength={300}
                value={swapFor}
                onChange={(e) => setSwapFor(e.target.value)}
                placeholder="e.g. Female nursing uniform size M, or a Calculus 1 book"
                className={inputClass}
              />
            </Field>
          )}
        </Section>

        <Section title="The item">
          <Field label="Title">
            <input
              required
              maxLength={100}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Nursing uniform, female, barely used"
              className={inputClass}
            />
          </Field>
          <Field label="Description" optional>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Measurements, flaws, where on campus you can meet…"
              className={inputClass}
            />
          </Field>
        </Section>

        <Section title={listingType === 'swap' ? 'Details and fit' : 'Price and fit'}>
          <div className="grid gap-4 sm:grid-cols-2">
            {listingType === 'sell' && (
              <Field label="Price (₱)">
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0"
                  className={`${inputClass} tabular`}
                />
              </Field>
            )}
            <Field label="Category">
              <select required value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
                <option value="" disabled>Choose a category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Condition">
              <select required value={condition} onChange={(e) => setCondition(e.target.value)} className={inputClass}>
                <option value="" disabled>Choose condition</option>
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Size" optional hint="e.g. M, XL, 7.5. Buyers filter by this.">
              <input maxLength={20} value={size} onChange={(e) => setSize(e.target.value)} className={inputClass} />
            </Field>
          </div>
          <Field
            label="School"
            optional
            hint="Type your school's full name. Pick a suggestion if yours is listed so buyers can find it."
          >
            <SchoolInput
              value={school}
              onChange={setSchool}
              placeholder="e.g. Bukidnon State University"
              className={inputClass}
            />
          </Field>
        </Section>

        <Section title="How students reach you">
          <Field
            label="Facebook username"
            optional={Boolean(user.email)}
            hint={
              user.email
                ? `Adds a “Message Seller on Messenger” button. Leave it blank and students will see your email (${user.email}) instead.`
                : 'Required: your account has no email, so students will contact you through Messenger.'
            }
          >
            <div className="relative">
              <MessengerIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                required={!user.email}
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                placeholder="juan.delacruz or your profile link"
                className={`${inputClass} pl-9`}
                autoCapitalize="none"
                autoCorrect="off"
              />
            </div>
          </Field>
        </Section>

        {error && (
          <p role="alert" className="rounded-sm border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800">
            {error}
          </p>
        )}

        <details className="rounded-md border border-line bg-surface lg:hidden">
          <summary className="cursor-pointer px-3.5 py-2.5 text-sm font-semibold text-primary">Preview your listing</summary>
          <div className="mx-auto max-w-[15rem] px-3.5 pb-4 pt-1">
            <ListingCardPreview listing={preview} cover={images[0]?.url ?? null} />
          </div>
        </details>

        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-accent py-3 text-[15px] font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {saving ? (images.some((i) => i.file) ? 'Resizing and uploading photos…' : 'Saving…') : isEdit ? 'Save Changes' : listingType === 'swap' ? 'Post Swap' : 'Post Item'}
        </button>
      </div>

      <aside className="hidden lg:block">
        <div className="lg:sticky lg:top-6">
          <p className="mb-2 text-sm font-semibold text-ink">Preview</p>
          <div>
            <ListingCardPreview listing={preview} cover={images[0]?.url ?? null} />
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted">
            This is how your listing shows up when students browse.
          </p>
        </div>
      </aside>
    </form>
  )
}
