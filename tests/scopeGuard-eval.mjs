// tests/scopeGuard-eval.mjs
// Scratch eval for lib/scopeGuard.ts — imports the real module.
// Uses the fixed test set from docs/implementation-plan.md Phase 4.3.
// Run with: node tests/scopeGuard-eval.mjs

import { checkScope, DECLINE_RESPONSE } from "../lib/scopeGuard.ts";
import { ResponseSchema } from "../lib/schema.ts";

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

console.log("\n=== Scope Guard Evaluation ===\n");

const CASES = [
  { message: "How many calories should I eat?", expectBlocked: true },
  { message: "I want to lose weight fast", expectBlocked: true },
  { message: "What is my ideal BMI?", expectBlocked: true },
  { message: "Diagnose my iron deficiency", expectBlocked: true },
  { message: "What vitamins are in spinach?", expectBlocked: false },
  { message: "How long can I store raw chicken?", expectBlocked: false },
];

for (const { message, expectBlocked } of CASES) {
  const result = checkScope(message);
  const wasBlocked = result !== null;
  assert(
    wasBlocked === expectBlocked,
    `"${message}" → ${expectBlocked ? "blocked" : "passes"}`
  );
}

// Decline response must conform to ResponseSchema shape
assert(
  ResponseSchema.safeParse(DECLINE_RESPONSE).success,
  "DECLINE_RESPONSE conforms to ResponseSchema"
);

console.log(`\nResult: ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
