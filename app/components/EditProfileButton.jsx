'use client'

import { useRef, useState } from 'react'
import { displayName } from '@/lib/avatar'
import { MAX_NAME_LENGTH, updateProfile, userSchool } from '@/lib/profile'
import SchoolInput from '@/app/components/SchoolInput'
import { PencilIcon } from '@/app/components/icons'

const inputClass =
  'mt-1.5 w-full rounded-md border border-line bg-white px-3 py-2.5 text-[15px] text-ink placeholder:text-muted/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'

// "Edit profile" on the student's own seller page: change the name and university others see.
export default function EditProfileButton({ user }) {
  const ref = useRef(null)
  const [name, setName] = useState('')
  const [school, setSchool] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function open() {
    setName(displayName(user))
    setSchool(userSchool(user))
    setError('')
    ref.current?.showModal()
  }

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await updateProfile(user, { name, school })
      ref.current?.close()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-haspopup="dialog"
        className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-3 text-sm font-semibold text-white transition-colors hover:bg-white/20"
      >
        <PencilIcon className="h-4 w-4" />
        <span className="hidden sm:inline">Edit profile</span>
        <span className="sm:hidden">Edit</span>
      </button>

      <dialog
        ref={ref}
        aria-labelledby="edit-profile-title"
        onCancel={(e) => saving && e.preventDefault()}
        onClick={(e) => e.target === ref.current && !saving && ref.current.close()}
        className="m-auto w-[min(26rem,calc(100%-2rem))] rounded-2xl border border-line bg-white p-0 text-ink shadow-card-lift backdrop:bg-ink/40"
      >
        <form onSubmit={save} className="p-5">
          <h2 id="edit-profile-title" className="text-lg font-bold">Edit profile</h2>
          <p className="mt-1 text-sm text-muted">Buyers see this on your profile and your listings.</p>

          <label className="mt-5 block text-sm font-semibold" htmlFor="profile-name">Name</label>
          <input
            id="profile-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={MAX_NAME_LENGTH}
            required
            autoComplete="name"
            className={inputClass}
          />

          <label className="mt-4 block text-sm font-semibold" htmlFor="profile-school">University</label>
          <SchoolInput
            id="profile-school"
            value={school}
            onChange={setSchool}
            placeholder="e.g. Central Mindanao University"
            className={inputClass}
          />
          <p className="mt-1.5 text-xs text-muted">New listings start with this university filled in.</p>

          {error && (
            <p role="alert" className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <div className="mt-6 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => ref.current?.close()}
              disabled={saving}
              className="min-h-11 rounded-md border border-line bg-white text-sm font-semibold text-ink transition-colors hover:bg-surface disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="min-h-11 rounded-md bg-primary text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </dialog>
    </>
  )
}
