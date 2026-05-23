export interface Prompt {
  id: string;
  question: string;
  category: "fun" | "values" | "lifestyle" | "dreams" | "community";
}

export const PROMPTS: Prompt[] = [
  // Fun
  { id: "weekend_looks_like", question: "My ideal weekend looks like…", category: "fun" },
  { id: "two_truths", question: "Two truths and a lie about me", category: "fun" },
  { id: "change_my_mind", question: "Change my mind about…", category: "fun" },
  { id: "best_meal", question: "The meal I keep making again and again", category: "fun" },
  { id: "spotify_habit", question: "The song I've played embarrassingly many times", category: "fun" },
  { id: "random_skill", question: "A random skill I'm oddly proud of", category: "fun" },
  { id: "argue_with_me", question: "I'll argue that ____ is underrated", category: "fun" },
  // Values
  { id: "dealbreaker", question: "My one non-negotiable", category: "values" },
  { id: "proud_of", question: "Something I'm quietly proud of", category: "values" },
  { id: "learned_hard_way", question: "Something I learned the hard way", category: "values" },
  { id: "love_language", question: "My love language in action looks like…", category: "values" },
  { id: "change_about_world", question: "If I could change one thing about the world", category: "values" },
  // Lifestyle
  { id: "morning_person", question: "Morning person, night owl, or chaotic neutral?", category: "lifestyle" },
  { id: "introvert_extrovert", question: "I recharge by…", category: "lifestyle" },
  { id: "recent_discovery", question: "Something I recently got into", category: "lifestyle" },
  { id: "hometown_secret", question: "The best kept secret in my city", category: "lifestyle" },
  { id: "spontaneous_thing", question: "Most spontaneous thing I've done", category: "lifestyle" },
  { id: "comfort_show", question: "My comfort show / book / album", category: "lifestyle" },
  // Dreams
  { id: "five_year", question: "Where I see myself in five years", category: "dreams" },
  { id: "bucket_list_top", question: "Top of my bucket list", category: "dreams" },
  { id: "if_money", question: "If money weren't a thing I'd spend my time…", category: "dreams" },
  { id: "dream_collab", question: "My dream collaboration (living or historical)", category: "dreams" },
  { id: "passion_project", question: "A passion project I'm working on", category: "dreams" },
  // Community
  { id: "help_offer", question: "Something I'm genuinely great at helping with", category: "community" },
  { id: "meet_for", question: "I'd love to meet someone to…", category: "community" },
  { id: "looking_for_friend", question: "The kind of friend I'm looking for", category: "community" },
  { id: "show_you_around", question: "I'd show you around my neighbourhood by…", category: "community" },
  { id: "accountability_goal", question: "A goal I'd love an accountability buddy for", category: "community" },
  { id: "mentor_topic", question: "I could use a mentor in…", category: "community" },
  { id: "teach_you", question: "I could teach you…", category: "community" },
];

export interface ProfilePrompt {
  id: string;
  answer: string;
}

export function getPrompt(id: string): Prompt | undefined {
  return PROMPTS.find((p) => p.id === id);
}
