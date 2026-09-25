'use client'

import { useEffect, useId, useState } from 'react'
import { supabase } from '@/lib/supabase'

// Free-text school field with suggestions from schools sellers have already entered.
// The list grows on its own as new schools get posted, so there is nothing to maintain.
export default function SchoolInput({ value, onChange, placeholder, className, id, required, ...props }) {
  const listId = useId()
  const [schools, setSchools] = useState([])

  useEffect(() => {
    supabase
      .from('listings')
      .select('school')
      .not('school', 'is', null)
      .then(({ data }) => {
        // De-duplicate case-insensitively, keeping the first spelling seen.
        const seen = new Map()
        for (const row of data ?? []) {
          const name = row.school.trim()
          if (name && !seen.has(name.toLowerCase())) seen.set(name.toLowerCase(), name)
        }
        setSchools([...seen.values()].sort((a, b) => a.localeCompare(b)))
      })
  }, [])

  return (
    <>
      <input
        id={id}
        type="text"
        list={listId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        maxLength={100}
        autoComplete="off"
        className={className}
        {...props}
      />
      <datalist id={listId}>
        {schools.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>
    </>
  )
}
