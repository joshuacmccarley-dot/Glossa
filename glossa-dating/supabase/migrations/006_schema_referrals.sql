-- Rename likes columns to match new API
ALTER TABLE likes RENAME COLUMN from_user_id TO liker_id;
ALTER TABLE likes RENAME COLUMN to_user_id TO liked_id;

-- Update RLS policies on likes (they reference old column names)
DROP POLICY IF EXISTS "likes_select" ON likes;
DROP POLICY IF EXISTS "likes_insert" ON likes;
CREATE POLICY "likes_select" ON likes FOR SELECT USING (auth.uid() = liker_id OR auth.uid() = liked_id);
CREATE POLICY "likes_insert" ON likes FOR INSERT WITH CHECK (auth.uid() = liker_id);

-- Add missing profile columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS latitude float8;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS longitude float8;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS connection_modes text[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS wants text[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_age boolean DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hide_distance boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_paused boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS photo_verified boolean DEFAULT false;

-- Referral codes
CREATE TABLE IF NOT EXISTS referral_codes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  code text NOT NULL UNIQUE,
  uses integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Referral uses
CREATE TABLE IF NOT EXISTS referral_uses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  code text NOT NULL REFERENCES referral_codes(code),
  referred_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  referrer_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rewarded boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_uses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ref_codes_select" ON referral_codes FOR SELECT USING (true);
CREATE POLICY "ref_codes_own" ON referral_codes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "ref_uses_own" ON referral_uses FOR SELECT USING (auth.uid() = referred_user_id OR auth.uid() = referrer_user_id);
CREATE POLICY "ref_uses_insert" ON referral_uses FOR INSERT WITH CHECK (auth.uid() = referred_user_id);

-- Allow service_role to insert notifications
CREATE POLICY "notif_insert_service" ON notifications FOR INSERT WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ref_code ON referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_ref_uses_referrer ON referral_uses(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles(latitude, longitude) WHERE latitude IS NOT NULL;
