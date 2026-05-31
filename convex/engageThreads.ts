import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireUserId } from "./lib/auth";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const uid = await requireUserId(ctx);
    const rows = await ctx.db
      .query("engageThreads")
      .withIndex("by_owner_likelihood", (q) => q.eq("ownerId", uid))
      .collect();
    rows.sort((a, b) => b.updatedAt - a.updatedAt);
    return rows;
  },
});

export const byAccount = query({
  args: { accountId: v.id("accounts") },
  handler: async (ctx, { accountId }) => {
    const uid = await requireUserId(ctx);
    return await ctx.db
      .query("engageThreads")
      .withIndex("by_owner_account", (q) => q.eq("ownerId", uid).eq("accountId", accountId))
      .collect();
  },
});

export const insertReply = internalMutation({
  args: {
    ownerId: v.id("users"),
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
