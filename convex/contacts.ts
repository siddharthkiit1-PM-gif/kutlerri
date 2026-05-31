import { query, internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const contacts = await ctx.db.query("contacts").collect();
    contacts.sort((a, b) => b.score - a.score);
    return contacts;
  },
});

export const _getRaw = internalQuery({
  args: { contactId: v.id("contacts") },
  handler: async (ctx, { contactId }) => ctx.db.get(contactId),
});

/** Light projection used by the overnight action (action → query bridge). */
export const listForRun = internalQuery({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("contacts").collect();
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
    return await ctx.db
      .query("contacts")
      .withIndex("by_account", (q) => q.eq("accountId", accountId))
      .collect();
  },
});
