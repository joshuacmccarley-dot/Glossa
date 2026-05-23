-- ============================================================
-- 008: Niche improvements across all 4 modes
-- ============================================================

-- Profile prompts (Hinge-style Q&A conversation starters)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_prompts jsonb DEFAULT '[]';

-- Activity tracking (for "Active today" badge)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_active_at timestamptz DEFAULT now();

-- Advanced dating details
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_kids text;        -- 'yes','no','prefer-not'
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS wants_kids text;       -- 'yes','no','open','prefer-not'
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS relationship_style text; -- 'monogamous','open','enm','prefer-not'
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS drinking text;          -- 'never','rarely','socially','regularly'
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS smoking text;           -- 'never','socially','yes'

-- Help: help quality tracking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS help_given_count int DEFAULT 0;

-- Help posts: urgency flag + resolver tracking
ALTER TABLE help_posts ADD COLUMN IF NOT EXISTS is_urgent boolean DEFAULT false;
ALTER TABLE help_posts ADD COLUMN IF NOT EXISTS resolved_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Events: recurring events
ALTER TABLE events ADD COLUMN IF NOT EXISTS recurrence text DEFAULT 'once'; -- 'once','weekly','biweekly','monthly'

-- Matches: anti-ghost nudge tracking
ALTER TABLE matches ADD COLUMN IF NOT EXISTS nudge_sent_at timestamptz;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON profiles(last_active_at DESC);
CREATE INDEX IF NOT EXISTS idx_help_posts_urgent ON help_posts(is_urgent DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_recurrence ON events(recurrence, starts_at);
CREATE INDEX IF NOT EXISTS idx_profiles_prompts ON profiles USING gin(profile_prompts);
