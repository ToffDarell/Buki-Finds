-- 010: A public.profiles table that mirrors every account, visible in the Table Editor.
-- Supabase already stores accounts in auth.users (Authentication > Users); this copies the useful
-- fields into your own table automatically: a row appears on sign-up and updates on every login.
-- Paste the whole file into the Supabase SQL editor and click Run. Safe to run more than once.

begin;

create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  email           text,
  full_name       text,
  avatar_url      text,
  provider        text,          -- how they signed up: 'email', 'google', ...
  created_at      timestamptz not null default now(),  -- when the account was created
  last_sign_in_at timestamptz,   -- updated on every login
  updated_at      timestamptz not null default now()
);

-- Emails are private: each student can read only their own profile, and change only their name.
-- The project owner sees everyone in the Table Editor (the dashboard bypasses these rules).
alter table public.profiles enable row level security;
grant select on public.profiles to authenticated;
grant update (full_name) on public.profiles to authenticated;

drop policy if exists "Students read their own profile" on public.profiles;
create policy "Students read their own profile" on public.profiles
  for select to authenticated using (auth.uid() = id);
drop policy if exists "Students rename themselves" on public.profiles;
create policy "Students rename themselves" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- Copies an auth.users row into profiles. Runs as the table owner, so it can write for anyone.
-- A name the student set themselves is kept; everything else follows the latest login.
create or replace function public.sync_profile_from_auth()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, provider, created_at, last_sign_in_at, updated_at)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'),
    new.raw_app_meta_data->>'provider',
    new.created_at,
    new.last_sign_in_at,
    now()
  )
  on conflict (id) do update set
    email           = excluded.email,
    full_name       = coalesce(public.profiles.full_name, excluded.full_name),
    avatar_url      = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    provider        = excluded.provider,
    last_sign_in_at = excluded.last_sign_in_at,
    updated_at      = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_saved on auth.users;
create trigger on_auth_user_saved
  after insert or update of email, last_sign_in_at, raw_user_meta_data on auth.users
  for each row execute function public.sync_profile_from_auth();

-- Existing accounts get their rows now.
insert into public.profiles (id, email, full_name, avatar_url, provider, created_at, last_sign_in_at)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name'),
  coalesce(u.raw_user_meta_data->>'avatar_url', u.raw_user_meta_data->>'picture'),
  u.raw_app_meta_data->>'provider',
  u.created_at,
  u.last_sign_in_at
from auth.users u
on conflict (id) do nothing;

commit;

notify pgrst, 'reload schema';
