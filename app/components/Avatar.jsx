'use client'

import { useState } from 'react'

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
