-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- Profiles table
create table if not exists profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  display_name text not null,
  bio text,
  birthdate date not null,
  gender text not null,
  looking_for text[] default '{}',
  location text,
  occupation text,
  work_field text,
  relationship_intention text,
  photos text[] default '{}',
  interests text[] default '{}',
  is_premium boolean default false,
  onboarding_complete boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Likes table
create table if not exists likes (
  id uuid primary key default uuid_generate_v4(),
  from_user_id uuid references auth.users(id) on delete cascade not null,
  to_user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(from_user_id, to_user_id)
);

-- Matches table (created when both users like each other)
-- expires_at = created_at + 12 hours; if no message sent, match is expired
create table if not exists matches (
  id uuid primary key default uuid_generate_v4(),
  user1_id uuid references auth.users(id) on delete cascade not null,
  user2_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '12 hours'),
  is_expired boolean default false,
  -- null = not recovered; user_id = premium user who recovered this match
  recovered_by uuid references auth.users(id),
  unique(user1_id, user2_id)
);

-- Messages table
create table if not exists messages (
  id uuid primary key default uuid_generate_v4(),
  match_id uuid references matches(id) on delete cascade not null,
  sender_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  read boolean default false,
  created_at timestamptz default now()
);

-- Subscriptions table
create table if not exists subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  stripe_subscription_id text,
  stripe_customer_id text,
  status text default 'inactive' check (status in ('active','canceled','past_due','trialing','inactive')),
  current_period_end timestamptz,
  created_at timestamptz default now()
);

-- When a message is sent into a match, reset the expiry (conversation is active)
create or replace function extend_match_on_message()
returns trigger as $$
begin
  update matches
  set
    is_expired = false,
    expires_at = now() + interval '12 hours'
  where id = NEW.match_id and is_expired = false;
  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_message_sent
  after insert on messages
  for each row execute function extend_match_on_message();

-- Mark matches as expired (run via cron or edge function)
create or replace function expire_old_matches()
returns void as $$
begin
  update matches
  set is_expired = true
  where expires_at < now() and is_expired = false;
end;
$$ language plpgsql security definer;

-- Auto-update updated_at on profiles
create or replace function update_updated_at()
returns trigger as $$
begin
  NEW.updated_at = now();
  return NEW;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

-- Row Level Security
alter table profiles enable row level security;
alter table likes enable row level security;
alter table matches enable row level security;
alter table messages enable row level security;
alter table subscriptions enable row level security;

-- Profiles: anyone can read; only owner can write
create policy "profiles_select" on profiles for select using (true);
create policy "profiles_insert" on profiles for insert with check (auth.uid() = user_id);
create policy "profiles_update" on profiles for update using (auth.uid() = user_id);

-- Likes: users can only see/create their own
create policy "likes_select" on likes for select using (auth.uid() = from_user_id or auth.uid() = to_user_id);
create policy "likes_insert" on likes for insert with check (auth.uid() = from_user_id);

-- Matches: users can see matches they are in
create policy "matches_select" on matches for select
  using (auth.uid() = user1_id or auth.uid() = user2_id);
create policy "matches_update" on matches for update
  using (auth.uid() = user1_id or auth.uid() = user2_id);

-- Messages: only participants in the match can read/write
create policy "messages_select" on messages for select
  using (
    exists (
      select 1 from matches m
      where m.id = match_id
        and (m.user1_id = auth.uid() or m.user2_id = auth.uid())
    )
  );
create policy "messages_insert" on messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from matches m
      where m.id = match_id
        and (m.user1_id = auth.uid() or m.user2_id = auth.uid())
        and m.is_expired = false
    )
  );

-- Subscriptions: only owner can read/write
create policy "subscriptions_select" on subscriptions for select using (auth.uid() = user_id);
create policy "subscriptions_insert" on subscriptions for insert with check (auth.uid() = user_id);
create policy "subscriptions_update" on subscriptions for update using (auth.uid() = user_id);

-- Indexes
create index if not exists idx_profiles_user_id on profiles(user_id);
create index if not exists idx_likes_from on likes(from_user_id);
create index if not exists idx_likes_to on likes(to_user_id);
create index if not exists idx_matches_user1 on matches(user1_id);
create index if not exists idx_matches_user2 on matches(user2_id);
create index if not exists idx_matches_expires on matches(expires_at) where is_expired = false;
create index if not exists idx_messages_match on messages(match_id, created_at);
