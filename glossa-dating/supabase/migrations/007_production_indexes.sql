-- Performance indexes for production scale

-- Profiles: common filter combinations
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_paused
  ON profiles(onboarding_complete, profile_paused)
  WHERE onboarding_complete = true AND profile_paused = false;

CREATE INDEX IF NOT EXISTS idx_profiles_updated_at ON profiles(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_location_onboard
  ON profiles(latitude, longitude)
  WHERE latitude IS NOT NULL AND onboarding_complete = true;

-- Likes: daily limit check is critical path (10/day for free users)
CREATE INDEX IF NOT EXISTS idx_likes_liker_date
  ON likes(liker_id, created_at DESC);

-- Matches: per-user active matches
CREATE INDEX IF NOT EXISTS idx_matches_user1_active
  ON matches(user1_id, is_expired, expires_at);
CREATE INDEX IF NOT EXISTS idx_matches_user2_active
  ON matches(user2_id, is_expired, expires_at);

-- Messages: per-match ordered
CREATE INDEX IF NOT EXISTS idx_messages_match_time
  ON messages(match_id, created_at DESC);

-- Notifications: unread count badge (hit on every page load)
CREATE INDEX IF NOT EXISTS idx_notifications_unread
  ON notifications(user_id, read, created_at DESC)
  WHERE read = false;

-- Events: upcoming by location
CREATE INDEX IF NOT EXISTS idx_events_starts_public
  ON events(starts_at, is_public)
  WHERE is_public = true;

-- Reports: open reports for admin
CREATE INDEX IF NOT EXISTS idx_reports_open
  ON reports(resolved, created_at)
  WHERE resolved = false;

-- Push subscriptions: fast lookup by user
CREATE INDEX IF NOT EXISTS idx_push_subs_user
  ON push_subscriptions(user_id);

-- Blocks: bidirectional lookup
CREATE INDEX IF NOT EXISTS idx_blocks_blocker ON blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocks_blocked ON blocks(blocked_id);

-- Referrals
CREATE INDEX IF NOT EXISTS idx_ref_codes_user ON referral_codes(user_id);
