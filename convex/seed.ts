/**
 * Seed Convex with the V1 fixture accounts + at least one contact per
 * account. Idempotent: rerunning will only insert accounts/contacts that
 * don't already exist by name.
 *
 * Run from the UI's Settings → "Reset demo data" button, or via
 * `npx convex run seed:run` from the CLI.
 */
import { internalMutation, mutation } from "./_generated/server";
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
    {
      name: "Jordan Reyes",
      initials: "JR",
      title: "Office Manager",
      email: "jordan@acmetech.com",
      score: 94,
      status: "replied",
      activity: "Replied last night",
    },
  ],
  "Stripe Austin": [
    {
      name: "Priya Shah",
      initials: "PS",
      title: "Workplace Lead",
      email: "priya@stripe.com",
      score: 71,
      status: "opened",
      activity: "Opened 4 of last 5 emails",
    },
  ],
  "Indeed HQ": [
    {
      name: "Marcus Lee",
      initials: "ML",
      title: "Facilities Manager",
      email: "marcus@indeed.com",
      score: 64,
      status: "clicked",
      activity: "Clicked menu Tue",
    },
  ],
  "BigCommerce": [
    {
      name: "Hannah Cole",
      initials: "HC",
      title: "Head of People Ops",
      email: "hannah@bigcommerce.com",
      score: 88,
      status: "opened",
      activity: "Opened follow-up 2x",
    },
  ],
  "Westlake Marketing": [
    {
      name: "Ben Patel",
      initials: "BP",
      title: "Office Coordinator",
      email: "ben@westlakemkt.com",
      score: 38,
      status: "lapsed",
      activity: "No orders in 60 days",
    },
  ],
  "GreenBox Inc.": [
    {
      name: "Tessa Wang",
      initials: "TW",
      title: "People Lead",
      email: "tessa@greenbox.io",
      score: 78,
      status: "opened",
      activity: "Asked about vegan menu",
    },
  ],
  "Stride Capital": [
    {
      name: "Avery Kim",
      initials: "AK",
      title: "Executive Assistant",
      email: "avery@stridecap.com",
      score: 42,
      status: "lapsed",
      activity: "Last order Mar 28",
    },
  ],
  "Klar Robotics": [
    {
      name: "Diego Romero",
      initials: "DR",
      title: "Office Manager",
      email: "diego@klarbots.com",
      score: 66,
      status: "opened",
      activity: "Opened sample menu",
    },
  ],
  "Patel Dental Group": [
    {
      name: "Riya Patel",
      initials: "RP",
      title: "Practice Manager",
      email: "riya@pateldental.com",
      score: 31,
      status: "cold",
      activity: "No engagement yet",
    },
  ],
  "Heritage Title Co.": [
    {
      name: "Sam Carter",
      initials: "SC",
      title: "Operations Lead",
      email: "sam@heritagetx.com",
      score: 47,
      status: "cold",
      activity: "Opened first email Apr 18",
    },
  ],
};

export const run = internalMutation({
  args: {},
  handler: async (ctx) => {
    let accountsInserted = 0;
    let contactsInserted = 0;

    for (const acc of SEED_ACCOUNTS) {
      const existing = await ctx.db
        .query("accounts")
        .withIndex("by_name", (q) => q.eq("name", acc.name))
        .first();

      let accountId = existing?._id;
      if (!accountId) {
        accountId = await ctx.db.insert("accounts", {
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
          .withIndex("by_account", (q) => q.eq("accountId", accountId!))
          .filter((q) => q.eq(q.field("name"), c.name))
          .first();
        if (dup) continue;
        await ctx.db.insert("contacts", {
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

/** Public mutation so the Settings "Reset demo data" button can call it. */
export const seedPublic = mutation({
  args: {},
  handler: async (ctx) => {
    let accountsInserted = 0;
    let contactsInserted = 0;
    for (const acc of SEED_ACCOUNTS) {
      const existing = await ctx.db
        .query("accounts")
        .withIndex("by_name", (q) => q.eq("name", acc.name))
        .first();
      let accountId = existing?._id;
      if (!accountId) {
        accountId = await ctx.db.insert("accounts", {
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
          .withIndex("by_account", (q) => q.eq("accountId", accountId!))
          .filter((q) => q.eq(q.field("name"), c.name))
          .first();
        if (dup) continue;
        await ctx.db.insert("contacts", {
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
