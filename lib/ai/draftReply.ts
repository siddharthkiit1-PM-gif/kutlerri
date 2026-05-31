/**
 * Generate a HOT_REPLY draft for a catering inquiry-like situation.
 * Input: scored account + contact + the freshest signals.
 * Output: a 3–5 sentence email reply the owner can approve in one tap.
 */
import { generateObject } from "ai";
import { z } from "zod";
import { geminiModel, MODEL_ID } from "@/lib/ai/client";
import type { ScoredAccount, AIResult } from "@/lib/types/domain";

export const DraftReplySchema = z.object({
  subject: z.string().min(4).max(120),
  body: z.string().min(40).max(900),
  recommendation: z
    .string()
    .min(20)
    .max(280)
    .describe("One-sentence rationale shown above the reply in the card."),
});

export type DraftReply = z.infer<typeof DraftReplySchema>;

export type DraftReplyInput = {
  account: ScoredAccount;
  contact: { name: string; title: string; email?: string };
  inquirySummary: string; // e.g. "Replied to last week's outreach asking about Thursday lunches for 30"
  ownerName?: string;
  restaurantName?: string;
};

export async function draftReply(
  input: DraftReplyInput,
): Promise<AIResult<DraftReply>> {
  const t0 = Date.now();
  const owner = input.ownerName ?? "Sid";
  const restaurant = input.restaurantName ?? "Round Rock Kitchen";

  const reasons = input.account.reasonChain.length
    ? input.account.reasonChain.map((r, i) => `${i + 1}. ${r}`).join("\n")
    : "(no fresh intent signals)";

  const prompt = `You are the catering ops assistant for ${restaurant}, writing on behalf of the owner ${owner}.

Recipient: ${input.contact.name} (${input.contact.title}) at ${input.account.name}.
Inquiry: ${input.inquirySummary}

Intent score: ${input.account.intentScore}/100 (${input.account.intentLevel})
Why this account is interesting right now:
${reasons}

Write a warm, concise reply (3–5 sentences) that:
- Acknowledges the inquiry directly.
- Proposes 2 concrete next steps (e.g. a tasting time, a sample menu link).
- References ONE specific, plausible local detail (their office, neighborhood, headcount, hiring momentum) — never invent dates, prices, or menus.
- Signs off as ${owner}, ${restaurant}.

Also produce a one-sentence "recommendation" the owner sees above the reply explaining why approving makes sense.
Tone: friendly, professional, no marketing-speak, no emojis.`;

  try {
    const { object } = await generateObject({
      model: geminiModel,
      schema: DraftReplySchema,
      prompt,
      temperature: 0.4,
    });
    return { ok: true, data: object, modelUsed: MODEL_ID, latencyMs: Date.now() - t0 };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
