-- 004: Consolidate the listings schema for the marketplace pages.
-- The listings table is empty, so dropping the duplicate columns loses no data.
-- Paste the whole file into the Supabase SQL editor and click Run.

begin;

-- ---------------------------------------------------------------------------
-- listings
-- ---------------------------------------------------------------------------

-- Old policies reference user_id, which is being dropped.
drop policy if exists "Anyone can view listings" on public.listings;
drop policy if exists "Users can create their own listings" on public.listings;
drop policy if exists "Users can update their own listings" on public.listings;
drop policy if exists "Users can delete their own listings" on public.listings;

-- seller_id is the owner column; user_id / is_sold / image_url / contact were
-- duplicates (replaced by seller_id, status, listing_images, seller_facebook_username).
alter table public.listings drop column if exists user_id;
alter table public.listings drop column if exists is_sold;
alter table public.listings drop column if exists image_url;
alter table public.listings drop column if exists contact;

-- Remove a user's listings when their account is deleted.
alter table public.listings drop constraint if exists listings_seller_id_fkey;
alter table public.listings
  add constraint listings_seller_id_fkey foreign key (seller_id) references auth.users(id) on delete cascade;
alter table public.listings alter column seller_id set default auth.uid();

update public.listings set status = 'available' where status is null;
alter table public.listings alter column status set not null;
alter table public.listings drop constraint if exists listings_status_check;
alter table public.listings add constraint listings_status_check check (status in ('available', 'sold'));

alter table public.listings drop constraint if exists listings_price_check;
alter table public.listings add constraint listings_price_check check (price >= 0);

alter table public.listings alter column created_at type timestamptz using created_at at time zone 'UTC';
alter table public.listings alter column created_at set not null;

-- Optional Messenger contact. Only letters, digits and dots, so the m.me link can't be abused.
alter table public.listings add column if not exists seller_facebook_username text;
alter table public.listings drop constraint if exists listings_seller_facebook_username_check;
alter table public.listings
  add constraint listings_seller_facebook_username_check
  check (seller_facebook_username is null or seller_facebook_username ~ '^[A-Za-z0-9.]{1,100}$');

create index if not exists listings_status_created_idx on public.listings (status, created_at desc);
create index if not exists listings_seller_idx on public.listings (seller_id);

grant select on public.listings to anon, authenticated;
grant insert, update, delete on public.listings to authenticated;

create policy "Anyone can view listings"
  on public.listings for select
  using (true);

create policy "Sellers can create their own listings"
  on public.listings for insert to authenticated
  with check (auth.uid() = seller_id);

create policy "Sellers can update their own listings"
  on public.listings for update to authenticated
  using (auth.uid() = seller_id)
  with check (auth.uid() = seller_id);

create policy "Sellers can delete their own listings"
  on public.listings for delete to authenticated
  using (auth.uid() = seller_id);

-- ---------------------------------------------------------------------------
-- listing_images (RLS was enabled with no policies, so nothing could read/write it)
-- ---------------------------------------------------------------------------

delete from public.listing_images where listing_id is null;
alter table public.listing_images alter column listing_id set not null;
alter table public.listing_images alter column sort_order set not null;

create index if not exists listing_images_listing_idx on public.listing_images (listing_id, sort_order);

grant select on public.listing_images to anon, authenticated;
grant insert, update, delete on public.listing_images to authenticated;

drop policy if exists "Anyone can view listing images" on public.listing_images;
drop policy if exists "Sellers can add images to their listings" on public.listing_images;
drop policy if exists "Sellers can update images on their listings" on public.listing_images;
drop policy if exists "Sellers can delete images on their listings" on public.listing_images;

create policy "Anyone can view listing images"
  on public.listing_images for select
  using (true);

create policy "Sellers can add images to their listings"
  on public.listing_images for insert to authenticated
  with check (exists (select 1 from public.listings l where l.id = listing_id and l.seller_id = auth.uid()));

create policy "Sellers can update images on their listings"
  on public.listing_images for update to authenticated
  using (exists (select 1 from public.listings l where l.id = listing_id and l.seller_id = auth.uid()))
  with check (exists (select 1 from public.listings l where l.id = listing_id and l.seller_id = auth.uid()));

create policy "Sellers can delete images on their listings"
  on public.listing_images for delete to authenticated
  using (exists (select 1 from public.listings l where l.id = listing_id and l.seller_id = auth.uid()));

commit;

notify pgrst, 'reload schema';
