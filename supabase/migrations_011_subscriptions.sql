-- 011: ₱20/month seller subscription, paid by GCash and approved by hand.
-- Free accounts can have up to 3 active listings (available or reserved) at a time; an active
-- subscription removes the limit. Students submit a payment screenshot; the project owner approves
-- or rejects it in Table Editor > subscriptions by changing `status`. Everything else is automatic.
-- Paste the whole file into the Supabase SQL editor and click Run. Safe to run more than once.

begin;

-- ---------------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------------
create table if not exists public.subscriptions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null default auth.uid() references auth.users(id) on delete cascade,
  proof_image_url text not null,  -- path inside the private payment-proofs bucket, e.g. <user id>/<file>.webp
  status          text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  amount          numeric not null default 20,
  submitted_at    timestamptz not null default now(),
  reviewed_at     timestamptz,    -- set automatically when you approve or reject
  expires_at      timestamptz     -- set automatically on approval (30 days)
);
create index if not exists subscriptions_user_idx on public.subscriptions (user_id, submitted_at desc);
-- One request waiting for review per student at a time.
create unique index if not exists subscriptions_one_pending_idx on public.subscriptions (user_id) where status = 'pending';

-- Students can file a pending request for themselves and read their own history. There is no
-- update or delete grant at all, so only the project owner (dashboard) can change a row.
alter table public.subscriptions enable row level security;
grant select, insert on public.subscriptions to authenticated;

drop policy if exists "Students see their own subscriptions" on public.subscriptions;
create policy "Students see their own subscriptions" on public.subscriptions
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Students request a subscription for themselves" on public.subscriptions;
create policy "Students request a subscription for themselves" on public.subscriptions
  for insert to authenticated
  with check (
    auth.uid() = user_id
    and status = 'pending'
    and amount = 20
    and reviewed_at is null
    and expires_at is null
    and proof_image_url like auth.uid()::text || '/%'
  );

-- ---------------------------------------------------------------------------
-- Approving: you only change `status`. This fills in reviewed_at and, on approval, expires_at:
-- 30 days from now, or 30 days added on top of a subscription that is still running.
-- ---------------------------------------------------------------------------
create or replace function public.stamp_subscription_review()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_current_end timestamptz;
begin
  if new.status is distinct from old.status and new.status in ('approved', 'rejected') then
    new.reviewed_at := coalesce(new.reviewed_at, now());
    if new.status = 'approved' and new.expires_at is null then
      select max(expires_at) into v_current_end
      from public.subscriptions
      where user_id = new.user_id and status = 'approved' and id <> new.id and expires_at > now();
      new.expires_at := greatest(coalesce(v_current_end, now()), now()) + interval '30 days';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists subscriptions_stamp_review on public.subscriptions;
create trigger subscriptions_stamp_review
  before update on public.subscriptions
  for each row execute function public.stamp_subscription_review();

-- True while the student has an approved subscription that hasn't expired.
create or replace function public.has_active_subscription(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.subscriptions
    where user_id = p_user_id and status = 'approved' and expires_at > now()
  );
$$;
revoke all on function public.has_active_subscription(uuid) from public, anon;
grant execute on function public.has_active_subscription(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- The gate: without an active subscription, a seller can have at most 3 active listings
-- (available or reserved). Checked on new listings and when a sold listing is made available
-- again. Enforced here, so it can't be skipped from the browser.
-- ---------------------------------------------------------------------------
create or replace function public.enforce_free_listing_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_active int;
begin
  if new.status not in ('available', 'reserved') then
    return new;
  end if;
  if tg_op = 'UPDATE' and old.status in ('available', 'reserved') then
    return new; -- was already active: edits and available<->reserved don't count again
  end if;
  if public.has_active_subscription(new.seller_id) then
    return new;
  end if;

  select count(*) into v_active
  from public.listings
  where seller_id = new.seller_id and status in ('available', 'reserved') and id <> new.id;

  if v_active >= 3 then
    raise exception 'FREE_LIMIT: Free accounts can have 3 active listings. Subscribe for ₱20/month to post more, or mark one as sold.'
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists listings_free_limit on public.listings;
create trigger listings_free_limit
  before insert or update of status on public.listings
  for each row execute function public.enforce_free_listing_limit();

commit;

-- ---------------------------------------------------------------------------
-- Storage: private bucket for payment screenshots. Files live under <user id>/...
-- Students can upload to and read their own folder; nobody else can read them.
-- You view them in Storage > payment-proofs (the dashboard bypasses these rules).
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('payment-proofs', 'payment-proofs', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = false;

drop policy if exists "Students upload their own payment proofs" on storage.objects;
create policy "Students upload their own payment proofs" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'payment-proofs' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Students read their own payment proofs" on storage.objects;
create policy "Students read their own payment proofs" on storage.objects
  for select to authenticated
  using (bucket_id = 'payment-proofs' and (storage.foldername(name))[1] = auth.uid()::text);

notify pgrst, 'reload schema';
