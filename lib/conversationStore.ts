// lib/conversationStore.ts
// In-memory conversation store keyed by sessionId.
// M2 upgrade path: replace the Map internals with PostgreSQL (Railway).
// The exported interface (getHistory / appendTurn) stays identical.

export type Message = {
  role: "user" | "assistant";
  content: string;
};

// Single in-process store — resets on server restart (acceptable for M1).
const store = new Map<string, Message[]>();

/**
 * Returns the full conversation history for a session.
 * Returns an empty array if the session has no history yet.
 */
export function getHistory(sessionId: string): Message[] {
  return store.get(sessionId) ?? [];
}

/**
 * Appends a single turn (user or assistant message) to the session history.
 */
export function appendTurn(
  sessionId: string,
  role: "user" | "assistant",
  content: string
): void {
  const history = getHistory(sessionId);
  store.set(sessionId, [...history, { role, content }]);
}
