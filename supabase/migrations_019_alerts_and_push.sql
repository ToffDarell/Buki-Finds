-- 019: Price-drop alerts, the "Still available?" check, and phone push notifications.
--   * Price drop: when a seller lowers the price of an item for sale, everyone who saved it gets a
--     notification, e.g. "Juan dropped the price of PE uniform set: ₱350 → ₱300".
--   * Still available?: listings carry confirmed_at, the last time the seller said the item is still
--     there. After 30 days the seller is asked; after 37 days without an answer the listing leaves
--     Browse (it stays on its own page and in My Listings) until the seller taps "Still Available".
--     The app uses the same numbers: STALE_AFTER_DAYS and HIDE_AFTER_DAYS in lib/listings.js.
--   * Push: each phone or computer that turns on notifications stores its push subscription here.
--     Every new notification is sent to the site's /api/push route, which delivers it to the
--     student's devices.
-- Paste the whole file into the Supabase SQL editor and click Run. Safe to run more than once.
-- Requires 016 and 017 (notifications). Setup steps for push are at the end of this file.

begin;

-- ---------------------------------------------------------------------------
-- New notification kinds
-- ---------------------------------------------------------------------------
alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check
  check (type in ('saved', 'review', 'price_drop', 'stale'));

-- The service role (the /api/push route) reads a notification to build the phone alert.
grant select on public.notifications to service_role;

-- ---------------------------------------------------------------------------
-- Price drop: tell everyone who saved the item. actor_id stays empty on purpose: the unique key
-- (type, listing_id, actor_id) would otherwise let only the first saver be notified, and a later
-- second price drop should notify again.
-- ---------------------------------------------------------------------------
create or replace function public.notify_price_drop()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  seller record;
begin
  if new.listing_type <> 'sell' or new.status = 'sold'
     or new.price is null or old.price is null or new.price >= old.price then
    return new;
  end if;

  select p.full_name, p.avatar_url into seller from public.profiles p where p.id = new.seller_id;

  insert into public.notifications (user_id, type, listing_id, listing_title, actor_name, actor_avatar, detail)
  select s.user_id, 'price_drop', new.id, new.title,
         coalesce(nullif(seller.full_name, ''), nullif(new.seller_name, ''), 'The seller'),
         seller.avatar_url,
         '₱' || to_char(old.price, 'FM999,999,990.##') || ' → ₱' || to_char(new.price, 'FM999,999,990.##')
  from public.saved_listings s
  where s.listing_id = new.id and s.user_id <> new.seller_id;
  return new;
end;
$$;

drop trigger if exists listings_notify_price_drop on public.listings;
create trigger listings_notify_price_drop
  after update of price on public.listings
  for each row execute function public.notify_price_drop();

-- ---------------------------------------------------------------------------
-- Still available?
-- ---------------------------------------------------------------------------
-- Existing listings start their 30 days from today, so nothing disappears the day this runs.
alter table public.listings add column if not exists confirmed_at timestamptz not null default now();
create index if not exists listings_confirmed_idx on public.listings (status, confirmed_at);

-- confirmed_at is stamped by the database, never trusted from the browser: a seller can only set it
-- to "now" (by changing it at all), and marking a listing available again also counts.
create or replace function public.stamp_listing_confirmed()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.confirmed_at := now();
  elsif new.confirmed_at is distinct from old.confirmed_at
     or (new.status = 'available' and old.status <> 'available') then
    new.confirmed_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists listings_stamp_confirmed on public.listings;
create trigger listings_stamp_confirmed
  before insert or update on public.listings
  for each row execute function public.stamp_listing_confirmed();

-- Daily: ask sellers about listings unconfirmed for 30 days, once per confirmation.
create or replace function public.ask_if_still_available()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  asked integer;
begin
  insert into public.notifications (user_id, type, listing_id, listing_title, actor_name)
  select l.seller_id, 'stale', l.id, l.title, 'BukiFinds'
  from public.listings l
  where l.status in ('available', 'reserved')
    and l.confirmed_at < now() - interval '30 days'
    and not exists (
      select 1 from public.notifications n
      where n.type = 'stale' and n.listing_id = l.id and n.created_at > l.confirmed_at
    );
  get diagnostics asked = row_count;
  return asked;
