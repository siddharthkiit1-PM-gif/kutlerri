export type Agent =
  | "Catering"
  | "Waste Control"
  | "Guest Retention"
  | "Prep Forecast";

export type CardType =
  | "HOT_REPLY"
  | "WASTE_ALERT"
  | "NEW_SEGMENT"
  | "RETENTION_RISK"
  | "PREP_RECOMMENDATION"
  | "NEEDS_JUDGMENT";

export type IntentLevel = "hot" | "warm" | "cold";

export type Lane = "autonomous" | "needs-you";

export type Signal = {
  label: string;
  source: string; // named source
  weight?: number; // +pts contribution
};

export type Option = {
  letter: "a" | "b" | "c";
  title: string;
  predicted: string;
};

export type LapsedAccount = {
  name: string;
  lastOrderUSD: number;
  lastOrderDate: string; // "Apr 10"
};

export type CardBase = {
  id: string;
  type: CardType;
  agent: Agent;
  crossAgent?: boolean;
  /** Sibling agent that surfaced the signal even though this card belongs to `agent`. */
  poweredBy?: Agent;
  /** Estimated $ impact for ranking the queue. */
  impactUSD?: number;
  /** How that impact is framed (e.g. "Quote value", "Weekly waste saved"). */
  impactKind?: string;
  /** Confidence lane: "autonomous" (high) vs "needs-you" (judgment). */
  lane?: Lane;
  title: string;
  subtitle?: string;
  business?: string;
  intentScore?: number;
  intentLevel?: IntentLevel;
  trigger?: string;
  signals?: Signal[];
  aiRecommendation?: string;
  actions: string[];
  // type-specific
  segmentCriteria?: string[];
  segmentSamples?: string[];
  segmentExpectedReply?: string;
  segmentSequence?: string[];
  lapsedAccounts?: LapsedAccount[];
  lapsedTrigger?: string;
  prepOrderId?: string;
  options?: Option[];
  needsJudgmentReason?: string;
  /** Convex-backed HOT_REPLY cards include the Gemini-drafted email body. */
  aiReplyDraft?: string;
};

export type Business = {
  id: string;
  name: string;
  industry: string;
  size: string; // "120 employees"
  distanceMi: number;
  intent: number;
  level: IntentLevel;
  topSignal: string;
  lastTouchpoint: string;
};

export type ContactStatus =
  | "replied"
  | "opened"
  | "clicked"
  | "lapsed"
  | "cold";

export type Contact = {
  id: string;
  businessId: string;
  name: string;
  title: string;
  activity: string; // "replied", "opened 4 emails", "clicked menu"
  initials: string;
  /** 0–100 engagement-derived score. Used for Contacts ranking. */
  score?: number;
  status?: ContactStatus;
};

export type ActivityEvent = {
  date: string; // "Yesterday 11:42 PM"
  label: string;
  source?: string;
};

export type BusinessDetail = Business & {
  scoreBreakdown: { label: string; pts: number; source: string }[];
  recommendation: string;
  contacts: Contact[];
  activity: ActivityEvent[];
};

/* ---------------- Engage ---------------- */

export type EngageChannel = "email" | "dm" | "call";

export type EngageThread = {
  id: string;
  businessId?: string;
  name: string;
  last: string;
  when: string;
  channel: EngageChannel;
  unread: boolean;
  /** 0–100 predicted likelihood of reply within 7 days. */
  replyLikelihood: number;
  /** Plain-language prediction the agent stands behind. */
  predictedReply: string;
  /** Was this sent by the agent autonomously or by the owner? */
  sentBy: "agent" | "owner";
};

/* ---------------- Agent activity / overnight ---------------- */

export type OvernightAction = {
  id: string;
  time: string; // "11:42 PM" / "3:14 AM"
  agent: Agent;
  summary: string;
  lane: Lane;
  impactUSD?: number;
  revertable?: boolean;
  /** Internal href to drill into the related card or business. */
  href?: string;
};

export type OvernightSummary = {
  ranTotal: number;
  autonomous: number;
  needsYou: number;
  savedMinutes: number;
  impactUSD: number;
  window: string; // "9 PM – 8 AM"
};

/* ---------------- Insights ---------------- */

export type InsightSourceROI = {
  source: string;
  bookedUSD: number;
  share: number; // 0..1
};

export type InsightMetric = {
  label: string;
  value: string;
  delta: string;
  hint?: string;
};
