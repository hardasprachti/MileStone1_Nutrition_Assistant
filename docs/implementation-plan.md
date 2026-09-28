# Phase-Wise Implementation Plan
## AI Nutrition Assistant — Milestone 1

> **Goal:** Ship a working chat prototype with structured LLM output, server-side scope enforcement,
> and an empty sources panel ready for Milestone 2's RAG layer.
>
> **Total Phases:** 7 | **Estimated Time:** 3–5 days

---

## Quick Reference — Phase Map

```
Phase 1          Phase 2           Phase 3          Phase 4
Project Setup ──▶ Backend Core ──▶ Response Schema ──▶ Scope Guard
                                                          │
                                                          ▼
Phase 7          Phase 6           Phase 5
Deploy & Log ◀── Integration  ◀── Frontend
```

---

## Phase 1 — Project Setup & Scaffolding

**Objective:** Get a running Next.js app with the correct folder structure, dependencies, and environment wiring.

### 1.1 Initialize the Project

```bash
npx create-next-app@latest nutrition-assistant \
  --typescript --eslint --app --no-tailwind --src-dir=false

cd nutrition-assistant
```

### 1.2 Install Dependencies

```bash
# Schema validation
npm install zod

# LLM SDK — Groq (OpenAI-compatible chat completions API)
npm install groq-sdk

# Optional: UUID for session IDs
npm install uuid
npm install -D @types/uuid
```

### 1.3 Create the Directory Structure

```bash
mkdir -p lib components tests docs
```

Create the following empty files to lock in the contract early:

| File | Purpose |
|---|---|
| `lib/schema.ts` | Zod response schema |
| `lib/scopeGuard.ts` | Blocked topic patterns |
| `lib/systemPrompt.ts` | System prompt string |
| `lib/llm.ts` | LLM client (server-only) |
| `lib/conversationStore.ts` | In-memory session store |
| `app/api/chat/route.ts` | POST /api/chat endpoint |
| `tests/questions.ts` | Fixed 10-question suite |

### 1.4 Environment Setup

Create `.env.local` (never commit):
```bash
GROQ_API_KEY=your_key_here
LLM_MODEL=openai/gpt-oss-120b
```

Create `.env.example` (commit this):
```bash
GROQ_API_KEY=
LLM_MODEL=
```