end;
$$;
revoke all on function public.ask_if_still_available() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Push subscriptions: one row per device that turned notifications on.
-- ---------------------------------------------------------------------------
create table if not exists public.push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  endpoint   text not null unique check (char_length(endpoint) <= 1000),
  p256dh     text not null check (char_length(p256dh) <= 200),
  auth       text not null check (char_length(auth) <= 100),
  created_at timestamptz not null default now()
);
create index if not exists push_subscriptions_user_idx on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;
grant select, insert, update, delete on public.push_subscriptions to authenticated;
-- /api/push reads a student's devices and removes ones the browser says are gone.
grant select, delete on public.push_subscriptions to service_role;

drop policy if exists "Students see their own devices" on public.push_subscriptions;
create policy "Students see their own devices" on public.push_subscriptions
  for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Students add their own devices" on public.push_subscriptions;
create policy "Students add their own devices" on public.push_subscriptions
  for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Students update their own devices" on public.push_subscriptions;
create policy "Students update their own devices" on public.push_subscriptions
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Students remove their own devices" on public.push_subscriptions;
create policy "Students remove their own devices" on public.push_subscriptions
  for delete to authenticated using (auth.uid() = user_id);

-- A device that was turned on by one student and then signs in as another moves to the new
-- student (same endpoint). Runs as owner so it can take over the other student's row.
create or replace function public.save_push_subscription(p_endpoint text, p_p256dh text, p_auth text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Log in to turn on notifications.';
  end if;
  insert into public.push_subscriptions (user_id, endpoint, p256dh, auth)
  values (auth.uid(), p_endpoint, p_p256dh, p_auth)
  on conflict (endpoint) do update
    set user_id = excluded.user_id, p256dh = excluded.p256dh, auth = excluded.auth, created_at = now();
end;
$$;
revoke all on function public.save_push_subscription(text, text, text) from public, anon;
grant execute on function public.save_push_subscription(text, text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Send each new notification to /api/push (needs pg_net and the two Vault secrets below).
-- Any problem here is swallowed: a notification is never lost because a phone alert failed.
-- ---------------------------------------------------------------------------
create extension if not exists pg_net;

create or replace function public.push_notification()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_url    text;
  v_secret text;
begin
  select decrypted_secret into v_url from vault.decrypted_secrets where name = 'push_webhook_url';
  select decrypted_secret into v_secret from vault.decrypted_secrets where name = 'push_webhook_secret';
  if v_url is null or v_secret is null then
    return new;
  end if;
  if not exists (select 1 from public.push_subscriptions p where p.user_id = new.user_id) then
    return new;
  end if;
  perform net.http_post(
    url := v_url,
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || v_secret),
    body := jsonb_build_object('id', new.id),
    timeout_milliseconds := 5000
  );
  return new;
exception when others then
  return new;
end;
$$;

drop trigger if exists notifications_push on public.notifications;
create trigger notifications_push
  after insert on public.notifications
  for each row execute function public.push_notification();

commit;

notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------------
-- One-time setup (run these separately, after the file above)
-- ---------------------------------------------------------------------------
-- 1. Daily "Still available?" check, 8:00 AM Philippine time (00:00 UTC):
--
--    create extension if not exists pg_cron;
--    select cron.schedule('ask-if-still-available', '0 0 * * *', $$ select public.ask_if_still_available() $$);
--
-- 2. Push notifications. Use the same secret as PUSH_WEBHOOK_SECRET in Vercel:
--
--    select vault.create_secret('https://www.bukifinds.online/api/push', 'push_webhook_url');
--    select vault.create_secret('<the same long random secret as PUSH_WEBHOOK_SECRET>', 'push_webhook_secret');
--
--    To change one later: select vault.update_secret(id, '<new value>') using the id from
--    select id, name from vault.secrets;
