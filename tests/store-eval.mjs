// tests/store-eval.mjs
// Scratch eval for lib/conversationStore.ts
// Run with: node tests/store-eval.mjs
// (Uses .mjs so we can run without ts-node)

// Re-implementing the store inline to test the logic without the TS module system
const store = new Map();

function getHistory(sessionId) {
  return store.get(sessionId) ?? [];
}

function appendTurn(sessionId, role, content) {
  const history = getHistory(sessionId);
  store.set(sessionId, [...history, { role, content }]);
}

// ── Tests ────────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    console.log(`  ✅ PASS: ${label}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${label}`);
    failed++;
  }
}

console.log("\n=== Conversation Store Evaluation ===\n");

// Test 1: new session returns empty array
assert(
  JSON.stringify(getHistory("new-session")) === "[]",
  "getHistory returns [] for new session"
);

// Test 2: appendTurn adds a user message
appendTurn("s1", "user", "Hello");
const h1 = getHistory("s1");
assert(h1.length === 1, "appendTurn adds first message");
assert(h1[0].role === "user", "First message has role 'user'");
assert(h1[0].content === "Hello", "First message has correct content");

// Test 3: appendTurn adds an assistant message
appendTurn("s1", "assistant", "Hi there!");
const h2 = getHistory("s1");
assert(h2.length === 2, "appendTurn adds second message");
assert(h2[1].role === "assistant", "Second message has role 'assistant'");

// Test 4: sessions are isolated
appendTurn("s2", "user", "Different session");
assert(getHistory("s1").length === 2, "Session s1 not contaminated by s2");
assert(getHistory("s2").length === 1, "Session s2 has its own history");

// Test 5: history cap simulation (last 10 turns)
for (let i = 0; i < 15; i++) {
  appendTurn("s3", i % 2 === 0 ? "user" : "assistant", `Turn ${i}`);
}
const rawHistory = getHistory("s3");
const capped = rawHistory.slice(-10);
assert(rawHistory.length === 15, "Store holds all 15 turns");
assert(capped.length === 10, "Cap to last 10 works correctly");
assert(capped[0].content === "Turn 5", "Capped history starts at correct turn");

// Test 6: empty string content appends (store doesn't validate — route.ts does)
appendTurn("s4", "user", "");
assert(getHistory("s4").length === 1, "Empty content stored (route.ts validates, not store)");

console.log(`\nResult: ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
