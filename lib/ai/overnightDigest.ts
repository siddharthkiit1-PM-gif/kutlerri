/**
 * Generate the morning digest the owner receives after the overnight run.
 * Returns plain-text + simple HTML for Resend, plus a short subject line.
 */
import { generateObject } from "ai";
import { z } from "zod";
import { geminiModel, MODEL_ID } from "@/lib/ai/client";
import type { AIResult } from "@/lib/types/domain";

export const OvernightDigestSchema = z.object({
  subject: z.string().min(8).max(120),
  greeting: z.string().min(4).max(120),
  bullets: z.array(z.string().min(8).max(220)).min(2).max(6),
  closing: z.string().min(4).max(200),
});

export type OvernightDigest = z.infer<typeof OvernightDigestSchema>;

export type OvernightDigestInput = {
  ownerName: string;
  restaurantName: string;
  windowLabel: string; // "9 PM – 8 AM"
  cardsForYouCount: number;
  cardsAutonomousCount: number;
  topImpactUSD: number;
  highlights: Array<{ account: string; what: string; impactUSD?: number }>;
};

export async function overnightDigest(
  input: OvernightDigestInput,
): Promise<AIResult<OvernightDigest>> {
  const t0 = Date.now();

  const highlightsBlock = input.highlights
    .slice(0, 6)
    .map(
      (h) =>
        `- ${h.account}: ${h.what}${
          h.impactUSD ? ` (~$${h.impactUSD.toLocaleString()})` : ""
        }`,
    )
    .join("\n");

  const prompt = `Write the morning digest email for ${input.ownerName}, owner of ${input.restaurantName}.

Overnight run window: ${input.windowLabel}
Cards waiting for you: ${input.cardsForYouCount}
Autonomous actions taken: ${input.cardsAutonomousCount}
Top single-card impact: $${input.topImpactUSD.toLocaleString()}

Highlights:
${highlightsBlock || "(no notable activity)"}

Produce:
- subject: ≤ 80 chars, lead with the dollar impact or the most interesting card.
- greeting: warm but brief (e.g. "Good morning, ${input.ownerName} —").
- bullets: 2–6 plain-text bullets summarizing what happened and what's waiting. Reference specific account names from the highlights. Each bullet ≤ 220 chars.
- closing: one sentence pointing them to open the app to review.

Tone: confident, calm, restaurant-operator voice. No emojis. No corporate fluff.`;

  try {
    const { object } = await generateObject({
      model: geminiModel,
      schema: OvernightDigestSchema,
      prompt,
      temperature: 0.4,
    });
    return { ok: true, data: object, modelUsed: MODEL_ID, latencyMs: Date.now() - t0 };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/** Convert a validated digest into Resend-ready { subject, text, html }. */
export function renderDigestEmail(d: OvernightDigest): {
  subject: string;
  text: string;
  html: string;
} {
  const text = [
    d.greeting,
    "",
    ...d.bullets.map((b) => `• ${b}`),
    "",
    d.closing,
  ].join("\n");

  const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111;line-height:1.55;font-size:15px;max-width:560px;margin:0 auto;padding:24px;">
  <p style="margin:0 0 16px;">${escapeHtml(d.greeting)}</p>
  <ul style="margin:0 0 16px;padding-left:20px;">
    ${d.bullets.map((b) => `<li style="margin:6px 0;">${escapeHtml(b)}</li>`).join("")}
  </ul>
  <p style="margin:0;color:#444;">${escapeHtml(d.closing)}</p>
</div>`;

  return { subject: d.subject, text, html };
}

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
