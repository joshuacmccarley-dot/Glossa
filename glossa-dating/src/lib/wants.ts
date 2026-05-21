// "What I want" — quick-select tags users pick to signal their needs.
// Shown as a tab-style selector on the profile and during onboarding.
// Used by the discover API to surface the most relevant matches.

export interface Want {
  id: string;
  label: string;
  emoji: string;
  mode: "dating" | "events" | "help" | "community" | "any";
  description: string;
}

export const WANTS: Want[] = [
  // Dating
  { id: "date_serious", label: "Serious relationship", emoji: "💍", mode: "dating", description: "Looking for a committed, long-term partner" },
  { id: "date_casual", label: "Casual dating", emoji: "✨", mode: "dating", description: "Open to meeting and seeing where it goes" },
  { id: "date_marriage", label: "Marriage-minded", emoji: "💒", mode: "dating", description: "Ready for the next big step" },
  { id: "date_friends_first", label: "Friends first", emoji: "🌱", mode: "dating", description: "Build a friendship before anything romantic" },
  { id: "date_activity", label: "Activity partner", emoji: "🏃", mode: "dating", description: "Someone to do things with — hikes, coffee, shows" },

  // Events
  { id: "event_concert", label: "Concert buddy", emoji: "🎸", mode: "events", description: "Someone to see live music with" },
  { id: "event_outdoors", label: "Outdoors crew", emoji: "🏔️", mode: "events", description: "Hiking, camping, climbing, adventures" },
  { id: "event_food", label: "Foodie meetups", emoji: "🍽️", mode: "events", description: "Restaurants, food tours, cooking events" },
  { id: "event_sports", label: "Sports & fitness", emoji: "⚽", mode: "events", description: "Group workouts, leagues, games" },
  { id: "event_social", label: "Social hangouts", emoji: "🎉", mode: "events", description: "Casual gatherings, game nights, meetups" },
  { id: "event_culture", label: "Arts & culture", emoji: "🎨", mode: "events", description: "Museums, galleries, theatre, talks" },

  // Lend a Hand
  { id: "help_give_skills", label: "Teach a skill", emoji: "📚", mode: "help", description: "I have skills I'd love to share" },
  { id: "help_need_skills", label: "Learn a skill", emoji: "🎯", mode: "help", description: "Looking to learn from someone experienced" },
  { id: "help_give_rides", label: "Offer rides", emoji: "🚗", mode: "help", description: "Happy to help with transport nearby" },
  { id: "help_moving", label: "Moving help", emoji: "📦", mode: "help", description: "Need or can give help moving" },
  { id: "help_tech", label: "Tech support", emoji: "💻", mode: "help", description: "Fix or get tech help" },
  { id: "help_emotional", label: "Listening ear", emoji: "💬", mode: "help", description: "Someone to talk to, no judgment" },
  { id: "help_language", label: "Language exchange", emoji: "🌍", mode: "help", description: "Practice a language together" },
  { id: "help_pets", label: "Pet sitting", emoji: "🐾", mode: "help", description: "Pet care help — give or receive" },

  // Community
  { id: "comm_friends", label: "Make friends", emoji: "🤝", mode: "community", description: "Genuine, no-pressure friendship" },
  { id: "comm_mentor", label: "Find a mentor", emoji: "🧭", mode: "community", description: "Career, life, or skills guidance" },
  { id: "comm_mentor_give", label: "Be a mentor", emoji: "🌟", mode: "community", description: "Share your experience with others" },
  { id: "comm_accountability", label: "Accountability partner", emoji: "✅", mode: "community", description: "Reach goals together" },
  { id: "comm_neighbour", label: "Meet neighbours", emoji: "🏘️", mode: "community", description: "Build community close to home" },
  { id: "comm_volunteer", label: "Volunteer together", emoji: "💚", mode: "community", description: "Give back with good people" },
];

export const WANTS_BY_MODE: Record<string, Want[]> = WANTS.reduce((acc, w) => {
  const key = w.mode === "any" ? "any" : w.mode;
  acc[key] = [...(acc[key] || []), w];
  return acc;
}, {} as Record<string, Want[]>);

export function getWantById(id: string): Want | undefined {
  return WANTS.find((w) => w.id === id);
}

// Score two users on shared wants (0-100)
export function scoreWants(a: string[], b: string[]): number {
  if (!a.length || !b.length) return 0;
  const setA = new Set(a);
  const common = b.filter((w) => setA.has(w)).length;
  return Math.round((common / Math.max(a.length, b.length)) * 100);
}
