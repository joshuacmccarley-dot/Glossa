-- User wants tags
alter table profiles
  add column if not exists wants text[] default '{}';

-- Push notification subscriptions
create table if not exists push_subscriptions (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete cascade not null unique,
  endpoint    text not null,
  p256dh      text not null,
  auth        text not null,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Event messages (group chat for event attendees)
create table if not exists event_messages (
  id         uuid primary key default uuid_generate_v4(),
  event_id   uuid references events(id) on delete cascade not null,
  sender_id  uuid references auth.users(id) on delete cascade not null,
  content    text not null,
  created_at timestamptz default now()
);

-- Notifications table (in-app)
create table if not exists notifications (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  kind        text not null,  -- 'match', 'match_expiring', 'liked_you', 'help_response', 'event_rsvp'
  title       text not null,
  body        text,
  action_url  text,
  read        boolean default false,
  created_at  timestamptz default now()
);

-- RLS
alter table push_subscriptions enable row level security;
alter table event_messages      enable row level security;
alter table notifications       enable row level security;

create policy "push_select"   on push_subscriptions for select using (auth.uid() = user_id);
create policy "push_insert"   on push_subscriptions for insert with check (auth.uid() = user_id);
create policy "push_update"   on push_subscriptions for update using (auth.uid() = user_id);
create policy "push_delete"   on push_subscriptions for delete using (auth.uid() = user_id);

-- Event messages: only attendees (going) can read/write
create policy "evt_msg_select" on event_messages for select
  using (exists (
    select 1 from event_rsvps r
    where r.event_id = event_messages.event_id
      and r.user_id = auth.uid()
      and r.status = 'going'
  ) or exists (
    select 1 from events e where e.id = event_messages.event_id and e.creator_id = auth.uid()
  ));

create policy "evt_msg_insert" on event_messages for insert
  with check (
    auth.uid() = sender_id
    and (
      exists (select 1 from event_rsvps r where r.event_id = event_messages.event_id and r.user_id = auth.uid() and r.status = 'going')
      or exists (select 1 from events e where e.id = event_messages.event_id and e.creator_id = auth.uid())
    )
  );

-- Notifications: own only
create policy "notif_select" on notifications for select using (auth.uid() = user_id);
create policy "notif_update" on notifications for update using (auth.uid() = user_id);

-- Indexes
create index if not exists idx_push_user     on push_subscriptions(user_id);
create index if not exists idx_evt_msg_event on event_messages(event_id, created_at);
create index if not exists idx_notif_user    on notifications(user_id, read, created_at);
