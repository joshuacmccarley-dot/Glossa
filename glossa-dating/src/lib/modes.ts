export type ConnectionMode = "dating" | "events" | "help" | "community";

export interface Mode {
  id: ConnectionMode;
  label: string;
  emoji: string;
  tagline: string;
  color: string;         // tailwind bg class
  textColor: string;     // tailwind text class
  borderColor: string;
  description: string;
}

export const MODES: Mode[] = [
  {
    id: "dating",
    label: "Dating",
    emoji: "",
    tagline: "Find someone who just gets it",
    color: "bg-rose-50",
    textColor: "text-rose-600",
    borderColor: "border-rose-200",
    description: "From casual to marriage-minded — connect with someone who shares your interests and intentions.",
  },
  {
    id: "events",
    label: "Events",
    emoji: "",
    tagline: "Show up together",
    color: "bg-amber-50",
    textColor: "text-amber-600",
    borderColor: "border-amber-200",
    description: "Create or join local events. Find people already going to the same things you love.",
  },
  {
    id: "help",
    label: "Lend a Hand",
    emoji: "",
    tagline: "Give or receive, no strings",
    color: "bg-blue-50",
    textColor: "text-blue-600",
    borderColor: "border-blue-200",
    description: "Offer a skill, ask for help, swap favors. Community built on genuine generosity.",
  },
  {
    id: "community",
    label: "Community",
    emoji: "",
    tagline: "Grow your people",
    color: "bg-emerald-50",
    textColor: "text-emerald-600",
    borderColor: "border-emerald-200",
    description: "Friends, mentors, neighbours, accountability partners. No pressure, just connection.",
  },
];

export function getModeById(id: string): Mode | undefined {
  return MODES.find((m) => m.id === id);
}

export const DATING_INTENTIONS = [
  { id: "long_term", label: "Long-term / marriage-minded", emoji: "" },
  { id: "serious", label: "Serious relationship", emoji: "" },
  { id: "casual", label: "Casual, see where it goes", emoji: "" },
  { id: "friends_first", label: "Friends first, open to more", emoji: "" },
  { id: "open", label: "Open to anything genuine", emoji: "" },
  { id: "ethically_non_mono", label: "Ethically non-monogamous", emoji: "" },
] as const;

export const HELP_CATEGORIES = [
  { id: "skills", label: "Skills & Teaching", emoji: "" },
  { id: "moving", label: "Moving & Heavy lifting", emoji: "" },
  { id: "rides", label: "Rides & Transport", emoji: "" },
  { id: "food", label: "Meals & Groceries", emoji: "" },
  { id: "tech", label: "Tech & Devices", emoji: "" },
  { id: "pets", label: "Pet care", emoji: "" },
  { id: "childcare", label: "Childcare & Babysitting", emoji: "" },
  { id: "emotional", label: "A listening ear", emoji: "" },
  { id: "diy", label: "DIY & Home repair", emoji: "" },
  { id: "language", label: "Language exchange", emoji: "" },
  { id: "fitness", label: "Workout buddy", emoji: "" },
  { id: "other", label: "Other", emoji: "" },
] as const;

export const EVENT_CATEGORIES = [
  { id: "hangout", label: "Casual hangout", emoji: "" },
  { id: "outdoors", label: "Outdoors & Adventure", emoji: "" },
  { id: "food_drink", label: "Food & Drinks", emoji: "" },
  { id: "fitness", label: "Fitness & Sport", emoji: "" },
  { id: "arts", label: "Arts & Culture", emoji: "" },
  { id: "music", label: "Music & Concerts", emoji: "" },
  { id: "gaming", label: "Gaming", emoji: "" },
  { id: "learning", label: "Learning & Workshops", emoji: "" },
  { id: "volunteering", label: "Volunteering", emoji: "" },
  { id: "social", label: "Social & Meetup", emoji: "" },
] as const;
