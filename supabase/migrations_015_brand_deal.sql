-- 015: Brand and deal method on listings.
-- brand:         optional, e.g. "Nike" (buyers filter and search by it).
-- deal_methods:  how the item can change hands: meetup, delivery, or both. Existing listings
--                become meet-up only, which is how everything worked before.
-- delivery_note: optional short note when delivery is offered, e.g. "J&T, buyer pays shipping".
-- Paste the whole file into the Supabase SQL editor and click Run. Safe to run more than once.
-- Run this BEFORE deploying the code that writes these columns.

alter table public.listings add column if not exists brand text;
alter table public.listings drop constraint if exists listings_brand_check;
alter table public.listings add constraint listings_brand_check
  check (brand is null or char_length(brand) <= 40);

alter table public.listings add column if not exists deal_methods text[] not null default '{meetup}';
alter table public.listings drop constraint if exists listings_deal_methods_check;
alter table public.listings add constraint listings_deal_methods_check
  check (deal_methods <@ array['meetup', 'delivery']::text[] and cardinality(deal_methods) >= 1);

alter table public.listings add column if not exists delivery_note text;
alter table public.listings drop constraint if exists listings_delivery_note_check;
alter table public.listings add constraint listings_delivery_note_check
  check (delivery_note is null or char_length(delivery_note) <= 80);

notify pgrst, 'reload schema';
