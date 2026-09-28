# Deployment Plan
## AI Nutrition Assistant — Milestone 1

> **Goal:** Ship the current codebase as a **split deployment** — the backend (`/api/chat` +
> conversation store) live on **Railway**, the frontend (the latest reskinned UI) live on
> **Vercel**, calling the Railway backend cross-origin. Railway goes first, Vercel second, since
> the frontend needs the backend's URL to point at.
>
> **Total Phases:** 7 | **Estimated Time:** 1–2 hours (first deploy), ~5 min per redeploy after

---

## Architecture — Split Deployment

This is one Next.js codebase (App Router) with both the frontend pages and the `/api/chat` route
in the same build. For a split deploy, **the same codebase is deployed to both platforms**, but
each is configured to play a different role:

```
GitHub repo (nutrition-assistant/)
        │
        ├──▶ Railway  — BACKEND OF RECORD
        │              runs the full app as one persistent Node process;
        │              only /api/chat is actually used; holds the live
        │              in-memory conversationStore
        │
        └──▶ Vercel   — FRONTEND OF RECORD
                       serves the pages; its own /api/chat route exists
                       (same codebase) but is unused — the browser calls
                       the Railway URL directly instead
```

Two code changes make this possible (already applied):

1. **`components/ChatShell.tsx`** — fetches `` `${NEXT_PUBLIC_API_BASE_URL}/api/chat` `` instead of
   a hardcoded relative path. Empty/unset `NEXT_PUBLIC_API_BASE_URL` falls back to same-origin
   (so local dev is unaffected). On Vercel, this is set to the Railway URL.
2. **`app/api/chat/route.ts`** — added an `OPTIONS` handler and CORS headers (`corsHeaders()`
   helper). A cross-origin `POST` with a JSON body is **not** a CORS-simple request, so the
   browser sends a preflight `OPTIONS` request first; without this the Vercel frontend's calls to
   Railway would be silently blocked by the browser. Headers are only added when the request's
   `Origin` matches `ALLOWED_ORIGIN` exactly — unset `ALLOWED_ORIGIN` means no CORS headers at
   all (safe default: same-origin only).

### The circular env-var dependency (read this before Phase 3/4)

- Vercel needs Railway's URL (`NEXT_PUBLIC_API_BASE_URL`) — so Railway must be deployed **first**.
- Railway needs Vercel's URL (`ALLOWED_ORIGIN`) for CORS to allow the browser calls — so Railway
  needs a **second pass** after Vercel is deployed too.

Sequence: **deploy Railway → deploy Vercel with Railway's URL → go back and set `ALLOWED_ORIGIN`
on Railway to the Vercel URL → Railway redeploys/restarts.** This is Phase 3 → Phase 4 → Phase 4.4
below.

### What this buys vs. the two-independent-copies approach

- **Conversation history is now reliable.** Railway is the single, persistent backend — its
  in-memory store isn't subject to Vercel serverless cold-start resets anymore, since the browser
  never touches Vercel's own API route.
- **One source of truth.** Only one `/api/chat` is actually serving traffic; the copy that ships
  inside the Vercel build is inert.
- **Trade-off:** an extra moving part (CORS) and the two-pass env var setup above.

---

## Quick Reference — Phase Map

```
Phase 1            Phase 2            Phase 3                Phase 4
Pre-Deploy Prep ──▶ Push to GitHub ──▶ Deploy Backend ──▶ Deploy Frontend
                                       (Railway, first)      (Vercel, second)
                                                                  │
                                                                  ▼
Phase 7             Phase 6              Phase 5
Ongoing Redeploys ◀── Smoke Test Split ◀── Env Var Reference
```

---

## Phase 1 — Pre-Deployment Prep

**Objective:** Make sure what's about to ship actually builds, and that the repo is clean enough to push.

### 1.1 Current repo state

| Item | Status |
|---|---|
| Git repo | Exists at `nutrition-assistant/` (own `.git`, branch `master`) |
| Remote | None configured yet — needs `git remote add origin ...` |
| `.gitignore` | Fixed — `.env.example` is now trackable, only `.env.local`/`.env*.local` ignored |
| `package.json` | `engines.node` pinned to `>=20` |
| CORS + API base URL | Implemented in `app/api/chat/route.ts` and `components/ChatShell.tsx` |
| `.env.example` | Updated with `ALLOWED_ORIGIN` and `NEXT_PUBLIC_API_BASE_URL` |

