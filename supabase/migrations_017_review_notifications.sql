-- 017: Notify sellers when a buyer reviews them, e.g. "Maria Santos left a 5-star review on your
-- Nike Air Force 1", with the start of the comment. Written by the database when the review is
-- saved (reviews can only be written through submit_review(), so this can't be faked).
-- Paste the whole file into the Supabase SQL editor and click Run. Safe to run more than once.
-- Requires 016 (notifications).

begin;

-- New notification kind, plus the rating and a short excerpt of the comment.
alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check check (type in ('saved', 'review'));
alter table public.notifications add column if not exists rating smallint check (rating between 1 and 5);
alter table public.notifications add column if not exists detail text check (detail is null or char_length(detail) <= 160);

-- Sold listings are purged after 7 days. Keep their notifications (title and all); only the link goes.
alter table public.notifications drop constraint if exists notifications_listing_id_fkey;
alter table public.notifications add constraint notifications_listing_id_fkey
  foreign key (listing_id) references public.listings(id) on delete set null;

create or replace function public.notify_review_received()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  reviewer record;
begin
  if new.reviewer_id is not null and new.reviewer_id = new.seller_id then
    return new;
  end if;

  select p.full_name, p.avatar_url into reviewer from public.profiles p where p.id = new.reviewer_id;

  insert into public.notifications
    (user_id, type, listing_id, listing_title, actor_id, actor_name, actor_avatar, rating, detail)
  values (
    new.seller_id,
    'review',
    new.listing_id,
    new.listing_title,
    new.reviewer_id,
    coalesce(nullif(reviewer.full_name, ''), nullif(new.reviewer_name, ''), 'A buyer'),
    reviewer.avatar_url,
    new.rating,
    case when new.comment is null or new.comment = '' then null
         when char_length(new.comment) > 157 then left(new.comment, 157) || '...'
         else new.comment end
  )
  on conflict (type, listing_id, actor_id) do nothing;
  return new;
end;
$$;

drop trigger if exists reviews_notify on public.reviews;
create trigger reviews_notify
  after insert on public.reviews
  for each row execute function public.notify_review_received();

commit;

notify pgrst, 'reload schema';
