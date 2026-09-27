'use client'

import { useEffect, useRef, useState } from 'react'
import { TrashIcon } from '@/app/components/icons'

// In-app replacement for the browser's confirm() and alert(), styled like the logout dialog.
//   const [dialog, { confirm, alert }] = useDialog()
//   if (!(await confirm({ title: 'Delete “Hoodie”?', body: '…', action: 'Delete' }))) return
//   await alert({ title: 'Couldn’t delete', body: error.message })
// Render {dialog} once anywhere in the page.
export default function useDialog() {
  const ref = useRef(null)
  const resolveRef = useRef(null)
  const [opts, setOpts] = useState(null)

  useEffect(() => {
    if (opts && !ref.current?.open) ref.current?.showModal()
  }, [opts])

  function open(next) {
    resolveRef.current?.(false)
    return new Promise((resolve) => {
      resolveRef.current = resolve
      setOpts(next)
    })
  }

  function finish(result) {
    resolveRef.current?.(result)
    resolveRef.current = null
    ref.current?.close()
  }

  const confirm = (o) => open({ kind: 'confirm', ...o })
  const alert = (o) => open({ kind: 'alert', ...(typeof o === 'string' ? { body: o } : o) })

  const danger = opts?.kind === 'confirm' && opts.danger !== false
  const dialog = (
    <dialog
      ref={ref}
      aria-labelledby="app-dialog-title"
      aria-describedby="app-dialog-body"
      // Escape. (Not onClose: that fires after finish(), when a follow-up alert may already be open.)
      onCancel={(e) => {
        e.preventDefault()
        finish(false)
      }}
      onClick={(e) => e.target === ref.current && finish(false)}
      className="m-auto w-[min(22rem,calc(100%-2rem))] rounded-2xl border border-line bg-white p-0 text-ink shadow-card-lift backdrop:bg-ink/40"
    >
      {opts && (
        <div className="p-5">
          {danger && (
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600">
              <TrashIcon className="h-5 w-5" />
            </span>
          )}
          <h2 id="app-dialog-title" className={`${danger ? 'mt-3' : ''} text-lg font-bold`}>
            {opts.title || (opts.kind === 'alert' ? 'Something went wrong' : 'Are you sure?')}
          </h2>
          {opts.body && (
            <p id="app-dialog-body" className="mt-1 text-sm text-muted">
              {opts.body}
            </p>
          )}
          {opts.kind === 'confirm' ? (
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                autoFocus
                onClick={() => finish(false)}
                className="min-h-11 rounded-md border border-line bg-white text-sm font-semibold text-ink transition-colors hover:bg-surface"
              >
                {opts.cancel || 'Cancel'}
              </button>
              <button
                onClick={() => finish(true)}
                className={`min-h-11 rounded-md text-sm font-semibold text-white transition-colors ${
                  danger ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-primary-hover'
                }`}
              >
                {opts.action || 'OK'}
              </button>
            </div>
          ) : (
            <button
              autoFocus
              onClick={() => finish(true)}
              className="mt-5 min-h-11 w-full rounded-md bg-primary text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              OK
            </button>
          )}
        </div>
      )}
    </dialog>
  )

  return [dialog, { confirm, alert }]
}
