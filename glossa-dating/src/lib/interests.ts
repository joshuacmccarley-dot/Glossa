export interface InterestCategory {
  id: string;
  label: string;
  emoji: string;
  interests: Interest[];
}

export interface Interest {
  id: string;
  label: string;
  emoji: string;
}

export const RELATIONSHIP_INTENTIONS = [
  { id: "serious", label: "Serious relationship", emoji: "💍" },
  { id: "casual", label: "Casual dating", emoji: "✨" },
  { id: "friendship", label: "Friendship first", emoji: "🤝" },
  { id: "marriage", label: "Marriage-minded", emoji: "💒" },
  { id: "figuring_out", label: "Still figuring it out", emoji: "🌱" },
] as const;

export const WORK_FIELDS = [
  { id: "tech", label: "Technology", emoji: "💻" },
  { id: "healthcare", label: "Healthcare", emoji: "🏥" },
  { id: "education", label: "Education", emoji: "🎓" },
  { id: "arts_media", label: "Arts & Media", emoji: "🎨" },
  { id: "finance", label: "Finance & Business", emoji: "📊" },
  { id: "law", label: "Law & Government", emoji: "⚖️" },
  { id: "science", label: "Science & Research", emoji: "🔬" },
  { id: "trades", label: "Trades & Construction", emoji: "🔧" },
  { id: "hospitality", label: "Hospitality & Food", emoji: "🍽️" },
  { id: "nonprofit", label: "Nonprofit & Social Work", emoji: "🌍" },
  { id: "entrepreneur", label: "Entrepreneur", emoji: "🚀" },
  { id: "student", label: "Student", emoji: "📚" },
  { id: "military", label: "Military & Defense", emoji: "🪖" },
  { id: "freelance", label: "Freelance / Self-employed", emoji: "🏠" },
  { id: "other", label: "Other", emoji: "🌟" },
] as const;

export const INTEREST_CATEGORIES: InterestCategory[] = [
  {
    id: "arts",
    label: "Arts & Creativity",
    emoji: "🎨",
    interests: [
      { id: "painting", label: "Painting", emoji: "🖌️" },
      { id: "photography", label: "Photography", emoji: "📸" },
      { id: "writing", label: "Writing", emoji: "✍️" },
      { id: "music", label: "Music", emoji: "🎵" },
      { id: "drawing", label: "Drawing", emoji: "✏️" },
      { id: "sculpture", label: "Sculpture", emoji: "🗿" },
      { id: "film", label: "Filmmaking", emoji: "🎬" },
      { id: "dance", label: "Dance", emoji: "💃" },
      { id: "pottery", label: "Pottery", emoji: "🏺" },
      { id: "singing", label: "Singing", emoji: "🎤" },
    ],
  },
  {
    id: "outdoors",
    label: "Outdoors & Adventure",
    emoji: "🏔️",
    interests: [
      { id: "hiking", label: "Hiking", emoji: "🥾" },
      { id: "camping", label: "Camping", emoji: "⛺" },
      { id: "climbing", label: "Rock Climbing", emoji: "🧗" },
      { id: "surfing", label: "Surfing", emoji: "🏄" },
      { id: "skiing", label: "Skiing", emoji: "⛷️" },
      { id: "cycling", label: "Cycling", emoji: "🚴" },
      { id: "kayaking", label: "Kayaking", emoji: "🛶" },
      { id: "running", label: "Running", emoji: "🏃" },
      { id: "fishing", label: "Fishing", emoji: "🎣" },
      { id: "skydiving", label: "Skydiving", emoji: "🪂" },
    ],
  },
  {
    id: "food",
    label: "Food & Drink",
    emoji: "🍽️",
    interests: [
      { id: "cooking", label: "Cooking", emoji: "👨‍🍳" },
      { id: "baking", label: "Baking", emoji: "🥐" },
      { id: "wine", label: "Wine Tasting", emoji: "🍷" },
      { id: "coffee", label: "Coffee Culture", emoji: "☕" },
      { id: "foodie", label: "Foodie Travel", emoji: "🌮" },
      { id: "plant_based", label: "Plant-Based", emoji: "🥗" },
      { id: "brewing", label: "Home Brewing", emoji: "🍺" },
      { id: "grilling", label: "Grilling & BBQ", emoji: "🔥" },
    ],
  },
  {
    id: "tech_gaming",
    label: "Tech & Gaming",
    emoji: "💻",
    interests: [
      { id: "gaming", label: "Gaming", emoji: "🎮" },
      { id: "programming", label: "Programming", emoji: "👨‍💻" },
      { id: "vr", label: "VR/AR", emoji: "🥽" },
      { id: "boardgames", label: "Board Games", emoji: "♟️" },
      { id: "dnd", label: "D&D / RPGs", emoji: "🎲" },
      { id: "anime", label: "Anime", emoji: "🌸" },
      { id: "retrogaming", label: "Retro Gaming", emoji: "🕹️" },
      { id: "esports", label: "Esports", emoji: "🏆" },
    ],
  },
  {
    id: "wellness",
    label: "Wellness & Fitness",
    emoji: "🧘",
    interests: [
      { id: "yoga", label: "Yoga", emoji: "🧘" },
      { id: "gym", label: "Gym / Lifting", emoji: "🏋️" },
      { id: "meditation", label: "Meditation", emoji: "🌿" },
      { id: "martial_arts", label: "Martial Arts", emoji: "🥋" },
      { id: "pilates", label: "Pilates", emoji: "🤸" },
      { id: "swimming", label: "Swimming", emoji: "🏊" },
      { id: "nutrition", label: "Nutrition", emoji: "🥦" },
      { id: "mental_health", label: "Mental Wellness", emoji: "💚" },
    ],
  },
  {
    id: "culture",
    label: "Culture & Learning",
    emoji: "📚",
    interests: [
      { id: "reading", label: "Reading", emoji: "📖" },
      { id: "languages", label: "Languages", emoji: "🌍" },
      { id: "history", label: "History", emoji: "🏛️" },
      { id: "science_nerd", label: "Science", emoji: "🔬" },
      { id: "philosophy", label: "Philosophy", emoji: "🤔" },
      { id: "travel", label: "Travel", emoji: "✈️" },
      { id: "museums", label: "Museums / Art", emoji: "🎭" },
      { id: "podcasts", label: "Podcasts", emoji: "🎙️" },
    ],
  },
  {
    id: "social",
    label: "Social & Lifestyle",
    emoji: "🎉",
    interests: [
      { id: "concerts", label: "Concerts", emoji: "🎸" },
      { id: "volunteering", label: "Volunteering", emoji: "🤝" },
      { id: "fashion", label: "Fashion", emoji: "👗" },
      { id: "pets", label: "Pets", emoji: "🐾" },
      { id: "astrology", label: "Astrology", emoji: "⭐" },
      { id: "sustainability", label: "Sustainability", emoji: "🌱" },
      { id: "entrepreneurship", label: "Entrepreneurship", emoji: "🚀" },
      { id: "spirituality", label: "Spirituality", emoji: "🙏" },
    ],
  },
];

export const ALL_INTERESTS: Interest[] = INTEREST_CATEGORIES.flatMap((c) => c.interests);

export function getInterestById(id: string): Interest | undefined {
  return ALL_INTERESTS.find((i) => i.id === id);
}

export function scoreCompatibility(a: string[], b: string[]): number {
  if (!a.length || !b.length) return 0;
  const setA = new Set(a);
  const common = b.filter((i) => setA.has(i)).length;
  return Math.round((common / Math.max(a.length, b.length)) * 100);
}

export const MATCH_EXPIRY_HOURS = 12;
