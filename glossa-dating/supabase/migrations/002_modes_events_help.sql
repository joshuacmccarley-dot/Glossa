-- Add connection modes and location to profiles
alter table profiles
  add column if not exists connection_modes text[] default '{}',
  add column if not exists latitude  double precision,
  add column if not exists longitude double precision;

-- Events table
create table if not exists events (
  id           uuid primary key default uuid_generate_v4(),
  creator_id   uuid references auth.users(id) on delete cascade not null,
  title        text not null,
  description  text,
  category     text not null default 'hangout',
  location_name text,
  latitude     double precision,
  longitude    double precision,
  starts_at    timestamptz not null,
  ends_at      timestamptz,
  max_attendees int,
  image_url    text,
  is_public    boolean default true,
  created_at   timestamptz default now()
);

-- Event RSVPs
create table if not exists event_rsvps (
  id         uuid primary key default uuid_generate_v4(),
  event_id   uuid references events(id) on delete cascade not null,
  user_id    uuid references auth.users(id) on delete cascade not null,
  status     text default 'going' check (status in ('going', 'interested', 'not_going')),
  created_at timestamptz default now(),
  unique(event_id, user_id)
);

-- Help posts table (needs & offers)
create table if not exists help_posts (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  kind        text not null check (kind in ('need', 'offer')),
  title       text not null,
  description text not null,
  category    text not null default 'general',
  latitude    double precision,
  longitude   double precision,
  location_name text,
  is_resolved boolean default false,
  created_at  timestamptz default now()
);

-- Help post responses
create table if not exists help_responses (
  id          uuid primary key default uuid_generate_v4(),
  post_id     uuid references help_posts(id) on delete cascade not null,
  responder_id uuid references auth.users(id) on delete cascade not null,
  message     text not null,
  created_at  timestamptz default now(),
  unique(post_id, responder_id)
);

-- RLS for new tables
alter table events enable row level security;
alter table event_rsvps enable row level security;
alter table help_posts enable row level security;
alter table help_responses enable row level security;

-- Events: public can read; creator can write
create policy "events_select"  on events for select using (is_public = true or auth.uid() = creator_id);
create policy "events_insert"  on events for insert with check (auth.uid() = creator_id);
create policy "events_update"  on events for update using (auth.uid() = creator_id);
create policy "events_delete"  on events for delete using (auth.uid() = creator_id);

-- RSVPs
create policy "rsvps_select" on event_rsvps for select using (true);
create policy "rsvps_insert" on event_rsvps for insert with check (auth.uid() = user_id);
create policy "rsvps_update" on event_rsvps for update using (auth.uid() = user_id);
create policy "rsvps_delete" on event_rsvps for delete using (auth.uid() = user_id);

-- Help posts
create policy "help_select"  on help_posts for select using (true);
create policy "help_insert"  on help_posts for insert with check (auth.uid() = user_id);
create policy "help_update"  on help_posts for update using (auth.uid() = user_id);
create policy "help_delete"  on help_posts for delete using (auth.uid() = user_id);

-- Help responses
create policy "help_resp_select" on help_responses for select using (true);
create policy "help_resp_insert" on help_responses for insert with check (auth.uid() = responder_id);

-- Indexes
create index if not exists idx_events_starts    on events(starts_at);
create index if not exists idx_events_creator   on events(creator_id);
create index if not exists idx_help_posts_kind  on help_posts(kind);
create index if not exists idx_help_posts_user  on help_posts(user_id);
create index if not exists idx_rsvps_event      on event_rsvps(event_id);
create index if not exists idx_help_resp_post   on help_responses(post_id);
