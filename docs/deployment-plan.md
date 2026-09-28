# Deployment Plan
## AI Nutrition Assistant — Milestone 1

> **Goal:** Ship the current codebase (backend API routes + the latest reskinned frontend) as two
> independent, fully-functional live deployments — one on **Vercel**, one on **Railway** — per the
> project brief's "deploy using Vercel, Railway" requirement.
>
> **Total Phases:** 7 | **Estimated Time:** 1–2 hours (first deploy), ~5 min per redeploy after

---

## Architecture Note — Why Two *Independent* Full Deployments

This is a single Next.js app (App Router) with the frontend pages and the `/api/chat` route living in
the same codebase and the same build. There is no separate backend service to split out.

Per `docs/architecture.md` §12 and `docs/problemStatement.md` §6, both platforms are expected as
deploy targets for the **same app**, not a frontend/backend split:

```
GitHub repo (nutrition-assistant/)
        │
        ├──▶ Vercel   — full app (frontend + /api/chat), serverless functions
        │
        └──▶ Railway  — full app (frontend + /api/chat), one persistent Node process
```

Each deployment is self-contained: its own build, its own env vars, its own in-memory
`conversationStore`. They do **not** talk to each other and do not share conversation state — that's
expected for M1 (see Known Limitations, Phase 6).

If a true frontend/backend split (Vercel serving only pages, calling a separate Railway API
cross-origin) is wanted later, that requires code changes — a configurable API base URL on the
client and CORS headers on the route — and is **out of scope for this plan**. Flag it separately if
you want it.

---

## Quick Reference — Phase Map

```
Phase 1            Phase 2          Phase 3           Phase 4
Pre-Deploy Prep ──▶ Push to GitHub ──▶ Deploy: Vercel ──▶ Deploy: Railway
                                                              │
                                                              ▼
Phase 7             Phase 6              Phase 5
Ongoing Redeploys ◀── Smoke Test Both ◀── Env Var Reference
```

---

## Phase 1 — Pre-Deployment Prep

**Objective:** Make sure what's about to ship actually builds, and that the repo is clean enough to push.

### 1.1 Current Repo State (checked before writing this plan)

| Item | Status |
|---|---|
| Git repo | Exists at `nutrition-assistant/` (own `.git`, branch `master`) |
| Commits | 1 — `"Initial commit from Create Next App"` |
| Remote | **None configured** — needs `git remote add origin ...` |
| Uncommitted work | Header/ChatShell/globals.css reskin, SourcesPanel updates, `docs/implementation-plan.md` checkbox updates — all still in the working tree |
| `.env.local` | Present, correctly git-ignored |
| `.env.example` | Present, but **currently git-ignored by mistake** (see 1.2) |

### 1.2 Fix `.gitignore` so `.env.example` can be committed

`nutrition-assistant/.gitignore` has:
```
# env files (can opt-in for committing if needed)
.env*
...
# local env
.env.local
```

