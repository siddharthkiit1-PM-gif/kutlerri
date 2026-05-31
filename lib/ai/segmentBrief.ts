/**
 * Generate a NEW_SEGMENT brief: agent has found a pattern across multiple
 * accounts (e.g. "5 funded SaaS startups within 3 miles") and needs the
 * owner to approve a 3-touch sequence targeting that segment.
 */
import { generateObject } from "ai";
import { z } from "zod";
import { geminiModel, MODEL_ID } from "@/lib/ai/client";
import type { ScoredAccount, AIResult } from "@/lib/types/domain";

export const SegmentBriefSchema = z.object({
  segmentName: z.string().min(4).max(80),
  criteria: z.array(z.string().min(4)).min(2).max(5),
  rationale: z.string().min(40).max(400),
  expectedReplyRate: z
    .number()
    .min(0)
    .max(100)
    .describe("Predicted reply rate as percentage (0–100)."),
  sequence: z
    .array(
      z.object({
        step: z.number().int().min(1).max(3),
        channel: z.enum(["email", "linkedin_dm"]),
        dayOffset: z.number().int().min(0).max(14),
        subject: z.string().min(4).max(120).optional(),
        message: z.string().min(40).max(700),
      }),
    )
    .length(3),
  recommendation: z.string().min(20).max(280),
});

export type SegmentBrief = z.infer<typeof SegmentBriefSchema>;

export type SegmentBriefInput = {
  candidateAccounts: ScoredAccount[];
  patternHint: string; // e.g. "All recently funded, hiring office managers, within 5 miles"
  ownerName?: string;
  restaurantName?: string;
};

export async function segmentBrief(
  input: SegmentBriefInput,
): Promise<AIResult<SegmentBrief>> {
  const t0 = Date.now();
  const owner = input.ownerName ?? "Sid";
  const restaurant = input.restaurantName ?? "Round Rock Kitchen";

  const candidatesBlock = input.candidateAccounts
    .slice(0, 8)
    .map(
      (a) =>
        `- ${a.name} (intent ${a.intentScore}/${a.intentLevel}): ${
          a.reasonChain[0] ?? "—"
        }`,
    )
    .join("\n");

  const prompt = `You are the catering ops assistant for ${restaurant}, writing for owner ${owner}.

The Catering agent detected a NEW prospect SEGMENT worth a 3-touch sequence.

Pattern hint: ${input.patternHint}

Candidate accounts (top 8 of the matches):
${candidatesBlock}

Produce:
- segmentName: short, ownerable label (e.g. "Newly-funded RR startups").
- criteria: 2–5 plain-English filter rules that defined the segment.
- rationale: why this segment is worth ${restaurant}'s time, referencing the candidate list.
- expectedReplyRate: realistic 5–25% range based on the signal strength.
- sequence: exactly 3 touches across 14 days max. Each must specify channel (email or linkedin_dm), dayOffset (0 = today), subject (email only), and a 2–4 sentence message that mentions ONE concrete plausible detail. Never invent prices, menus, or specific dates.
- recommendation: one sentence the owner sees on the card explaining why to approve.

Tone: confident, restaurant-owner voice, no jargon, no emojis.`;

  try {
    const { object } = await generateObject({
      model: geminiModel,
      schema: SegmentBriefSchema,
      prompt,
      temperature: 0.5,
    });
    return { ok: true, data: object, modelUsed: MODEL_ID, latencyMs: Date.now() - t0 };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
