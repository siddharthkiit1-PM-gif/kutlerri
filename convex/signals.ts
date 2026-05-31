import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireUserId } from "./lib/auth";

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
    const uid = await requireUserId(ctx);
    const rows = await ctx.db
      .query("signals")
      .withIndex("by_owner_account", (q) => q.eq("ownerId", uid).eq("accountId", accountId))
      .collect();
    rows.sort((a, b) => b.observedAt - a.observedAt);
    return rows.slice(0, limit ?? 20);
  },
});

/** Bulk replace signals for an account (used by overnight run). */
export const replaceForAccount = internalMutation({
  args: {
    ownerId: v.id("users"),
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
  handler: async (ctx, { ownerId, accountId, items }) => {
    const old = await ctx.db
      .query("signals")
      .withIndex("by_owner_account", (q) => q.eq("ownerId", ownerId).eq("accountId", accountId))
      .collect();
    for (const s of old) await ctx.db.delete(s._id);
    const ids: string[] = [];
    for (const it of items) {
      const id = await ctx.db.insert("signals", { ownerId, accountId, ...it });
      ids.push(id);
    }
    return ids;
  },
});
