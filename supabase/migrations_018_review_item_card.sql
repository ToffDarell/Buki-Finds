-- 018: Reviews show the item that was bought (photo, title, price), like Carousell, plus the
-- buyer's photo and optional quick tags ("Item as described", "Good communication", ...).
-- Sold listings are purged after 7 days, so the review keeps its own copy of the price and the
-- cover photo's URL, and the purge function (supabase/functions/purge-sold-listings) now keeps that
-- one photo for reviewed listings. Redeploy that function after running this.
-- Paste the whole file into the Supabase SQL editor and click Run. Safe to run more than once.
-- Requires 008 (reviews) and 010/013 (profiles).

begin;

alter table public.reviews add column if not exists listing_price   numeric;
alter table public.reviews add column if not exists listing_type    text;
alter table public.reviews add column if not exists listing_photo   text;
alter table public.reviews add column if not exists reviewer_avatar text;
alter table public.reviews add column if not exists tags text[] not null default '{}';

alter table public.reviews drop constraint if exists reviews_tags_check;
alter table public.reviews add constraint reviews_tags_check
  check (tags <@ array['as_described', 'communication', 'punctual', 'fair_price']::text[] and cardinality(tags) <= 4);

-- The purge function (service role) reads which photos to keep.
grant select on public.reviews to service_role;

-- Same checks as before; now also saves the item snapshot, the buyer's photo and tags.
drop function if exists public.submit_review(uuid, uuid, int, text);
create or replace function public.submit_review(
  p_listing_id uuid, p_token uuid, p_rating int, p_comment text, p_tags text[] default '{}'
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_listing public.listings%rowtype;
  v_name    text;
  v_avatar  text;
  v_photo   text;
  v_tags    text[];
  v_id      uuid;
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

  -- The name and photo the buyer shows on BukiFinds.
  select coalesce(nullif(p.full_name, ''), u.raw_user_meta_data->>'custom_name', u.raw_user_meta_data->>'full_name',
                  u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
         p.avatar_url
    into v_name, v_avatar
    from auth.users u left join public.profiles p on p.id = u.id
   where u.id = auth.uid();

  -- The cover photo (the first one) of the item.
  select i.image_url into v_photo from public.listing_images i
   where i.listing_id = p_listing_id order by i.sort_order limit 1;

  -- Known tags only, each once.
  select coalesce(array_agg(distinct t), '{}') into v_tags
    from unnest(coalesce(p_tags, '{}')) as t
   where t in ('as_described', 'communication', 'punctual', 'fair_price');

  insert into public.reviews
    (listing_id, seller_id, reviewer_id, reviewer_name, reviewer_avatar, listing_title, listing_price, listing_type,
     listing_photo, rating, comment, tags)
  values (p_listing_id, v_listing.seller_id, auth.uid(), v_name, v_avatar, v_listing.title,
          case when v_listing.listing_type = 'swap' then null else v_listing.price end,
          v_listing.listing_type, v_photo, p_rating,
          nullif(left(trim(coalesce(p_comment, '')), 500), ''), v_tags)
  returning id into v_id;

  return v_id;
exception
  when unique_violation then
    raise exception 'This listing already has a review.';
end;
$$;

revoke all on function public.submit_review(uuid, uuid, int, text, text[]) from public, anon;
grant execute on function public.submit_review(uuid, uuid, int, text, text[]) to authenticated;

commit;

notify pgrst, 'reload schema';
