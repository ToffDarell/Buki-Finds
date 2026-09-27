-- 014: Sellers can add an Instagram username next to (or instead of) Facebook.
-- Buyers get a "Message on Instagram" button (ig.me/m/<username>). The app stores only the
-- clean username, whatever the seller pastes (profile link, share link, @username).
-- Paste the whole file into the Supabase SQL editor and click Run. Safe to run more than once.

alter table public.listings add column if not exists seller_instagram_username text;

alter table public.listings drop constraint if exists listings_seller_instagram_username_check;
alter table public.listings add constraint listings_seller_instagram_username_check
  check (seller_instagram_username is null or seller_instagram_username ~ '^[a-z0-9._]{1,30}$');

notify pgrst, 'reload schema';
