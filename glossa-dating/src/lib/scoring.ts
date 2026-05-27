// Intelligent ranking engine for Discover.
// Produces a 0-100 composite score used to order profiles in the feed.
// Higher = more relevant to the current user.

import { scoreCompatibility } from "@/lib/interests";
import { scoreWants } from "@/lib/wants";
import { distanceMiles } from "@/lib/location";

interface ScoredProfile {
  id: string;
  interests: string[];
  wants: string[];
  latitude: number | null;
  longitude: number | null;
  updated_at: string;
  connection_modes: string[];
}

interface MyContext {
  interests: string[];
  wants: string[];
  latitude: number | null;
  longitude: number | null;
  connection_modes: string[];
}

// Activity score: decay linearly from 1.0 (updated today) to 0.0 (30+ days idle)
function activityScore(updatedAt: string): number {
  const daysSince = (Date.now() - new Date(updatedAt).getTime()) / 86_400_000;
  return Math.max(0, 1 - daysSince / 30);
}

// Distance score: 1.0 at 0 miles, decays to 0 at 100+ miles
function distanceScore(miles: number | undefined): number {
  if (miles === undefined) return 0.5; // unknown = neutral
  return Math.max(0, 1 - miles / 100);
}

// Mode overlap: fraction of the user's modes the candidate also has
function modeScore(myModes: string[], theirModes: string[]): number {
  if (!myModes.length || !theirModes.length) return 0;
  const theirs = new Set(theirModes);
  const overlap = myModes.filter((m) => theirs.has(m)).length;
  return overlap / myModes.length;
}

// Weights (must sum to 1.0)
const W = {
  interests: 0.35,   // shared hobbies
  wants: 0.30,       // shared intent (what they're here for)
  modes: 0.15,       // shared connection modes
  activity: 0.12,    // how recently active
  distance: 0.08,    // proximity bonus
};

export function rankScore(me: MyContext, them: ScoredProfile): number {
  const dist = me.latitude && them.latitude
    ? distanceMiles(me.latitude, me.longitude!, them.latitude!, them.longitude!)
    : undefined;

  const interest = scoreCompatibility(me.interests, them.interests) / 100;
  const wants = scoreWants(me.wants, them.wants) / 100;
  const modes = modeScore(me.connection_modes, them.connection_modes);
  const activity = activityScore(them.updated_at);
  const distance = distanceScore(dist);

  const raw =
    interest  * W.interests +
    wants     * W.wants +
    modes     * W.modes +
    activity  * W.activity +
    distance  * W.distance;

  return Math.round(raw * 100);
}

export function rankProfiles<T extends ScoredProfile>(me: MyContext, profiles: T[]): T[] {
  return [...profiles].sort((a, b) => rankScore(me, b) - rankScore(me, a));
}
