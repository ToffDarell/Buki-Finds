// Photo handling for listings: shrink phone photos in the browser before upload, and keep a
// small thumbnail next to each photo so Browse cards don't download full-size images.
// Phone photos are 2-5 MB; after this they are ~100-250 KB (full) and ~20-35 KB (thumbnail),
// which keeps the Supabase free tier's storage and bandwidth limits far away.

import { storagePathFromUrl } from '@/lib/listings'

// maxSize caps the LONGER side, so portrait phone photos (the usual case) shrink as much as landscape ones.
const FULL = { maxSize: 1200, quality: 0.82 }
const THUMB = { maxSize: 480, quality: 0.72 }

// Largest raw photo we accept before compression. Anything the browser can't decode
// (e.g. HEIC on some browsers) is uploaded as-is, so it has to be small already.
export const MAX_RAW_IMAGE_BYTES = 25 * 1024 * 1024
export const MAX_UNCOMPRESSED_BYTES = 5 * 1024 * 1024

export async function decode(file) {
  // createImageBitmap applies the photo's EXIF rotation, so sideways phone photos come out upright.
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' })
    } catch {
      // fall through to <img> decoding
    }
  }
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.src = url
    await img.decode()
    return img
  } finally {
    URL.revokeObjectURL(url)
  }
}

export function toBlob(canvas, type, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality))
}

async function encode(source, { maxSize, quality }, type) {
  const width = source.width
  const height = source.height
  const scale = Math.min(1, maxSize / Math.max(width, height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(width * scale))
  canvas.height = Math.max(1, Math.round(height * scale))
  const ctx = canvas.getContext('2d')
  // JPEG has no transparency: paint white first so transparent PNGs don't turn black.
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height)
  return toBlob(canvas, type, quality)
}

// Returns { full, thumb, ext, contentType } ready to upload, or { original: file } when the
// browser can't decode the format (the caller uploads the original if it is small enough).
export async function prepareImage(file) {
  let source
  try {
    source = await decode(file)
  } catch {
    return { original: file }
  }

  // WebP is ~30% smaller than JPEG; browsers that can't encode it silently return PNG, so check.
  let type = 'image/webp'
  let full = await encode(source, FULL, type)
  if (!full || full.type !== type) {
    type = 'image/jpeg'
    full = await encode(source, FULL, type)
  }
  const thumb = await encode(source, THUMB, type)
  source.close?.()

  if (!full || !thumb) return { original: file }
  return { full, thumb, ext: type === 'image/webp' ? 'webp' : 'jpg', contentType: type }
}

// ".../abc.webp" -> ".../abc-thumb.webp". Older photos have no thumbnail; callers fall back to the full URL.
export function thumbUrl(url) {
  return url ? url.replace(/(\.[a-z0-9]+)$/i, '-thumb$1') : url
}

// Storage paths to delete for a photo: the photo itself and its thumbnail.
export function imageStoragePaths(urls) {
  return urls.flatMap((url) => {
    const path = storagePathFromUrl(url)
    return path ? [path, storagePathFromUrl(thumbUrl(url))] : []
  })
}
