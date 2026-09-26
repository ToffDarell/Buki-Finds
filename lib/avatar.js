// Profile photos. Google accounts come with a photo in user_metadata (avatar_url / picture);
// a photo the student uploads is stored as custom_avatar_url, which Google login never overwrites.

import { supabase } from '@/lib/supabase'
import { decode, toBlob } from '@/lib/images'

export const AVATAR_BUCKET = 'avatars'
const SIZE = 320
const MAX_RAW_BYTES = 25 * 1024 * 1024

export function displayName(user) {
  return user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Student'
}

export function avatarUrl(user) {
  const meta = user?.user_metadata
  return meta?.custom_avatar_url || meta?.avatar_url || meta?.picture || null
}

// Google accounts fall back to their Google photo when the upload is removed.
export function hasCustomAvatar(user) {
  return Boolean(user?.user_metadata?.custom_avatar_url)
}

function storagePath(url) {
  const marker = `/object/public/${AVATAR_BUCKET}/`
  const i = url?.indexOf(marker) ?? -1
  return i === -1 ? null : decodeURIComponent(url.slice(i + marker.length))
}

// Center-crops to a square and shrinks to SIZE px, so a phone photo becomes a ~15 KB file.
async function squareImage(file) {
  const source = await decode(file)
  const side = Math.min(source.width, source.height)
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = Math.min(SIZE, side)
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(source, (source.width - side) / 2, (source.height - side) / 2, side, side, 0, 0, canvas.width, canvas.height)
  source.close?.()

  let blob = await toBlob(canvas, 'image/webp', 0.85)
  if (!blob || blob.type !== 'image/webp') blob = await toBlob(canvas, 'image/jpeg', 0.85)
  if (!blob) throw new Error('Couldn’t read that photo. Try a JPG or PNG.')
  return blob
}

async function removeOld(user) {
  const path = storagePath(user?.user_metadata?.custom_avatar_url)
  if (path) await supabase.storage.from(AVATAR_BUCKET).remove([path])
}

export async function uploadAvatar(user, file) {
  if (!file.type.startsWith('image/')) throw new Error('Choose an image file.')
  if (file.size > MAX_RAW_BYTES) throw new Error('That photo is too large. Choose one under 25 MB.')

  let blob
  try {
    blob = await squareImage(file)
  } catch {
    throw new Error('Couldn’t read that photo. Try a JPG or PNG.')
  }
  const ext = blob.type === 'image/webp' ? 'webp' : 'jpg'
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`
  const bucket = supabase.storage.from(AVATAR_BUCKET)
  const { error } = await bucket.upload(path, blob, { contentType: blob.type })
  if (error) throw new Error(`Photo upload failed: ${error.message}`)

  const url = bucket.getPublicUrl(path).data.publicUrl
  const { error: updateError } = await supabase.auth.updateUser({ data: { custom_avatar_url: url } })
  if (updateError) {
    await bucket.remove([path])
    throw new Error(`Couldn’t save your photo: ${updateError.message}`)
  }
  await removeOld(user)
}

export async function removeAvatar(user) {
  const { error } = await supabase.auth.updateUser({ data: { custom_avatar_url: null } })
  if (error) throw new Error(`Couldn’t remove your photo: ${error.message}`)
  await removeOld(user)
}
