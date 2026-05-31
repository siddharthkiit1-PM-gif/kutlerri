import { query, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { requireUserId } from "./lib/auth";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const uid = await requireUserId(ctx);
    const contacts = await ctx.db
      .query("contacts")
      .withIndex("by_owner_score", (q) => q.eq("ownerId", uid))
      .collect();
    contacts.sort((a, b) => b.score - a.score);
    return contacts;
  },
});

export const _getRaw = internalQuery({
  args: { ownerId: v.id("users"), contactId: v.id("contacts") },
  handler: async (ctx, { ownerId, contactId }) => {
    const c = await ctx.db.get(contactId);
    if (!c || c.ownerId !== ownerId) return null;
    return c;
  },
});

/** Light projection used by the overnight action (action → query bridge). */
export const listForRun = internalQuery({
  args: { ownerId: v.id("users") },
  handler: async (ctx, { ownerId }) => {
    const rows = await ctx.db
      .query("contacts")
      .withIndex("by_owner_score", (q) => q.eq("ownerId", ownerId))
      .collect();
    return rows.map((r) => ({
      _id: r._id,
      accountId: r.accountId,
      name: r.name,
      title: r.title,
      email: r.email,
    }));
  },
});

export const byAccount = query({
  args: { accountId: v.id("accounts") },
  handler: async (ctx, { accountId }) => {
    const uid = await requireUserId(ctx);
    return await ctx.db
      .query("contacts")
      .withIndex("by_owner_account", (q) => q.eq("ownerId", uid).eq("accountId", accountId))
      .collect();
  },
});
