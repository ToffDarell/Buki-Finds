'use client'

import { useEffect, useRef, useState } from 'react'
import { checkAvatarFile, cropAvatar, hasCustomAvatar, removeAvatar, uploadAvatar } from '@/lib/avatar'
import Avatar from '@/app/components/Avatar'
import { CameraIcon, ImageIcon, TrashIcon } from '@/app/components/icons'

const MAX_ZOOM = 4

// Frame the photo inside a circle: drag to move, pinch / scroll / slider to zoom.
// Works in photo pixels scaled so zoom 1 = the photo's short side exactly fills the frame.
function Cropper({ url, onReady, onFail, viewRef }) {
  const frameRef = useRef(null)
  const pointers = useRef(new Map())
  const pinch = useRef(0)
  const [layout, setLayout] = useState(null) // { w, h, frame }
  const [view, setView] = useState({ zoom: 1, x: 0, y: 0 })

  // Turning the phone resizes the frame, so start over at the new size.
  useEffect(() => {
    // Phones also fire resize when the address bar hides, so only reset if the frame really changed.
    function onResize() {
      const frame = frameRef.current?.clientWidth
      if (!frame || !viewRef.current || viewRef.current.frame === frame) return
      const start = { zoom: 1, x: 0, y: 0 }
      viewRef.current = { ...viewRef.current, ...start, frame }
      setLayout((l) => (l ? { ...l, frame } : l))
      setView(start)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [viewRef])

  function clamp(v, l = layout) {
    if (!l) return v
    const zoom = Math.min(MAX_ZOOM, Math.max(1, v.zoom))
    const scale = (l.frame / Math.min(l.w, l.h)) * zoom
    const maxX = (l.w * scale - l.frame) / 2
    const maxY = (l.h * scale - l.frame) / 2
    return { zoom, x: Math.min(maxX, Math.max(-maxX, v.x)), y: Math.min(maxY, Math.max(-maxY, v.y)) }
  }

  function update(fn) {
    setView((v) => {
      const next = clamp(fn(v))
      viewRef.current = { ...next, ...layout }
      return next
    })
  }

  function onLoad(e) {
    const l = { w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight, frame: frameRef.current.clientWidth }
    const start = { zoom: 1, x: 0, y: 0 }
    setLayout(l)
    setView(start)
    viewRef.current = { ...start, ...l }
    onReady(true)
  }

  function distance() {
    const [a, b] = [...pointers.current.values()]
    return Math.hypot(a.x - b.x, a.y - b.y)
  }

  function onPointerDown(e) {
    e.currentTarget.setPointerCapture(e.pointerId)
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.current.size === 2) pinch.current = distance()
  }

  function onPointerMove(e) {
    const prev = pointers.current.get(e.pointerId)
    if (!prev) return
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.current.size === 1) {
      update((v) => ({ ...v, x: v.x + e.clientX - prev.x, y: v.y + e.clientY - prev.y }))
    } else if (pointers.current.size === 2 && pinch.current) {
      const d = distance()
      const ratio = d / pinch.current
      pinch.current = d
      update((v) => ({ zoom: v.zoom * ratio, x: v.x * ratio, y: v.y * ratio }))
    }
  }

  function onPointerUp(e) {
    pointers.current.delete(e.pointerId)
    pinch.current = pointers.current.size === 2 ? distance() : 0
  }

  function zoomTo(zoom) {
    update((v) => ({ zoom, x: (v.x * zoom) / v.zoom, y: (v.y * zoom) / v.zoom }))
  }

  const scale = layout ? (layout.frame / Math.min(layout.w, layout.h)) * view.zoom : 1

  return (
    <div className="flex flex-col items-center gap-5">
      <div
        ref={frameRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={(e) => zoomTo(view.zoom * (e.deltaY < 0 ? 1.08 : 1 / 1.08))}
        className="relative aspect-square w-[min(20rem,calc(100vw-2rem))] cursor-grab touch-none select-none overflow-hidden rounded-lg bg-black active:cursor-grabbing"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt=""
          draggable={false}
          onLoad={onLoad}
          onError={onFail}
          className={`absolute left-1/2 top-1/2 max-w-none ${layout ? '' : 'opacity-0'}`}
          style={
            layout
              ? {
                  width: layout.w * scale,
                  height: layout.h * scale,
                  transform: `translate(calc(-50% + ${view.x}px), calc(-50% + ${view.y}px))`,
                }
              : undefined
          }
        />
        {/* Darkens the corners so the circle shows exactly what others will see. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-full shadow-[0_0_0_9999px_rgb(0_0_0/0.55)] ring-2 ring-white/80" />
      </div>

      <label className="flex w-[min(20rem,calc(100vw-2rem))] items-center gap-3 text-white/80">
        <span className="sr-only">Zoom</span>
        <ImageIcon className="h-4 w-4 shrink-0" />
        <input
          type="range"
          min="1"
          max={MAX_ZOOM}
          step="0.01"
          value={view.zoom}
          onChange={(e) => zoomTo(Number(e.target.value))}
          disabled={!layout}
          className="h-11 flex-1 accent-white"
        />
        <ImageIcon className="h-6 w-6 shrink-0" />
      </label>
    </div>
  )
}

// The signed-in student's own photo. Tapping it opens a sheet (take photo / choose / remove),
// and a picked photo goes through the cropper before it's saved.
export default function AvatarEditor({ user, src, name, className }) {
  const sheetRef = useRef(null)
  const cropRef = useRef(null)
  const cameraRef = useRef(null)
  const galleryRef = useRef(null)
  const viewRef = useRef(null)
  const [picked, setPicked] = useState(null) // { file, url }
  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  // Only phones and tablets get a separate "Take photo"; desktops open the file picker for both.
  const [touch, setTouch] = useState(false)

  function openSheet() {
    setError('')
    setTouch(Boolean(window.matchMedia?.('(pointer: coarse)').matches))
    sheetRef.current?.showModal()
  }

  function choose(input) {
    sheetRef.current?.close()
    input.current?.click()
  }

  function onPick(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const problem = checkAvatarFile(file)
    if (problem) {
      setError(problem)
      setTouch(Boolean(window.matchMedia?.('(pointer: coarse)').matches))
      sheetRef.current?.showModal()
      return
    }
    setError('')
    setReady(false)
    setPicked({ file, url: URL.createObjectURL(file) })
    cropRef.current?.showModal()
  }

  function onCropClosed() {
    if (picked) URL.revokeObjectURL(picked.url)
    setPicked(null)
    setReady(false)
    setError('')
  }

  async function save() {
    const v = viewRef.current
    if (!v || !picked) return
    const scale = (v.frame / Math.min(v.w, v.h)) * v.zoom
    const side = v.frame / scale
    const rect = { side, sx: v.w / 2 - v.x / scale - side / 2, sy: v.h / 2 - v.y / scale - side / 2 }
    setBusy(true)
    setError('')
    try {
      await uploadAvatar(user, await cropAvatar(picked.file, rect))
      cropRef.current?.close()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    setBusy(true)
    setError('')
    try {
      await removeAvatar(user)
      sheetRef.current?.close()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const option =
    'flex min-h-12 w-full items-center gap-3 rounded-xl px-4 text-left text-[15px] font-semibold text-ink transition-colors hover:bg-surface disabled:opacity-60'
  // Keeps Escape / Tab inside these dialogs from reaching the profile menu's own key handlers.
  const isolate = { onKeyDown: (e) => e.stopPropagation() }

  return (
    <>
      <button
        type="button"
        onClick={openSheet}
        aria-haspopup="dialog"
        aria-label="Edit profile photo"
        className="group relative shrink-0 rounded-full"
      >
        <Avatar src={src} name={name} className={`${className} transition-opacity group-hover:opacity-90`} />
        <span className="absolute -bottom-1.5 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-primary shadow-sm">
          <CameraIcon className="h-3 w-3" strokeWidth="2.25" />
          Edit
        </span>
      </button>

      <input ref={cameraRef} type="file" accept="image/*" capture="user" onChange={onPick} className="sr-only" tabIndex={-1} aria-hidden="true" />
      <input ref={galleryRef} type="file" accept="image/*" onChange={onPick} className="sr-only" tabIndex={-1} aria-hidden="true" />

      {/* Action sheet: slides up from the bottom on phones, a small card on desktop. */}
      <dialog
        ref={sheetRef}
        aria-labelledby="avatar-sheet-title"
        onClick={(e) => e.target === sheetRef.current && !busy && sheetRef.current.close()}
        {...isolate}
        className="mx-0 mb-0 mt-auto w-full max-w-none rounded-t-2xl border border-line bg-white p-0 text-ink shadow-card-lift backdrop:bg-ink/40 sm:m-auto sm:max-w-sm sm:rounded-2xl"
      >
        <div className="p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div aria-hidden="true" className="mx-auto mb-2 h-1 w-10 rounded-full bg-line sm:hidden" />
          <h2 id="avatar-sheet-title" className="px-4 pb-2 pt-1 text-base font-bold">Profile photo</h2>
          {error && (
            <p role="alert" className="mx-4 mb-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}
          {touch && (
            <button type="button" onClick={() => choose(cameraRef)} disabled={busy} className={option}>
              <CameraIcon className="h-5 w-5 text-primary" />
              Take photo
            </button>
          )}
          <button type="button" onClick={() => choose(galleryRef)} disabled={busy} className={option}>
            <ImageIcon className="h-5 w-5 text-primary" />
            {touch ? 'Choose from gallery' : 'Upload a photo'}
          </button>
          {hasCustomAvatar(user) && (
            <button type="button" onClick={remove} disabled={busy} className={`${option} text-red-600 hover:bg-red-50`}>
              <TrashIcon className="h-5 w-5 text-red-500" />
              {busy ? 'Removing…' : 'Remove photo'}
            </button>
          )}
          <button
            type="button"
            onClick={() => sheetRef.current?.close()}
            disabled={busy}
            className="mt-2 min-h-12 w-full rounded-xl border border-line text-[15px] font-semibold text-ink transition-colors hover:bg-surface"
          >
            Cancel
          </button>
        </div>
      </dialog>

      {/* Cropper: full screen on phones, like a camera app; a dark card on desktop. */}
      <dialog
        ref={cropRef}
        aria-labelledby="avatar-crop-title"
        onClose={onCropClosed}
        onCancel={(e) => busy && e.preventDefault()}
        {...isolate}
        className="m-0 h-dvh max-h-none w-full max-w-none bg-neutral-950 p-0 text-white backdrop:bg-ink/70 sm:m-auto sm:h-auto sm:max-w-md sm:rounded-2xl"
      >
        <div className="flex h-full flex-col pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
          <div className="flex items-center justify-between gap-2 px-2 py-2">
            <button
              type="button"
              onClick={() => cropRef.current?.close()}
              disabled={busy}
              className="min-h-11 rounded-lg px-3 text-[15px] font-medium text-white/85 hover:bg-white/10 disabled:opacity-50"
            >
              Cancel
            </button>
            <h2 id="avatar-crop-title" className="text-base font-bold">Move and scale</h2>
            <button
              type="button"
              onClick={save}
              disabled={!ready || busy}
              className="min-h-11 rounded-lg bg-accent px-4 text-[15px] font-bold text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
            >
              {busy ? 'Saving…' : 'Save'}
            </button>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-6">
            {picked && (
              <Cropper
                key={picked.url}
                url={picked.url}
                onReady={setReady}
                onFail={() => setError('This browser can’t open that photo. Try a JPG or PNG, or take a new one.')}
                viewRef={viewRef}
              />
            )}
            <p className="text-center text-sm text-white/60">Drag to move · pinch or use the slider to zoom</p>
            {error && (
              <p role="alert" className="max-w-xs rounded-md bg-red-50 px-3 py-2 text-center text-sm text-red-700">{error}</p>
            )}
          </div>
        </div>
      </dialog>
    </>
  )
}