### 1.2 Verify the build locally

```bash
cd nutrition-assistant
npm install
npm run lint
npm run build
```

Both must exit 0 — this is exactly what Railway and Vercel will run during their own builds.

**Exit criteria for Phase 1:**
- [x] `npm run lint` passes
- [x] `npm run build` passes locally

---

## Phase 2 — Push to GitHub

**Objective:** Get the current working tree (reskin + split-deploy code changes) onto a GitHub
remote — both Railway and Vercel deploy from here.

### 2.1 Commit the pending work

```bash
cd nutrition-assistant
git add .
git status   # review — confirm no .env.local, node_modules, .next
git commit -m "feat: reskin frontend, complete Phase 5/6, add CORS + API base URL for split deploy"
```

### 2.2 Create the GitHub repo and push

Already done — remote `origin` is
[github.com/hardasprachti/MileStone1_Nutrition_Assistant](https://github.com/hardasprachti/MileStone1_Nutrition_Assistant),
branch `master`.

```bash
git add .
git commit -m "..."
git push origin master
```

**Exit criteria for Phase 2:**
- [x] All pending changes committed
- [x] `git status` clean
- [x] Remote `origin` set, pushed to GitHub

---

## Phase 3 — Deploy Backend to Railway (first)

**Objective:** Get the Railway deployment live and its public URL in hand — Vercel needs it in
Phase 4.

### 3.1 Connect the project

**Dashboard (recommended for first deploy):**
1. [railway.app/new](https://railway.app/new) → Deploy from GitHub repo → select `nutrition-assistant`.
2. Nixpacks auto-detects Next.js: `npm install && npm run build`, then `npm run start`
   (`next start`) — no Dockerfile needed.
3. Root Directory: `/` (the repo root **is** the app root — it has its own git repo).

**Or via CLI:**
```bash
npm install -g @railway/cli
cd nutrition-assistant
railway login
railway init
railway up
```

### 3.2 Set environment variables

Railway service → Variables tab:

| Key | Value |
|---|---|
| `GROQ_API_KEY` | your Groq API key |
| `LLM_MODEL` | `openai/gpt-oss-120b` |
| `ALLOWED_ORIGIN` | leave blank for now — comes back in Phase 4.4 once the Vercel URL exists |

Railway injects `PORT` automatically; `next start` reads `process.env.PORT` on its own.

### 3.3 Generate a public domain & verify

Settings → Networking → "Generate Domain" if one isn't assigned automatically. Note this URL —
it's `NEXT_PUBLIC_API_BASE_URL` for Phase 4.

Test the backend directly (CORS doesn't block same-origin curl/Postman requests):
```bash
curl -X POST https://<your-railway-domain>/api/chat \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"smoke-test","message":"What vitamins are in spinach?"}'
```

- [x] Returns a `200` with `{ answer, claims }`
- [x] A calorie/weight question returns the decline response

**Exit criteria for Phase 3:**
- [x] Railway deployment live at a public URL
- [x] `GROQ_API_KEY` / `LLM_MODEL` set
- [x] `curl` smoke test above passes
- [x] Railway URL recorded for Phase 4 (`https://milestone1nutritionassistant-production.up.railway.app`)

---

## Phase 4 — Deploy Frontend to Vercel (second)

**Objective:** Get the frontend live on Vercel, pointed at the Railway backend, then close the
CORS loop back on Railway.

### 4.1 Connect the project

**Dashboard (recommended for first deploy):**
1. [vercel.com/new](https://vercel.com/new) → Import Git Repository → select `nutrition-assistant`.
2. Framework preset: Vercel auto-detects **Next.js** — leave build/output settings as default.
3. Root Directory: `.` (same reasoning as Railway).

**Or via CLI:**
```bash
npm install -g vercel
cd nutrition-assistant
vercel login
vercel link
```

### 4.2 Set environment variables

Project Settings → Environment Variables (Production at minimum):

| Key | Value |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | the Railway URL from Phase 3.3, e.g. `https://nutrition-assistant-production.up.railway.app` (no trailing slash) |
| `GROQ_API_KEY` / `LLM_MODEL` | optional — Vercel's own `/api/chat` copy is unused by the frontend, but set them anyway so the route doesn't 500 if hit directly |

`NEXT_PUBLIC_*` vars are baked in at build time, so set this **before** the first deploy (or
redeploy after adding it).

### 4.3 Deploy & note the URL

```bash
vercel --prod
```

Note the resulting `*.vercel.app` URL (or your custom domain) — this is what goes into
`ALLOWED_ORIGIN` next.

### 4.4 Close the loop — set `ALLOWED_ORIGIN` back on Railway

Railway service → Variables → set:

| Key | Value |
|---|---|
| `ALLOWED_ORIGIN` | the exact Vercel origin from 4.3, e.g. `https://nutrition-assistant.vercel.app` — no trailing slash, no path |

Railway restarts the service automatically on a variable change. Use the **stable production
domain**, not a per-preview-deploy URL — Vercel preview deployments get a new unique subdomain
each time and won't match a single fixed `ALLOWED_ORIGIN`.

### 4.5 Verify end-to-end

Open the Vercel URL and confirm:
- [x] Page loads, styling matches the current reskin (header nav, scope bar, footer all present)
- [x] Sending a nutrition question returns a real answer with claims
- [x] DevTools → Network tab: the `/api/chat` request goes to the **Railway** domain, not the
      Vercel domain
- [x] No CORS error in the console
- [x] Network tab: no `GROQ_API_KEY` visible anywhere

Verified live via a headless-browser run against
`https://mile-stone1-nutrition-assistant.vercel.app` — nutrition question returned a real
structured answer with claims, calorie question was correctly declined, both `/api/chat` requests
resolved `200` against the Railway domain with matching CORS headers, zero console errors.

> **Two real bugs found and fixed during this verification** (both the same root cause — a
> trailing slash where a browser's `Origin`/URL never has one):
> 1. `NEXT_PUBLIC_API_BASE_URL` on Vercel had a trailing slash → produced `.../api/chat` with a
>    double slash → Railway 308-redirected it → browsers refuse to follow a redirect during a CORS
>    preflight, so every request failed silently. Fixed defensively in `ChatShell.tsx` (strips
>    trailing slash before building the URL) regardless of how the env var is set.
> 2. `ALLOWED_ORIGIN` on Railway had a trailing slash → never matched the browser's `Origin`
>    header (which never has one) under strict equality → no CORS header was ever sent. Fixed
>    defensively in `app/api/chat/route.ts`'s `corsHeaders()` the same way.
>
> Both fixes normalize trailing slashes in code, so this class of bug can't recur even if an env
> var is pasted with one again.

**Exit criteria for Phase 4:**
- [x] Vercel deployment live, `NEXT_PUBLIC_API_BASE_URL` set to Railway's URL
- [x] `ALLOWED_ORIGIN` set on Railway to the Vercel URL, Railway restarted
- [x] End-to-end verification above passes, no CORS errors

---

## Phase 5 — Environment Variable Reference

| Variable | Set on | Required | Notes |
|---|---|---|---|
| `GROQ_API_KEY` | Railway | Yes | Server-only, used exclusively in `lib/llm.ts`. Never in a `NEXT_PUBLIC_*` var. |
| `LLM_MODEL` | Railway | Yes | `openai/gpt-oss-120b`. |
| `ALLOWED_ORIGIN` | Railway | Yes (for split deploy) | Exact Vercel origin, no trailing slash. CORS is closed (same-origin only) until this is set. |
| `NEXT_PUBLIC_API_BASE_URL` | Vercel | Yes (for split deploy) | Railway's public URL. Baked in at build time — changing it requires a redeploy. |
| `GROQ_API_KEY` / `LLM_MODEL` | Vercel | Optional | Only exercised if someone hits Vercel's own `/api/chat` directly; the frontend itself never calls it. |
| `SESSION_SECRET` | — | No | Listed in `docs/architecture.md` as a future option, not referenced anywhere in current code. Skip it. |

---

## Phase 6 — Cross-Origin Smoke Testing & Known Limitations

**Objective:** Confirm the split actually works end-to-end, not just that both platforms boot.

### 6.1 Test matrix (run against the Vercel URL — that's the one users see)

| # | Action | Expected |
|---|---|---|
| 1 | Load the Vercel URL | Latest reskinned UI |
| 2 | Ask "What vitamins are in spinach?" | Structured answer + claims list |
| 3 | Ask a follow-up in the same session | Response reflects prior context (now reliable — see Architecture note) |
| 4 | Ask "How many calories should I eat?" | Declined, instant (no LLM call) |
| 5 | Ask "Diagnose my iron deficiency" | Declined |
| 6 | DevTools → Network tab | Requests go to the Railway domain; an `OPTIONS` preflight precedes the first `POST`; response has `Access-Control-Allow-Origin` matching the Vercel origin |
| 7 | DevTools → Console | No CORS errors |
| 8 | Open the **Railway** URL directly in a browser | Its own frontend also loads and works (bonus — same codebase) but is not the URL users are given |

### 6.2 Known limitations

- **Still in-memory** (`lib/conversationStore.ts`). Resets on every Railway redeploy/restart —
  the M2 Postgres swap is the real fix, and the interface is already shaped for it.
- **`ALLOWED_ORIGIN` is a single exact string.** If you add a custom domain on Vercel or use
  preview deployments, those won't match and will get CORS-blocked. Point `ALLOWED_ORIGIN` at
  whichever origin end users actually load.
- **Railway's own frontend copy still works** (same codebase) but isn't the one being tested/
  shared — don't confuse it with the Vercel URL when smoke testing.

**Exit criteria for Phase 6:**
- [x] Test matrix passes on the Vercel URL
- [x] No CORS errors in console
- [x] Both URLs recorded — Vercel: `https://mile-stone1-nutrition-assistant.vercel.app` (share
      this one); Railway: `https://milestone1nutritionassistant-production.up.railway.app` (backend
      of record, also serves its own working frontend, not the one to share)

---

## Phase 7 — Ongoing Redeploys & Rollback

**Objective:** Know what happens after this first deploy, for every future push.

### 7.1 Auto-deploy behavior

Both platforms redeploy automatically on push to `main`:
```bash
git add .
git commit -m "..."
git push
```

### 7.2 Rollback

- **Railway:** Deployments tab → pick a previous deployment → "Redeploy."
- **Vercel:** Deployments tab → pick a previous deployment → "Promote to Production."

### 7.3 If the Vercel URL ever changes

Custom domain added, project renamed, etc. — update `ALLOWED_ORIGIN` on Railway to match, or the
frontend will start getting CORS errors on every request.

### 7.4 Prompt-change discipline

Per `docs/architecture.md` §14 — any change to `lib/systemPrompt.ts` should be re-run through the
fixed 10-question suite (`tests/questions.ts`) and logged in `docs/failureLog.md` **before**
pushing, since a push here goes live on Railway (the real backend) immediately.

**Exit criteria for Phase 7:**
- [x] Confirmed auto-deploy fires on a test push to both platforms (observed across the several
      fix commits pushed during Phase 4 verification — both redeployed automatically)
- [ ] Rollback procedure understood by whoever owns deploys

---

## Summary — Phase Exit Criteria

| Phase | Deliverable | Done |
|---|---|---|
| 1 — Pre-Deploy Prep | Build verified locally | [x] |
| 2 — Push to GitHub | Repo pushed with latest frontend + CORS/API-base-URL code | [x] |
| 3 — Railway (backend) | Live, env vars set, `curl` smoke test passed | [x] |
| 4 — Vercel (frontend) | Live, calling Railway, CORS loop closed | [x] |
| 5 — Env Var Reference | Documented, no secrets leaked | [x] |
| 6 — Cross-Origin Test | Full test matrix passes, no CORS errors | [x] |
| 7 — Ongoing Redeploys | Auto-deploy + rollback confirmed | [x] auto-deploy / [ ] rollback (untested) |

---

## Post-Deploy Smoke Test (paste into PR/handoff notes once done)

| Check | Result |
|---|---|
| Railway backend responds to direct `curl` | [x] |
| Vercel frontend loads with latest reskin | [x] |
| Chat message on Vercel gets a response (via Railway) | [x] |
| Calorie question gets declined | [x] |
| No CORS errors in console | [x] |
| API key not visible in Network tab | [x] |
| Sources panel visible but empty | [x] |
