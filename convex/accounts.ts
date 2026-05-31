import { query, internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";

/** Owner-facing list, ranked by score desc. */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const accounts = await ctx.db.query("accounts").collect();
    accounts.sort((a, b) => b.intentScore - a.intentScore);
    return accounts;
  },
});

export const get = query({
  args: { accountId: v.id("accounts") },
  handler: async (ctx, { accountId }) => {
    return await ctx.db.get(accountId);
  },
});

/** Light projection used by the overnight action (action → query bridge). */
export const listForRun = internalQuery({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("accounts").collect();
    return rows.map((r) => ({ _id: r._id, name: r.name }));
  },
});

export const updateScore = internalMutation({
  args: {
    accountId: v.id("accounts"),
    intentScore: v.number(),
    intentLevel: v.union(v.literal("hot"), v.literal("warm"), v.literal("cold")),
    lastSignalAt: v.number(),
  },
  handler: async (ctx, { accountId, intentScore, intentLevel, lastSignalAt }) => {
    await ctx.db.patch(accountId, { intentScore, intentLevel, lastSignalAt });
  },
});
