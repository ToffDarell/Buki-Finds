// The student's own name and university, edited on their profile page.
// Stored in user metadata as custom_name / school (Google login refreshes full_name and name,
// so a separate key keeps the student's choice). Migration 013 copies both into profiles.

import { supabase } from '@/lib/supabase'
import { normalizeSchool } from '@/lib/listings'
import { canonicalSchool } from '@/lib/schools'

export const MAX_NAME_LENGTH = 60

export function userSchool(user) {
  return user?.user_metadata?.school || ''
}

export async function updateProfile(user, { name, school }) {
  const cleanName = name.replace(/\s+/g, ' ').trim().slice(0, MAX_NAME_LENGTH)
  if (!cleanName) throw new Error('Enter your name.')
  const cleanSchool = normalizeSchool(canonicalSchool(school))

  const { error } = await supabase.auth.updateUser({ data: { custom_name: cleanName, school: cleanSchool || null } })
  if (error) throw new Error(`Couldn’t save your profile: ${error.message}`)

  // Listings keep a copy of the seller's name for cards and item pages; bring them up to date.
  const { error: listingsError } = await supabase.from('listings').update({ seller_name: cleanName }).eq('seller_id', user.id)
  if (listingsError) throw new Error(`Your profile was saved, but your listings still show the old name: ${listingsError.message}`)
}
