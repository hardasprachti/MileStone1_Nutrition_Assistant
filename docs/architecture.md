# Architecture — AI Nutrition Assistant (Milestone 1)

> **Scope:** Milestone 1 is a fully functional chat prototype backed by an LLM with no retrieval layer.
> The interface, endpoints, and response schema are intentionally built to accept Milestone 2's RAG drop-in without any structural changes.

---

## 1. High-Level System Overview

```
┌─────────────────────────────────────────────────────────┐
│                       BROWSER                           │
│                                                         │
│  ┌──────────────┐   ┌────────────┐   ┌───────────────┐  │
│  │  Message     │   │  Input     │   │  Sources      │  │
│  │  List        │   │  Box       │   │  Panel        │  │
│  │              │   │            │   │  (empty M1)   │  │
│  └──────────────┘   └────────────┘   └───────────────┘  │
│           │                │                            │
│           └────────────────┘                            │
│                    │  HTTP POST /api/chat               │
└────────────────────┼────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                    SERVER  (Railway)                     │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Scope Guard (code layer)             │  │
│  │   blocks: calorie targets · weight · medical Rx   │  │
│  └────────────────────┬──────────────────────────────┘  │
│                       │                                 │
│  ┌────────────────────▼──────────────────────────────┐  │
│  │              Chat Handler                         │  │
│  │  1. load conversation history                     │  │
│  │  2. build prompt (system + history + user msg)    │  │
│  │  3. call LLM                                      │  │
│  │  4. parse & validate response schema              │  │
│  │  5. persist new turn                              │  │
│  │  6. return structured JSON                        │  │
│  └────────────────────┬──────────────────────────────┘  │
│                       │                                 │
│         ┌─────────────┴──────────────┐                  │
│         │                            │                  │
│  ┌──────▼──────┐            ┌────────▼──────┐           │
│  │  LLM API    │            │  Conversation │           │
│  │  (server)   │            │  Store        │           │
│  └─────────────┘            └───────────────┘           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Technology Choices

| Layer | Technology | Reason |
|---|---|---|
| **Frontend** | Next.js (React) | SSR + API routes in one repo; easy Vercel deploy |
| **Backend API** | Next.js API Routes | Same repo, no separate Express server needed |
| **LLM** | Google Gemini / OpenAI GPT-4o | Structured output support (JSON mode) |
| **Conversation Store** | In-memory (Map) → PostgreSQL (upgrade path) | Simple for M1; Railway Postgres ready for M2 |
| **Frontend Styling** | Vanilla CSS + CSS Variables | No framework overhead; full design control |
| **Frontend Deploy** | Vercel | Zero-config Next.js hosting |
| **Backend Deploy** | Railway | Persistent server environment for API keys |
| **Schema Validation** | Zod | Runtime parse + type safety; hard fail on mismatch |

---

## 3. Directory Structure

```
nutrition-assistant/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout, fonts, metadata
│   ├── page.tsx                  # Home — renders <ChatShell />
│   └── api/
│       └── chat/
│           └── route.ts          # POST /api/chat  ← main endpoint
│
├── components/
│   ├── ChatShell.tsx             # Top-level layout (3-panel)
│   ├── MessageList.tsx           # Conversation history display
│   ├── MessageBubble.tsx         # Single message (user / assistant)
│   ├── InputBox.tsx              # Textarea + send button
│   └── SourcesPanel.tsx          # Empty in M1; filled in M2
│
├── lib/
│   ├── schema.ts                 # Zod response schema definition
│   ├── scopeGuard.ts             # Code-level topic block list
│   ├── systemPrompt.ts           # System prompt constant
│   ├── llm.ts                    # LLM client wrapper (server only)
│   └── conversationStore.ts      # In-memory session store
│
├── docs/
│   ├── problemStatement.md       # Project brief
│   ├── architecture.md           # This file
│   └── failureLog.md             # Populated after test runs
│
├── tests/
│   └── questions.ts              # Fixed 10-question test suite
│
├── .env.local                    # API keys (never committed)
├── .env.example                  # Safe key names to commit
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## 4. API Contract

### `POST /api/chat`

**Request body:**
```json
{
  "sessionId": "abc-123",
  "message": "What vitamins are in spinach?"
}
```

