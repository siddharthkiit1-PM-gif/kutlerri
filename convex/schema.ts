import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Kutlerri V1 schema — single tenant (Round Rock Kitchen).
 *
 * Lifecycle: signals.ingest → scoring → cards (Today queue) →
 * owner approves/skips → agentRuns (audit log) → optionally emit
 * Resend send / Convex action.
 */
export default defineSchema({
  // ── Businesses we sell catering to ──────────────────────────────────────
  accounts: defineTable({
    name: v.string(),
    domain: v.optional(v.string()),
    industry: v.optional(v.string()),
    headcount: v.optional(v.number()),
    city: v.string(),
    distanceMiles: v.number(),
    // last update of any signal touching this account
    lastSignalAt: v.optional(v.number()),
    // cached score derived from signals (0–100)
    intentScore: v.number(),
    intentLevel: v.union(v.literal("hot"), v.literal("warm"), v.literal("cold")),
  })
    .index("by_score", ["intentScore"])
    .index("by_name", ["name"]),

  // ── People at those businesses ──────────────────────────────────────────
  contacts: defineTable({
    accountId: v.id("accounts"),
    name: v.string(),
    initials: v.string(),
    title: v.string(),
    email: v.optional(v.string()),
    // 0–100 engagement score
    score: v.number(),
    status: v.union(
      v.literal("replied"),
      v.literal("clicked"),
      v.literal("opened"),
      v.literal("lapsed"),
      v.literal("cold"),
    ),
    activity: v.string(), // human-readable last activity blurb
    lastActivityAt: v.optional(v.number()),
  })
    .index("by_account", ["accountId"])
    .index("by_score", ["score"]),

  // ── Raw intent signals (the connector layer) ───────────────────────────
  signals: defineTable({
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
    weight: v.number(), // 0–1 source weight (Toast match = 1.0, etc.)
    label: v.string(), // "5 office-manager job posts in last 14 days"
    rawPayload: v.string(), // JSON.stringify of the source payload shape
    observedAt: v.number(),
  })
    .index("by_account", ["accountId"])
    .index("by_observedAt", ["observedAt"]),

  // ── Today queue cards ──────────────────────────────────────────────────
  cards: defineTable({
    type: v.union(
      v.literal("HOT_REPLY"),
      v.literal("NEW_SEGMENT"),
      v.literal("NEEDS_JUDGMENT"),
    ),
    agent: v.literal("Catering"),
    lane: v.union(v.literal("needs-you"), v.literal("autonomous")),
    poweredBy: v.optional(v.string()), // cross-agent attribution
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

    // AI-generated content (validated against zod before storage)
    aiRecommendation: v.string(),
    aiReplyDraft: v.optional(v.string()),       // HOT_REPLY
    aiSegmentBrief: v.optional(v.any()),         // NEW_SEGMENT — { criteria, sampleNames, expectedReply, sequence }
    aiJudgmentOptions: v.optional(v.any()),      // NEEDS_JUDGMENT — array of { letter, title, predicted }

    signalIds: v.array(v.id("signals")),
    createdAt: v.number(),
    resolvedAt: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_lane_status", ["lane", "status"])
    .index("by_createdAt", ["createdAt"]),

  // ── Engage tab threads ──────────────────────────────────────────────────
  engageThreads: defineTable({
    accountId: v.id("accounts"),
    channel: v.union(v.literal("email"), v.literal("dm"), v.literal("call")),
    name: v.string(),
    last: v.string(),
    when: v.string(),
    unread: v.boolean(),
    replyLikelihood: v.number(), // 0–100
    predictedReply: v.string(),
    sentBy: v.union(v.literal("agent"), v.literal("owner")),
    updatedAt: v.number(),
  })
    .index("by_account", ["accountId"])
    .index("by_likelihood", ["replyLikelihood"]),

  // ── Overnight / audit log ──────────────────────────────────────────────
  agentRuns: defineTable({
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
    window: v.string(), // e.g. "9 PM – 8 AM"
  })
    .index("by_runAt", ["runAt"]),
});
