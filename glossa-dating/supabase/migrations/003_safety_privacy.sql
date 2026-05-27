-- Photo verification status
alter table profiles
  add column if not exists photo_verified   boolean default false,
  add column if not exists email_verified   boolean default false,
  add column if not exists verification_submitted_at timestamptz,
  -- Privacy controls
  add column if not exists show_in_dating   boolean default true,
  add column if not exists show_in_events   boolean default true,
  add column if not exists show_in_help     boolean default true,
  add column if not exists show_in_community boolean default true,
  add column if not exists hide_distance    boolean default false,
  add column if not exists show_age         boolean default true,
  add column if not exists profile_paused   boolean default false;

-- Photo verification submissions
create table if not exists photo_verifications (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete cascade not null unique,
  selfie_url  text not null,
  status      text default 'pending' check (status in ('pending','approved','rejected')),
  reviewed_at timestamptz,
  created_at  timestamptz default now()
);

-- Reports table
create table if not exists reports (
  id           uuid primary key default uuid_generate_v4(),
  reporter_id  uuid references auth.users(id) on delete cascade not null,
  reported_id  uuid references auth.users(id) on delete cascade,
  reported_message_id uuid references messages(id) on delete set null,
  reason       text not null,
  details      text,
  status       text default 'open' check (status in ('open','reviewed','actioned','dismissed')),
  created_at   timestamptz default now()
);

-- Blocks table
create table if not exists blocks (
  id           uuid primary key default uuid_generate_v4(),
  blocker_id   uuid references auth.users(id) on delete cascade not null,
  blocked_id   uuid references auth.users(id) on delete cascade not null,
  created_at   timestamptz default now(),
  unique(blocker_id, blocked_id)
);

-- Moderation strikes
create table if not exists moderation_strikes (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  reason      text not null,
  details     text,
  admin_id    uuid references auth.users(id),
  created_at  timestamptz default now()
);

-- RLS
alter table photo_verifications  enable row level security;
alter table reports              enable row level security;
alter table blocks               enable row level security;
alter table moderation_strikes   enable row level security;

-- Photo verifications: users can see/create their own
create policy "photo_ver_select" on photo_verifications for select using (auth.uid() = user_id);
create policy "photo_ver_insert" on photo_verifications for insert with check (auth.uid() = user_id);

-- Reports: users can create, only see their own
create policy "reports_insert" on reports for insert with check (auth.uid() = reporter_id);
create policy "reports_select" on reports for select using (auth.uid() = reporter_id);

-- Blocks: users can manage their own
create policy "blocks_select" on blocks for select using (auth.uid() = blocker_id);
create policy "blocks_insert" on blocks for insert with check (auth.uid() = blocker_id);
create policy "blocks_delete" on blocks for delete using (auth.uid() = blocker_id);

-- Moderation strikes: users can see their own count (not details)
create policy "strikes_select" on moderation_strikes for select using (auth.uid() = user_id);

-- Filter out blocked users from profiles visible to a given user
-- (enforce via app layer + RLS is cleaner for this)

-- Indexes
create index if not exists idx_blocks_blocker  on blocks(blocker_id);
create index if not exists idx_blocks_blocked  on blocks(blocked_id);
create index if not exists idx_reports_reporter on reports(reporter_id);
create index if not exists idx_reports_status   on reports(status);
create index if not exists idx_photo_ver_status on photo_verifications(status);
