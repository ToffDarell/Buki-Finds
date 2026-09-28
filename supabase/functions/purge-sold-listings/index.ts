// Deletes listings that have been Sold/Swapped for 7+ days, and their photos in storage.
// A reviewed listing's cover photo is kept, because its review shows it (migration 018).
// Called once a day by the pg_cron job in supabase/migrations_006_auto_purge.sql.
//
// Deploy: Supabase dashboard > Edge Functions > Deploy a new function > Via Editor.
// Keep the file name index.ts, set Function name to purge-sold-listings, paste this file, Deploy.
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided to Edge Functions automatically.
// Written with plain strings only (no regex or template literals) so it survives copy-paste.

import { createClient } from 'npm:@supabase/supabase-js@2'

const BUCKET = 'listing-images'
const RETENTION_DAYS = 7
const BATCH = 100
const MARKER = '/object/public/' + BUCKET + '/'

// https://<project>.supabase.co/storage/v1/object/public/listing-images/<path> -> <path>
function storagePath(url: string): string | null {
  const i = url.indexOf(MARKER)
  if (i === -1) return null
  return decodeURIComponent(url.slice(i + MARKER.length))
}

// ".../abc.webp" -> ".../abc-thumb.webp"
function thumbPath(path: string): string {
  const dot = path.lastIndexOf('.')
  if (dot === -1) return path + '-thumb'
  return path.slice(0, dot) + '-thumb' + path.slice(dot)
}

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  )
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString()

  // 1. Find what's due, with photo URLs (they're gone once the row is deleted).
  const found = await supabase
    .from('listings')
    .select('id, seller_id, listing_images(image_url)')
    .eq('status', 'sold')
    .lt('sold_at', cutoff)
    .limit(BATCH)
  if (found.error) return Response.json({ error: found.error.message }, { status: 500 })
  const due = found.data ?? []
  if (due.length === 0) return Response.json({ deleted: 0 })

  // 1b. Reviews show the item's cover photo (migration 018), so keep that photo (and its thumbnail)
  //     for listings that were reviewed. Read before deleting: the review loses its link after.
  const keep = new Set<string>()
  const reviewed = await supabase
    .from('reviews')
    .select('listing_photo')
    .in('listing_id', due.map((l) => l.id))
    .not('listing_photo', 'is', null)
  for (const review of reviewed.data ?? []) {
    const path = storagePath(review.listing_photo)
    if (path) {
      keep.add(path)
      keep.add(thumbPath(path))
    }
  }

  // 2. Delete the rows first, re-checking the conditions so a listing marked Available a moment
  //    ago is left alone. listing_images rows go with ON DELETE CASCADE.
  const removed = await supabase
    .from('listings')
    .delete()
    .in('id', due.map((l) => l.id))
    .eq('status', 'sold')
    .lt('sold_at', cutoff)
    .select('id')
  if (removed.error) return Response.json({ error: removed.error.message }, { status: 500 })

  // 3. Remove the photos of the deleted listings: every file in <seller>/<listing>/ plus any
  //    photo URL stored elsewhere.
  const deletedIds = new Set((removed.data ?? []).map((l) => l.id))
  const paths = new Set<string>()
  for (const listing of due) {
    if (!deletedIds.has(listing.id)) continue
    const folder = listing.seller_id + '/' + listing.id
    const listed = await supabase.storage.from(BUCKET).list(folder, { limit: 100 })
    for (const file of listed.data ?? []) paths.add(folder + '/' + file.name)
    for (const img of listing.listing_images ?? []) {
      const path = storagePath(img.image_url)
      if (path) {
        paths.add(path)
        paths.add(thumbPath(path))
      }
    }
  }

  for (const path of keep) paths.delete(path)

  let storageError: string | null = null
  if (paths.size > 0) {
    const result = await supabase.storage.from(BUCKET).remove(Array.from(paths))
    if (result.error) storageError = result.error.message
  }

  // More than one batch due: the next daily run picks up the rest.
  return Response.json({ deleted: deletedIds.size, files: paths.size, storageError, more: due.length === BATCH })
})