**Success response `200`:**
```json
{
  "answer": "Spinach is rich in vitamin K, vitamin A (as beta-carotene), folate, and vitamin C.",
  "claims": [
    { "claim_text": "Spinach contains vitamin K.", "source": null },
    { "claim_text": "Spinach contains vitamin A as beta-carotene.", "source": null },
    { "claim_text": "Spinach contains folate.", "source": null },
    { "claim_text": "Spinach contains vitamin C.", "source": null }
  ]
}
```

**Declined response `200`** (scope guard triggered):
```json
{
  "answer": "I can't provide calorie targets or weight recommendations. Please consult a registered dietitian or your doctor.",
  "claims": []
}
```

**Schema parse failure `500`:**
```json
{
  "error": "Response did not match expected schema.",
  "details": "..."
}
```

---

## 5. Response Schema (Zod)

```typescript
// lib/schema.ts
import { z } from "zod";

export const ClaimSchema = z.object({
  claim_text: z.string(),
  source: z.null(),          // always null in M1; M2 fills this in
});

export const ResponseSchema = z.object({
  answer: z.string(),
  claims: z.array(ClaimSchema),
});

export type NutritionResponse = z.infer<typeof ResponseSchema>;
```

> **Hard rule:** If `ResponseSchema.parse()` throws, the endpoint returns a `500`.
> Do not return raw prose or silently swallow parse errors.

---

## 6. Scope Guard

The scope guard runs **before** the LLM call. If a forbidden topic is detected, the request never reaches the model.

```typescript
// lib/scopeGuard.ts

const BLOCKED_PATTERNS = [
  /calorie[s]?\s*(target|goal|limit|deficit|intake)/i,
  /how\s+many\s+calories/i,
  /lose\s+weight/i,
  /gain\s+weight/i,
  /bmi/i,
  /ideal\s+weight/i,
  /should\s+i\s+weigh/i,
  /medical\s+advice/i,
  /diagnos(e|is)/i,
  /treat(ment|ing)?/i,
  /prescri(be|ption)/i,
];

export function isBlocked(message: string): boolean {
  return BLOCKED_PATTERNS.some((pattern) => pattern.test(message));
}
```

**Layered enforcement:**

```
User message
      │
      ▼
 ┌──────────────┐    YES    ┌─────────────────────────────────┐
 │ Scope Guard  │ ─────────▶│ Return decline message (no LLM) │
 │ (code layer) │           └─────────────────────────────────┘
 └──────┬───────┘
        │ NO
        ▼
 ┌──────────────┐
 │ System Prompt│  (secondary line of defence)
 │ (prompt layer│
 └──────┬───────┘
        │
        ▼
     LLM Call
```

---

## 7. System Prompt

```
You are a nutrition assistant. You help people understand food, nutrients, cooking methods, and food safety.

Rules:
1. Answer only questions about food, nutrition, cooking, and food safety.
2. Keep answers concise — 3 to 5 sentences unless more depth is clearly needed.
3. Break factual claims into separate, discrete statements.
4. Do NOT provide calorie targets, weight-loss plans, weight recommendations, or medical advice.
5. If asked about any of the above, decline politely and direct the user to a registered dietitian or doctor.
6. Do not speculate about individual health conditions.
7. Return your response as valid JSON matching the schema provided.

Response format (strict JSON — no markdown, no prose wrapper):
{
  "answer": "<your answer here>",
  "claims": [
    { "claim_text": "<one factual claim>", "source": null },
    ...
  ]
}
```

---

## 8. Conversation Store

In Milestone 1, conversation history is kept in server memory using a `Map` keyed by `sessionId`.

```typescript
// lib/conversationStore.ts
import { Message } from "@/types";

const store = new Map<string, Message[]>();

export function getHistory(sessionId: string): Message[] {
  return store.get(sessionId) ?? [];
}

export function appendTurn(sessionId: string, role: "user" | "assistant", content: string) {
  const history = getHistory(sessionId);
  store.set(sessionId, [...history, { role, content }]);
}
```

> **M2 upgrade path:** Swap `conversationStore.ts` internals to PostgreSQL (via Railway).
> The handler code doesn't change — only the store implementation.

---

## 9. Chat Handler Flow

