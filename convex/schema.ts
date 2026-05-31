import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

/**
 * Kutlerri V2 schema — multi-tenant via Convex Auth.
 *
 * Lifecycle: signals.ingest → scoring → cards (Today queue) →
 * owner approves/skips → agentRuns (audit log) → optionally emit
 * Resend send / Convex action. Every domain row is scoped to a
 * `users._id` via `ownerId`. Every index is owner-prefixed.
 */
export default defineSchema({
  ...authTables,
  // Extra optional fields on the auth `users` table (Convex Auth lets you
  // augment by re-declaring with the same name after the spread).
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    // Kutlerri-specific:
    restaurantName: v.optional(v.string()),
    ownerName: v.optional(v.string()),
  })
    .index("email", ["email"])
    .index("phone", ["phone"]),

  // ── Businesses we sell catering to ──────────────────────────────────────
  accounts: defineTable({
    ownerId: v.id("users"),
    name: v.string(),
    domain: v.optional(v.string()),
    industry: v.optional(v.string()),
    headcount: v.optional(v.number()),
    city: v.string(),
    distanceMiles: v.number(),
    lastSignalAt: v.optional(v.number()),
    intentScore: v.number(),
    intentLevel: v.union(v.literal("hot"), v.literal("warm"), v.literal("cold")),
  })
    .index("by_owner_score", ["ownerId", "intentScore"])
    .index("by_owner_name", ["ownerId", "name"]),

  // ── People at those businesses ──────────────────────────────────────────
  contacts: defineTable({
    ownerId: v.id("users"),
    accountId: v.id("accounts"),
    name: v.string(),
    initials: v.string(),
    title: v.string(),
    email: v.optional(v.string()),
    score: v.number(),
    status: v.union(
      v.literal("replied"),
      v.literal("clicked"),
      v.literal("opened"),
      v.literal("lapsed"),
      v.literal("cold"),
    ),
    activity: v.string(),
    lastActivityAt: v.optional(v.number()),
  })
    .index("by_owner_account", ["ownerId", "accountId"])
    .index("by_owner_score", ["ownerId", "score"]),

  // ── Raw intent signals (the connector layer) ───────────────────────────
  signals: defineTable({
    ownerId: v.id("users"),
    accountId: v.id("accounts"),
    source: v.union(
      v.literal("toast_pos_guest_match"),
      v.literal("crunchbase_funding"),
      v.literal("linkedin_jobs"),
      v.literal("indeed_jobs"),
      v.literal("apollo_firmographics"),
      v.literal("greenhouse_lever_ats"),
      v.literal("retention_cross_agent"),
    ),
    weight: v.number(),
    label: v.string(),
    rawPayload: v.string(),
    observedAt: v.number(),
  })
    .index("by_owner_account", ["ownerId", "accountId"])
    .index("by_owner_observedAt", ["ownerId", "observedAt"]),

  // ── Today queue cards ──────────────────────────────────────────────────
  cards: defineTable({
    ownerId: v.id("users"),
    type: v.union(
      v.literal("HOT_REPLY"),
      v.literal("NEW_SEGMENT"),
      v.literal("NEEDS_JUDGMENT"),
    ),
    agent: v.literal("Catering"),
    lane: v.union(v.literal("needs-you"), v.literal("autonomous")),
    poweredBy: v.optional(v.string()),
    status: v.union(
      v.literal("open"),
      v.literal("approved"),
      v.literal("declined"),
      v.literal("skipped"),
      v.literal("expired"),
    ),
    accountId: v.optional(v.id("accounts")),
    contactId: v.optional(v.id("contacts")),

    title: v.string(),
    subtitle: v.string(),
    intentScore: v.optional(v.number()),
    intentLevel: v.optional(v.union(v.literal("hot"), v.literal("warm"), v.literal("cold"))),

    impactUSD: v.number(),
    impactKind: v.string(),

    aiRecommendation: v.string(),
    aiReplyDraft: v.optional(v.string()),
    aiSegmentBrief: v.optional(v.any()),
    aiJudgmentOptions: v.optional(v.any()),

    signalIds: v.array(v.id("signals")),
    createdAt: v.number(),
    resolvedAt: v.optional(v.number()),
  })
    .index("by_owner_status", ["ownerId", "status"])
    .index("by_owner_lane_status", ["ownerId", "lane", "status"])
    .index("by_owner_createdAt", ["ownerId", "createdAt"]),

  // ── Engage tab threads ──────────────────────────────────────────────────
  engageThreads: defineTable({
    ownerId: v.id("users"),
    accountId: v.id("accounts"),
    channel: v.union(v.literal("email"), v.literal("dm"), v.literal("call")),
    name: v.string(),
    last: v.string(),
    when: v.string(),
    unread: v.boolean(),
    replyLikelihood: v.number(),
    predictedReply: v.string(),
    sentBy: v.union(v.literal("agent"), v.literal("owner")),
    updatedAt: v.number(),
  })
    .index("by_owner_account", ["ownerId", "accountId"])
    .index("by_owner_likelihood", ["ownerId", "replyLikelihood"]),

  // ── Overnight / audit log ──────────────────────────────────────────────
  agentRuns: defineTable({
    ownerId: v.id("users"),
    agent: v.union(
      v.literal("Catering"),
      v.literal("Waste Control"),
      v.literal("Guest Retention"),
      v.literal("Prep Forecast"),
    ),
    lane: v.union(v.literal("needs-you"), v.literal("autonomous")),
    summary: v.string(),
    impactUSD: v.optional(v.number()),
    revertable: v.boolean(),
    reverted: v.boolean(),
    cardId: v.optional(v.id("cards")),
    href: v.optional(v.string()),
    runAt: v.number(),
    window: v.string(),
  })
    .index("by_owner_runAt", ["ownerId", "runAt"]),
});
