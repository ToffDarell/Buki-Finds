-- 009: Public "N saved" count on each listing, like Carousell's likes.
-- saved_listings stays private (each student only sees their own rows), so the count is kept on
-- the listing by a trigger. A guard stops anyone, including the seller, from editing it directly.
-- Paste the whole file into the Supabase SQL editor and click Run. Safe to run more than once.

begin;

alter table public.listings add column if not exists save_count integer not null default 0;

-- Backfill from existing saves.
update public.listings l
set save_count = (select count(*) from public.saved_listings s where s.listing_id = l.id);

-- Keeps save_count in step with saved_listings. Runs as the table owner, so it can update
-- listings the saver doesn't own; it flags itself so the guard below lets the change through.
create or replace function public.sync_save_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform set_config('buki.syncing_saves', 'on', true);
  if tg_op = 'INSERT' then
    update public.listings set save_count = save_count + 1 where id = new.listing_id;
  else
    update public.listings set save_count = greatest(save_count - 1, 0) where id = old.listing_id;
  end if;
  perform set_config('buki.syncing_saves', 'off', true);
  return null;
end;
$$;

drop trigger if exists saved_listings_sync_count on public.saved_listings;
create trigger saved_listings_sync_count
  after insert or delete on public.saved_listings
  for each row execute function public.sync_save_count();

-- Nobody sets save_count by hand: new listings start at 0, and edits keep the old value
-- unless the change comes from sync_save_count().
create or replace function public.guard_save_count()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.save_count := 0;
  elsif coalesce(current_setting('buki.syncing_saves', true), 'off') <> 'on' then
    new.save_count := old.save_count;
  end if;
  return new;
end;
$$;

drop trigger if exists listings_guard_save_count on public.listings;
create trigger listings_guard_save_count
  before insert or update on public.listings
  for each row execute function public.guard_save_count();

commit;

notify pgrst, 'reload schema';
