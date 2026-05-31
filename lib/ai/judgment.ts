/**
 * Generate a NEEDS_JUDGMENT card: the agent has 2–3 plausible plays
 * and wants the owner to pick. Owner sees A/B/C options with predicted
 * outcomes and chooses one.
 */
import { generateObject } from "ai";
import { z } from "zod";
import { geminiModel, MODEL_ID } from "@/lib/ai/client";
import type { ScoredAccount, AIResult } from "@/lib/types/domain";

export const JudgmentSchema = z.object({
  question: z.string().min(10).max(240),
  context: z.string().min(40).max(500),
  options: z
    .array(
      z.object({
        letter: z.enum(["A", "B", "C"]),
        title: z.string().min(4).max(80),
        action: z.string().min(20).max(280),
        predicted: z.string().min(20).max(280),
        risk: z.enum(["low", "medium", "high"]),
      }),
    )
    .min(2)
    .max(3),
  recommendation: z.string().min(20).max(280),
});

export type Judgment = z.infer<typeof JudgmentSchema>;

export type JudgmentInput = {
  account: ScoredAccount;
  situation: string; // e.g. "Lapsed account — 6 months of weekly orders, then silence for 60 days"
  ownerName?: string;
  restaurantName?: string;
};

export async function judgment(
  input: JudgmentInput,
): Promise<AIResult<Judgment>> {
  const t0 = Date.now();
  const owner = input.ownerName ?? "Sid";
  const restaurant = input.restaurantName ?? "Round Rock Kitchen";

  const reasons = input.account.reasonChain.length
    ? input.account.reasonChain.map((r, i) => `${i + 1}. ${r}`).join("\n")
    : "(no fresh intent signals)";

  const prompt = `You are the catering ops assistant for ${restaurant} (owner ${owner}).

A judgment call has surfaced for ${input.account.name} (intent ${input.account.intentScore}/${input.account.intentLevel}).

Situation: ${input.situation}

What we know:
${reasons}

Produce a card with:
- question: the binary/ternary decision (one sentence ending in a question mark).
- context: 2–3 sentences that frame why a human needs to decide.
- options: 2 or 3 lettered plays (A/B/C). Each has a title, a concrete action (what we'd do this week), a "predicted" outcome (what likely happens), and a risk level.
- recommendation: which option you'd lean toward and a one-sentence why.

Rules: never invent prices, menus, or specific dates. Use plausible Round Rock / Austin context. No emojis.`;

  try {
    const { object } = await generateObject({
      model: geminiModel,
      schema: JudgmentSchema,
      prompt,
      temperature: 0.6,
    });
    return { ok: true, data: object, modelUsed: MODEL_ID, latencyMs: Date.now() - t0 };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
