import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireUserId } from "./lib/auth";

export const latest = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const uid = await requireUserId(ctx);
    const rows = await ctx.db
      .query("agentRuns")
      .withIndex("by_owner_runAt", (q) => q.eq("ownerId", uid))
      .order("desc")
      .take(limit ?? 50);
    return rows;
  },
});

export const insert = internalMutation({
  args: {
    ownerId: v.id("users"),
    agent: v.union(
      v.literal("Catering"),
      v.literal("Waste Control"),
      v.literal("Guest Retention"),
      v.literal("Prep Forecast"),
    ),
    lane: v.union(v.literal("needs-you"), v.literal("autonomous")),
    summary: v.string(),
    impactUSD: v.optional(v.number()),
    revertable: v.boolean(),
    cardId: v.optional(v.id("cards")),
    href: v.optional(v.string()),
    window: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("agentRuns", {
      ...args,
      reverted: false,
      runAt: Date.now(),
    });
  },
});
