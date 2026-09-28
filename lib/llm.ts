// lib/llm.ts
// SERVER-ONLY — never import this in client components or pages.
// All LLM calls must go through the /api/chat route.
// Uses Groq's OpenAI-compatible chat completions API.

import Groq from "groq-sdk";

let groqClient: Groq | null = null;

/**
 * Lazily constructs the client so importing this module (e.g. from route.ts)
 * never throws — only an actual LLM call requires the key to be present.
 */
function getClient(): Groq {
  if (!process.env.GROQ_API_KEY) {
    throw new Error(
      "GROQ_API_KEY environment variable is not set. Add it to .env.local."
    );
  }
  if (!groqClient) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
}

export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

/**
 * Strips markdown code fences from an LLM response.
 * Handles ```json ... ``` and plain ``` ... ``` wrappers.
 * Some models wrap JSON in markdown even when JSON mode is requested.
 */
function stripMarkdownFences(raw: string): string {
  return raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
}

/**
 * Sends a list of messages to the LLM and returns the raw JSON string response.
 *
 * Contract:
 * - The first message in the array MUST have role "system".
 * - At least one "user" message must follow.
 * - Returns raw text after stripping any markdown fences.
 * - Throws on API error, rate limit, or network failure — caller handles these.
 */
export async function callLLM(messages: ChatMessage[]): Promise<string> {
  if (messages.length < 2) {
    throw new Error("callLLM: messages must include a system prompt and at least one user message.");
  }

  if (messages[0].role !== "system") {
    throw new Error("callLLM: first message must have role 'system'.");
  }

  const lastMessage = messages.at(-1);
  if (!lastMessage || lastMessage.role !== "user") {
    throw new Error("callLLM: last message must have role 'user'.");
  }

  const modelName = process.env.LLM_MODEL ?? "openai/gpt-oss-120b";

  // Groq's API is OpenAI-compatible — messages pass through in order,
  // no reshaping into a separate system/history split.
  const completion = await getClient().chat.completions.create({
    model: modelName,
    messages,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content ?? "";

  // Strip markdown fences in case the model wraps JSON in code blocks
  return stripMarkdownFences(raw);
}
