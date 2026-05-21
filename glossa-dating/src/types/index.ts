export interface Profile {
  id: string;
  user_id: string;
  display_name: string;
  bio: string | null;
  birthdate: string;
  gender: string;
  looking_for: string[];
  location: string | null;
  occupation: string | null;
  work_field: string | null;
  relationship_intention: string | null;
  photos: string[];
  interests: string[];
  is_premium: boolean;
  onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface Like {
  id: string;
  from_user_id: string;
  to_user_id: string;
  created_at: string;
}

export interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  expires_at: string;
  is_expired: boolean;
  recovered_by: string | null;
  profile?: Profile;
  last_message?: Message;
  unread_count?: number;
}

export interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  status: "active" | "canceled" | "past_due" | "trialing";
  current_period_end: string | null;
  created_at: string;
}

export interface DiscoverProfile extends Profile {
  compatibility_score: number;
  age: number;
}
