-- Full Buki-Finds schema for a FRESH Supabase project: paste the whole file into the
-- SQL editor and click Run. The live project already has all of this (it was built up by the
-- earlier migrations 004-007), so do not run it there.
--
-- After this file, also run migrations_008_trust_features.sql (reserved status, meet-up spot,
-- saved listings, reports, reviews). It is written to run on top of this schema.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.listings (
  id                       uuid primary key default gen_random_uuid(),
  seller_id                uuid not null default auth.uid() references auth.users(id) on delete cascade,
  seller_email             text,
  seller_name              text,
  seller_facebook_username text check (seller_facebook_username is null or seller_facebook_username ~ '^[A-Za-z0-9.]{1,100}$'),
  title                    text not null,
  description              text,
  listing_type             text not null default 'sell' check (listing_type in ('sell', 'swap')),
  price                    numeric check (price >= 0),
  swap_for                 text check (swap_for is null or char_length(swap_for) <= 300),
  category                 text not null,
  condition                text,
  size                     text,
  school                   text,
  status                   text not null default 'available' check (status in ('available', 'sold')),
  created_at               timestamptz not null default now(),
  sold_at                  timestamptz, -- set by listings_set_sold_at; the listing is purged 7 days later
  -- Swaps have no price; listings for sale must have one.
  constraint listings_price_required_check check (listing_type = 'swap' or price is not null)
);

create table if not exists public.listing_images (
  id         uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  image_url  text not null,
  sort_order integer not null default 0
);

create index if not exists listings_status_created_idx on public.listings (status, created_at desc);
create index if not exists listings_seller_idx on public.listings (seller_id);
create index if not exists listings_type_status_created_idx on public.listings (listing_type, status, created_at desc);
create index if not exists listings_sold_at_idx on public.listings (sold_at) where status = 'sold';
create index if not exists listing_images_listing_idx on public.listing_images (listing_id, sort_order);

-- sold_at is set by the database, never by the browser: stamped when a listing becomes sold,
-- kept while it stays sold, cleared when it's marked available again (which cancels the purge).
create or replace function public.set_listing_sold_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status <> 'sold' then
    new.sold_at := null;
  elsif tg_op = 'UPDATE' and old.status = 'sold' then
    new.sold_at := old.sold_at;
  else
    new.sold_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists listings_set_sold_at on public.listings;
create trigger listings_set_sold_at
  before insert or update on public.listings
  for each row execute function public.set_listing_sold_at();

-- ---------------------------------------------------------------------------
-- Access (row level security)
-- ---------------------------------------------------------------------------

alter table public.listings enable row level security;
alter table public.listing_images enable row level security;

grant select on public.listings, public.listing_images to anon, authenticated;
grant insert, update, delete on public.listings, public.listing_images to authenticated;
-- The purge-sold-listings Edge Function runs as service_role.
grant select, delete on public.listings, public.listing_images to service_role;

create policy "Anyone can view listings" on public.listings for select using (true);
create policy "Sellers can create their own listings" on public.listings for insert to authenticated
  with check (auth.uid() = seller_id);
create policy "Sellers can update their own listings" on public.listings for update to authenticated
  using (auth.uid() = seller_id) with check (auth.uid() = seller_id);
create policy "Sellers can delete their own listings" on public.listings for delete to authenticated
  using (auth.uid() = seller_id);

create policy "Anyone can view listing images" on public.listing_images for select using (true);
create policy "Sellers can add images to their listings" on public.listing_images for insert to authenticated
  with check (exists (select 1 from public.listings l where l.id = listing_id and l.seller_id = auth.uid()));
create policy "Sellers can update images on their listings" on public.listing_images for update to authenticated
  using (exists (select 1 from public.listings l where l.id = listing_id and l.seller_id = auth.uid()))
  with check (exists (select 1 from public.listings l where l.id = listing_id and l.seller_id = auth.uid()));
create policy "Sellers can delete images on their listings" on public.listing_images for delete to authenticated
  using (exists (select 1 from public.listings l where l.id = listing_id and l.seller_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- Storage: public bucket for listing photos. Files live under <user id>/<listing id>/...
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do nothing;

create policy "Anyone can view listing images" on storage.objects for select
  using (bucket_id = 'listing-images');
create policy "Signed-in users can upload to their own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'listing-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users can delete their own images" on storage.objects for delete to authenticated
  using (bucket_id = 'listing-images' and (storage.foldername(name))[1] = auth.uid()::text);

-- ---------------------------------------------------------------------------
-- Nightly purge (optional, run once after deploying the Edge Function in
-- supabase/functions/purge-sold-listings). Deletes listings 7 days after they're marked
-- sold, photos included. Replace <PROJECT_REF> and <ANON_KEY> with the new project's values
-- (Project Settings > API), then uncomment and run. 19:00 UTC = 3:00 AM Philippine time.
-- ---------------------------------------------------------------------------

-- create extension if not exists pg_cron;
-- create extension if not exists pg_net;
-- select cron.schedule(
--   'purge-sold-listings',
--   '0 19 * * *',
--   $$
--   select net.http_post(
--     url := 'https://<PROJECT_REF>.supabase.co/functions/v1/purge-sold-listings',
--     headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer <ANON_KEY>'),
--     body := '{}'::jsonb,
--     timeout_milliseconds := 60000
--   );
--   $$
-- );

notify pgrst, 'reload schema';
