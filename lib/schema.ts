// lib/schema.ts
// Response contract shared across M1 and M2.
// M2 only needs to change ClaimSchema.source from z.null() to a citation object.
import { z } from "zod";

export const ClaimSchema = z.object({
  claim_text: z.string().min(1),
  source: z.null(), // always null in M1; M2 replaces this type
});

export const ResponseSchema = z.object({
  answer: z.string().min(1),
  claims: z.array(ClaimSchema),
});

export type Claim = z.infer<typeof ClaimSchema>;
export type NutritionResponse = z.infer<typeof ResponseSchema>;

/**
 * Parse a raw LLM output string into a validated NutritionResponse.
 * Throws SyntaxError if not valid JSON.
 * Throws ZodError if the shape does not match the schema.
 * The caller is responsible for catching and returning 500.
 */
export function parseResponse(raw: string): NutritionResponse {
  const parsed = JSON.parse(raw);
  return ResponseSchema.parse(parsed);
}
