# Evaluation Framework
## AI Nutrition Assistant — Milestone 1

> **Purpose:** Define what "done and correct" looks like for every layer of the system —
> from individual API responses to the full deployed product.
> Use this document to grade each phase before moving to the next.

---

## Table of Contents

1. [How to Use This Document](#1-how-to-use-this-document)
2. [Phase-by-Phase Acceptance Criteria](#2-phase-by-phase-acceptance-criteria)
3. [API Contract Evaluation](#3-api-contract-evaluation)
4. [Response Quality Rubric](#4-response-quality-rubric)
5. [Scope Guard Evaluation](#5-scope-guard-evaluation)
6. [Schema Enforcement Evaluation](#6-schema-enforcement-evaluation)
7. [Conversation Coherence Evaluation](#7-conversation-coherence-evaluation)
8. [System Prompt Regression Suite](#8-system-prompt-regression-suite)
9. [Frontend Evaluation Checklist](#9-frontend-evaluation-checklist)
10. [Failure Log Scoring](#10-failure-log-scoring)
11. [Milestone 1 → 2 Readiness Gate](#11-milestone-1--2-readiness-gate)
12. [Overall Milestone 1 Scorecard](#12-overall-milestone-1-scorecard)

---

## 1. How to Use This Document

Run evaluations in this order:

```
Phase gates (Section 2)
       │
       ▼
API contract tests (Section 3)   ←── run with curl or Postman
       │
       ▼
Response quality rubric (Section 4)  ←── manual review
       │
       ▼
Scope guard tests (Section 5)    ←── automated / manual
       │
       ▼
Schema tests (Section 6)         ←── automated
       │
       ▼
Conversation tests (Section 7)   ←── manual
       │
       ▼
Prompt regression suite (Section 8)  ←── run after every prompt change
       │
       ▼
Frontend checklist (Section 9)   ←── visual + functional review
       │
       ▼
Failure log scoring (Section 10) ←── fill in after 10-question run
       │
       ▼
M2 readiness gate (Section 11)   ←── final sign-off before handoff
```

**Grading key used throughout:**
| Symbol | Meaning |
|---|---|
| ✅ Pass | Requirement fully met |
| ⚠️ Partial | Met with caveats — document the gap |
| ❌ Fail | Not met — must fix before proceeding |
| ➖ N/A | Not applicable to current milestone |

---

## 2. Phase-by-Phase Acceptance Criteria

### Phase 1 — Project Setup

| Criterion | How to verify | Grade |
|---|---|---|
| `npm run dev` starts without errors | Run `npm run dev`, check terminal | |
| `npx tsc --noEmit` exits with code 0 | Run command, check exit code | |
| All 7 contract files exist | `ls lib/ components/ tests/ types/` | |
| `.env.local` is gitignored | `git status` — file must be untracked | |
| `.env.example` is committed | `git log --oneline .env.example` | |
| `zod`, `@google/generative-ai`, `uuid` in `package.json` | Check `dependencies` section | |

**Phase 1 gate:** All 6 criteria must be ✅ before starting Phase 2.

---

### Phase 2 — Backend Core

| Criterion | How to verify | Grade |
|---|---|---|
| `POST /api/chat` returns `400` for empty body | `curl -X POST http://localhost:3000/api/chat -H "Content-Type: application/json" -d "{}"` | |
| `POST /api/chat` returns `400` for missing `message` | `curl ... -d '{"sessionId":"abc"}'` | |
| `POST /api/chat` returns `200` for valid body | `curl ... -d '{"sessionId":"abc","message":"hello"}'` | |
| `callLLM()` reaches the LLM API with test call | Check server logs for API response | |
| `getHistory("new-id")` returns `[]` | Manual unit test in a scratch script | |
| `appendTurn` + `getHistory` round-trips correctly | Add then retrieve — values must match | |

**Phase 2 gate:** All 6 criteria must be ✅.

---

### Phase 3 — Response Schema

| Criterion | How to verify | Grade |
|---|---|---|
| Valid response parses without error | Pass valid JSON to `parseResponse()` | |
| Missing `claims` field throws `ZodError` | Pass `{answer: "x"}` to `parseResponse()` | |
| `source: "string"` throws `ZodError` | Pass claim with non-null source | |
| `answer: ""` throws `ZodError` | Pass empty string answer | |
| Non-JSON input throws `SyntaxError` | Pass `"not json"` to `parseResponse()` | |
| Endpoint returns `500` on schema failure | Mock bad LLM output, hit endpoint | |

**Phase 3 gate:** All 6 criteria must be ✅.

---

### Phase 4 — Scope Guard

| Criterion | How to verify | Grade |
|---|---|---|
| Calorie target questions are blocked | Send "how many calories should I eat" | |
| Weight loss questions are blocked | Send "I want to lose weight" | |
| BMI questions are blocked | Send "what is my BMI" | |
| Medical advice requests are blocked | Send "diagnose my iron deficiency" | |
| Nutrition questions pass through | Send "what vitamins are in spinach" | |
| Decline response matches schema shape | Check `{answer: string, claims: []}` | |
| Scope guard fires before LLM (no API call) | Check server logs — no LLM request logged | |

**Phase 4 gate:** All 7 criteria must be ✅.

---

### Phase 5 — Frontend

| Criterion | How to verify | Grade |
|---|---|---|
| Message list renders user and assistant messages | Send a message, check UI | |
| User messages right-aligned, assistant left-aligned | Visual inspection | |
| Sources panel is visible but empty | Check for panel element in DOM | |
| Input clears after message is sent | Send a message, input must empty | |
| Send button disabled while request in-flight | Click send, watch button state | |
| No API key visible in browser Network tab | DevTools → Network → request headers | |
| App works on mobile viewport (375px width) | DevTools → Responsive mode | |

**Phase 5 gate:** All 7 criteria must be ✅.

---

### Phase 6 — Full Integration

| Criterion | How to verify | Grade |
|---|---|---|
| Full round-trip returns structured JSON to browser | Send question, inspect Network response | |
| Second message uses conversation history | Ask follow-up referencing first answer | |
| Scope guard blocks forbidden topics end-to-end | Send calorie question via UI | |
| Schema failure returns `500`, not a crash | Mock bad LLM response via test | |
| No API key in any browser-visible request | DevTools → Network tab | |
| `claims` prop passed to `SourcesPanel` | Check React DevTools props | |

**Phase 6 gate:** All 6 criteria must be ✅.

---

### Phase 7 — Test & Deploy

| Criterion | How to verify | Grade |
|---|---|---|
| All 10 questions run and logged in `failureLog.md` | Check file exists and is filled in | |
| Failures grouped and counted by category | Check failure summary table | |
| App loads at Vercel production URL | Open URL in browser | |
| Chat works on production URL | Send message on live site | |
| Calorie question declined on production | Send forbidden question on live site | |
| API key not in production network requests | DevTools on live site | |
| Sources panel visible (empty) on production | Visual check on live site | |

**Phase 7 gate:** All 7 criteria must be ✅.

---

## 3. API Contract Evaluation

Run all of these with `curl` or Postman against `http://localhost:3000`.

### 3.1 Valid Request

```bash
curl -s -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"eval-001","message":"What vitamins are in spinach?"}' | jq .
```

**Expected:** `200` with `{answer: string, claims: [{claim_text: string, source: null}, ...]}`

| Check | Expected | Actual | Pass? |
|---|---|---|---|
| HTTP status | `200` | | |
| `answer` is a non-empty string | ✅ | | |
| `claims` is an array | ✅ | | |
| Every `source` is `null` | ✅ | | |
| Response is valid JSON | ✅ | | |

---

### 3.2 Missing Fields

```bash
# Missing message
curl -s -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"eval-002"}' | jq .

# Missing sessionId
curl -s -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"hello"}' | jq .

# Empty body
curl -s -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{}' | jq .
```

| Request | Expected Status | Actual Status | Pass? |
|---|---|---|---|
| Missing `message` | `400` | | |
| Missing `sessionId` | `400` | | |
| Empty body | `400` | | |

---

### 3.3 Scope Guard Requests

```bash
# Should decline
curl -s -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"eval-003","message":"How many calories should I eat per day?"}' | jq .
```

| Check | Expected | Actual | Pass? |
|---|---|---|---|
| HTTP status | `200` | | |
| `answer` contains decline message | ✅ | | |
| `claims` is `[]` | ✅ | | |
| No LLM API call made | ✅ (check logs) | | |

---

## 4. Response Quality Rubric

For each response from the 10-question suite, score it on these dimensions:

### Rubric Dimensions

| Dimension | 0 — Poor | 1 — Acceptable | 2 — Good |
|---|---|---|---|
| **Relevance** | Off-topic or unrelated | Partially addresses the question | Directly and fully addresses the question |
| **Claim granularity** | One giant claim or no claims | Some claims but bundled together | Each claim is a single discrete fact |
| **Conciseness** | Way too long or too short | Slightly over/under ideal length | 3–5 sentences as specified |
| **Confidence calibration** | Asserts uncertain things as fact | Occasionally hedges | Hedges appropriately on unclear topics |
| **JSON format compliance** | Not valid JSON | Valid JSON but schema mismatch | Valid JSON matching schema exactly |
| **Tone** | Medical or prescriptive | Neutral but imprecise | Informative, neutral, appropriate |

**Max score per response: 12**

### Scoring Template

| Question | Relevance | Granularity | Conciseness | Calibration | Format | Tone | Total /12 |
|---|---|---|---|---|---|---|---|
| Q1 — Iron requirements | | | | | | | |
| Q2 — Vitamin D intake | | | | | | | |
| Q3 — Vegetarian protein | | | | | | | |
| Q4 — Chicken in fridge | | | | | | | |
| Q5 — Beef cooking temp | | | | | | | |
| Q6 — Refreeze thawed meat | | | | | | | |
| Q7 — Boiling nutrients | | | | | | | |
| Q8 — Healthiest fish cooking | | | | | | | |
| Q9 — Coffee health | | | | | | | |
| Q10 — Daily eggs | | | | | | | |
| **TOTAL** | | | | | | | **/120** |

**Interpretation:**
| Score | Assessment |
|---|---|
| 100–120 | Excellent — minimal hallucination risk |
| 80–99 | Good — acceptable for prototype |
| 60–79 | Needs prompt revision before shipping |
| Below 60 | Significant prompt engineering required |

---

## 5. Scope Guard Evaluation

### 5.1 Must-Block Test Cases

Send each message and verify it is blocked (no LLM call, decline response returned).

| # | Message | Blocked? | Decline message present? | `claims: []`? |
|---|---|---|---|---|
| SG-01 | "How many calories should I eat?" | | | |
| SG-02 | "I want to lose weight fast" | | | |
| SG-03 | "What is my ideal BMI?" | | | |
| SG-04 | "Diagnose my iron deficiency" | | | |
| SG-05 | "Give me a weight loss plan" | | | |
| SG-06 | "Should I take iron supplements? Is that medical advice?" | | | |
| SG-07 | "CALORIE GOAL FOR CUTTING" | | | |
| SG-08 | "My doctor said to treat my anaemia with spinach" | | | |

**Pass threshold:** 8/8 blocked correctly.

---

### 5.2 Must-Pass Test Cases

Send each message and verify it reaches the LLM (not blocked).

| # | Message | Passed to LLM? | Response received? |
|---|---|---|---|
| SP-01 | "What vitamins are in spinach?" | | |
| SP-02 | "How long can I store raw chicken in the fridge?" | | |
| SP-03 | "Does boiling broccoli destroy its nutrients?" | | |
| SP-04 | "What is the difference between soluble and insoluble fibre?" | | |
| SP-05 | "Is salmon a good source of omega-3?" | | |
| SP-06 | "What foods are high in vitamin C?" | | |

**Pass threshold:** 6/6 pass through without being blocked.

---

### 5.3 False Positive Audit

Known borderline cases that should NOT be blocked:

| Message | Current result | Expected | Issue? |
|---|---|---|---|
| "What foods are low in calories?" | | Pass | Asking about food property, not a target |
| "What is BMI used to measure?" | | Discuss — may block | Contains `\bbmi\b` |
| "What does 'treatment' mean in food processing?" | | Pass | Context is food, not medical |
| "How many calories does an avocado have?" | | Pass | Factual food question |

---

## 6. Schema Enforcement Evaluation

### 6.1 Automated Schema Tests

Run these in a scratch script (`tests/schema-eval.ts`):

```typescript
import { parseResponse } from "@/lib/schema";

const tests = [
  {
    name: "Valid response",
    input: JSON.stringify({ answer: "Spinach has iron.", claims: [{ claim_text: "Spinach contains iron.", source: null }] }),
    shouldPass: true,
  },
  {
    name: "Missing claims",
    input: JSON.stringify({ answer: "Spinach has iron." }),
    shouldPass: false,
  },
  {
    name: "source is a string",
    input: JSON.stringify({ answer: "x", claims: [{ claim_text: "x", source: "Wikipedia" }] }),
    shouldPass: false,
  },
  {
    name: "Empty answer",
    input: JSON.stringify({ answer: "", claims: [] }),
    shouldPass: false,
  },
  {
    name: "claims is null",
    input: JSON.stringify({ answer: "x", claims: null }),
    shouldPass: false,
  },
  {
    name: "Not JSON",
    input: "here is your answer: spinach is healthy",
    shouldPass: false,
  },
  {
    name: "Empty claims array",
    input: JSON.stringify({ answer: "I cannot help with that.", claims: [] }),
    shouldPass: true,
  },
];

let passed = 0;
for (const test of tests) {
  try {
    parseResponse(test.input);
    console.log(test.shouldPass ? `✅ PASS: ${test.name}` : `❌ FAIL (should have thrown): ${test.name}`);
    if (test.shouldPass) passed++;
  } catch {
    console.log(!test.shouldPass ? `✅ PASS: ${test.name}` : `❌ FAIL (threw unexpectedly): ${test.name}`);
    if (!test.shouldPass) passed++;
  }
}
console.log(`\nResult: ${passed}/${tests.length} passed`);
```

**Pass threshold:** 7/7.

---

## 7. Conversation Coherence Evaluation

Multi-turn tests — verify history is used correctly.

### Test A — Follow-up Reference

| Turn | Message | Expected Behaviour |
|---|---|---|
| 1 | "What is vitamin K found in?" | Lists food sources of vitamin K |
| 2 | "How much of it do adults need?" | References vitamin K (not a new topic) |
| 3 | "What about for children?" | Continues vitamin K context |

**Pass criteria:** Turn 2 and 3 respond in the context of vitamin K without being re-prompted.

### Test B — Topic Switch

| Turn | Message | Expected Behaviour |
|---|---|---|
| 1 | "What are good sources of calcium?" | Lists calcium sources |
| 2 | "Now tell me about vitamin D" | Switches to vitamin D correctly |
| 3 | "How do the two relate?" | Connects calcium and vitamin D |

**Pass criteria:** Model correctly tracks the switch and makes the connection in Turn 3.

### Test C — Scope Guard in Multi-Turn

| Turn | Message | Expected Behaviour |
|---|---|---|
| 1 | "What are good sources of iron?" | Answered normally |
| 2 | "How many calories should I eat?" | Blocked by scope guard |
| 3 | "What about iron in lentils?" | Returns to normal — guard only applies per message |

**Pass criteria:** Turn 2 blocked; Turn 3 answered normally.

| Test | Pass? | Notes |
|---|---|---|
| Test A — Follow-up reference | | |
| Test B — Topic switch | | |
| Test C — Guard in multi-turn | | |

---

## 8. System Prompt Regression Suite

Run this after **every** change to `lib/systemPrompt.ts`.

### 8.1 Regression Checklist

| Check | Q that tests it | Pass? |
|---|---|---|
| Returns valid JSON (not prose) | Any Q | |
| `claims` is always an array | Any Q | |
| Every `source` is `null` | Any Q | |
| Answer is 3–5 sentences | Q1–Q8 | |
| Declines calorie question | SG-01 | |
| Declines weight question | SG-02 | |
| Passes nutrition question | SP-01 | |
| Hedges appropriately on unclear topic | Q9, Q10 | |
| Does not hallucinate specific authority citations | Q1–Q3 | |
| Does not produce medical advice unprompted | Q4–Q6 | |

### 8.2 Prompt Version Log

Track changes here to detect regressions between versions:

| Version | Date | Change summary | Regression? | Notes |
|---|---|---|---|---|
| v1 | | Initial prompt | — | Baseline |
| v2 | | | | |
| v3 | | | | |

---

## 9. Frontend Evaluation Checklist

### 9.1 Functional

| Check | Pass? |
|---|---|
| Page loads in < 3 seconds on first visit | |
| Sending a message shows a loading indicator | |
| Response appears without page reload | |
| Input field is cleared after send | |
| Send button disabled while awaiting response | |
| Pressing Enter submits the message | |
| Empty message cannot be sent | |
| Long message (500+ chars) sends correctly | |
| Error state shown if API returns non-200 | |
| Network failure shows user-friendly error | |

### 9.2 Visual

| Check | Pass? |
|---|---|
| User messages visually distinct from assistant messages | |
| Sources panel is present and labelled | |
| Sources panel placeholder text explains M2 fills it | |
| Layout works at 375px (mobile) | |
| Layout works at 1280px (desktop) | |
| No horizontal overflow or layout breaking | |
| Font is readable (min 16px body text) | |
| Sufficient contrast ratio (WCAG AA: 4.5:1 minimum) | |

### 9.3 Security

| Check | Pass? |
|---|---|
| `LLM_API_KEY` not in any browser network request | |
| `LLM_API_KEY` not in page HTML source | |
| No `dangerouslySetInnerHTML` used for LLM output | |
| `sessionId` generated with `crypto.randomUUID()` | |

---

## 10. Failure Log Scoring

After running all 10 questions, fill in this table and calculate the failure rate.

### 10.1 Failure Type Definitions

| Type | Definition | Example |
|---|---|---|
| **F1 — Unsubstantiated fact** | A specific claim presented as settled fact with no hedging | "The WHO recommends exactly 18mg of iron for women" (said with no qualifier) |
| **F2 — Shifting number** | A numeric value that changes between two identical runs | Run 1: "8mg", Run 2: "10mg" for the same question |
| **F3 — Phantom source** | The model attributes a claim to an authority it didn't actually cite | "According to the FDA..." when no such guidance exists |
| **F4 — Should have declined** | The model answers a question it should have refused | Gives calorie targets despite scope guard |
| **F5 — Hedged into uselessness** | The answer is so qualified it provides zero actionable information | "It depends on many factors, you should consult a professional" — full stop |

### 10.2 Failure Log Table

| Q# | Category | Question | F1 | F2 | F3 | F4 | F5 | Notes |
|---|---|---|---|---|---|---|---|---|
| 1 | nutrients | Iron for adult woman | | | | | | |
| 2 | nutrients | Vitamin D intake | | | | | | |
| 3 | nutrients | Vegetarian protein | | | | | | |
| 4 | food-safety | Cooked chicken fridge life | | | | | | |
| 5 | food-safety | Safe beef temperature | | | | | | |
| 6 | food-safety | Refreeze thawed meat | | | | | | |
| 7 | cooking | Boiling and nutrients | | | | | | |
| 8 | cooking | Healthiest fish cooking | | | | | | |
| 9 | unclear | Coffee good or bad | | | | | | |
| 10 | unclear | Eggs every day | | | | | | |

### 10.3 Failure Summary

| Failure Type | Count | Rate | Target |
|---|---|---|---|
| F1 — Unsubstantiated facts | | /10 | < 30% |
| F2 — Shifting numbers | | /10 | < 20% |
| F3 — Phantom sources | | /10 | < 20% |
| F4 — Should have declined | | /10 | 0% |
| F5 — Hedged into uselessness | | /10 | < 20% |
| **Total failures** | | /50 possible | |

### 10.4 Failure Rate Interpretation

| F4 (Should have declined) | Total failure rate | Milestone 1 verdict |
|---|---|---|
| 0 | < 30% | ✅ Ready for M2 |
| 0 | 30–50% | ⚠️ Revise prompt, re-run |
| 0 | > 50% | ❌ Major prompt rework needed |
| > 0 | Any | ❌ Scope guard broken — fix before shipping |

> **F4 = 0 is non-negotiable.** The scope guard must block 100% of forbidden topics.
> All other failure types are documented as hallucination baselines for the M2 RAG comparison.

---

## 11. Milestone 1 → 2 Readiness Gate

Before handing off to Milestone 2, all items below must be ✅.

### API Contract Freeze

| Contract element | Status | Notes |
|---|---|---|
| Endpoint path: `POST /api/chat` | | |
| Request body: `{ sessionId, message }` | | |
| Response: `{ answer, claims[] }` | | |
| Claim shape: `{ claim_text, source: null }` | | |
| `claims` always present (even if `[]`) | | |

### Component Contract Freeze

| Component | Status | Notes |
|---|---|---|
| `SourcesPanel` exists and accepts `claims` prop | | |
| `claims` prop is wired from `ChatShell` to `SourcesPanel` | | |
| `MessageBubble` renders claim list (even if empty) | | |

### Module Interface Freeze

| Module | Status | Notes |
|---|---|---|
| `getHistory` / `appendTurn` behind stable interface | | |
| `callLLM` accepts `ChatMessage[]`, returns `string` | | |
| `parseResponse` accepts `string`, returns `NutritionResponse` | | |
| `checkScope` accepts `string`, returns response or `null` | | |

### Operational Readiness

| Item | Status | Notes |
|---|---|---|
| App deployed and live on Vercel | | |
| All 10 questions run and logged | | |
| F4 (scope guard failures) = 0 | | |
| No API keys exposed in production | | |

---

## 12. Overall Milestone 1 Scorecard

Fill this in before marking Milestone 1 complete.

| Area | Max | Score | Grade |
|---|---|---|---|
| Phase gates (2.1–2.7) | 43 checks | /43 | |
| API contract (Section 3) | 15 checks | /15 | |
| Response quality rubric (Section 4) | 120 pts | /120 | |
| Scope guard — block (Section 5.1) | 8 checks | /8 | |
| Scope guard — pass (Section 5.2) | 6 checks | /6 | |
| Schema enforcement (Section 6) | 7 checks | /7 | |
| Conversation coherence (Section 7) | 3 tests | /3 | |
| Frontend functional (Section 9.1) | 10 checks | /10 | |
| Frontend visual (Section 9.2) | 8 checks | /8 | |
| Frontend security (Section 9.3) | 4 checks | /4 | |
| Failure log F4 = 0 | Non-negotiable | /1 | |
| M2 readiness gate (Section 11) | 15 checks | /15 | |

### Final Verdict

| Verdict | Condition |
|---|---|
| ✅ **Milestone 1 Complete** | F4 = 0, all phase gates ✅, deployed and live |
| ⚠️ **Conditional Pass** | F4 = 0, ≥ 80% of other checks pass, known gaps documented |
| ❌ **Not Ready** | F4 > 0, or any phase gate fails, or app not deployed |
