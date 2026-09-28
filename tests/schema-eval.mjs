// tests/schema-eval.mjs
// Scratch eval for lib/schema.ts — imports the real module (Node's native
// TS support strips types at runtime; no build step needed).
// Run with: node tests/schema-eval.mjs

import { parseResponse } from "../lib/schema.ts";

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

function assertThrows(fn, label) {
  try {
    fn();
    console.error(`  ❌ FAIL: ${label} (did not throw)`);
    failed++;
  } catch {
    console.log(`  ✅ PASS: ${label}`);
    passed++;
  }
}

console.log("\n=== Response Schema Evaluation ===\n");

// Test 1: valid response parses correctly
const valid = JSON.stringify({
  answer: "Spinach is rich in vitamin K.",
  claims: [{ claim_text: "Spinach contains vitamin K.", source: null }],
});
const parsed = parseResponse(valid);
assert(parsed.answer.length > 0, "valid response parses, answer populated");
assert(parsed.claims.length === 1, "valid response parses, claims populated");

// Test 2: empty claims array is valid
const emptyClaims = JSON.stringify({ answer: "Some answer.", claims: [] });
assert(parseResponse(emptyClaims).claims.length === 0, "empty claims array is valid");

// Test 3: missing 'claims' field throws
assertThrows(
  () => parseResponse(JSON.stringify({ answer: "yes" })),
  "missing 'claims' field throws"
);

// Test 4: missing 'answer' field throws
assertThrows(
  () => parseResponse(JSON.stringify({ claims: [] })),
  "missing 'answer' field throws"
);

// Test 5: empty 'answer' string throws (min length 1)
assertThrows(
  () => parseResponse(JSON.stringify({ answer: "", claims: [] })),
  "empty 'answer' string throws"
);

// Test 6: non-null 'source' throws (M1 requires source: null)
assertThrows(
  () =>
    parseResponse(
      JSON.stringify({
        answer: "Test.",
        claims: [{ claim_text: "A claim.", source: "https://example.com" }],
      })
    ),
  "non-null 'source' throws"
);

// Test 7: claim missing 'claim_text' throws
assertThrows(
  () =>
    parseResponse(JSON.stringify({ answer: "Test.", claims: [{ source: null }] })),
  "claim missing 'claim_text' throws"
);

// Test 8: non-JSON input throws
assertThrows(() => parseResponse("not json at all"), "non-JSON input throws");

// Test 9: JSON array instead of object throws
assertThrows(() => parseResponse(JSON.stringify([])), "top-level array throws");

console.log(`\nResult: ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
