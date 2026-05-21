-- Warn-before-expiry flag on matches
alter table matches
  add column if not exists warned_expiry boolean default false;

-- Extra photos array on profiles
alter table profiles
  add column if not exists extra_photos text[] default '{}';

-- Banned flag for moderation
alter table profiles
  add column if not exists banned boolean default false;

-- Resolution field on reports
alter table reports
  add column if not exists resolution text;

-- reviewed_at for photo verifications
alter table photo_verifications
  add column if not exists reviewed_at timestamptz;

-- is_mutual flag on likes (used by "who liked you" feature)
alter table likes
  add column if not exists is_mutual boolean default false;

-- RPC to get a user's email (admin use only — restricted by RLS via service role)
create or replace function get_user_email(uid uuid)
returns text
language sql
security definer
as $$
  select email from auth.users where id = uid;
$$;

-- Revoke from public, grant to service_role only
revoke execute on function get_user_email(uuid) from public;
grant execute on function get_user_email(uuid) to service_role;

-- Indexes
create index if not exists idx_matches_warned on matches(warned_expiry) where is_expired = false;
create index if not exists idx_likes_mutual   on likes(liked_id, is_mutual);
