import { internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { requireUserId } from "./lib/auth";

const cardTypeUnion = v.union(
  v.literal("HOT_REPLY"),
  v.literal("NEW_SEGMENT"),
  v.literal("NEEDS_JUDGMENT"),
);
const statusUnion = v.union(
  v.literal("open"),
  v.literal("approved"),
  v.literal("declined"),
  v.literal("skipped"),
  v.literal("expired"),
);
const laneUnion = v.union(v.literal("needs-you"), v.literal("autonomous"));
const levelUnion = v.union(v.literal("hot"), v.literal("warm"), v.literal("cold"));

/** Today queue: open cards sorted needs-you first, then by impact desc. */
export const today = query({
  args: {},
  handler: async (ctx) => {
    const uid = await requireUserId(ctx);
    const open = await ctx.db
      .query("cards")
      .withIndex("by_owner_status", (q) => q.eq("ownerId", uid).eq("status", "open"))
      .collect();
    open.sort((a, b) => {
      const laneRank = (l: string) => (l === "needs-you" ? 0 : 1);
      const ld = laneRank(a.lane) - laneRank(b.lane);
      if (ld !== 0) return ld;
      return b.impactUSD - a.impactUSD;
    });
    return open;
  },
});

export const get = query({
  args: { cardId: v.id("cards") },
  handler: async (ctx, { cardId }) => {
    const uid = await requireUserId(ctx);
    const card = await ctx.db.get(cardId);
    if (!card || card.ownerId !== uid) return null;
    return card;
  },
});

// Internal raw reader used by the send-reply action (action → query bridge).
export const _getRaw = internalQuery({
  args: { ownerId: v.id("users"), cardId: v.id("cards") },
  handler: async (ctx, { ownerId, cardId }) => {
    const card = await ctx.db.get(cardId);
    if (!card || card.ownerId !== ownerId) return null;
    return card;
  },
});

export const approve = mutation({
  args: { cardId: v.id("cards") },
  handler: async (ctx, { cardId }) => {
    const uid = await requireUserId(ctx);
    const card = await ctx.db.get(cardId);
    if (!card || card.ownerId !== uid) return;
    await ctx.db.patch(cardId, { status: "approved", resolvedAt: Date.now() });

    // HOT_REPLY → actually send the AI-drafted reply via Resend.
    if (card.type === "HOT_REPLY" && card.aiReplyDraft && card.contactId) {
      await ctx.scheduler.runAfter(0, internal.email.sendReplyFromCard, {
        ownerId: uid,
        cardId,
      });
    }
  },
});

export const decline = mutation({
  args: { cardId: v.id("cards") },
  handler: async (ctx, { cardId }) => {
    const uid = await requireUserId(ctx);
    const card = await ctx.db.get(cardId);
    if (!card || card.ownerId !== uid) return;
    await ctx.db.patch(cardId, { status: "declined", resolvedAt: Date.now() });
  },
});

export const skip = mutation({
  args: { cardId: v.id("cards") },
  handler: async (ctx, { cardId }) => {
    const uid = await requireUserId(ctx);
    const card = await ctx.db.get(cardId);
    if (!card || card.ownerId !== uid) return;
    await ctx.db.patch(cardId, { status: "skipped", resolvedAt: Date.now() });
  },
});

/** Pick a NEEDS_JUDGMENT option — records the choice in aiRecommendation. */
export const pickJudgment = mutation({
  args: { cardId: v.id("cards"), letter: v.union(v.literal("A"), v.literal("B"), v.literal("C")) },
  handler: async (ctx, { cardId, letter }) => {
    const uid = await requireUserId(ctx);
    const card = await ctx.db.get(cardId);
    if (!card || card.ownerId !== uid) return;
    const updated = `${card.aiRecommendation}\n\nOwner picked: ${letter}`;
    await ctx.db.patch(cardId, {
      status: "approved",
      aiRecommendation: updated,
      resolvedAt: Date.now(),
    });
  },
});

/** Wipe all open cards before overnight regenerates the queue (per-owner). */
export const expireOpen = internalMutation({
  args: { ownerId: v.id("users") },
  handler: async (ctx, { ownerId }) => {
    const open = await ctx.db
      .query("cards")
      .withIndex("by_owner_status", (q) => q.eq("ownerId", ownerId).eq("status", "open"))
      .collect();
    for (const c of open) {
      await ctx.db.patch(c._id, { status: "expired", resolvedAt: Date.now() });
    }
  },
});

export const insert = internalMutation({
  args: {
    ownerId: v.id("users"),
    type: cardTypeUnion,
    lane: laneUnion,
    poweredBy: v.optional(v.string()),
    accountId: v.optional(v.id("accounts")),
    contactId: v.optional(v.id("contacts")),
    title: v.string(),
    subtitle: v.string(),
    intentScore: v.optional(v.number()),
    intentLevel: v.optional(levelUnion),
    impactUSD: v.number(),
    impactKind: v.string(),
    aiRecommendation: v.string(),
    aiReplyDraft: v.optional(v.string()),
    aiSegmentBrief: v.optional(v.any()),
    aiJudgmentOptions: v.optional(v.any()),
    signalIds: v.array(v.id("signals")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("cards", {
      ...args,
      agent: "Catering",
      status: "open",
      createdAt: Date.now(),
    });
  },
});

/** Stats for header (needs-you / autonomous / total impact). */
export const stats = query({
  args: {},
  handler: async (ctx) => {
    const uid = await requireUserId(ctx);
    const open = await ctx.db
      .query("cards")
      .withIndex("by_owner_status", (q) => q.eq("ownerId", uid).eq("status", "open"))
      .collect();
    return {
      needsYou: open.filter((c) => c.lane === "needs-you").length,
      autonomous: open.filter((c) => c.lane === "autonomous").length,
      total: open.length,
      impactUSD: open.reduce((s, c) => s + c.impactUSD, 0),
    };
  },
});
