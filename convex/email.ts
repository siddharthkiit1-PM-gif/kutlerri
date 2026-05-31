"use node";
/**
 * Resend wrapper. Reads RESEND_API_KEY + RESEND_FROM from Convex env.
 * Owner email comes from KUTLERRI_OWNER_EMAIL.
 */
import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Resend } from "resend";

function resendClient(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set in Convex env");
  return new Resend(key);
}

function from(): string {
  return process.env.RESEND_FROM ?? "onboarding@resend.dev";
}

function ownerEmail(): string {
  const e = process.env.KUTLERRI_OWNER_EMAIL;
  if (!e) throw new Error("KUTLERRI_OWNER_EMAIL is not set in Convex env");
  return e;
}

/** Internal sender used by the overnight orchestrator action. */
export const _sendToOwnerInternal = internalAction({
  args: { subject: v.string(), text: v.string(), html: v.string() },
  handler: async (_ctx, { subject, text, html }) => {
    const r = await resendClient().emails.send({
      from: from(),
      to: ownerEmail(),
      subject,
      text,
      html,
    });
    if (r.error) throw new Error(`Resend error: ${r.error.message}`);
    return { id: r.data?.id ?? null };
  },
});

/** Public version for ad-hoc CLI sends. */
export const sendToOwner = action({
  args: { subject: v.string(), text: v.string(), html: v.string() },
  handler: async (_ctx, { subject, text, html }) => {
    const r = await resendClient().emails.send({
      from: from(),
      to: ownerEmail(),
      subject,
      text,
      html,
    });
    if (r.error) throw new Error(`Resend error: ${r.error.message}`);
    return { id: r.data?.id ?? null };
  },
});

/** Scheduled by cards.approve when a HOT_REPLY card is approved. */
export const sendReplyFromCard = internalAction({
  args: { cardId: v.id("cards") },
  handler: async (ctx, { cardId }) => {
    const ctx2: any = ctx;
    const card: any = await ctx2.runQuery(internal.cards._getRaw, { cardId });
    if (!card || !card.aiReplyDraft || !card.contactId) return;
    const contact: any = await ctx2.runQuery(internal.contacts._getRaw, {
      contactId: card.contactId,
    });
    if (!contact?.email) return;

    const draft: string = card.aiReplyDraft;
    const lines = draft.split("\n");
    const subjectLine = lines.find((l: string) => l.toLowerCase().startsWith("subject:"));
    const subject = subjectLine
      ? subjectLine.replace(/^subject:\s*/i, "").trim()
      : `Re: ${card.title}`;
    const body = lines
      .filter((l: string) => !l.toLowerCase().startsWith("subject:"))
      .join("\n")
      .trim();

    const r = await resendClient().emails.send({
      from: from(),
      to: contact.email,
      subject,
      text: body,
      html: `<pre style="font-family:sans-serif;white-space:pre-wrap;">${escape(body)}</pre>`,
      replyTo: ownerEmail(),
    });

    await ctx2.runMutation(internal.agentRuns.insert, {
      agent: "Catering",
      lane: "needs-you",
      summary: r.error
        ? `Send failed to ${contact.email}: ${r.error.message}`
        : `Sent approved reply to ${contact.name} <${contact.email}>`,
      impactUSD: card.impactUSD,
      revertable: false,
      cardId,
      window: "9 PM – 8 AM",
    });
  },
});

function escape(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export const sendReply = action({
  args: {
    to: v.string(),
    subject: v.string(),
    text: v.string(),
    html: v.optional(v.string()),
    replyTo: v.optional(v.string()),
  },
  handler: async (_ctx, { to, subject, text, html, replyTo }) => {
    const r = await resendClient().emails.send({
      from: from(),
      to,
      subject,
      text,
      html: html ?? `<pre style="font-family:sans-serif;white-space:pre-wrap;">${text}</pre>`,
      replyTo: replyTo ?? ownerEmail(),
    });
    if (r.error) throw new Error(`Resend error: ${r.error.message}`);
    return { id: r.data?.id ?? null };
  },
});
