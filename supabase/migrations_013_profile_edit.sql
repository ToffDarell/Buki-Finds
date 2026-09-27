-- 013: Students edit their own name and university from their profile page.
-- The edited name lives in user metadata as custom_name (Google login refreshes full_name/name
-- every time, so a separate key keeps the student's choice); the university as school.
-- Paste the whole file into the Supabase SQL editor and click Run. Safe to run more than once.
-- Requires 010 (profiles) and 012 (avatars).

begin;

alter table public.profiles add column if not exists school text;

create or replace function public.sync_profile_from_auth()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, school, provider, created_at, last_sign_in_at, updated_at)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'custom_name', new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    coalesce(
      new.raw_user_meta_data->>'custom_avatar_url',
      new.raw_user_meta_data->>'avatar_url',
      new.raw_user_meta_data->>'picture'
    ),
    nullif(new.raw_user_meta_data->>'school', ''),
    new.raw_app_meta_data->>'provider',
    new.created_at,
    new.last_sign_in_at,
    now()
  )
  on conflict (id) do update set
    email           = excluded.email,
    -- A name the student chose wins; otherwise keep the first name we saw.
    full_name       = coalesce(new.raw_user_meta_data->>'custom_name', public.profiles.full_name, excluded.full_name),
    avatar_url      = excluded.avatar_url,
    school          = excluded.school,
    provider        = excluded.provider,
    last_sign_in_at = excluded.last_sign_in_at,
    updated_at      = now();
  return new;
end;
$$;

-- Existing rows pick up names and schools saved before this migration.
update public.profiles p
set full_name = coalesce(u.raw_user_meta_data->>'custom_name', p.full_name),
    school    = nullif(u.raw_user_meta_data->>'school', '')
from auth.users u
where u.id = p.id;

-- What anyone may see on a seller page: name, photo and university. Never the email.
create or replace function public.seller_profile(seller uuid)
returns table (full_name text, avatar_url text, school text)
language sql
stable
security definer
set search_path = ''
as $$
  select full_name, avatar_url, school from public.profiles where id = seller;
$$;

revoke all on function public.seller_profile(uuid) from public;
grant execute on function public.seller_profile(uuid) to anon, authenticated;

commit;

notify pgrst, 'reload schema';
