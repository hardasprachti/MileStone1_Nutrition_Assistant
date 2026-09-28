// app/api/chat/route.ts
// POST /api/chat — main chat endpoint.
// Phase 2: full input validation + conversation store + LLM call.
// Phase 3: schema parsing.
// Phase 4: scope guard (this phase).
// Phase 6: final integration of all layers.
// Split deploy: this route is called cross-origin from the Vercel-hosted
// frontend, so it needs CORS headers + an OPTIONS preflight handler.

import { NextRequest, NextResponse } from "next/server";
import { getHistory, appendTurn } from "@/lib/conversationStore";
import { callLLM, type ChatMessage } from "@/lib/llm";
import { SYSTEM_PROMPT } from "@/lib/systemPrompt";
import { parseResponse } from "@/lib/schema";
import { checkScope } from "@/lib/scopeGuard";

/** Maximum number of previous turns to include (guards against context overflow). */
const MAX_HISTORY_TURNS = 10;

/**
 * Only reflects the Origin header back when it matches ALLOWED_ORIGIN exactly.
 * Unset ALLOWED_ORIGIN (e.g. same-origin deploys) means no CORS headers are
 * added — the request only works same-origin, which is the safe default.
 */
function corsHeaders(req: NextRequest): HeadersInit {
  const allowedOrigin = process.env.ALLOWED_ORIGIN;
  const origin = req.headers.get("origin");

  if (!allowedOrigin || !origin || origin !== allowedOrigin) {
    return {};
  }

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

function jsonResponse(req: NextRequest, body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, {
    ...init,
    headers: { ...corsHeaders(req), ...init?.headers },
  });
}

/** Handles the browser's CORS preflight for cross-origin POST requests. */
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req) });
}

export async function POST(req: NextRequest) {
  // ── 1. Parse & validate request body ─────────────────────────────────────
  let body: { sessionId?: unknown; message?: unknown };
  try {
    body = await req.json();
  } catch {
    return jsonResponse(req, { error: "Request body must be valid JSON." }, { status: 400 });
  }

  const { sessionId, message } = body;

  if (!sessionId || typeof sessionId !== "string") {
    return jsonResponse(
      req,
      { error: "sessionId is required and must be a string." },
      { status: 400 }
    );
  }

  if (!message || typeof message !== "string" || !message.trim()) {
    return jsonResponse(
      req,
      { error: "message is required and must be a non-empty string." },
      { status: 400 }
    );
  }

  const trimmedMessage = message.trim();

  // ── 2. Scope guard — block forbidden topics before spending an LLM call ──
  const blocked = checkScope(trimmedMessage);
  if (blocked) {
    return jsonResponse(req, blocked, { status: 200 });
  }

  // ── 3. Load conversation history ─────────────────────────────────────────
  const fullHistory = getHistory(sessionId);

  // Cap history to last MAX_HISTORY_TURNS turns to avoid context overflow
  const history = fullHistory.slice(-MAX_HISTORY_TURNS);

  // ── 4. Build messages array for LLM ──────────────────────────────────────
  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: trimmedMessage },
  ];

  // ── 5. Call LLM ───────────────────────────────────────────────────────────
  let rawOutput: string;
  try {
    rawOutput = await callLLM(messages);
  } catch (err) {
    console.error("[/api/chat] LLM call failed:", err);
    return jsonResponse(
      req,
      { error: "Failed to get a response from the AI model.", details: String(err) },
      { status: 502 }
    );
  }

  // ── 6. Parse & validate the LLM output against the response schema ───────
  let structured;
  try {
    structured = parseResponse(rawOutput);
  } catch (err) {
    console.error("[/api/chat] Schema parse failure:", err, "raw output:", rawOutput);
    return jsonResponse(
      req,
      { error: "Response did not match expected schema.", details: String(err) },
      { status: 500 }
    );
  }

  // ── 7. Persist the turn ───────────────────────────────────────────────────
  // Store the parsed answer text, not the raw JSON — future turns feed this
  // back to the LLM as conversation history, and it should read as prose.
  appendTurn(sessionId, "user", trimmedMessage);
  appendTurn(sessionId, "assistant", structured.answer);

  // ── 8. Return ─────────────────────────────────────────────────────────────
  return jsonResponse(req, structured);
}
