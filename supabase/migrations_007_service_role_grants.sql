-- 007: Let the purge-sold-listings Edge Function read and delete listings.
-- The function runs as service_role, and this project's tables only granted anon and
-- authenticated, so every run failed with "permission denied for table listings".
-- Paste into the Supabase SQL editor and click Run. Safe to run more than once.

grant select, delete on public.listings, public.listing_images to service_role;
