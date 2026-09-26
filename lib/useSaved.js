'use client'

import { useSyncExternalStore } from 'react'
import { supabase } from '@/lib/supabase'

// One shared store of the signed-in student's saved listing ids, so a grid of cards makes a
// single request instead of one per heart. It follows auth changes on its own.
let ids = new Set()
let userId = null
let loadedFor = null
const listeners = new Set()

function emit() {
  ids = new Set(ids) // new reference so React re-renders subscribers
  listeners.forEach((l) => l())
}

async function load(forUser) {
  loadedFor = forUser
  if (!forUser) {
    ids = new Set()
    emit()
    return
  }
  const { data } = await supabase.from('saved_listings').select('listing_id')
  if (loadedFor !== forUser) return
  ids = new Set((data ?? []).map((row) => row.listing_id))
  emit()
}

let started = false
function start() {
  if (started || typeof window === 'undefined') return
  started = true
  supabase.auth.getUser().then(({ data }) => {
    userId = data.user?.id ?? null
    load(userId)
  })
  supabase.auth.onAuthStateChange((_event, session) => {
    const next = session?.user?.id ?? null
    if (next !== userId) {
      userId = next
      load(userId)
    }
  })
}

function subscribe(listener) {
  start()
  listeners.add(listener)
  return () => listeners.delete(listener)
}

const EMPTY = new Set()

export function useSavedIds() {
  return useSyncExternalStore(subscribe, () => ids, () => EMPTY)
}

// Optimistic toggle; rolls back if the database refuses. Returns false when signed out.
export async function toggleSaved(listingId) {
  if (!userId) return false
  const wasSaved = ids.has(listingId)
  if (wasSaved) ids.delete(listingId)
  else ids.add(listingId)
  emit()
  const { error } = wasSaved
    ? await supabase.from('saved_listings').delete().eq('listing_id', listingId)
    : await supabase.from('saved_listings').insert({ listing_id: listingId })
  if (error) {
    if (wasSaved) ids.add(listingId)
    else ids.delete(listingId)
    emit()
  }
  return true
}