`.env*` matches `.env.example` too, so it never gets tracked — but `.env.example` is meant to be
committed (it's the documented list of required env vars, referenced in `docs/architecture.md`).
Fix it to exclude only the real secrets file:

```diff
- # env files (can opt-in for committing if needed)
- .env*
+ # env files — keep the template, ignore anything with real secrets
+ .env.local
+ .env*.local
```

### 1.3 Verify the build locally

```bash
cd nutrition-assistant
npm install
npm run lint
npm run build
```

Both must exit 0 before touching any deploy platform. `npm run build` is exactly what Vercel and
Railway will run — if it fails locally, it fails in CI too.

### 1.4 Node version

Next.js 16 needs a current Node LTS. Pin it explicitly so both platforms use the same version you
built/tested with:

```bash
node -v   # confirm locally, e.g. v20.x
```

Add to `package.json` if not already present:
```json
"engines": { "node": ">=20" }
```

**Exit criteria for Phase 1:**
- [ ] `.gitignore` fixed so `.env.example` is trackable
- [ ] `npm run lint` passes
- [ ] `npm run build` passes locally
- [ ] Node version pinned via `engines` in `package.json`

---

## Phase 2 — Push to GitHub

**Objective:** Get the current working tree (reskin + doc updates) onto a GitHub remote — both
Vercel and Railway deploy from here.

### 2.1 Commit the pending work

```bash
cd nutrition-assistant
git add .
git status   # review — confirm no .env.local, no node_modules, no .next
git commit -m "feat: reskin frontend to Vitalis AI design system, complete Phase 5/6"
```

### 2.2 Create the GitHub repo and push

```bash
# via GitHub CLI
gh repo create nutrition-assistant --private --source=. --remote=origin

# or manually: create the repo on github.com, then
git remote add origin https://github.com/<you>/nutrition-assistant.git
git branch -M main
git push -u origin main
```

> Keep it **private** unless there's a reason to make it public — the repo doesn't contain secrets
> (`.env.local` is git-ignored), but there's no need to expose it either.

**Exit criteria for Phase 2:**
- [ ] All pending changes committed
- [ ] `git status` clean
- [ ] Remote `origin` set, pushed to GitHub
- [ ] Repo browsable on GitHub with the latest frontend visible in `components/`

---

## Phase 3 — Deploy to Vercel

**Objective:** Get the full app (frontend + `/api/chat`) live on Vercel as serverless functions.

### 3.1 Connect the project

**Dashboard (recommended for first deploy):**
1. [vercel.com/new](https://vercel.com/new) → Import Git Repository → select `nutrition-assistant`.
2. Framework preset: Vercel auto-detects **Next.js** — leave build command (`next build`) and
   output settings as default.
3. Root Directory: leave as `.` (the repo root **is** `nutrition-assistant/` — there's no nested
   monorepo folder to point at, since the app has its own git repo).

**Or via CLI:**
```bash
npm install -g vercel
cd nutrition-assistant
vercel login
vercel link
vercel --prod
```

### 3.2 Set environment variables

In Project Settings → Environment Variables (apply to Production, and Preview if you want PR
previews to work too):

| Key | Value |
|---|---|
| `GROQ_API_KEY` | your Groq API key |
| `LLM_MODEL` | `openai/gpt-oss-120b` |

Redeploy after adding env vars (Vercel doesn't hot-reload them into an already-built deployment).

### 3.3 Deploy & verify

```bash
vercel --prod
```

Open the resulting `*.vercel.app` URL and confirm:
- [ ] Page loads, styling matches the current reskin (header nav, scope bar, footer all present)
- [ ] Sending a nutrition question returns a real answer with claims
- [ ] Sending a calorie/weight question gets declined
- [ ] Network tab: no `GROQ_API_KEY` visible in any request/response

**Exit criteria for Phase 3:**
- [ ] Vercel deployment live at a public URL
- [ ] Env vars set for Production
- [ ] Manual smoke test (above) passes

---

## Phase 4 — Deploy to Railway

**Objective:** Get the same full app live on Railway as a persistent Node process.

### 4.1 Connect the project

**Dashboard (recommended for first deploy):**
1. [railway.app/new](https://railway.app/new) → Deploy from GitHub repo → select `nutrition-assistant`.
2. Railway's Nixpacks builder auto-detects Next.js and runs `npm install && npm run build`, then
   `npm run start` (which is `next start`) — no Dockerfile needed.
3. Root Directory: leave as `/` (same reasoning as Vercel — the repo root is the app root).

**Or via CLI:**
```bash
npm install -g @railway/cli
cd nutrition-assistant
railway login
railway init
railway up
```

### 4.2 Set environment variables

In the Railway service → Variables tab:

| Key | Value |
|---|---|
| `GROQ_API_KEY` | your Groq API key |
| `LLM_MODEL` | `openai/gpt-oss-120b` |

Railway injects `PORT` automatically — `next start` already reads `process.env.PORT` on its own,
so no start-script change is needed. Confirm this in the deploy logs (Next.js prints the bound
port on boot).

### 4.3 Deploy & verify

Railway auto-deploys on push once connected. Generate a public domain under
Settings → Networking → "Generate Domain" if one isn't assigned automatically, then run the same
checklist as 3.3 against the Railway URL:

- [ ] Page loads, styling matches the current reskin
- [ ] Sending a nutrition question returns a real answer with claims
- [ ] Sending a calorie/weight question gets declined
- [ ] Network tab: no `GROQ_API_KEY` visible in any request/response

**Exit criteria for Phase 4:**
- [ ] Railway deployment live at a public URL
- [ ] Env vars set
- [ ] Manual smoke test (above) passes

---

## Phase 5 — Environment Variable Reference

One table, both platforms need the same two keys:

| Variable | Required | Notes |
|---|---|---|
| `GROQ_API_KEY` | Yes | Server-only. Never exposed to the browser — used exclusively in `lib/llm.ts`. |
| `LLM_MODEL` | Yes | `openai/gpt-oss-120b` (production tier). Falls back to this value in code if unset, but set it explicitly for clarity. |
| `SESSION_SECRET` | No | Listed in `docs/architecture.md` as a future option for signing session IDs — **not referenced anywhere in the current code**. Skip it. |

> **Never** put `GROQ_API_KEY` in a `NEXT_PUBLIC_*` variable or in any client component — it must
> only be read inside `lib/llm.ts` (server-only, called from `app/api/chat/route.ts`).

---

## Phase 6 — Cross-Platform Smoke Testing & Known Limitations

**Objective:** Confirm both live deployments behave identically, and document what's expected to
differ.

### 6.1 Test matrix (run against both URLs)

| # | Action | Expected on both |
|---|---|---|
| 1 | Load the home page | Latest reskinned UI (header nav, scope bar, chat, sources panel, footer) |
| 2 | Ask "What vitamins are in spinach?" | Structured answer + claims list |
| 3 | Ask a follow-up in the same session | Response reflects prior context |
| 4 | Ask "How many calories should I eat?" | Declined, no LLM call (instant response) |
| 5 | Ask "Diagnose my iron deficiency" | Declined |
| 6 | Refresh the page mid-conversation | Conversation resets (new `sessionId` — expected, no persistence layer yet) |
| 7 | Open DevTools → Network tab while sending a message | No API key in request headers, body, or response |

### 6.2 Known limitations (both platforms, by design for M1)

- **In-memory conversation store** (`lib/conversationStore.ts`) is a process-local `Map`. It resets
  on every redeploy and every server restart. On Railway (one long-running process) it survives
  between requests reliably during normal operation. On Vercel (serverless functions) it *may* reset
  between requests if the function cold-starts on a different instance — multi-turn history is not
  guaranteed to persist there. This is the same limitation `docs/architecture.md` already documents
  for M1; the fix is the Postgres swap planned for M2, and it drops in without touching the handler.
- **Vercel and Railway don't share state.** A conversation started on the Vercel URL is invisible to
  the Railway URL and vice versa — they're two separate live instances of the same app.

**Exit criteria for Phase 6:**
- [ ] Test matrix passes on the Vercel URL
- [ ] Test matrix passes on the Railway URL
- [ ] Both URLs recorded (README or team doc)

---

## Phase 7 — Ongoing Redeploys & Rollback

**Objective:** Know what happens after this first deploy, for every future push.

### 7.1 Auto-deploy behavior

Both platforms are connected to the GitHub repo and redeploy automatically on push to `main`:

```bash
git add .
git commit -m "..."
git push
```

No manual `vercel --prod` / `railway up` needed after the initial link — only run those manually
for one-off deploys from a local branch that isn't pushed yet.

### 7.2 Rollback

- **Vercel:** Deployments tab → pick a previous deployment → "Promote to Production." Instant, no
  rebuild.
- **Railway:** Deployments tab on the service → pick a previous deployment → "Redeploy."

### 7.3 Prompt-change discipline

Per `docs/architecture.md` §14 — any change to `lib/systemPrompt.ts` should be re-run through the
fixed 10-question suite (`tests/questions.ts`) and logged in `docs/failureLog.md` **before** pushing,
since a push here immediately goes live on both platforms.

**Exit criteria for Phase 7:**
- [ ] Confirmed auto-deploy fires on a test push to both platforms
- [ ] Rollback procedure understood by whoever owns deploys

---

## Summary — Phase Exit Criteria

| Phase | Deliverable | Done |
|---|---|---|
| 1 — Pre-Deploy Prep | Build verified, `.gitignore` fixed, Node pinned | [ ] |
| 2 — Push to GitHub | Repo pushed with latest frontend + docs | [ ] |
| 3 — Vercel Deploy | Live, env vars set, smoke test passed | [ ] |
| 4 — Railway Deploy | Live, env vars set, smoke test passed | [ ] |
| 5 — Env Var Reference | Documented, no secrets leaked | [x] |
| 6 — Cross-Platform Test | Both URLs verified against same test matrix | [ ] |
| 7 — Ongoing Redeploys | Auto-deploy + rollback confirmed | [ ] |

---

## Post-Deploy Smoke Test (paste into PR/handoff notes once done)

| Check | Vercel | Railway |
|---|---|---|
| App loads | [ ] | [ ] |
| Chat message gets a response | [ ] | [ ] |
| Calorie question gets declined | [ ] | [ ] |
| API key not visible in Network tab | [ ] | [ ] |
| Sources panel visible but empty | [ ] | [ ] |
| Latest reskinned UI visible (header/scope bar/footer) | [ ] | [ ] |
