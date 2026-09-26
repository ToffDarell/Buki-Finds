-- 008: Reserved status, meet-up spot, saved listings, reports, and seller reviews.
-- Paste the whole file into the Supabase SQL editor and click Run. Safe to run more than once.
-- This project's tables need explicit grants (new tables are not exposed automatically).

begin;

-- ---------------------------------------------------------------------------
-- Reserved status: promised to a buyer, still visible so others know.
-- The sold_at trigger already clears sold_at for anything that isn't 'sold'.
-- ---------------------------------------------------------------------------
alter table public.listings drop constraint if exists listings_status_check;
alter table public.listings
  add constraint listings_status_check check (status in ('available', 'reserved', 'sold'));

-- ---------------------------------------------------------------------------
-- Meet-up spot, e.g. "BukSU main gate" or "CMU library".
-- ---------------------------------------------------------------------------
alter table public.listings add column if not exists meetup_spot text;
alter table public.listings drop constraint if exists listings_meetup_spot_check;
alter table public.listings
  add constraint listings_meetup_spot_check check (meetup_spot is null or char_length(meetup_spot) <= 120);

-- ---------------------------------------------------------------------------
-- Saved listings: private to each student.
-- ---------------------------------------------------------------------------
create table if not exists public.saved_listings (
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);
alter table public.saved_listings enable row level security;
grant select, insert, delete on public.saved_listings to authenticated;

drop policy if exists "Students see their own saved listings" on public.saved_listings;
create policy "Students see their own saved listings" on public.saved_listings
  for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Students save listings for themselves" on public.saved_listings;
create policy "Students save listings for themselves" on public.saved_listings
  for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Students unsave their own listings" on public.saved_listings;
create policy "Students unsave their own listings" on public.saved_listings
  for delete to authenticated using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Reports: anyone signed in can file one per listing; only the project owner reads them
-- (Supabase dashboard > Table Editor > reports). No select grant on purpose.
-- ---------------------------------------------------------------------------
create table if not exists public.reports (
  id          uuid primary key default gen_random_uuid(),
  listing_id  uuid not null references public.listings(id) on delete cascade,
  reporter_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  reason      text not null check (reason in ('scam', 'wrong_item', 'inappropriate', 'other')),
  details     text check (details is null or char_length(details) <= 500),
  created_at  timestamptz not null default now(),
  unique (listing_id, reporter_id)
);
alter table public.reports enable row level security;
grant insert on public.reports to authenticated;

drop policy if exists "Students file reports as themselves" on public.reports;
create policy "Students file reports as themselves" on public.reports
  for insert to authenticated with check (auth.uid() = reporter_id);

-- ---------------------------------------------------------------------------
-- Reviews. A review is tied to one sold listing (one review per listing) and survives the
-- listing being deleted by the 7-day purge (listing_id goes null, the seller keeps the review).
-- Reviews are public to read; they can only be written through submit_review().
-- ---------------------------------------------------------------------------
create table if not exists public.reviews (
  id            uuid primary key default gen_random_uuid(),
  listing_id    uuid unique references public.listings(id) on delete set null,
  seller_id     uuid not null references auth.users(id) on delete cascade,
  reviewer_id   uuid references auth.users(id) on delete set null,
  reviewer_name text,
  listing_title text,
  rating        smallint not null check (rating between 1 and 5),
  comment       text check (comment is null or char_length(comment) <= 500),
  created_at    timestamptz not null default now()
);
create index if not exists reviews_seller_idx on public.reviews (seller_id, created_at desc);
alter table public.reviews enable row level security;
grant select on public.reviews to anon, authenticated;

drop policy if exists "Anyone can read reviews" on public.reviews;
create policy "Anyone can read reviews" on public.reviews for select using (true);

-- The secret in each review link. Nobody can read this table directly (no grants);
-- the functions below check it on the caller's behalf.
create table if not exists public.review_invites (
  listing_id uuid primary key references public.listings(id) on delete cascade,
  token      uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now()
);
alter table public.review_invites enable row level security;

-- Seller asks for a review link for their own sold listing. Returns the same token every time.
create or replace function public.create_review_invite(p_listing_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_token uuid;
begin
  if not exists (
    select 1 from public.listings
    where id = p_listing_id and seller_id = auth.uid() and status = 'sold'
  ) then
    raise exception 'Only the seller can get a review link, after marking the item sold.';
  end if;

  insert into public.review_invites (listing_id) values (p_listing_id)
  on conflict (listing_id) do nothing;

  select token into v_token from public.review_invites where listing_id = p_listing_id;
  return v_token;
end;
$$;

-- What the review page should show for a link: 'ok', 'invalid', 'own' or 'reviewed'.
create or replace function public.review_invite_status(p_listing_id uuid, p_token uuid)
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not exists (select 1 from public.review_invites where listing_id = p_listing_id and token = p_token) then
    return 'invalid';
  end if;
  if exists (select 1 from public.reviews where listing_id = p_listing_id) then
    return 'reviewed';
  end if;
  if exists (select 1 from public.listings where id = p_listing_id and seller_id = auth.uid()) then
    return 'own';
  end if;
  return 'ok';
end;
$$;

-- The only way to write a review: valid link, signed in, not the seller, first review for it.
create or replace function public.submit_review(p_listing_id uuid, p_token uuid, p_rating int, p_comment text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_listing public.listings%rowtype;
  v_name text;
  v_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Log in to leave a review.';
  end if;
  if not exists (select 1 from public.review_invites where listing_id = p_listing_id and token = p_token) then
    raise exception 'This review link is not valid.';
  end if;

  select * into v_listing from public.listings where id = p_listing_id;
  if not found then
    raise exception 'This listing no longer exists.';
  end if;
  if v_listing.seller_id = auth.uid() then
    raise exception 'You can''t review your own listing.';
  end if;
  if p_rating is null or p_rating < 1 or p_rating > 5 then
    raise exception 'Pick 1 to 5 stars.';
  end if;

  select coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', split_part(u.email, '@', 1))
    into v_name from auth.users u where u.id = auth.uid();

  insert into public.reviews (listing_id, seller_id, reviewer_id, reviewer_name, listing_title, rating, comment)
  values (p_listing_id, v_listing.seller_id, auth.uid(), v_name, v_listing.title, p_rating,
          nullif(left(trim(coalesce(p_comment, '')), 500), ''))
  returning id into v_id;

  return v_id;
exception
  when unique_violation then
    raise exception 'This listing already has a review.';
end;
$$;

revoke all on function public.create_review_invite(uuid) from public, anon;
revoke all on function public.review_invite_status(uuid, uuid) from public, anon;
revoke all on function public.submit_review(uuid, uuid, int, text) from public, anon;
grant execute on function public.create_review_invite(uuid) to authenticated;
grant execute on function public.review_invite_status(uuid, uuid) to authenticated;
grant execute on function public.submit_review(uuid, uuid, int, text) to authenticated;

commit;

notify pgrst, 'reload schema';
