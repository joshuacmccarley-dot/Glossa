import type { ConnectionMode } from "@/lib/modes";

export interface Profile {
  id: string;
  user_id: string;
  display_name: string;
  bio: string | null;
  birthdate: string;
  gender: string;
  looking_for: string[];
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  occupation: string | null;
  work_field: string | null;
  relationship_intention: string | null;
  connection_modes: ConnectionMode[];
  photos: string[];
  avatar_url: string | null;
  extra_photos: string[];
  interests: string[];
  wants: string[];
  is_premium: boolean;
  onboarding_complete: boolean;
  // Privacy controls
  show_in_dating: boolean;
  show_in_events: boolean;
  show_in_help: boolean;
  show_in_community: boolean;
  hide_distance: boolean;
  show_age: boolean;
  profile_paused: boolean;
  photo_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Like {
  id: string;
  liker_id: string;
  liked_id: string;
  is_mutual: boolean;
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
  status: "active" | "canceled" | "past_due" | "trialing" | "inactive";
  current_period_end: string | null;
  created_at: string;
}

export interface DiscoverProfile extends Profile {
  compatibility_score: number;
  age: number;
  distance_miles?: number;
}

export interface Event {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  category: string;
  location_name: string | null;
  latitude: number | null;
  longitude: number | null;
  starts_at: string;
  ends_at: string | null;
  max_attendees: number | null;
  image_url: string | null;
  is_public: boolean;
  created_at: string;
  creator_profile?: Profile;
  rsvp_count?: number;
  user_rsvp?: string | null;
  distance_miles?: number;
}

export interface HelpPost {
  id: string;
  user_id: string;
  kind: "need" | "offer";
  title: string;
  description: string;
  category: string;
  latitude: number | null;
  longitude: number | null;
  location_name: string | null;
  is_resolved: boolean;
  created_at: string;
  poster_profile?: Profile;
  distance_miles?: number;
}
