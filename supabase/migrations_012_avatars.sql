-- 012: Profile photos. Google accounts show their Google photo; anyone can upload their own.
-- The uploaded photo lives in user metadata as custom_avatar_url (Google login refreshes
-- avatar_url/picture every time, so a separate key keeps the student's choice).
-- Paste the whole file into the Supabase SQL editor and click Run. Safe to run more than once.
-- Requires 010 (profiles).

begin;

-- profiles.avatar_url follows the photo the student actually sees: their upload, else Google's.
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
    coalesce(
      new.raw_user_meta_data->>'custom_avatar_url',
      new.raw_user_meta_data->>'avatar_url',
      new.raw_user_meta_data->>'picture'
    ),
    new.raw_app_meta_data->>'provider',
    new.created_at,
    new.last_sign_in_at,
    now()
  )
  on conflict (id) do update set
    email           = excluded.email,
    full_name       = coalesce(public.profiles.full_name, excluded.full_name),
    avatar_url      = excluded.avatar_url,  -- null after an email student removes their photo
    provider        = excluded.provider,
    last_sign_in_at = excluded.last_sign_in_at,
    updated_at      = now();
  return new;
end;
$$;

-- Existing rows pick up any uploads made before this migration.
update public.profiles p
set avatar_url = coalesce(u.raw_user_meta_data->>'custom_avatar_url', u.raw_user_meta_data->>'avatar_url', u.raw_user_meta_data->>'picture')
from auth.users u
where u.id = p.id;

-- Seller pages show a seller's photo to everyone, but profiles stay private (they hold emails),
-- so this exposes only the photo.
create or replace function public.seller_avatar(seller uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select avatar_url from public.profiles where id = seller;
$$;

revoke all on function public.seller_avatar(uuid) from public;
grant execute on function public.seller_avatar(uuid) to anon, authenticated;

commit;

-- ---------------------------------------------------------------------------
-- Storage: public bucket for profile photos. Files live under <user id>/...
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = true;

drop policy if exists "Anyone can view avatars" on storage.objects;
create policy "Anyone can view avatars" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "Students upload their own avatar" on storage.objects;
create policy "Students upload their own avatar" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Students delete their own avatar" on storage.objects;
create policy "Students delete their own avatar" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

notify pgrst, 'reload schema';
