-- Full schema for a fresh Supabase project. For the existing project, run
-- migrations_004_marketplace.sql instead (it brings the old table to this shape).

create table if not exists public.listings (
  id                       uuid primary key default gen_random_uuid(),
  seller_id                uuid not null default auth.uid() references auth.users(id) on delete cascade,
  seller_email             text,
  seller_name              text,
  seller_facebook_username text check (seller_facebook_username is null or seller_facebook_username ~ '^[A-Za-z0-9.]{1,100}$'),
  title                    text not null,
  description              text,
  price                    numeric not null check (price >= 0),
  category                 text not null,
  condition                text,
  size                     text,
  school                   text,
  status                   text not null default 'available' check (status in ('available', 'sold')),
  created_at               timestamptz not null default now()
);

create table if not exists public.listing_images (
  id         uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  image_url  text not null,
  sort_order integer not null default 0
);

create index if not exists listings_status_created_idx on public.listings (status, created_at desc);
create index if not exists listings_seller_idx on public.listings (seller_id);
create index if not exists listing_images_listing_idx on public.listing_images (listing_id, sort_order);

alter table public.listings enable row level security;
alter table public.listing_images enable row level security;

grant select on public.listings, public.listing_images to anon, authenticated;
grant insert, update, delete on public.listings, public.listing_images to authenticated;

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

-- Public bucket for listing photos. Files live under <user id>/<listing id>/...
insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do nothing;

create policy "Anyone can view listing images" on storage.objects for select
  using (bucket_id = 'listing-images');
create policy "Signed-in users can upload to their own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'listing-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users can delete their own images" on storage.objects for delete to authenticated
  using (bucket_id = 'listing-images' and (storage.foldername(name))[1] = auth.uid()::text);
