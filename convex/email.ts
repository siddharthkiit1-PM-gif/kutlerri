"use node";
/**
 * Resend wrapper. Reads RESEND_API_KEY + RESEND_FROM from Convex env.
 * Recipient is resolved per-tenant from the `users` table — no env var.
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

/** Internal sender used by the overnight orchestrator action. */
export const _sendToOwnerInternal = internalAction({
  args: { to: v.string(), subject: v.string(), text: v.string(), html: v.string() },
  handler: async (_ctx, { to, subject, text, html }) => {
    const r = await resendClient().emails.send({
      from: from(),
      to,
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
  args: { to: v.string(), subject: v.string(), text: v.string(), html: v.string() },
  handler: async (_ctx, { to, subject, text, html }) => {
    const r = await resendClient().emails.send({
      from: from(),
      to,
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
  args: { ownerId: v.id("users"), cardId: v.id("cards") },
  handler: async (ctx, { ownerId, cardId }) => {
    const ctx2: any = ctx;
    const card: any = await ctx2.runQuery(internal.cards._getRaw, { ownerId, cardId });
    if (!card || !card.aiReplyDraft || !card.contactId) return;
    const contact: any = await ctx2.runQuery(internal.contacts._getRaw, {
      ownerId,
      contactId: card.contactId,
    });
    if (!contact?.email) return;
    const owner: any = await ctx2.runQuery(internal.users._getRaw, { ownerId });
    const replyTo = owner?.email;
    if (!replyTo) return;

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
      replyTo,
    });

    await ctx2.runMutation(internal.agentRuns.insert, {
      ownerId,
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
      replyTo,
    });
    if (r.error) throw new Error(`Resend error: ${r.error.message}`);
    return { id: r.data?.id ?? null };
  },
});
