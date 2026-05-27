// Server-side input validation helpers

export function sanitizeText(input: string, maxLength = 500): string {
  return input
    .trim()
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // strip control chars
    .slice(0, maxLength);
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 320;
}

export function validateAge(birthdate: string): boolean {
  const birth = new Date(birthdate);
  if (isNaN(birth.getTime())) return false;
  const age = (Date.now() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  return age >= 18 && age <= 120;
}

export function validateInterests(interests: unknown): interests is string[] {
  if (!Array.isArray(interests)) return false;
  if (interests.length > 15) return false;
  return interests.every((i) => typeof i === "string" && /^[a-z_]{1,40}$/.test(i));
}

export function validateDisplayName(name: string): boolean {
  return typeof name === "string" && name.trim().length >= 2 && name.trim().length <= 50;
}

export function validateGender(gender: string): boolean {
  const allowed = ["Man", "Woman", "Non-binary", "Genderqueer", "Transgender", "Prefer not to say"];
  return allowed.includes(gender);
}

export function validateIntention(intention: string): boolean {
  const allowed = ["serious", "casual", "friendship", "marriage", "figuring_out"];
  return allowed.includes(intention);
}

export function validateWorkField(field: string): boolean {
  const allowed = ["tech","healthcare","education","arts_media","finance","law","science","trades","hospitality","nonprofit","entrepreneur","student","military","freelance","other"];
  return allowed.includes(field);
}

// Ensure a UUID looks valid (not foolproof but prevents obvious injections)
export function isValidUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(str);
}
