// lib/scopeGuard.ts
// Code-level enforcement of forbidden topics.
// This runs BEFORE the LLM call — a line in the prompt is not enough.

const BLOCKED_PATTERNS: RegExp[] = [
  // Calorie targets
  /calorie[s]?\s*(target|goal|limit|deficit|intake)/i,
  /how\s+many\s+calories/i,
  /calorie[s]?\s+should\s+i/i,

  // Weight targets
  /lose\s+weight/i,
  /gain\s+weight/i,
  /ideal\s+weight/i,
  /should\s+i\s+weigh/i,
  /weight\s+loss\s+(plan|goal|target)/i,
  /\bbmi\b/i,

  // Medical advice
  /medical\s+advice/i,
  /diagnos(e|is)/i,
  /\btreat(ment|ing|ed)?\b/i,
  /prescri(be|ption)/i,
  /is\s+this\s+(a\s+)?symptom/i,
  /do\s+i\s+have\b/i,
];

export const DECLINE_RESPONSE = {
  answer:
    "I can't help with calorie targets, weight goals, or medical advice. " +
    "For personalised guidance, please consult a registered dietitian or your doctor.",
  claims: [] as [],
};

/**
 * Returns a decline response if the message matches a forbidden pattern,
 * or null if the message is safe to pass to the LLM.
 */
export function checkScope(message: string): typeof DECLINE_RESPONSE | null {
  const blocked = BLOCKED_PATTERNS.some((p) => p.test(message));
  return blocked ? DECLINE_RESPONSE : null;
}
