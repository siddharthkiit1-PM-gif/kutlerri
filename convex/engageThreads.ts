import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("engageThreads").collect();
    rows.sort((a, b) => b.updatedAt - a.updatedAt);
    return rows;
  },
});

export const byAccount = query({
  args: { accountId: v.id("accounts") },
  handler: async (ctx, { accountId }) => {
    return await ctx.db
      .query("engageThreads")
      .withIndex("by_account", (q) => q.eq("accountId", accountId))
      .collect();
  },
});

export const insertReply = internalMutation({
  args: {
    accountId: v.id("accounts"),
    name: v.string(),
    last: v.string(),
    predictedReply: v.string(),
    replyLikelihood: v.number(),
    sentBy: v.union(v.literal("agent"), v.literal("owner")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("engageThreads", {
      ...args,
      channel: "email",
      when: "Just now",
      unread: true,
      updatedAt: Date.now(),
    });
  },
});
