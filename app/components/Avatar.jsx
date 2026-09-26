'use client'

import { useRef, useState } from 'react'
import { hasCustomAvatar, removeAvatar, uploadAvatar } from '@/lib/avatar'
import { CameraIcon } from '@/app/components/icons'

// Round profile photo, falling back to the name's first letter when there's no photo or it fails to load.
export default function Avatar({ src, name, className = 'h-11 w-11 text-base', bg = 'bg-white/20' }) {
  const [failed, setFailed] = useState(null)
  const initial = ((name || '')[0] || 'U').toUpperCase()
  const showImage = src && failed !== src

  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full font-bold text-white shadow-xs backdrop-blur-xs ${bg} ${className}`}
    >
      {showImage ? (
        // Google photos refuse requests that carry a referrer.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" referrerPolicy="no-referrer" onError={() => setFailed(src)} className="h-full w-full object-cover" />
      ) : (
        initial
      )}
    </span>
  )
}

// The signed-in student's own photo with a camera button to change it.
export function AvatarEditor({ user, src, name, className, showRemove = false }) {
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function run(action) {
    setBusy(true)
    setError('')
    try {
      await action()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  function onPick(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (file) run(() => uploadAvatar(user, file))
  }

  return (
    <div className="flex shrink-0 flex-col items-center gap-1">
      <div className="relative">
        <span className={busy ? 'block animate-pulse opacity-60' : 'block'}>
          <Avatar src={src} name={name} className={className} />
        </span>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          aria-label="Change profile photo"
          title="Change profile photo"
          className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-accent text-white shadow-xs transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          <CameraIcon className="h-3.5 w-3.5" strokeWidth="2" />
        </button>
        <input ref={inputRef} type="file" accept="image/*" onChange={onPick} className="sr-only" tabIndex={-1} aria-hidden="true" />
      </div>
      {showRemove && hasCustomAvatar(user) && (
        <button
          type="button"
          onClick={() => run(() => removeAvatar(user))}
          disabled={busy}
          className="mt-1 text-xs font-medium text-on-primary-muted underline-offset-2 hover:text-white hover:underline disabled:opacity-60"
        >
          Remove photo
        </button>
      )}
      {error && (
        <p role="alert" className="max-w-40 rounded bg-red-50 px-2 py-1 text-center text-xs text-red-700">
          {error}
        </p>
      )}
    </div>
  )
}
