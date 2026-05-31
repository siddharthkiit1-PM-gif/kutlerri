import { query, internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { requireUserId } from "./lib/auth";

/** Owner-facing list, ranked by score desc. */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const uid = await requireUserId(ctx);
    const accounts = await ctx.db
      .query("accounts")
      .withIndex("by_owner_score", (q) => q.eq("ownerId", uid))
      .collect();
    accounts.sort((a, b) => b.intentScore - a.intentScore);
    return accounts;
  },
});

export const get = query({
  args: { accountId: v.id("accounts") },
  handler: async (ctx, { accountId }) => {
    const uid = await requireUserId(ctx);
    const acc = await ctx.db.get(accountId);
    if (!acc || acc.ownerId !== uid) return null;
    return acc;
  },
});

/** Light projection used by the overnight action (action → query bridge). */
export const listForRun = internalQuery({
  args: { ownerId: v.id("users") },
  handler: async (ctx, { ownerId }) => {
    const rows = await ctx.db
      .query("accounts")
      .withIndex("by_owner_score", (q) => q.eq("ownerId", ownerId))
      .collect();
    return rows.map((r) => ({ _id: r._id, name: r.name }));
  },
});

export const updateScore = internalMutation({
  args: {
    ownerId: v.id("users"),
    accountId: v.id("accounts"),
    intentScore: v.number(),
    intentLevel: v.union(v.literal("hot"), v.literal("warm"), v.literal("cold")),
    lastSignalAt: v.number(),
  },
  handler: async (ctx, { ownerId, accountId, intentScore, intentLevel, lastSignalAt }) => {
    const acc = await ctx.db.get(accountId);
    if (!acc || acc.ownerId !== ownerId) return;
    await ctx.db.patch(accountId, { intentScore, intentLevel, lastSignalAt });
  },
});