> **Model choice:** `openai/gpt-oss-120b` is Groq's production-tier general model — use it as the
> default. `qwen/qwen3.8-27b` is available as a preview-tier alternative (Groq preview models may
> be discontinued without notice, so don't rely on it for anything long-lived). Both speak the same
> OpenAI-style chat completions API, so switching between them is just an env var change.

### 1.5 Verify Scaffold

```bash
npm run dev
# Expected: Next.js app running at http://localhost:3000
```

**Exit criteria for Phase 1:**
- [x] `npm run dev` runs without errors
- [x] Folder structure matches architecture spec
- [x] `.env.local` present, `.env.example` committed

---

## Phase 2 — Backend Core

**Objective:** Build the server-side plumbing: conversation store, LLM wrapper, and the chat endpoint skeleton.

### 2.1 Conversation Store

```typescript
// lib/conversationStore.ts
export type Message = { role: "user" | "assistant"; content: string };

const store = new Map<string, Message[]>();

export function getHistory(sessionId: string): Message[] {
  return store.get(sessionId) ?? [];
}

export function appendTurn(
  sessionId: string,
  role: "user" | "assistant",
  content: string
) {
  const history = getHistory(sessionId);
  store.set(sessionId, [...history, { role, content }]);
}
```

> **Note:** This is an in-memory store. It resets on server restart — acceptable for M1.
> The interface is intentionally minimal so M2 can swap in PostgreSQL without touching the handler.

### 2.2 LLM Client Wrapper

```typescript
// lib/llm.ts
// THIS FILE MUST ONLY BE IMPORTED IN SERVER COMPONENTS / API ROUTES
import Groq from "groq-sdk";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY! });

export async function callLLM(messages: { role: string; content: string }[]): Promise<string> {
  // Groq's chat completions API is OpenAI-compatible — messages (including
  // the system prompt) are passed straight through in order, no reshaping.
  const completion = await client.chat.completions.create({
    model: process.env.LLM_MODEL ?? "openai/gpt-oss-120b",
    messages,
    response_format: { type: "json_object" },
  });

  return completion.choices[0]?.message?.content ?? "";
}
```

### 2.3 Chat Endpoint Skeleton

```typescript
// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { sessionId, message } = body;

  if (!sessionId || !message) {
    return NextResponse.json({ error: "sessionId and message are required." }, { status: 400 });
  }

  // Phases 3, 4, and onwards wire in here
  return NextResponse.json({ status: "ok — wiring in progress" });
}
```

**Exit criteria for Phase 2:**
- [x] `POST /api/chat` returns `200` for valid bodies
- [x] `POST /api/chat` returns `400` for missing fields
- [x] `callLLM()` can reach the LLM API with a test call from a scratch script
- [x] `getHistory` / `appendTurn` work correctly (unit-testable in isolation)

---

## Phase 3 — Response Schema & Validation

**Objective:** Define the structured output contract and enforce it with a hard parse failure on mismatch.

### 3.1 Define the Zod Schema

```typescript
// lib/schema.ts
import { z } from "zod";

export const ClaimSchema = z.object({
  claim_text: z.string().min(1),
  source: z.null(),            // always null in M1; M2 replaces this type
});

export const ResponseSchema = z.object({
  answer: z.string().min(1),
  claims: z.array(ClaimSchema),
});

export type NutritionResponse = z.infer<typeof ResponseSchema>;

export function parseResponse(raw: string): NutritionResponse {
  const parsed = JSON.parse(raw);           // throws SyntaxError if not JSON
  return ResponseSchema.parse(parsed);      // throws ZodError if schema mismatch
}
```

### 3.2 Wire Validation into the Endpoint

```typescript
// app/api/chat/route.ts  (updated)
import { parseResponse } from "@/lib/schema";

// inside POST handler, after LLM call:
let structured;
try {
  structured = parseResponse(rawLLMOutput);
} catch (err) {
  console.error("Schema parse failure:", err);
  return NextResponse.json(
    { error: "Response did not match expected schema.", details: String(err) },
    { status: 500 }
  );
}
```

### 3.3 Test the Schema

Manually verify with a unit test:

```typescript
// tests/schema.test.ts
import { parseResponse } from "@/lib/schema";

const valid = JSON.stringify({
  answer: "Spinach is rich in vitamin K.",
  claims: [{ claim_text: "Spinach contains vitamin K.", source: null }],
});

const invalid = JSON.stringify({ answer: "yes" }); // missing claims

console.assert(parseResponse(valid).answer.length > 0, "valid passes");
try { parseResponse(invalid); console.error("FAIL: should have thrown"); }
catch { console.log("PASS: invalid correctly rejected"); }
```

**Exit criteria for Phase 3:**
- [x] Valid JSON matching schema returns parsed object
- [x] Missing `claims` field throws and returns `500`
- [x] `source` field with a non-null value throws and returns `500`
- [x] Non-JSON LLM output throws and returns `500`

---

## Phase 4 — Scope Guard

**Objective:** Block forbidden topics in code before the request ever reaches the LLM.

### 4.1 Implement the Guard

```typescript
// lib/scopeGuard.ts

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
  /bmi/i,

  // Medical advice
  /medical\s+advice/i,
  /diagnos(e|is)/i,
  /treat(ment|ing|ed)?/i,
  /prescri(be|ption)/i,
  /is\s+this\s+(a\s+)?symptom/i,
  /do\s+i\s+have/i,
];

const DECLINE_RESPONSE = {
  answer:
    "I can't help with calorie targets, weight goals, or medical advice. " +
    "For personalised guidance, please consult a registered dietitian or your doctor.",
  claims: [],
};

export function checkScope(message: string): typeof DECLINE_RESPONSE | null {
  const blocked = BLOCKED_PATTERNS.some((p) => p.test(message));
  return blocked ? DECLINE_RESPONSE : null;
}
```

### 4.2 Wire into the Endpoint

```typescript
// app/api/chat/route.ts  (updated)
import { checkScope } from "@/lib/scopeGuard";

// inside POST handler, before LLM call:
const blocked = checkScope(message);
if (blocked) {
  return NextResponse.json(blocked, { status: 200 });
}
```

### 4.3 Test the Guard

Use this fixed set to validate both blocking and passing:

| Message | Expected |
|---|---|
| `"How many calories should I eat?"` | Declined |
| `"I want to lose weight fast"` | Declined |
| `"What is my ideal BMI?"` | Declined |
| `"Diagnose my iron deficiency"` | Declined |
| `"What vitamins are in spinach?"` | Passes to LLM |
| `"How long can I store raw chicken?"` | Passes to LLM |

**Exit criteria for Phase 4:**
- [x] All 4 forbidden categories blocked in code
- [x] Passing messages reach the LLM unaffected
- [x] Decline response conforms to ResponseSchema shape

---

## Phase 5 — Frontend

**Objective:** Build the 3-panel chat UI with the sources panel present but empty.

### 5.1 Types

```typescript
// types/index.ts
export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  claims?: Array<{ claim_text: string; source: null }>;
};
```

### 5.2 Component Build Order

Build components in this order (each depends on the previous):

```
1. InputBox          ← no dependencies
2. MessageBubble     ← uses Message type
3. MessageList       ← uses MessageBubble
4. SourcesPanel      ← empty shell; accepts claims prop
5. ChatShell         ← assembles all above + manages state
```

### 5.3 ChatShell — State & API Call

```typescript
// components/ChatShell.tsx  (key logic)
const [messages, setMessages] = useState<Message[]>([]);
const [sessionId] = useState(() => crypto.randomUUID());

async function sendMessage(text: string) {
  // 1. Optimistically add user message
  setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "user", content: text }]);

  // 2. Call server endpoint
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, message: text }),
  });

  const data = await res.json();

  // 3. Append assistant response
  setMessages((prev) => [
    ...prev,
    {
      id: crypto.randomUUID(),
      role: "assistant",
      content: data.answer,
      claims: data.claims,
    },
  ]);
}
```

### 5.4 Layout Specification

```
┌─────────────────────────────────────────────────────────────────┐
│  🥗 Nutrition Assistant                             [header]    │
├──────────────────────────────────┬──────────────────────────────┤
│  MESSAGE LIST (flex-col)         │  SOURCES PANEL               │
│  scrollable, flex-grow           │  fixed width ~280px          │
│                                  │  empty in M1                 │
│  User bubble  ────────────────▶  │  label: "Sources"            │
│            ◀──── Assistant bubble│  sub-label: "Available in    │
│  ...                             │  Milestone 2"                │
│                                  │                              │
├──────────────────────────────────┴──────────────────────────────┤
│  [ Ask about food, nutrition, or food safety...  ]   [Send ▶]  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.5 CSS Design Tokens

```css
/* app/globals.css */
:root {
  --color-bg:         #0f1117;
  --color-surface:    #1a1d27;
  --color-border:     #2a2d3a;
  --color-accent:     #4ade80;     /* green — nutrition theme */
  --color-accent-dim: #16a34a;
  --color-text:       #e2e8f0;
  --color-text-muted: #64748b;
  --color-user-bubble:      #1e3a5f;
  --color-assistant-bubble: #1a1d27;
  --radius:    12px;
  --radius-sm: 6px;
}
```

**Exit criteria for Phase 5:**
- [x] Messages render in correct order with correct bubble alignment
- [x] Sources panel renders (empty, with placeholder text)
- [x] Input clears after send
- [x] No LLM API keys visible in browser dev tools / network tab

---

## Phase 6 — Full Integration

**Objective:** Connect all layers end-to-end and run the complete request lifecycle.

### 6.1 Complete the Chat Endpoint

```typescript
// app/api/chat/route.ts  — final version
import { NextRequest, NextResponse } from "next/server";
import { checkScope }         from "@/lib/scopeGuard";
import { getHistory, appendTurn } from "@/lib/conversationStore";
import { SYSTEM_PROMPT }      from "@/lib/systemPrompt";
import { callLLM }            from "@/lib/llm";
import { parseResponse }      from "@/lib/schema";

export async function POST(req: NextRequest) {
  const { sessionId, message } = await req.json();

  if (!sessionId || !message) {
    return NextResponse.json({ error: "sessionId and message are required." }, { status: 400 });
  }

  // 1. Scope Guard
  const blocked = checkScope(message);
  if (blocked) return NextResponse.json(blocked);

  // 2. Load history
  const history = getHistory(sessionId);

  // 3. Build messages
  const messages = [
    { role: "system",    content: SYSTEM_PROMPT },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user",      content: message },
  ];

  // 4. Call LLM
  let rawOutput: string;
  try {
    rawOutput = await callLLM(messages);
  } catch (err) {
    return NextResponse.json({ error: "LLM call failed.", details: String(err) }, { status: 502 });
  }

  // 5. Parse & validate
  let structured;
  try {
    structured = parseResponse(rawOutput);
  } catch (err) {
    return NextResponse.json({ error: "Schema parse failure.", details: String(err) }, { status: 500 });
  }

  // 6. Persist turn
  appendTurn(sessionId, "user", message);
  appendTurn(sessionId, "assistant", structured.answer);

  // 7. Return
  return NextResponse.json(structured);
}
```

### 6.2 Integration Checklist

Run through this sequence manually:

| Step | Action | Expected result |
|---|---|---|
| 1 | Send a nutrition question | Structured JSON response with claims |
| 2 | Send a follow-up | Second turn uses conversation history |
| 3 | Send a calorie question | Decline response, no LLM call |
| 4 | Send a medical question | Decline response, no LLM call |
| 5 | Force schema error (mock bad LLM) | `500` with error details |
| 6 | Check browser Network tab | No API key visible in any request |

**Exit criteria for Phase 6:**
- [x] Full round-trip works: browser → API → LLM → parsed response → browser
- [x] Conversation history carries across multiple turns
- [x] Scope guard fires before any LLM token is spent
- [x] API key is never sent to the browser

---

## Phase 7 — Testing, Failure Log & Deployment

**Objective:** Run the fixed question suite, document failures, and ship to Vercel + Railway.

### 7.1 The Fixed 10-Question Suite

```typescript
// tests/questions.ts
export const QUESTIONS = [
  // Nutrient requirements
  { id: 1, category: "nutrients",    q: "How much iron does an adult woman need per day?" },
  { id: 2, category: "nutrients",    q: "What is the recommended daily vitamin D intake for adults?" },
  { id: 3, category: "nutrients",    q: "How much protein does a vegetarian adult need?" },

  // Food safety and storage
  { id: 4, category: "food-safety",  q: "How long can cooked chicken stay in the fridge?" },
  { id: 5, category: "food-safety",  q: "At what temperature should beef be cooked to be safe?" },
  { id: 6, category: "food-safety",  q: "Is it safe to refreeze meat that has been thawed?" },

  // Cooking methods
  { id: 7, category: "cooking",      q: "Does boiling vegetables destroy their nutrients?" },
  { id: 8, category: "cooking",      q: "What is the healthiest way to cook fish?" },

  // No clear answer
  { id: 9,  category: "unclear",     q: "Is coffee good or bad for your health?" },
  { id: 10, category: "unclear",     q: "Are eggs healthy to eat every day?" },
];
```

### 7.2 Run the Suite

After every system prompt change:
1. Clear conversation store (restart dev server)
2. Send all 10 questions fresh (new session each)
3. Record results in `docs/failureLog.md`

### 7.3 Failure Log Template

```markdown
## Run — [date] — Prompt version: [v1 / v2 / ...]

| # | Category | Question | Failure Type | Notes |
|---|---|---|---|---|
| 1 | nutrients | How much iron does an adult woman need? | | |
| 2 | nutrients | Vitamin D recommendation? | | |
| 3 | nutrients | Vegetarian protein needs? | | |
| 4 | food-safety | Cooked chicken in fridge? | | |
| 5 | food-safety | Safe beef cooking temp? | | |
| 6 | food-safety | Refreeze thawed meat? | | |
| 7 | cooking | Boiling destroys nutrients? | | |
| 8 | cooking | Healthiest way to cook fish? | | |
| 9 | unclear | Coffee good or bad? | | |
| 10 | unclear | Eggs every day? | | |

### Failure summary
| Type | Count |
|---|---|
| Unsubstantiated facts | |
| Shifting numbers | |
| Phantom sources | |
| Should have declined | |
| Hedged into uselessness | |
```

### 7.4 Deployment

**Vercel (Frontend + API Routes)**

```bash
# Install Vercel CLI
npm install -g vercel

# Push to GitHub first
git init && git add . && git commit -m "feat: milestone 1 complete"
git remote add origin https://github.com/<you>/nutrition-assistant.git
git push -u origin main

# Deploy
vercel --prod
# Set env vars in Vercel dashboard: GROQ_API_KEY, LLM_MODEL
```

**Railway (if using persistent backend)**

```bash
# Install Railway CLI
npm install -g @railway/cli
railway login
railway init
railway up
# Set env vars in Railway dashboard
```

**Post-deploy smoke test:**

| Check | Pass |
|---|---|
| App loads at Vercel URL | [ ] |
| Chat message gets a response | [ ] |
| Calorie question gets declined | [ ] |
| API key not visible in Network tab | [ ] |
| Sources panel visible but empty | [ ] |

**Exit criteria for Phase 7:**
- [ ] All 10 questions run and logged
- [ ] Failures grouped and counted
- [ ] App live on Vercel
- [ ] No secrets exposed in browser

---

## Summary — Phase Exit Criteria

| Phase | Deliverable | Done |
|---|---|---|
| 1 — Setup | Next.js running, structure in place, env wired | [x] |
| 2 — Backend Core | `/api/chat` skeleton, store, LLM wrapper | [x] |
| 3 — Schema | Zod contract enforced, hard-fail on mismatch | [x] |
| 4 — Scope Guard | 3 topic categories blocked in code | [x] |
| 5 — Frontend | 3-panel UI, sources panel present | [x] |
| 6 — Integration | Full end-to-end round-trip working | [x] |
| 7 — Test & Deploy | 10 questions logged, live on Vercel | [ ] |

---

## Milestone 2 Readiness Checklist

Before closing Milestone 1, confirm these contracts are frozen:

- [ ] `POST /api/chat` request shape unchanged (`sessionId`, `message`)
- [ ] Response shape unchanged (`answer`, `claims[]` with `claim_text` + `source`)
- [ ] `SourcesPanel` component accepts a `claims` prop (even if unused)
- [ ] `ClaimSchema` uses `z.null()` for `source` — M2 changes this to a citation object
- [ ] Conversation store interface (`getHistory`, `appendTurn`) is behind an abstraction
