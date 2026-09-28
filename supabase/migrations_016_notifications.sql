-- 016: Notifications. When a student saves a listing, its seller gets a notification that names
-- who saved it (like Carousell's "X liked your listing"). The database writes the notification
-- itself, so it can't be faked or skipped from the browser.
-- Paste the whole file into the Supabase SQL editor and click Run. Safe to run more than once.
-- Requires 010 (profiles) and 013 (profile names).

begin;

create table if not exists public.notifications (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,     -- who sees it (the seller)
  type          text not null check (type in ('saved')),
  listing_id    uuid references public.listings(id) on delete cascade,
  listing_title text,
  actor_id      uuid references auth.users(id) on delete set null,             -- who saved it
  actor_name    text,
  actor_avatar  text,
  created_at    timestamptz not null default now(),
  read_at       timestamptz,
  -- One notification per person per listing: save, unsave, save again doesn't notify twice.
  unique (type, listing_id, actor_id)
);
create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);

-- Each student reads and marks their own notifications, and can clear them.
alter table public.notifications enable row level security;
grant select, delete on public.notifications to authenticated;
grant update (read_at) on public.notifications to authenticated;

drop policy if exists "Students read their own notifications" on public.notifications;
create policy "Students read their own notifications" on public.notifications
  for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Students mark their own notifications read" on public.notifications;
create policy "Students mark their own notifications read" on public.notifications
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Students clear their own notifications" on public.notifications;
create policy "Students clear their own notifications" on public.notifications
  for delete to authenticated using (auth.uid() = user_id);

-- Runs as the table owner, so it can read the seller and the saver's public name and photo.
create or replace function public.notify_listing_saved()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  seller uuid;
  title  text;
  saver  record;
begin
  select l.seller_id, l.title into seller, title from public.listings l where l.id = new.listing_id;
  if seller is null or seller = new.user_id then
    return new;   -- listing gone, or someone saving their own listing
  end if;

  select p.full_name, p.avatar_url into saver from public.profiles p where p.id = new.user_id;

  insert into public.notifications (user_id, type, listing_id, listing_title, actor_id, actor_name, actor_avatar)
  values (seller, 'saved', new.listing_id, title, new.user_id, coalesce(nullif(saver.full_name, ''), 'A student'), saver.avatar_url)
  on conflict (type, listing_id, actor_id) do nothing;
  return new;
end;
$$;

drop trigger if exists saved_listings_notify on public.saved_listings;
create trigger saved_listings_notify
  after insert on public.saved_listings
  for each row execute function public.notify_listing_saved();

commit;

notify pgrst, 'reload schema';
