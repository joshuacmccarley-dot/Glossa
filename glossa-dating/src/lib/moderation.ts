// Content moderation — blocks discriminatory and hateful content
// This runs server-side on all user-generated text before it's saved

const BLOCKED_PATTERNS: RegExp[] = [
  // Racial slurs — patterns rather than words to avoid listing them
  /\bn[i1!]+g+[a@e3]+r?\b/gi,
  /\bch[i!1]+nk\b/gi,
  /\bsp[i!1]+c\b/gi,
  /\bk[i!1]+ke\b/gi,
  /\bw[e3]+tb[a@]+ck\b/gi,
  /\bc[o0]+[o0]+n\b/gi,
  /\bj[i!1]+g+[a@]+b[o0]+[o0]+\b/gi,
  /\bs+p+[a@]+d+[e3]+\b/gi,
  /\bcr[a@]+ck[e3]+r\b/gi,
  /\bh[a@]+[j3]+[i!1]\b/gi,
  /\bw[o0]+g\b/gi,
  /\bd[a@]+g[o0]+\b/gi,

  // Gender/sexual hate
  /\bf[a@]+g+[o0]+t\b/gi,
  /\bf[a@]+gg?y?\b/gi,
  /\bd[yi!1]+k[e3]+\b/gi,
  /\btr[a@]+nn[yi!1]+e?\b/gi,
  /\bsh[e3]+m[a@]+l[e3]+\b/gi,

  // Misogyny
  /\bc[u]+nt\b/gi,
  /\bsl[u]+t\b/gi,
  /\bwh[o0]+r[e3]+\b/gi,

  // Explicit threats
  /\bk[i!1]+ll\s+(your?s?e?l?f?|all|them|those)\b/gi,
  /\bi\s+(will|[']m\s+gonna?|want\s+to)\s+(kill|murder|hurt|rape|harm)\b/gi,

  // Anti-religion hate
  /\bislam[o0]+ph[o0]+b[e3]+\b/gi,
];

const WARN_PATTERNS: RegExp[] = [
  /\bhate\s+(all|every)\b/gi,
  /\b(inferior|superior)\s+(race|people|gender|women|men|blacks|whites)\b/gi,
  /\bgo\s+back\s+to\b/gi,
];

export type ModerationResult =
  | { ok: true }
  | { ok: false; reason: string };

export function moderateText(text: string): ModerationResult {
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(text)) {
      return {
        ok: false,
        reason: "Your message contains language that violates sinc'd's community standards. Hate speech, slurs, and discriminatory content are not allowed.",
      };
    }
  }
  for (const pattern of WARN_PATTERNS) {
    if (pattern.test(text)) {
      return {
        ok: false,
        reason: "Your message may contain content that violates sinc'd's community guidelines around respectful communication.",
      };
    }
  }
  return { ok: true };
}

export const REPORT_REASONS = [
  { id: "hate_speech", label: "Hate speech / slurs" },
  { id: "racism", label: "Racism or discrimination" },
  { id: "sexism", label: "Sexism or misogyny" },
  { id: "harassment", label: "Harassment or bullying" },
  { id: "inappropriate_photos", label: "Inappropriate photos" },
  { id: "fake_profile", label: "Fake or bot profile" },
  { id: "underage", label: "Appears to be under 18" },
  { id: "spam", label: "Spam or scam" },
  { id: "threats", label: "Threats or violence" },
  { id: "other", label: "Other" },
] as const;

export type ReportReason = typeof REPORT_REASONS[number]["id"];
