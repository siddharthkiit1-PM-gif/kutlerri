/**
 * Per-tenant user profile + bootstrap.
 *
 * - `me` returns the logged-in user's profile (or null pre-auth).
 * - `bootstrapNewUser` seeds 10 demo accounts + contacts on first
 *   authed visit. Idempotent — safe to call from a React effect.
 * - `_listAll` / `_getRaw` power the per-tenant overnight cron loop.
 */
import { internalQuery, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { requireUserId } from "./lib/auth";
import { SEED_ACCOUNTS } from "@/lib/signals/seed";

type ContactSeed = {
  name: string;
  initials: string;
  title: string;
  email: string;
  score: number;
  status: "replied" | "clicked" | "opened" | "lapsed" | "cold";
  activity: string;
};

const CONTACTS_BY_ACCOUNT: Record<string, ContactSeed[]> = {
  "Acme Tech Holdings": [
    { name: "Jordan Reyes", initials: "JR", title: "Office Manager", email: "jordan@acmetech.com", score: 94, status: "replied", activity: "Replied last night" },
  ],
  "Stripe Austin": [
    { name: "Priya Shah", initials: "PS", title: "Workplace Lead", email: "priya@stripe.com", score: 71, status: "opened", activity: "Opened 4 of last 5 emails" },
  ],
  "Indeed HQ": [
    { name: "Marcus Lee", initials: "ML", title: "Facilities Manager", email: "marcus@indeed.com", score: 64, status: "clicked", activity: "Clicked menu Tue" },
  ],
  "BigCommerce": [
    { name: "Hannah Cole", initials: "HC", title: "Head of People Ops", email: "hannah@bigcommerce.com", score: 88, status: "opened", activity: "Opened follow-up 2x" },
  ],
  "Westlake Marketing": [
    { name: "Ben Patel", initials: "BP", title: "Office Coordinator", email: "ben@westlakemkt.com", score: 38, status: "lapsed", activity: "No orders in 60 days" },
  ],
  "GreenBox Inc.": [
    { name: "Tessa Wang", initials: "TW", title: "People Lead", email: "tessa@greenbox.io", score: 78, status: "opened", activity: "Asked about vegan menu" },
  ],
  "Stride Capital": [
    { name: "Avery Kim", initials: "AK", title: "Executive Assistant", email: "avery@stridecap.com", score: 42, status: "lapsed", activity: "Last order Mar 28" },
  ],
  "Klar Robotics": [
    { name: "Diego Romero", initials: "DR", title: "Office Manager", email: "diego@klarbots.com", score: 66, status: "opened", activity: "Opened sample menu" },
  ],
  "Patel Dental Group": [
    { name: "Riya Patel", initials: "RP", title: "Practice Manager", email: "riya@pateldental.com", score: 31, status: "cold", activity: "No engagement yet" },
  ],
  "Heritage Title Co.": [
    { name: "Sam Carter", initials: "SC", title: "Operations Lead", email: "sam@heritagetx.com", score: 47, status: "cold", activity: "Opened first email Apr 18" },
  ],
};

export const me = query({
  args: {},
  handler: async (ctx) => {
    const uid = await getAuthUserId(ctx);
    if (!uid) return null;
    const user = await ctx.db.get(uid);
    return user;
  },
});

/**
 * First-run seed for a newly signed-up user. Idempotent: if the user
 * already has any accounts, returns early without inserting duplicates.
 */
export const bootstrapNewUser = mutation({
  args: {},
  handler: async (ctx) => {
    const uid = await requireUserId(ctx);

    let accountsInserted = 0;
    let contactsInserted = 0;

    for (const acc of SEED_ACCOUNTS) {
      const existing = await ctx.db
        .query("accounts")
        .withIndex("by_owner_name", (q) => q.eq("ownerId", uid).eq("name", acc.name))
        .first();

      let accountId = existing?._id;
      if (!accountId) {
        accountId = await ctx.db.insert("accounts", {
          ownerId: uid,
          name: acc.name,
          domain: acc.domain,
          industry: acc.industry,
          headcount: acc.headcount,
          city: acc.city,
          distanceMiles: acc.distanceMiles,
          intentScore: 0,
          intentLevel: "cold",
        });
        accountsInserted++;
      }

      const seedContacts = CONTACTS_BY_ACCOUNT[acc.name] ?? [];
      for (const c of seedContacts) {
        const dup = await ctx.db
          .query("contacts")
          .withIndex("by_owner_account", (q) =>
            q.eq("ownerId", uid).eq("accountId", accountId!),
          )
          .filter((q) => q.eq(q.field("name"), c.name))
          .first();
        if (dup) continue;
        await ctx.db.insert("contacts", {
          ownerId: uid,
          accountId: accountId!,
          name: c.name,
          initials: c.initials,
          title: c.title,
          email: c.email,
          score: c.score,
          status: c.status,
          activity: c.activity,
          lastActivityAt: Date.now(),
        });
        contactsInserted++;
      }
    }

    return { accountsInserted, contactsInserted };
  },
});

/** Used by the overnight cron to iterate tenants. */
export const _listAll = internalQuery({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users.map((u) => ({
      _id: u._id,
      email: u.email,
      name: u.name,
      ownerName: u.ownerName,
      restaurantName: u.restaurantName,
    }));
  },
});

/** Internal full-row fetch (action → query bridge). */
export const _getRaw = internalQuery({
  args: { ownerId: v.id("users") },
  handler: async (ctx, { ownerId }) => ctx.db.get(ownerId),
});
