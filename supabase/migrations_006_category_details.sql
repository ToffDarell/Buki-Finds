-- 006 (category details): per-category extra fields for listings.
-- Existing columns (condition, size, brand, deal_methods, meetup_spot) are reused. Only the new
-- category-specific fields live in listings.details: model, included, issues (Electronics),
-- quantity, availability, schedule (Food), rate_unit, where, schedule (Services).
-- Existing listings get '{}' and keep working; no data migration.
-- Paste the whole file into the Supabase SQL editor and click Run. Safe to run more than once.
-- Run it after 015 (brand and deal method), before deploying the code that writes `details`.

begin;

alter table public.listings add column if not exists details jsonb not null default '{}'::jsonb;

alter table public.listings drop constraint if exists listings_details_object_check;
alter table public.listings add constraint listings_details_object_check
  check (jsonb_typeof(details) = 'object');

alter table public.listings drop constraint if exists listings_details_size_check;
alter table public.listings add constraint listings_details_size_check
  check (pg_column_size(details) <= 2000);

-- "Other" listings need a description of at least 10 characters.
-- A trigger instead of a NOT VALID check: a NOT VALID check still applies to every later UPDATE,
-- so an old Other listing with a short description couldn't even be marked Reserved or Sold.
-- This only checks new listings, and edits that change the category or the description.
create or replace function public.check_other_description()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.category = 'Other'
     and (tg_op = 'INSERT'
          or new.category is distinct from old.category
          or new.description is distinct from old.description)
     and char_length(btrim(coalesce(new.description, ''))) < 10 then
    raise exception 'OTHER_DESCRIPTION: For Other, describe the item in at least 10 characters.'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists listings_other_description on public.listings;
create trigger listings_other_description
  before insert or update of category, description on public.listings
  for each row execute function public.check_other_description();

commit;

notify pgrst, 'reload schema';