```
POST /api/chat
      │
      ├─1─▶ Validate request body (sessionId, message present)
      │
      ├─2─▶ Run Scope Guard  →  if blocked, return decline response
      │
      ├─3─▶ Load conversation history from store
      │
      ├─4─▶ Build messages array:
      │       [ system prompt, ...history, { role: "user", content: message } ]
      │
      ├─5─▶ Call LLM (server-side, API key from env)
      │       - Request JSON mode / structured output
      │
      ├─6─▶ Parse LLM output string as JSON
      │
      ├─7─▶ Validate against ResponseSchema (Zod)
      │       - On failure → 500 with error details
      │
      ├─8─▶ Persist user turn + assistant turn to store
      │
      └─9─▶ Return ResponseSchema-valid JSON to client
```

---

## 10. Frontend Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  🥗  Nutrition Assistant                              [header]  │
├──────────────────────────────────┬──────────────────────────────┤
│                                  │                              │
│        MESSAGE LIST              │       SOURCES PANEL          │
│                                  │                              │
│  ┌────────────────────────────┐  │   (empty in Milestone 1)    │
│  │ 👤 User message            │  │                              │
│  └────────────────────────────┘  │   Milestone 2 fills this     │
│  ┌────────────────────────────┐  │   with cited sources per     │
│  │ 🤖 Assistant answer        │  │   claim.                     │
│  │    • claim 1               │  │                              │
│  │    • claim 2               │  │                              │
│  └────────────────────────────┘  │                              │
│                                  │                              │
├──────────────────────────────────┴──────────────────────────────┤
│  [ Type a question about food or nutrition...        ] [Send]   │
└─────────────────────────────────────────────────────────────────┘
```

**Component tree:**
```
<ChatShell>
  ├── <MessageList>
  │     └── <MessageBubble> (×n)
  ├── <SourcesPanel>          ← rendered but empty in M1
  └── <InputBox>
```

---

## 11. Environment Variables

| Variable | Used By | Description |
|---|---|---|
| `LLM_API_KEY` | `lib/llm.ts` | API key for the LLM provider |
| `LLM_MODEL` | `lib/llm.ts` | Model name (e.g. `gemini-2.0-flash`) |
| `SESSION_SECRET` | `lib/conversationStore.ts` | Optional: sign session IDs |

> **Never expose `LLM_API_KEY` to the browser.** All LLM calls go through `/api/chat`.

---

## 12. Deployment Architecture

```
GitHub Repository
      │
      ├──▶ Vercel  (Frontend + API Routes)
      │     - Auto-deploys on push to main
      │     - Env vars set in Vercel dashboard
      │
      └──▶ Railway  (if splitting backend)
            - Persistent Node server
            - PostgreSQL addon ready for M2
            - Env vars set in Railway dashboard
```

> For Milestone 1, a single Vercel deployment of the Next.js app is sufficient.
> Railway becomes relevant when a persistent server (for the conversation store) is needed.

---

## 13. Milestone 2 Extension Points

Every decision in Milestone 1 was made to make this list of changes trivial:

| What changes in M2 | Where it lives | What stays the same |
|---|---|---|
| `source` goes from `null` to a citation object | `lib/schema.ts` — update `ClaimSchema` | API endpoint URL |
| RAG retrieval added before LLM call | New `lib/retriever.ts` | Request/response shape |
| Sources panel populated | `SourcesPanel.tsx` | All other components |
| Conversation store → PostgreSQL | `lib/conversationStore.ts` internals | Store interface |
| Vector DB added | New service in Railway | Frontend untouched |

---

## 14. Failure Log Methodology

After each system prompt change, run the fixed 10-question suite and fill in `docs/failureLog.md`:

| # | Category | Question | Failure Type | Notes |
|---|---|---|---|---|
| 1 | Nutrient requirements | How much iron does an adult woman need? | Shifting numbers | Run 1: 18mg, Run 2: 15mg |
| 2 | Food safety | How long can cooked chicken stay in the fridge? | Unsubstantiated facts | No source; varies by authority |
| 3 | Cooking methods | Does boiling destroy vitamin C? | — | Correct, consistent |
| 4 | No clear answer | Is coffee good or bad for you? | Hedged into uselessness | Non-answer |
| ... | | | | |

> Track failures per category. If one category dominates, refine the system prompt for that domain first.
