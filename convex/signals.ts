import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";

const sourceUnion = v.union(
  v.literal("toast_pos_guest_match"),
  v.literal("crunchbase_funding"),
  v.literal("linkedin_jobs"),
  v.literal("indeed_jobs"),
  v.literal("apollo_firmographics"),
  v.literal("greenhouse_lever_ats"),
  v.literal("retention_cross_agent"),
);

export const recentByAccount = query({
  args: { accountId: v.id("accounts"), limit: v.optional(v.number()) },
  handler: async (ctx, { accountId, limit }) => {
    const rows = await ctx.db
      .query("signals")
      .withIndex("by_account", (q) => q.eq("accountId", accountId))
      .collect();
    rows.sort((a, b) => b.observedAt - a.observedAt);
    return rows.slice(0, limit ?? 20);
  },
});

/** Bulk replace signals for an account (used by overnight run). */
export const replaceForAccount = internalMutation({
  args: {
    accountId: v.id("accounts"),
    items: v.array(
      v.object({
        source: sourceUnion,
        weight: v.number(),
        label: v.string(),
        rawPayload: v.string(),
        observedAt: v.number(),
      }),
    ),
  },
  handler: async (ctx, { accountId, items }) => {
    const old = await ctx.db
      .query("signals")
      .withIndex("by_account", (q) => q.eq("accountId", accountId))
      .collect();
    for (const s of old) await ctx.db.delete(s._id);
    const ids: string[] = [];
    for (const it of items) {
      const id = await ctx.db.insert("signals", { accountId, ...it });
      ids.push(id);
    }
    return ids;
  },
});
